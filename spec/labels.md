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

## Checking that a label scans

Every example here decodes to its link (`https://qr.tigertag.io/p/0027996997`, a Polymaker
Panchroma Gradient Silk Fire) at 203 and 300 dpi. When you print one, check it with a phone camera
before you stick a batch: a printer that smears dots, or a label scaled to fit a page, is the usual
cause of a QR that will not read.
