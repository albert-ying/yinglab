# Design record

Reference: https://pear.no/ (named by Albert, 2026-10-12, "要有高级审美"; "not just color.. and font, i want that animation"). Values below were measured from its stylesheet `/assets/index-Bd_JnIbr.css` on 2026-10-12 unless noted.

| Token | Value | Source |
|---|---|---|
| Paper ground | `#f2f1ed` | pear.no `--paper:#f2f1ed` |
| Ink | `#1d1c19` | pear.no `--ink:#1d1c19` |
| Press (near black) | `#0b0a09` | pear.no `--press:#0b0a09` |
| Painted blue sheet | `#0a4fa6` | pear.no hero film is a saturated cobalt painted sky; hex sampled from its rendered hero, adjusted toward Albert's "cobalt and navy" (2026-09-17) |
| Display face | Instrument Serif 400 | pear.no uses Flecha (commercial serif) for titles; nearest open licence face |
| Body face | Oxygen | Albert's own theme font (memory `feedback_slide_font_oxygen`, 2026-09-30) |
| Labels | JetBrains Mono, 0.6875rem, 0.2em tracking, uppercase | pear.no `.type-label{font-family:var(--font-mono);letter-spacing:.2em;text-transform:uppercase;font-size:.6875rem}`; used for units, captions, nav and buttons, not above headings |
| Easing | `cubic-bezier(.22,1,.36,1)` | pear.no `--ease` |
| Margin rules with four-point stars | 1px, rule at each sheet margin | pear.no `.ov .gv/.gh` rules and `cross` keyframe |
| Motion | eased wheel scroll; WebGL hero; line-by-line headline rise; rules that draw in; ink soak to paper | pear.no `a.js` (wheel easing, `settle`, `ruleV/ruleH`, `soak` shader) |
| Artwork | Albert's ARDD 2026 engravings, inverted to white line | `~/Desktop/Projects/2026/presentation/2026-10-03_ARDD_across-scales/schematics/` |

Rejected directions: minimal white with hairlines ("I want fancier"); dark navy with glow, gradient text and glass ("这个coloring太烂大街"). No rust or terracotta (2026-09-17).
