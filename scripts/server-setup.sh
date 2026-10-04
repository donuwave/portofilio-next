#!/usr/bin/env bash
# One-time setup and hardening of a fresh Ubuntu 24.04 VPS. Run it ON THE SERVER, as root:
#
#   scp -i ~/.ssh/id_ed25519_portfolio scripts/server-setup.sh root@IP:/root/
#   ssh -i ~/.ssh/id_ed25519_portfolio root@IP 'bash /root/server-setup.sh'
#
# Safe to run again. It does, in order:
#   updates + automatic security updates, a 2 GB swap file, Docker (with log rotation),
#   an unprivileged `deploy` user, key-only SSH with root login disabled, a firewall
#   that lets in only SSH/HTTP/HTTPS, and fail2ban against SSH brute force.
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="${APP_DIR:-/opt/portfolio}"

step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31mError:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || fail "Run this as root."

# The very first thing: password logins get switched off below, so without a key
# for the deploy user this script would lock you out of your own server.
[ -s /root/.ssh/authorized_keys ] || [ -s "/home/$DEPLOY_USER/.ssh/authorized_keys" ] \
  || fail "No SSH key is installed. Add your public key when creating the server (or to /root/.ssh/authorized_keys) first."

export DEBIAN_FRONTEND=noninteractive

step "Updating the system"
apt-get update -y
apt-get upgrade -y
apt-get install -y sudo ufw fail2ban unattended-upgrades curl ca-certificates

step "Automatic security updates"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

step "Swap file (2 GB)"
if ! swapon --show=NAME --noheadings | grep -q '^/swapfile$'; then
  [ -e /swapfile ] || { fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile; }
  swapon /swapfile
fi
grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf
sysctl -q -p /etc/sysctl.d/99-swap.conf

step "Docker"
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh
# Without a size cap, container logs grow until the disk is full.
if [ ! -s /etc/docker/daemon.json ]; then
  mkdir -p /etc/docker
  cat > /etc/docker/daemon.json <<'EOF'
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
EOF
  systemctl restart docker
fi
systemctl enable --now docker

step "User '$DEPLOY_USER'"
id "$DEPLOY_USER" >/dev/null 2>&1 || adduser --disabled-password --gecos "" "$DEPLOY_USER"
getent group docker >/dev/null || groupadd docker
usermod -aG docker "$DEPLOY_USER"
# No password exists for this user (key-only), so sudo has to be passwordless.
# That is no weaker than it looks: membership in the docker group is already root-equivalent.
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/90-$DEPLOY_USER"
chmod 440 "/etc/sudoers.d/90-$DEPLOY_USER"
if [ -s /root/.ssh/authorized_keys ]; then
  install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
  install -m 600 -o "$DEPLOY_USER" -g "$DEPLOY_USER" /root/.ssh/authorized_keys "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$APP_DIR"

step "SSH: keys only, no root login"
# Named 00- on purpose: sshd takes the FIRST value it sees for a setting, and cloud
# images ship a 50-cloud-init.conf that turns password login back on.
cat > /etc/ssh/sshd_config.d/00-hardening.conf <<EOF
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers $DEPLOY_USER
MaxAuthTries 3
LoginGraceTime 20
X11Forwarding no
AllowAgentForwarding no
EOF
if ! sshd -t; then
  rm -f /etc/ssh/sshd_config.d/00-hardening.conf
  fail "sshd rejected the new configuration; it was removed and nothing changed."
fi
systemctl reload ssh

step "Firewall"
ufw default deny incoming
ufw default allow outgoing
ufw limit 22/tcp   # allowed, but rate limited
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

step "fail2ban"
cat > /etc/fail2ban/jail.d/sshd.local <<'EOF'
[sshd]
enabled = true
backend = systemd
maxretry = 4
findtime = 10m
bantime = 1h
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

step "Done"
cat <<EOF

Server is set up. BEFORE closing this session, open a NEW terminal and check that you can log in:

  ssh -i ~/.ssh/id_ed25519_portfolio $DEPLOY_USER@<server IP>

Root login is now disabled. If the check works, put this in .deploy.env on your computer:

  SERVER="$DEPLOY_USER@<server IP>"
  REMOTE_DIR="$APP_DIR"
EOF
