# TigerQR links

A TigerQR label carries one link on `https://qr.tigertag.io/`. This page says how a link is read
and what each one answers. The reference reader is [`src/parse.ts`](../src/parse.ts) and the
reference builder is [`src/links.ts`](../src/links.ts). [`test-vectors/links.json`](../test-vectors/links.json)
lists every shape below with the exact result.

## Reading a path

The path is read case-insensitively. A trailing `/` is ignored, and so is one ending: `.json` or
`.ttag` (any case). What is left is matched in this order:

| Path | Names | Notes |
|---|---|---|
| `p/<8 hex>` | a product, `id_product` = the hex value | Labels printed before the decimal form. Exactly 8 digits are read as hex first; the server tries the decimal reading when the hex one is not in the catalogue. |
| `p/<1 to 10 digits>` | a product, `id_product` = the decimal value | Printed as 10 digits, zero-padded: `p/0010303748`. |
| `p/00000000`, `p/0`, `p/ffffffff`, `p/4294967295` | "no product" | Never printed; answers 404. |
| `p/<above 4294967295>` | unknown | Answers "update the app". |
| `<14 hex>` | a spool with a chip | The chip UID. Inventory id: the UID in uppercase. |
| `<13 hex starting with 4>` | a spool with a chip | An NTAG UID that lost its leading 0: the 0 is put back. |
| `<10 digits>` or `<17 digits>` | a spool without a chip | Inventory id: `TigerData_<digits>`. |
| `tigerdata_<digits>`, `tigerdata-<digits>` | a spool without a chip | The long form, typed or shared by hand. |
| anything else | unknown | A label from a newer version: "update the app" (404). |

Because a chip UID has 14 characters and a TigerData id 10 or 17 digits, an all-digit UID is never
read as a TigerData id. A product link always starts with `p/`, so it never collides with a spool.

## Shared links: the language prefix

A link that is shared (from a Share button, not printed) may start with the sharer's language:
`/<lang>/p/<id>` or `/<lang>/<spool id>`, where `<lang>` is one of `en`, `fr`, `de`, `es`, `it`,
`zh`, `pt`, `pt-pt`, `pl`, `ru`, `nl`. Every page answer then opens in that language for whoever
follows it, link-preview crawlers included. Without a prefix, the visitor's browser language
decides. An unknown prefix answers 404. Printed labels never carry a prefix, so a printed QR stays
the same in every country.

A reader handed a link (an app that scans or pastes one) drops one leading `/<lang>/` first, then
reads the rest as above: `/fr/p/2673739332` is the product `/p/2673739332`. It never stores or
prints the prefix: a label made from a shared link carries the bare link. The reference is
`splitLangPrefix` in [`src/parse.ts`](../src/parse.ts).

## What a link answers

### Product link

| Ending | Answer |
|---|---|
| none | 302 to the product's catalogue page on tigersystem.io |
| `.json` | the catalogue record, JSON (`?lang=` picks the text language), cacheable, any origin |
| `.ttag` | the TigerData+ record Tiger Studio creates from the product, as a file to import |

A product that left the catalogue (unknown, archived, merged) answers one "forgotten product" page
with status 404, or `{"error":"not-in-catalogue"}` for `.json` / `.ttag`.

### Spool link

| Who | No ending | `.json` / `.ttag` |
|---|---|---|
| The owner, signed in to their TigerSystem account | the spool | the spool (with `Authorization: Bearer <ID token>`) |
| Anyone else | the spool's catalogue product and the owner's display name | 303 to the product's `.json` / `.ttag` (404 without a product) |

A spool with no catalogue product shows a private page to anyone but its owner. Nothing of the
spool itself (weight, note, location) is ever shown to anyone else. A spool link may carry
`?weight=<grams>` and `?note=<text>`; they are passed on to the owner's spool page.

## Building a link

| From | Printed link |
|---|---|
| Chip UID `1D33DBDA0D1080` (inventory id) | `https://qr.tigertag.io/1d33dbda0d1080` (lowercase) |
| TigerData id `TigerData_6130922252` | `https://qr.tigertag.io/6130922252` (prefix removed) |
| `id_product` 10303748 | `https://qr.tigertag.io/p/0010303748` (decimal, 10 digits) |
| `id_product` 0 or 4294967295 | no link: these mean "unset" |

Links are always printed in lowercase, in one QR byte segment (see [labels.md](labels.md)).
