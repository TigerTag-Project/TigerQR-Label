# TigerQR label formats

Tiger Studio prints two kinds of TigerQR label:

- the **Spool Label**, for a spool of your inventory: its QR is the spool link;
- the **Filament Label**, for a catalogue product: its QR is the product link.

The pill on the label says **TigerQR+** when the label is linked to a catalogue product (every
Filament Label, and a Spool Label whose spool has a product) and **TigerQR** when it is not.

## The nine formats

| Format | Id | Size (mm) | Value slots | Example |
|---|---|---|---|---|
| Classic | `classic` | 40 × 30 | 4 | [svg](../examples/filament/label-classic-40x30.svg) |
| Wide | `expanded` | 50 × 30 | 4 | [svg](../examples/filament/label-wide-50x30.svg) |
| Compact | `compact` | 40 × 25 | 0 | [svg](../examples/filament/label-compact-40x25.svg) |
| Slim | `slim` | 40 × 12 | 0 | [svg](../examples/filament/label-slim-40x12.svg) |
| Slicer-friendly | `slicer` | 40 × 30 | 0 | [svg](../examples/filament/label-slicer-40x30.svg) |
| Vertical | `vertical` | 30 × 40 | 4 | [svg](../examples/filament/label-vertical-30x40.svg) |
| Vertical bold | `verticalBold` | 30 × 40 | 0 | [svg](../examples/filament/label-vertical-bold-30x40.svg) |
| Vertical compact | `verticalCompact` | 25 × 40 | 0 | [svg](../examples/filament/label-vertical-compact-25x40.svg) |
| QR only | `qrOnly` | 25 × 30 | 0 | [svg](../examples/filament/label-qr-only-25x30.svg) |

Every format exists as a Filament Label and as a Spool Label: [`examples/`](../examples/) has the
nine of each, TigerQR+ and TigerQR.

The value slots print, in order: nozzle, bed and drying temperatures, then the TD when the product
has one, else the diameter. **QR only** prints the pill centred at the top over a 20 mm QR, and
nothing else.

## How a label is drawn

- One SVG per label, sized in millimetres, laid out in tenths of a millimetre and scaled to printer
  dots at **203** or **300 dpi**.
- The QR is one byte-mode segment, error correction level **M**, of the lowercase link.
- Every QR module covers a whole number of printer dots, so the code stays sharp on a thermal
  printer. A PNG is drawn at exactly the label's size in dots, never resampled.
- The label's white margins are the QR's quiet zone.
- Texts never run over the QR or the pill: a long text shrinks first, then is narrowed.

Tiger Studio and tigersystem.io draw the same SVG, byte for byte, for the same label, format and
resolution.

## Printer dots per module

Every spool and product link is a 29 × 29 code (version 3). The label in dots, the dots a module
and the QR's printed side:

| Format | 203 dpi | 300 dpi |
|---|---|---|
| Classic | 320 × 240, 4 dots, 14.5 mm | 472 × 354, 6 dots, 14.7 mm |
| Wide | 400 × 240, 4 dots, 14.5 mm | 591 × 354, 6 dots, 14.7 mm |
| Compact | 320 × 200, 4 dots, 14.5 mm | 472 × 295, 6 dots, 14.7 mm |
| Slim | 320 × 96, 3 dots, 10.9 mm | 472 × 142, 4 dots, 9.8 mm |
| Slicer-friendly | 320 × 240, 5 dots, 18.1 mm | 472 × 354, 8 dots, 19.6 mm |
| Vertical | 240 × 320, 4 dots, 14.5 mm | 354 × 472, 5 dots, 12.3 mm |
| Vertical bold | 240 × 320, 4 dots, 14.5 mm | 354 × 472, 6 dots, 14.7 mm |
| Vertical compact | 200 × 320, 5 dots, 18.1 mm | 295 × 472, 8 dots, 19.6 mm |
| QR only | 200 × 240, 5 dots, 18.1 mm | 295 × 354, 8 dots, 19.6 mm |

The number of dots a module is the nearest one that fills the format's QR box, rounded up when
that stays within 6 % of the box, down otherwise.

## Checking that a label scans

Every example decodes to its link at 203 and 300 dpi: `https://qr.tigertag.io/p/0027996997` (a
Polymaker Panchroma Gradient Silk Fire) on the Filament Labels,
`https://qr.tigertag.io/17941702052264512` on the Spool Labels. When you print one, check it with a phone camera
before you stick a batch: a printer that smears dots, or a label scaled to fit a page, is the usual
cause of a QR that will not read.
