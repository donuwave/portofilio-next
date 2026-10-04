#!/usr/bin/env bash
# Builds the Docker image on this computer and ships it to the server.
#
#   scripts/deploy.sh               build, push, restart
#   scripts/deploy.sh --build-only  just build the image locally (no server needed)
#   scripts/deploy.sh --rollback    switch the server back to the previous image
#
# How the shipping works: the server runs a tiny private image registry that listens only
# on its own loopback. This script opens an SSH tunnel to it and pushes through the tunnel,
# so only the image layers that changed since the last deploy are uploaded (a code change
# is a few MB; the heavy dependency layers go once). Nothing is exposed to the internet.
#
# Settings live in .deploy.env (see .deploy.env.example). The server's secrets stay
# on the server in .env.prod; nothing secret is baked into the image or sent from here.
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="portfolio-app"
REGISTRY="localhost:5000"            # as the server sees its own registry
TUNNEL_PORT="5001"                   # local end of the tunnel
PUSH_HOST="host.docker.internal:$TUNNEL_PORT"   # as Docker Desktop's build container sees it
BUILDER="portfolio-builder"
COMPOSE=(docker compose --env-file .env.prod -f docker-compose.prod.yml)

mode="deploy"
case "${1:-}" in
  "") ;;
  --build-only) mode="build" ;;
  --rollback) mode="rollback" ;;
  -h|--help) sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
  *) echo "Unknown option: $1 (try --help)" >&2; exit 2 ;;
esac

step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31mError:\033[0m %s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null || fail "docker is not installed."
docker info >/dev/null 2>&1 || fail "Docker is not running. Start Docker Desktop and try again."

# --- settings -------------------------------------------------------------
SERVER="" REMOTE_DIR="/opt/portfolio" SSH_PORT="22" SSH_KEY=""
if [ -f .deploy.env ]; then
  # shellcheck disable=SC1091
  . ./.deploy.env
fi
# A "~" in a quoted value of .deploy.env is not expanded by the shell.
SSH_KEY="${SSH_KEY/#\~/$HOME}"
if [ "$mode" != "build" ] && [ -z "$SERVER" ]; then
  fail "SERVER is not set. Copy .deploy.env.example to .deploy.env and fill it in."
fi

SSH_OPTS=(-p "$SSH_PORT" -o ServerAliveInterval=30
  -o ControlMaster=auto -o "ControlPath=/tmp/portfolio-deploy-%C" -o ControlPersist=120)
[ -n "$SSH_KEY" ] && SSH_OPTS+=(-i "$SSH_KEY" -o IdentitiesOnly=yes)

remote() { ssh "${SSH_OPTS[@]}" "$SERVER" "$@"; }
# Runs a command on the server from the project directory.
in_dir() { remote "cd $(printf '%q' "$REMOTE_DIR") && $*"; }

TUNNEL_SOCKET="/tmp/portfolio-tunnel-$$"
close_tunnel() { ssh -S "$TUNNEL_SOCKET" -O exit "$SERVER" >/dev/null 2>&1 || true; }
trap close_tunnel EXIT

# Waits until the app container answers HTTP; prints its logs if it doesn't.
wait_healthy() {
  step "Waiting for the app to answer"
  local probe="node -e \"fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\""
  for _ in $(seq 1 30); do
    if in_dir "${COMPOSE[*]} exec -T app $probe" >/dev/null 2>&1; then
      echo "The app is up."
      return 0
    fi
    sleep 2
  done
  in_dir "${COMPOSE[*]} logs --tail 40 app" || true
  fail "The app did not come up within 60s (logs above). Roll back with: scripts/deploy.sh --rollback"
}

# --- rollback --------------------------------------------------------------
if [ "$mode" = "rollback" ]; then
  step "Rolling back on $SERVER"
  in_dir "docker image inspect $REGISTRY/$IMAGE:previous >/dev/null 2>&1" \
    || fail "There is no previous image on the server to roll back to."
  in_dir "docker tag $REGISTRY/$IMAGE:previous $REGISTRY/$IMAGE:latest && ${COMPOSE[*]} up -d --no-build --pull never --remove-orphans"
  wait_healthy
  echo "Rolled back. Database migrations are not reverted."
  exit 0
fi

# --- work out what to build for --------------------------------------------
if [ "$mode" = "build" ]; then
  PLATFORM="${PLATFORM:-linux/$(docker version --format '{{.Server.Arch}}')}"
else
  step "Checking $SERVER"
  remote true || fail "Cannot connect to $SERVER over SSH."
  remote "command -v docker >/dev/null && docker compose version >/dev/null" \
    || fail "Docker with the compose plugin is not installed on the server (see DEPLOY.md, step 2)."
  case "$(remote uname -m)" in
    x86_64) PLATFORM="linux/amd64" ;;
    aarch64|arm64) PLATFORM="linux/arm64" ;;
    *) fail "Unsupported server architecture: $(remote uname -m)" ;;
  esac
  remote "mkdir -p $(printf '%q' "$REMOTE_DIR")"
  in_dir "test -f .env.prod" \
    || fail "$REMOTE_DIR/.env.prod is missing on the server. Create it from .env.prod.example (see DEPLOY.md, step 3)."
fi

TAG="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)"
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  TAG="$TAG-dirty"
  echo "Note: you have uncommitted changes; they are included in this build."
fi

# --- build only ------------------------------------------------------------
if [ "$mode" = "build" ]; then
  step "Building $IMAGE:$TAG for $PLATFORM"
  docker buildx build --platform "$PLATFORM" --load -t "$IMAGE:$TAG" -t "$IMAGE:latest" .
  echo "Built $IMAGE:$TAG (not sent anywhere)."
  exit 0
fi

# --- registry on the server + tunnel ---------------------------------------
step "Preparing the registry on the server"
remote "docker inspect portfolio-registry >/dev/null 2>&1 || docker run -d --name portfolio-registry --restart unless-stopped \
  --security-opt no-new-privileges:true -p 127.0.0.1:5000:5000 -v portfolio_registry:/var/lib/registry registry:2 >/dev/null"
for _ in $(seq 1 15); do
  remote "curl -fsS -o /dev/null http://127.0.0.1:5000/v2/" 2>/dev/null && break
  sleep 1
done

# A dedicated builder, because the default one cannot push to a plain-HTTP registry.
docker buildx inspect "$BUILDER" >/dev/null 2>&1 \
  || docker buildx create --name "$BUILDER" --driver docker-container \
       --buildkitd-config "$PWD/scripts/buildkitd.toml" >/dev/null

step "Opening the SSH tunnel to the registry"
# Its own connection, not the shared one above: that one is closed after 2 idle minutes, and
# the build runs longer than that before it starts pushing. This one lives until close_tunnel.
TUNNEL_OPTS=(-p "$SSH_PORT" -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes)
[ -n "$SSH_KEY" ] && TUNNEL_OPTS+=(-i "$SSH_KEY" -o IdentitiesOnly=yes)
ssh "${TUNNEL_OPTS[@]}" -S "$TUNNEL_SOCKET" -M -f -N \
  -L "127.0.0.1:$TUNNEL_PORT:127.0.0.1:5000" "$SERVER"

# --- build and push --------------------------------------------------------
step "Building $IMAGE:$TAG for $PLATFORM and pushing only the changed layers"
docker buildx build --builder "$BUILDER" --platform "$PLATFORM" --provenance=false --push \
  -t "$PUSH_HOST/$IMAGE:$TAG" -t "$PUSH_HOST/$IMAGE:latest" .
close_tunnel

# --- restart ---------------------------------------------------------------
step "Uploading compose files"
rsync -e "ssh ${SSH_OPTS[*]}" -t docker-compose.prod.yml Caddyfile "$SERVER:$REMOTE_DIR/"

step "Pulling the new image and restarting"
# Keep the running image under :previous so --rollback has something to go back to.
remote "docker tag $REGISTRY/$IMAGE:latest $REGISTRY/$IMAGE:previous 2>/dev/null || true"
remote "docker pull -q $REGISTRY/$IMAGE:latest >/dev/null"
in_dir "${COMPOSE[*]} up -d --no-build --pull never --remove-orphans"
wait_healthy

# Leftovers from the earlier docker-save based scheme.
remote "docker rmi $IMAGE:latest $IMAGE:previous >/dev/null 2>&1 || true; docker image prune -f >/dev/null"
step "Done: $IMAGE:$TAG is live"
