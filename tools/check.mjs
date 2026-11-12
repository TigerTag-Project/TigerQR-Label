#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// The reference code of src/ against every test vector, and the documents
// against their own links.
//
//   node tools/check.mjs          (Node 22.13 or later)
//
// - test-vectors/links.json: every case of every section, through src/parse.ts
//   and src/links.ts (their types stripped by Node, nothing else changed);
// - README.md, spec/, examples/README.md: every relative link and picture
//   points to a file of the repository;
// - no emoji in the documents or the site (inline SVG icons or words instead).
import { mkdtempSync, readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { compileReference, REPO } from "./reference.mjs";

const failures = [];
const fail = (msg) => failures.push(msg);

// ── Test vectors ──
const tmp = mkdtempSync(join(tmpdir(), "tigerqr-"));
const [parseJs, linksJs] = compileReference(tmp);
const P = await import(pathToFileURL(parseJs).href);
const L = await import(pathToFileURL(linksJs).href);
rmSync(tmp, { recursive: true, force: true });

const V = JSON.parse(readFileSync(join(REPO, "test-vectors/links.json"), "utf8"));
const RUN = {
  read: (c) => [P.parseQrPath(c.path), c.path],
  lang: (c) => [P.splitLangPrefix(c.path), c.path],
  build: (c) => [L.qrLinkFrom(c.kind, c.input), `${c.kind} ${JSON.stringify(c.input)}`],
  spoolLink: (c) => [L.spoolLink(c.docId), c.docId],
  productLink: (c) => [L.productLink(c.id_product), String(c.id_product)],
  sharedLink: (c) => [L.sharedLink(c.link, c.lang), `${c.link} ${c.lang}`],
};
let cases = 0;
for (const [section, run] of Object.entries(RUN)) {
  for (const c of V[section] ?? []) {
    cases++;
    const [got, name] = run(c);
    if (!isDeepStrictEqual(got, c.expect)) fail(`test-vectors ${section} ${name}: expected ${JSON.stringify(c.expect)}, got ${JSON.stringify(got)}`);
  }
}
for (const section of Object.keys(V)) if (section !== "about" && !(section in RUN)) fail(`test-vectors: section "${section}" has no runner`);

// ── Links of the documents ──
const docs = ["README.md", "LICENSING.md", "examples/README.md", "brand/README.md",
  ...readdirSync(join(REPO, "spec")).map((f) => `spec/${f}`)].filter((f) => existsSync(join(REPO, f)));
for (const doc of docs) {
  // Code blocks are code, not links.
  const text = readFileSync(join(REPO, doc), "utf8").replace(/```[\s\S]*?```/g, "");
  const targets = [...text.matchAll(/\]\(([^)\s]+)\)/g), ...text.matchAll(/(?:src|href|srcset)="([^"]+)"/g)].map((m) => m[1]);
  for (const t of targets) {
    if (/^(https?:|mailto:|#)/.test(t)) continue;
    const file = join(dirname(join(REPO, doc)), t.replace(/#.*$/, ""));
    if (!existsSync(file)) fail(`${doc}: ${t} points to no file`);
  }
}

// ── No emoji ──
const EMOJI = /\p{Extended_Pictographic}/u;
const ALLOWED = /[©®™]/g; // ©, ®, ™ are text, not emoji
const textFiles = [...docs, "llms.txt", "site/index.html", "site/app.js", "site/site.css"];
for (const f of textFiles) {
  const lines = readFileSync(join(REPO, f), "utf8").split("\n");
  lines.forEach((line, i) => { if (EMOJI.test(line.replace(ALLOWED, ""))) fail(`${f}:${i + 1}: emoji`); });
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}
console.log(`ok: ${cases} test vectors pass; ${docs.length} documents link to existing files; no emoji`);
