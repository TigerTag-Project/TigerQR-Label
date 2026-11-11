// SPDX-License-Identifier: Apache-2.0
// Reference code of qr.tigertag.io (TigerTag Hub, lib/qr/parse.ts), published as is.
/**
 * Reads a qr.tigertag.io path back into what it points at — the contract
 * "Spool ids and QR links" (TigerSystem-Docs, docs/developers/
 * spool-ids-and-qr-links.md, §3 Reading a link back, §5, §6). Pure: no I/O, so
 * the apps' offline readers and this server agree by construction.
 *
 * Links are printed lowercase, but a link typed or shared by hand may not be:
 * every shape is matched case-insensitively and a trailing "/" is ignored. The
 * length decides between a chip UID (14 hex) and a chipless id (17 or 10
 * digits), so an all-digit UID is never misread.
 *
 * A product link is printed as the decimal `id_product` on 10 digits,
 * zero-padded (`p/0010303748`; founder, 2026-11-11: no collision possible, an
 * id_product never has more than 10 digits). Labels printed before carry 8 hex
 * characters, and keep working: 8 characters are hex, 10 digits are decimal —
 * two lengths, never confused. A hand-typed decimal of another length is read
 * as decimal; exactly 8 digits stay hex first (the old labels), with the
 * decimal reading as `idProductAlt` for the server to try when the hex one is
 * not in the catalogue.
 */

export type QrFormat = "page" | "json" | "ttag";

export type QrTarget =
  | { kind: "root" }
  | { kind: "spool"; spoolId: string; format: QrFormat }
  | { kind: "product"; idProduct: number; hex: string; format: QrFormat; idProductAlt?: number }
  /** `p/00000000` and `p/ffffffff`: "no product", never printed — 404. */
  | { kind: "no-product"; format: QrFormat }
  /** Any other shape: a label from a newer version — "update the app". */
  | { kind: "unknown"; format: QrFormat };

export function parseQrPath(rawPath: string): QrTarget {
  let path = rawPath;
  try {
    path = decodeURIComponent(rawPath);
  } catch {
    // A malformed escape is just an unknown shape.
  }
  path = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (path === "") return { kind: "root" };

  let format: QrFormat = "page";
  const ending = /\.(json|ttag)$/i.exec(path);
  if (ending) {
    format = ending[1].toLowerCase() as QrFormat;
    path = path.slice(0, -ending[0].length);
  }

  const product = /^p\/([0-9a-f]{8})$/i.exec(path);
  if (product) {
    const hex = product[1].toLowerCase();
    const idProduct = Number.parseInt(hex, 16);
    if (idProduct === 0 || idProduct === 0xffffffff) return { kind: "no-product", format };
    const alt = /^\d{8}$/.test(hex) ? Number(hex) : NaN;
    return alt > 0 && alt !== idProduct
      ? { kind: "product", idProduct, hex, format, idProductAlt: alt }
      : { kind: "product", idProduct, hex, format };
  }
  const decimal = /^p\/(\d{1,10})$/i.exec(path);
  if (decimal) {
    const idProduct = Number(decimal[1]);
    if (idProduct > 0xffffffff) return { kind: "unknown", format };
    if (idProduct === 0 || idProduct === 0xffffffff) return { kind: "no-product", format };
    return { kind: "product", idProduct, hex: productHex(idProduct), format };
  }

  const spoolId = spoolIdOf(path);
  if (spoolId) return { kind: "spool", spoolId, format };
  return { kind: "unknown", format };
}

// The site's eleven locales (lib/i18n/config.ts LOCALES), kept here so this
// file stays free of imports.
const LANG_PREFIX = /^\/*(en|fr|de|es|it|zh|pt-pt|pt|pl|ru|nl)(?=\/|$)/i;

/**
 * A shared link may carry the sharer's language first — `/fr/p/<id>`,
 * `/fr/<spool id>` (founder, 2026-11-11) — so the page and its preview open in
 * it, for everyone, crawlers included. Printed labels never do: they stay
 * language-neutral. Returns the language (lowercase) and the path after it.
 */
export function splitLangPrefix(rawPath: string): { lang: string | null; path: string } {
  const m = LANG_PREFIX.exec(rawPath);
  if (!m) return { lang: null, path: rawPath };
  return { lang: m[1].toLowerCase(), path: rawPath.slice(m[0].length) || "/" };
}

/** The inventory document id a spool path names, or null. */
export function spoolIdOf(path: string): string | null {
  // Short form, as the apps print it.
  if (/^(\d{17}|\d{10})$/.test(path)) return `TigerData_${path}`;
  if (/^[0-9a-f]{14}$/i.test(path)) return path.toUpperCase();
  // A truncated NTAG UID (its leading 0 lost): put it back.
  if (/^4[0-9a-f]{12}$/i.test(path)) return `0${path}`.toUpperCase();
  // Long form, typed or shared by hand: the prefix in any case, "_" or "-".
  const long = /^tigerdata[_-](\d{17}|\d{10})$/i.exec(path);
  if (long) return `TigerData_${long[1]}`;
  // `CLOUD_` and legacy decimal ids are never printed, so never read.
  return null;
}

/** The product link of an id_product, as printed: its decimal value on 10
 * digits, zero-padded. */
export function productDec(idProduct: number): string {
  return String(idProduct >>> 0).padStart(10, "0");
}

/** An id_product in the 8 lowercase hex characters labels printed before the
 * decimal form carry (still read; the .ttag record id keeps it). */
export function productHex(idProduct: number): string {
  return (idProduct >>> 0).toString(16).padStart(8, "0");
}
