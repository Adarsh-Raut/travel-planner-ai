const UNIT_MS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export function durationToMs(value: string): number {
  const match = /^(\d+)([smhdw])$/.exec(value);
  if (!match?.[1] || !match[2]) {
    throw new Error(`Invalid duration string: "${value}"`);
  }
  const multiplier = UNIT_MS[match[2]];
  if (multiplier === undefined) {
    throw new Error(`Unknown duration unit in "${value}"`);
  }
  return Number(match[1]) * multiplier;
}
