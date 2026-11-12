# Examples

The nine TigerQR formats, drawn by the label renderer Tiger Studio and tigersystem.io share (SVG,
sized in millimetres, drawn for 300 dpi), for a Polymaker Panchroma Gradient Silk Fire,
`id_product` 27996997. Every QR decodes to its link at 203 and 300 dpi.

| Folder | Label | Its QR | Pill |
|---|---|---|---|
| [`filament/`](filament/) | Filament Label: the catalogue product | `https://qr.tigertag.io/p/0027996997` | TigerQR+ |
| [`spool/tigerqr-plus/`](spool/tigerqr-plus/) | Spool Label: a spool without a chip whose reference is that catalogue product | `https://qr.tigertag.io/17941702052264512` | TigerQR+ |
| [`spool/tigerqr/`](spool/tigerqr/) | Spool Label: the same spool with no catalogue product | `https://qr.tigertag.io/17941702052264512` | TigerQR |

The Filament Labels are the files Tiger Studio exports, byte for byte. The value slots are nozzle,
bed and drying temperatures and the TD.

| Format | Filament Label | Spool Label, TigerQR+ | Spool Label, TigerQR |
|---|---|---|---|
| Classic, 40 × 30 mm | [svg](filament/label-classic-40x30.svg) | [svg](spool/tigerqr-plus/label-classic-40x30.svg) | [svg](spool/tigerqr/label-classic-40x30.svg) |
| Wide, 50 × 30 mm | [svg](filament/label-wide-50x30.svg) | [svg](spool/tigerqr-plus/label-wide-50x30.svg) | [svg](spool/tigerqr/label-wide-50x30.svg) |
| Compact, 40 × 25 mm | [svg](filament/label-compact-40x25.svg) | [svg](spool/tigerqr-plus/label-compact-40x25.svg) | [svg](spool/tigerqr/label-compact-40x25.svg) |
| Slim, 40 × 12 mm | [svg](filament/label-slim-40x12.svg) | [svg](spool/tigerqr-plus/label-slim-40x12.svg) | [svg](spool/tigerqr/label-slim-40x12.svg) |
| Slicer-friendly, 40 × 30 mm | [svg](filament/label-slicer-40x30.svg) | [svg](spool/tigerqr-plus/label-slicer-40x30.svg) | [svg](spool/tigerqr/label-slicer-40x30.svg) |
| Vertical, 30 × 40 mm | [svg](filament/label-vertical-30x40.svg) | [svg](spool/tigerqr-plus/label-vertical-30x40.svg) | [svg](spool/tigerqr/label-vertical-30x40.svg) |
| Vertical bold, 30 × 40 mm | [svg](filament/label-vertical-bold-30x40.svg) | [svg](spool/tigerqr-plus/label-vertical-bold-30x40.svg) | [svg](spool/tigerqr/label-vertical-bold-30x40.svg) |
| Vertical compact, 25 × 40 mm | [svg](filament/label-vertical-compact-25x40.svg) | [svg](spool/tigerqr-plus/label-vertical-compact-25x40.svg) | [svg](spool/tigerqr/label-vertical-compact-25x40.svg) |
| QR only, 25 × 30 mm | [svg](filament/label-qr-only-25x30.svg) | [svg](spool/tigerqr-plus/label-qr-only-25x30.svg) | [svg](spool/tigerqr/label-qr-only-25x30.svg) |

The same Filament Label for any catalogue product, in any format and at 203 or 300 dpi:
`https://tigersystem.io/api/public/v1/label/<id>.svg?template=<format>&dpi=<203|300>`, or every
format at once in the [TigerQR Playground](https://tigersystem.io/playground-tigerqr).
