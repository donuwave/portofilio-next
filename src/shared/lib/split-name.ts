export function splitName(name: string): { first: string; rest: string } {
  const [first, ...restParts] = name.trim().split(/\s+/);
  return { first: first ?? "", rest: restParts.join(" ") };
}
