/**
 * Returns a stable style for a tag so the same tag always has the same color everywhere.
 * Colors are chosen from a fixed palette via a simple string hash.
 */
const TAG_PALETTE: { bg: string; fg: string }[] = [
  { bg: 'hsl(220 70% 52%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(160 55% 45%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(280 55% 50%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(25 85% 52%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(190 65% 45%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(340 65% 50%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(45 75% 48%)', fg: 'hsl(0 0% 12%)' },
  { bg: 'hsl(260 55% 52%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(150 50% 42%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(320 60% 48%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(200 60% 45%)', fg: 'hsl(0 0% 100%)' },
  { bg: 'hsl(30 70% 48%)', fg: 'hsl(0 0% 100%)' },
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = (h << 5) - h + c;
    h = h & h;
  }
  return Math.abs(h);
}

export function getTagStyle(tag: string): { backgroundColor: string; color: string } {
  const i = hashString(tag) % TAG_PALETTE.length;
  const { bg, fg } = TAG_PALETTE[i];
  return { backgroundColor: bg, color: fg };
}
