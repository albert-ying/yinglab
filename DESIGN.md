# Design record

Reference: https://pear.no/ (named by Albert, 2026-10-12, "要有高级审美"; "not just color.. and font, i want that animation"). Values below were measured from its stylesheet `/assets/index-Bd_JnIbr.css` on 2026-10-12 unless noted.

| Token | Value | Source |
|---|---|---|
| Paper ground | `#f2f1ed` | pear.no `--paper:#f2f1ed` |
| Ink | `#1d1c19` | pear.no `--ink:#1d1c19` |
| Press (near black) | `#0b0a09` | pear.no `--press:#0b0a09` |
| Printed blue sheet | `#003a88` | median ground of the woodblock series |
| Display face | Instrument Serif 400 | pear.no uses Flecha (commercial serif) for titles; nearest open licence face |
| Body face | Oxygen | Albert's own theme font (memory `feedback_slide_font_oxygen`, 2026-09-30) |
| Labels | JetBrains Mono, 0.6875rem, 0.2em tracking, uppercase | pear.no `.type-label{font-family:var(--font-mono);letter-spacing:.2em;text-transform:uppercase;font-size:.6875rem}`; used for units, captions, nav and buttons, not above headings |
| Easing | `cubic-bezier(.22,1,.36,1)` | pear.no `--ease` |
| Margin rules with four-point stars | 1px, rule at each sheet margin | pear.no `.ov .gv/.gh` rules and `cross` keyframe |
| Motion | eased wheel scroll; WebGL hero; line-by-line headline rise; rules that draw in; ink soak to paper | pear.no `a.js` (wheel easing, `settle`, `ruleV/ruleH`, `soak` shader) |
| Artwork | Ukiyo-e woodblock series in the decorative manner of the anime Mononoke (lineup with Greenland shark, species, person, tissue, cell, molecule, agents, brain) | Albert, 2026-10-14: picked the woodblock direction, "往浮世绘、东方一点走", "怪化猫那种style", add the Greenland shark; sources in `~/Desktop/Projects/website/yinglab-art/2026-10-14_ukiyoe/` |
| Logo | Upright small neural network whose output runs up a dotted line to an open circle | Albert, 2026-10-14: concept E "竖起来"; the mark should say AI as well as aging |

Rejected directions: minimal white with hairlines ("I want fancier"); dark navy with glow, gradient text and glass ("这个coloring太烂大街"). No rust or terracotta (2026-09-17).
