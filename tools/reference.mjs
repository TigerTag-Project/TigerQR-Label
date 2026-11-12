// SPDX-License-Identifier: Apache-2.0
// The reference code in src/ as plain JavaScript modules, its TypeScript types
// stripped by Node itself (node:module stripTypeScriptTypes, Node 22.13+): the
// site and the test runner run the very code qr.tigertag.io runs, never a copy.
import { stripTypeScriptTypes } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = fileURLToPath(new URL("../", import.meta.url));
const SOURCES = ["parse", "links"];

/** Writes `parse.js` and `links.js` into `dir` and returns their paths. */
export function compileReference(dir) {
  mkdirSync(dir, { recursive: true });
  return SOURCES.map((name) => {
    const ts = readFileSync(join(REPO, "src", `${name}.ts`), "utf8");
    const js = stripTypeScriptTypes(ts, { mode: "strip" })
      // Browsers and Node resolve ESM by full file name.
      .replace(/from "\.\/(\w+)"/g, 'from "./$1.js"');
    const out = join(dir, `${name}.js`);
    writeFileSync(out, js);
    return out;
  });
}
