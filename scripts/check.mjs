import { readFileSync } from "node:fs";

const html = readFileSync(".next/server/app/index.html", "utf8");
const expected = { t: "Hello Jane!", "t.rich": "Hello Jane!", "t.markup": "Hello <b>Jane</b>!" };

let failed = 0;

for (const [, label, inner] of html.matchAll(/<li data-case="([^"]+)">(.*?)<\/li>/g)) {
  const rendered = inner.replace(/<\/?b>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const ok = rendered === expected[label.split(",")[0]];

  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${label.padEnd(28)} -> ${JSON.stringify(rendered)}`);
}

if (failed) {
  console.log(`\n${failed} of 6 calls lost their values.`);
  process.exit(1);
}
