#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Builds the GitHub Pages site into _site/ (or --out <dir>):
// https://tigertag-project.github.io/TigerQR-Label/
//
//   node tools/build-site.mjs [--out _site]
//
// The page is site/index.html with its {{…}} filled in; the reference code of
// src/ is published as js/parse.js and js/links.js (types stripped, nothing
// else changed), next to the example labels, the illustrations, the logos, the
// test vectors and llms.txt. The build fails on a {{…}} left unfilled or on a
// local link or picture that points to no file.
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { compileReference, REPO } from "./reference.mjs";

export const SITE = "https://tigertag-project.github.io/TigerQR-Label/";
const args = process.argv.slice(2);
const OUT = join(REPO, args.includes("--out") ? args[args.indexOf("--out") + 1] : "_site");

// The nine formats (spec/labels.md; the layout words of the contract, §7). Dots
// per module and the QR's printed side for a 29 × 29 code, as the renderer
// lays them out (spec/labels.md, "Printer dots per module").
export const FORMATS = [
  { id: "classic", name: "Classic", slug: "classic-40x30", w: 40, h: 30, slots: 4, layout: "Brand, bar, colour and hex, four slots, QR bottom right.", d: [4, 14.5, 6, 14.7] },
  { id: "expanded", name: "Wide", slug: "wide-50x30", w: 50, h: 30, slots: 4, layout: "The Classic, with a wider bar.", d: [4, 14.5, 6, 14.7] },
  { id: "compact", name: "Compact", slug: "compact-40x25", w: 40, h: 25, slots: 0, layout: "Brand, QR left, bar, colour, hex.", d: [4, 14.5, 6, 14.7] },
  { id: "slim", name: "Slim", slug: "slim-40x12", w: 40, h: 12, slots: 0, layout: "QR left, brand, bar, colour.", d: [3, 10.9, 4, 9.8] },
  { id: "slicer", name: "Slicer-friendly", slug: "slicer-40x30", w: 40, h: 30, slots: 0, layout: "Brand, series and colour stacked large, a big QR right.", d: [5, 18.1, 8, 19.6] },
  { id: "vertical", name: "Vertical", slug: "vertical-30x40", w: 30, h: 40, slots: 4, layout: "Brand, bar, colour large, hex, a rule, slots stacked left, QR bottom right.", d: [4, 14.5, 5, 12.3] },
  { id: "verticalBold", name: "Vertical bold", slug: "vertical-bold-30x40", w: 30, h: 40, slots: 0, layout: "Brand, full-width bar, colour, a rule, QR centred below.", d: [4, 14.5, 6, 14.7] },
  { id: "verticalCompact", name: "Vertical compact", slug: "vertical-compact-25x40", w: 25, h: 40, slots: 0, layout: "Brand, bar, colour, hex, a rule, a big QR below.", d: [5, 18.1, 8, 19.6] },
  { id: "qrOnly", name: "QR only", slug: "qr-only-25x30", w: 25, h: 30, slots: 0, layout: "The pill centred at the top over a 20 mm QR box, nothing else.", d: [5, 18.1, 8, 19.6] },
];
const DOTS = { 203: (mm) => Math.round(mm * 203 / 25.4), 300: (mm) => Math.round(mm * 300 / 25.4) };

const hash = (file) => createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 10);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function formatCards() {
  return FORMATS.map((f) => {
    const file = `examples/filament/label-${f.slug}.svg`, size = `${f.w} × ${f.h} mm`;
    return `      <article class="fmt" data-id="${f.id}" data-slug="${f.slug}" data-name="${esc(f.name)}" data-size="${size}" data-w="${f.w}">
        <div class="plate"><img src="${file}" alt="${esc(f.name)} TigerQR+ Filament Label, ${size}" width="${f.w * 6}" height="${f.h * 6}" style="width:${(f.w * 4.8).toFixed(0)}px" loading="lazy"></div>
        <div class="body">
          <h3>${esc(f.name)} <small>${size}</small></h3>
          <p><code>${f.id}</code> · ${f.slots ? `${f.slots} value slots` : "no value slot"}</p>
          <p>${esc(f.layout)}</p>
          <div class="row"><a class="btn small" data-dl href="${file}" download>SVG</a><a class="btn small" href="https://tigersystem.io/api/public/v1/label/27996997.svg?template=${f.id}">From the API</a></div>
        </div>
      </article>`;
  }).join("\n");
}

function dotsRows() {
  return FORMATS.map((f) => {
    const cell = (dpi, k, mm) => `${DOTS[dpi](f.w)} × ${DOTS[dpi](f.h)} dots · <b>${k}</b> a module · QR ${mm} mm`;
    return `          <tr><td>${esc(f.name)}</td><td><code>${f.id}</code></td><td class="num">${f.w} × ${f.h} mm</td><td class="num">${cell(203, f.d[0], f.d[1])}</td><td class="num">${cell(300, f.d[2], f.d[3])}</td></tr>`;
  }).join("\n");
}

function jsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}#page`, url: SITE, name: "TigerQR Label", inLanguage: "en",
        description: "The public reference of TigerQR and TigerQR+, the QR labels of the TigerTag ecosystem: qr.tigertag.io links, nine label formats, test vectors and reference code.",
        publisher: { "@type": "Organization", name: "TigerSystem", url: "https://tigersystem.io" } },
      { "@type": "SoftwareSourceCode", name: "TigerQR Label reference code", codeRepository: "https://github.com/TigerTag-Project/TigerQR-Label",
        programmingLanguage: "TypeScript", license: "https://www.apache.org/licenses/LICENSE-2.0" },
    ],
  }).replace(/</g, "\\u003c");
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Files as they are.
for (const name of ["site.css", "site.js", "app.js"]) copyFileSync(join(REPO, "site", name), join(OUT, name));
compileReference(join(OUT, "js"));
cpSync(join(REPO, "examples"), join(OUT, "examples"), { recursive: true, filter: (p) => !p.endsWith(".md") });
cpSync(join(REPO, "assets"), join(OUT, "assets"), { recursive: true });
const BRAND = {
  // White logo on the dark theme, black (contouring) logo on the light one (brand/README.md).
  "logo_tigertag_head.svg": "logo-tigertag-white.svg",
  "logo_tigertag_contouring_head.svg": "logo-tigertag-black.svg",
  "tigersystem-icon-framed.svg": "favicon.svg",
  "tigersystem-apple-touch-icon.png": "apple-touch-icon.png",
};
for (const [from, to] of Object.entries(BRAND)) copyFileSync(join(REPO, "brand", from), join(OUT, "assets", to));
mkdirSync(join(OUT, "test-vectors"));
copyFileSync(join(REPO, "test-vectors/links.json"), join(OUT, "test-vectors/links.json"));
copyFileSync(join(REPO, "llms.txt"), join(OUT, "llms.txt"));

// The page.
let html = readFileSync(join(REPO, "site/index.html"), "utf8");
const fill = { site: SITE, formats: formatCards(), dots: dotsRows(), jsonld: jsonLd() };
html = html.replace(/\{\{v:([\w.]+)\}\}/g, (_, f) => hash(join(OUT, f)))
  .replace(/\{\{(\w+)\}\}/g, (m, k) => (k in fill ? fill[k] : m));
const left = html.match(/\{\{[^}]*\}\}/g);
if (left) throw new Error(`site/index.html: unfilled ${[...new Set(left)].join(", ")}`);
writeFileSync(join(OUT, "index.html"), html);

// Every local picture, script, stylesheet and link must exist.
const missing = [];
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(https?:|mailto:|#|data:)/.test(url) || url === "./") continue;
  const file = join(OUT, url.replace(/[?#].*$/, ""));
  if (!existsSync(file)) missing.push(url);
}
for (const [, id] of html.matchAll(/href="#([\w-]+)"/g)) if (!html.includes(`id="${id}"`)) missing.push(`#${id}`);
if (missing.length) throw new Error(`site/index.html points to nothing: ${[...new Set(missing)].join(", ")}`);

// For search engines.
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
writeFileSync(join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}</loc></url>\n</urlset>\n`);
writeFileSync(join(OUT, ".nojekyll"), "");
console.log(`site built in ${OUT}`);
