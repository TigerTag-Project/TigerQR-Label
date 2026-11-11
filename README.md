# TigerQR Label

**TigerQR** is the QR label of the TigerTag ecosystem: a sticker for a filament spool whose QR code
opens the right page on any phone, with no app. **TigerQR+** is the same label when it is linked to a
product of the TigerTag+ catalogue; **TigerQR** when it is not, the same logic as TigerTag and
TigerTag+.

This repository is the public reference for what a TigerQR label prints and what its link means:

- [`spec/links.md`](spec/links.md): the `qr.tigertag.io` links, how they are read, and who gets what;
- [`spec/labels.md`](spec/labels.md): the nine label formats and how a label is drawn;
- [`test-vectors/links.json`](test-vectors/links.json): every link shape with the answer it must give;
- [`src/`](src/): the reference code that reads and builds the links, the code `qr.tigertag.io` runs;
- [`examples/`](examples/): the nine formats as Tiger Studio exports them.

## One scan, three links

Every label points to `qr.tigertag.io`. The path says what it is.

| Label | Link | What the path is |
|---|---|---|
| Spool with a chip (TigerTag, TigerTag+) | [`qr.tigertag.io/1d33dbda0d1080`](https://qr.tigertag.io/1d33dbda0d1080) | The chip's UID in hex, 14 characters. The twin chip's UID opens the same spool. |
| Spool without a chip (TigerData, TigerData+) | [`qr.tigertag.io/6130922252`](https://qr.tigertag.io/6130922252) | The TigerData id without its `TigerData_` prefix, 10 or 17 digits. The long form `TigerData_6130922252` opens too. |
| Catalogue product (TigerQR+) | [`qr.tigertag.io/p/2673739332`](https://qr.tigertag.io/p/2673739332) | The `id_product` in decimal, always 10 digits with leading zeros ([`/p/0010303748`](https://qr.tigertag.io/p/0010303748)). Labels printed with 8 hex characters ([`/p/9f5e0644`](https://qr.tigertag.io/p/9f5e0644)) still open. |

**Who gets what**

- A spool link: its owner, signed in to their TigerSystem account, gets the spool. Anyone else gets
  the spool's catalogue product and the owner's name, never the spool itself.
- A product link: everyone gets the catalogue product, with no sign-in.

**Files**: add `.json` (the data) or `.ttag` (the file Tiger Studio imports) to any link to build your
own interface: [`/p/2673739332.json`](https://qr.tigertag.io/p/2673739332.json),
[`/p/2673739332.ttag`](https://qr.tigertag.io/p/2673739332.ttag). On a spool link they answer the
owner only; anyone else is sent (303) to the product's `.json` / `.ttag`.

**Shared links** may start with the sharer's language,
[`qr.tigertag.io/fr/p/2673739332`](https://qr.tigertag.io/fr/p/2673739332): the page and its preview
on social networks then open in it, for everyone. Printed labels never carry a language.

Links are printed lowercase and read in any case.

## Make a label

- In Tiger Studio: the Spool Label for your own spool, the Filament Label for a catalogue product.
- On the web, from the catalogue, every format at once:
  [tigersystem.io/en/tiger-qr-labels](https://tigersystem.io/en/tiger-qr-labels#label-generator).
- From code, any catalogue product by its id:
  `GET https://tigersystem.io/api/public/v1/label/<id>.svg?template=<format>&dpi=<203|300>`
  ([example](https://tigersystem.io/api/public/v1/label/2673739332.svg?template=qrOnly)),
  `<id>.json` for what it prints and its link, `<id>.html` for a widget to frame on any site
  ([documentation](https://tigersystem.io/en/embed)).

## Related

- The full link contract, with every edge case: [Spool ids and QR links](https://wiki.tigersystem.io/developers/spool-ids-and-qr-links/)
- The TigerTag chip protocol: [TigerTag-RFID-Guide](https://github.com/TigerTag-Project/TigerTag-RFID-Guide)
- The labels explained, and a link generator: [tigersystem.io/en/tiger-qr-labels](https://tigersystem.io/en/tiger-qr-labels)

## Licence

Documentation and examples: CC-BY-4.0. Code in `src/`: Apache-2.0. Implementing these links and
labels needs no licence and no payment. Details in [LICENSING.md](LICENSING.md).
