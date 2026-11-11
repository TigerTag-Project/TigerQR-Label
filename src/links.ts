// SPDX-License-Identifier: Apache-2.0
// Reference code of qr.tigertag.io (TigerTag Hub, lib/qr/links.ts), published as is.
import { parseQrPath, productDec, splitLangPrefix } from "./parse";

/**
 * The qr.tigertag.io links as the apps print them (contract "Spool ids and QR
 * links", §2), the other way round from `parse.ts`: an id in, the short link
 * out. Pure, so the share buttons and the /tiger-qr-labels playground build in
 * the browser the very link a label prints.
 */
export const QR_BASE = "https://qr.tigertag.io";

/** The three kinds of link a label can carry. */
export type QrKind = "chip" | "data" | "product";

/** https://qr.tigertag.io/p/<id_product on 10 digits>; null without a real
 * id_product (0 and 0xFFFFFFFF mean "unset"): Studio prints no product label
 * for those. */
export function productLink(idProduct: number): string | null {
  const n = Number(idProduct);
  if (!Number.isInteger(n) || n <= 0 || n >= 0xffffffff) return null;
  return `${QR_BASE}/p/${productDec(n)}`;
}

/** A short link to share, in the sharer's language: `qr.tigertag.io/<lang>/…`
 * (never printed: a label stays language-neutral). */
export function sharedLink(link: string, locale: string): string {
  return link.replace(/^(https:\/\/qr\.tigertag\.io)\//, `$1/${locale}/`);
}

/** The short link of a spool's inventory document id: the chip UID in
 * lowercase hex, or a TigerData id without its prefix. */
export function spoolLink(docId: string): string | null {
  const data = /^TigerData_(\d{17}|\d{10})$/i.exec(docId);
  if (data) return `${QR_BASE}/${data[1]}`;
  if (/^[0-9a-f]{14}$/i.test(docId)) return `${QR_BASE}/${docId.toLowerCase()}`;
  return null;
}

/**
 * The link for what someone typed: a whole link or path (read with
 * `parseQrPath`, whatever `kind` says, and the kind it names returned), or a
 * bare id of the given kind — a chip UID with or without separators, a
 * TigerData id with or without its prefix, an id_product in decimal (or the 8
 * hex characters of an old label). Null when it is none of those.
 */
export function qrLinkFrom(kind: QrKind, typed: string): { kind: QrKind; link: string } | null {
  const raw = typed.trim();
  if (!raw) return null;

  if (/qr\.tigertag\.io|\//i.test(raw)) {
    const path = raw.replace(/^(https?:\/\/)?qr\.tigertag\.io/i, "").replace(/[?#].*$/, "");
    // A shared link's language goes: the label link is the same in every language.
    const target = parseQrPath(splitLangPrefix(path).path);
    if (target.kind === "product") {
      const link = productLink(target.idProduct);
      return link ? { kind: "product", link } : null;
    }
    if (target.kind === "spool") {
      const link = spoolLink(target.spoolId);
      return link ? { kind: target.spoolId.startsWith("TigerData_") ? "data" : "chip", link } : null;
    }
    return null;
  }

  if (kind === "chip") {
    let hex = raw.replace(/[\s:-]/g, "");
    if (!/^[0-9a-f]+$/i.test(hex)) return null;
    // A truncated NTAG UID (its leading 0 lost), as the reader puts it back.
    if (/^4[0-9a-f]{12}$/i.test(hex)) hex = `0${hex}`;
    const link = spoolLink(hex);
    return link ? { kind, link } : null;
  }
  if (kind === "data") {
    const id = raw.replace(/^tigerdata[_-]?/i, "");
    const link = /^(\d{17}|\d{10})$/.test(id) ? spoolLink(`TigerData_${id}`) : null;
    return link ? { kind, link } : null;
  }
  const n = /^\d{1,10}$/.test(raw) ? Number(raw) : /^[0-9a-f]{8}$/i.test(raw) ? Number.parseInt(raw, 16) : NaN;
  const link = productLink(n);
  return link ? { kind, link } : null;
}
