/**
 * Contrast audit for the visualization role tokens.
 *
 * Part of the standing measurement pass: charts encode meaning with colour, so
 * a chart that fails contrast is a chart that fails to communicate. Graphical
 * objects are held to WCAG 1.4.11 at 3:1; chart text to 1.4.3 at 4.5:1, since
 * axis labels run as small as 8px.
 *
 *   npm run check:contrast
 */

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function ratio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const WHITE = "#FFFFFF";
const BONE_2 = "#EDE6D6";
const INK = "#1C1C1C";

const CHECKS: [string, string, string, number][] = [
  ["level d1", "#C8102E", WHITE, 3],
  ["level d2", "#9B2B2B", WHITE, 3],
  ["level d3", "#2472BE", WHITE, 3],
  ["level naia", "#2F9159", WHITE, 3],
  ["level njcaa", "#7B5EA7", WHITE, 3],
  ["verify self ring", "#888888", WHITE, 3],
  ["verify coach fill", "#AF8F56", WHITE, 3],
  ["verify event fill", "#1C1C1C", WHITE, 3],
  ["component 1", "#1C1C1C", WHITE, 3],
  ["component 4", "#7A7060", BONE_2, 3],
  ["component 5", "#8C8272", BONE_2, 3],
  ["reference line", "#9C9487", WHITE, 3],
  ["reference strong", "#1C1C1C", WHITE, 3],
  ["projection line", "#444444", WHITE, 3],
  ["fit strong text", "#2D7A50", WHITE, 4.5],
  ["fit realistic text", "#4A6B55", WHITE, 4.5],
  ["fit reach text", "#737373", WHITE, 4.5],
  ["fit longshot text", "#9B2B2B", WHITE, 4.5],
  ["chart label", "#767676", WHITE, 4.5],
  ["gauge readout on ink", "#EDE6D6", INK, 4.5],
];

let failed = 0;
for (const [name, fg, bg, need] of CHECKS) {
  const r = ratio(fg, bg);
  const ok = r >= need;
  if (!ok) failed++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name.padEnd(24)} ${r.toFixed(2)}:1  (needs ${need}:1)`
  );
}

console.log(`\n${CHECKS.length - failed}/${CHECKS.length} pass`);
if (failed > 0) {
  console.error(`${failed} contrast failure(s).`);
  process.exit(1);
}
