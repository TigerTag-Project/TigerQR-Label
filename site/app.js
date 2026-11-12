// SPDX-License-Identifier: Apache-2.0
// The page's tools: the formats gallery, the link generator, the link reader and
// the label API preview. The links are read and built by the reference code of
// src/ (published by tools/build-site.mjs as js/parse.js and js/links.js), the QR
// drawn by qrcode-generator 2.0.4, the version Tiger Studio and tigersystem.io use.
import { parseQrPath, splitLangPrefix } from "./js/parse.js";
import { productLink, qrLinkFrom, sharedLink, spoolLink } from "./js/links.js";

const $ = (id) => document.getElementById(id);
const API = "https://tigersystem.io/api/public/v1/label/";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// ── Formats gallery: one set of nine labels at a time ──
const SETS = {
  "filament": "QR: <code>https://qr.tigertag.io/p/0027996997</code>, a Polymaker Panchroma Gradient Silk Fire (catalogue product). The pill is always TigerQR+.",
  "spool/tigerqr-plus": "QR: <code>https://qr.tigertag.io/17941702052264512</code>, a spool without a chip whose reference is a catalogue product: TigerQR+.",
  "spool/tigerqr": "QR: <code>https://qr.tigertag.io/17941702052264512</code>, the same spool with no catalogue product: TigerQR.",
};
document.querySelectorAll("#formats .tab").forEach((tab) => tab.addEventListener("click", () => {
  const set = tab.dataset.set;
  document.querySelectorAll("#formats .tab").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
  $("set-link").innerHTML = SETS[set];
  document.querySelectorAll("#formats .fmt").forEach((card) => {
    const file = `examples/${set}/label-${card.dataset.slug}.svg`;
    const kind = set === "filament" ? "Filament Label" : "Spool Label";
    const pill = set === "spool/tigerqr" ? "TigerQR" : "TigerQR+";
    const img = card.querySelector("img");
    img.src = file;
    img.alt = `${card.dataset.name} ${pill} ${kind}, ${card.dataset.size}`;
    card.querySelector("[data-dl]").href = file;
  });
}));

// ── The QR as a label draws it: one byte segment, ECC M, a 4-module quiet zone ──
let qrcode = null;
import("https://cdn.jsdelivr.net/npm/qrcode-generator@2.0.4/dist/qrcode.mjs")
  .then((m) => { qrcode = m.default; generate(); })
  .catch(() => {});
function qrSvg(text) {
  if (!qrcode) return "";
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount(), q = 4, size = n + 2 * q;
  let d = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c + q} ${r + q}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img" aria-label="QR code, ${n} by ${n} modules"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

// ── Link generator ──
const HINTS = {
  product: "id_product in decimal, or the 8 hex characters of an older label, or a whole link",
  chip: "the chip UID in hex, with or without separators, or a whole link",
  data: "the TigerData id, with or without its TigerData_ prefix, or a whole link",
};
const KIND_NAME = { product: "a catalogue product", chip: "a spool with a chip", data: "a spool without a chip" };
const btn = (href, label, extra = "") => `<a class="btn small" href="${esc(href)}"${extra}>${esc(label)}</a>`;
function generate() {
  const kind = $("g-kind").value, lang = $("g-lang").value;
  $("g-hint").textContent = HINTS[kind];
  const res = qrLinkFrom(kind, $("g-in").value);
  if (!res) {
    $("g-out").className = "result err";
    $("g-out").textContent = `Not ${KIND_NAME[kind]}: no link.`;
    $("g-meta").textContent = kind === "product" ? "0 and 4294967295 mean \"no product\": they get no link." : "";
    $("g-qr").innerHTML = "";
    $("g-actions").innerHTML = "";
    return;
  }
  const printed = res.link, shared = lang ? sharedLink(printed, lang) : null;
  $("g-out").className = "result";
  $("g-out").textContent = shared || printed;
  $("g-meta").innerHTML = (res.kind !== kind ? `Read as ${KIND_NAME[res.kind]}. ` : "")
    + (shared ? `Shared link, opens in <code>${esc(lang)}</code>. The QR shows the printed link, <code>${esc(printed)}</code>: a label never carries a language.`
      : `The printed link, ${printed.length} characters. The QR is ${qrcode ? "the one a label prints" : "drawn once the QR library has loaded"}.`);
  $("g-qr").innerHTML = qrSvg(printed);
  let actions = btn(shared || printed, "Open") + btn(`${printed}.json`, ".json") + btn(`${printed}.ttag`, ".ttag");
  if (res.kind === "product") actions += btn(`${API}${Number(printed.split("/").pop())}.svg?template=classic`, "Label SVG");
  actions += `<button type="button" class="btn small" id="g-copy">Copy</button>`;
  $("g-actions").innerHTML = actions;
  $("g-copy").addEventListener("click", (e) => {
    navigator.clipboard?.writeText(shared || printed).then(() => { e.target.textContent = "Copied"; }, () => {});
  });
}
["g-kind", "g-lang"].forEach((id) => $(id).addEventListener("change", generate));
$("g-in").addEventListener("input", generate);
$("g-samples").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  $("g-kind").value = b.dataset.kind;
  $("g-in").value = b.dataset.v;
  generate();
});

// ── Link reader ──
function read() {
  const raw = $("r-in").value.trim();
  let path = raw.replace(/^(https?:\/\/)?qr\.tigertag\.io/i, "").replace(/[?#].*$/, "");
  if (!path.startsWith("/")) path = `/${path}`;
  const { lang, path: rest } = splitLangPrefix(path);
  const target = parseQrPath(rest);
  const link = target.kind === "product" ? productLink(target.idProduct) : target.kind === "spool" ? spoolLink(target.spoolId) : null;
  const out = { lang, path: rest, target };
  if (link) out.printedLink = link;
  $("r-out").textContent = JSON.stringify(out, null, 2);
}
$("r-in").addEventListener("input", read);
$("r-samples").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  $("r-in").value = b.dataset.v;
  read();
});

// ── Label API preview ──
const TEMPLATES = [...document.querySelectorAll("#formats .fmt")].map((c) => [c.dataset.id, c.dataset.name]);
$("a-tpl").innerHTML = TEMPLATES.map(([id, name]) => `<option value="${id}">${esc(name)}</option>`).join("");
let timer = 0;
function api() {
  const id = $("a-id").value.trim(), tpl = $("a-tpl").value, dpi = $("a-dpi").value;
  if (!/^\d{1,10}$/.test(id)) { $("a-links").innerHTML = `<p class="meta">A product id is 1 to 10 digits.</p>`; return; }
  const svg = `${API}${id}.svg?template=${tpl}&dpi=${dpi}`;
  $("a-img").src = svg;
  const card = document.querySelector(`#formats .fmt[data-id="${tpl}"]`);
  $("a-img").style.width = `${Number(card?.dataset.w || 40) * 7}px`;
  $("a-links").innerHTML = btn(svg, `${id}.svg`) + btn(`${API}${id}.json`, `${id}.json`) + btn(`${API}${id}.html?template=${tpl}`, `${id}.html`)
    + (productLink(Number(id)) ? btn(productLink(Number(id)), "Product link") : "");
}
$("a-img").addEventListener("error", () => { $("a-links").insertAdjacentHTML("afterbegin", `<p class="meta">No label: this id is not in the catalogue.</p>`); });
$("a-id").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(api, 350); });
["a-tpl", "a-dpi"].forEach((id) => $(id).addEventListener("change", api));

generate();
read();
api();
