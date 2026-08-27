# DESIGN.md — Peekaboo Web Design System (Uber-derived, strict monochrome)

> **This is a prompt document.** It is written to be handed to an implementing agent as the
> single source of truth for the visual redesign of the Peekaboo web client. Every rule here is
> normative: **MUST** = non-negotiable, **SHOULD** = default unless there is a stated reason.
> When this document conflicts with existing code, **this document wins** — change the code.

**Scope:** the whole `client/` web app — public marketing pages, auth screens, and the
authenticated dashboard (tables, modals, charts, sidebars).
**Out of scope:** `mobile/` (React Native) and `server/`. Do not touch them.

**Reference:** interaction and layout behaviour is modelled on `uber.com` (values below were
measured from the live site, not guessed). Peekaboo is **not** a clone — the palette is stricter
(no Uber green/blue/brand colors) and the typography is a different face at lighter weights.

---

## 0. Before anything else: Tailwind v4 syntax

This project is on **Tailwind CSS v4**. The v3 shorthand for CSS variables was **removed**.

- Correct: `bg-(--ink)`, `text-(--muted)`, `rounded-(--radius-control)`, `border-(--line)`
- Broken, silently: `bg-[--ink]`, `text-[--muted]`, `rounded-[--radius-control]`

The bracket form does not error. It compiles to nothing, the class is dropped, and the element
renders with no color, no border, and no radius. A first pass at this redesign wrote 2,002 of
them across 152 files and the entire app rendered as unstyled text. `[var(--x)]` inside a
composite value (`shadow-[var(--ink)_0_0_0_1px_inset]`) is still correct — the rule is about the
bare-variable shorthand only.

Verify with: `grep -rE '\-\[--[a-z-]+\]' --include='*.tsx' src` — must return nothing.

## 1. The seven hard constraints

Every change MUST satisfy all seven. If a proposed change breaks one, the change is wrong.

1. **Monochrome only.** White and black and the neutral ramp between them. No hue anywhere —
   no yellow, no blue, no red, no green. Zero exceptions, including charts, status badges,
   focus rings, logo, toasts, and error states.
2. **Highlight = inversion ("vice versa").** The only way to mark something as selected, active,
   current, or checked is to swap ink and paper: the element takes the foreground color as its
   background and the background color as its text. Never a tint, never an accent bar in color.
3. **DM Sans, and only DM Sans.** One family for 100% of the UI. No monospace, no display face,
   no icon-font text, no `ui-monospace` fallback, no second "utility" family.
4. **Light weights.** `400` is the default; `500` is the ceiling for emphasis, headings, buttons,
   and labels. `600`+ is forbidden. `300` is permitted only at display sizes ≥ 48px.
5. **No gradients. Zero exceptions.** No `linear-gradient`, `radial-gradient`, `conic-gradient`,
   or gradient scrims on images. Flat fills only. The animated link underline uses a
   pseudo-element, not a gradient (§7.4). Do not smuggle one past the check with a CSS escape
   such as `linear-\000067radient` — that is the same violation, written to defeat the grep.
6. **Uber interaction physics.** Buttons, nav items, menus, and links use the exact easing,
   duration, and press/hover mechanics specified in §6. Notably: **press is a full-surface inset
   overlay, never a transform.**
7. **Borders over shadows.** Structure comes from 1px lines and flat surface steps. Only menus,
   popovers, and modals may cast a shadow (§6.4).

**And one rule about how much black.** Monochrome does not mean black-dominant. The ground is
paper; black is the accent that marks the primary action, the selected thing, and the frame of
the app. Reserve full-bleed `--ink` surfaces for the navigation bar, the footer, and **at most
one** closing call-to-action per page. Page heroes, sidebars, cards, and section bands stay on
paper with a `--line` hairline. Two black slabs stacked — a black bar above a black hero, or a
black nav beside a black sidebar — is the failure mode this rule exists to prevent.

---

## 2. Color tokens

Tokens are **semantic**, not literal, so that dark mode is a true mirror rather than a second
palette. Never write a raw hex in a component — always a token.

Replace the entire `:root` / `.dark` block in `client/src/index.css` with this.

```css
:root {
  /* Ground and ink — these two invert in dark mode, everything follows */
  --paper:          #ffffff;  /* page background */
  --ink:            #000000;  /* primary text, primary button fill, selected fill */

  /* Neutral ramp (light) */
  --surface:        #f3f3f3;  /* inputs, quiet cards, ghost-button hover */
  --surface-hover:  #e2e2e2;  /* hover on --surface, secondary-button hover */
  --surface-sunken: #fafafa;  /* zebra rows, subtle section banding */
  --line:           #e2e2e2;  /* default 1px border */
  --line-strong:    #afafaf;  /* emphasized border, input focus outline */
  --muted:          #6e6e6e;  /* secondary text — 5.1:1 on paper, AA at any size */
  --muted-weak:     #757575;  /* non-text and ≥18.66px only — 4.5:1 borderline */
  --disabled-fg:    #afafaf;

  /* Press overlays — chosen by the SURFACE the control sits on, not by theme */
  --press-on-ink:   rgba(255, 255, 255, 0.20);
  --press-on-paper: rgba(0, 0, 0, 0.08);

  --overlay:        rgba(0, 0, 0, 0.60);  /* modal scrim */
  --shadow-menu:    0 4px 16px rgba(0, 0, 0, 0.16);
  --shadow-modal:   0 8px 40px rgba(0, 0, 0, 0.24);
}

.dark {
  --paper:          #000000;
  --ink:            #ffffff;

  --surface:        #141414;
  --surface-hover:  #232323;
  --surface-sunken: #0a0a0a;
  --line:           #2e2e2e;
  --line-strong:    #5e5e5e;
  --muted:          #a3a3a3;   /* 8.3:1 on black */
  --muted-weak:     #8f8f8f;
  --disabled-fg:    #5e5e5e;

  /* Overlays do NOT flip with theme — a black button in dark mode is a WHITE button,
     so it still needs the dark press overlay. Surface decides, not mode. */
  --press-on-ink:   rgba(255, 255, 255, 0.20);
  --press-on-paper: rgba(0, 0, 0, 0.08);

  --overlay:        rgba(0, 0, 0, 0.72);
  --shadow-menu:    0 4px 16px rgba(0, 0, 0, 0.55);
  --shadow-modal:   0 8px 40px rgba(0, 0, 0, 0.70);
}
```

**Mapping to the existing shadcn layer.** Keep the `--background`/`--foreground`/`--primary`
names that `components/ui/*` already consumes, but redefine them as aliases so there is one
source of truth:

```css
:root, .dark {
  --background: var(--paper);
  --foreground: var(--ink);
  --card: var(--paper);
  --card-foreground: var(--ink);
  --popover: var(--paper);
  --popover-foreground: var(--ink);
  --primary: var(--ink);
  --primary-foreground: var(--paper);
  --secondary: var(--surface);
  --secondary-foreground: var(--ink);
  --muted-foreground: var(--muted);
  --accent: var(--surface);
  --accent-foreground: var(--ink);
  --destructive: var(--ink);       /* destructive is communicated by copy + icon, not hue */
  --border: var(--line);
  --input: var(--line);
  --ring: var(--ink);
}
```

**Delete outright:** the `--color-secondary-*` yellow ramp in `@theme`, `--peekaboo-yellow`,
`--peekaboo-yellow-dark`, `--ops-signal`, `--ops-route`, `--ops-alert`, and the whole `--ops-*`
group if unreferenced after migration.

### 2.1 The inversion rule

This is the load-bearing idea of the system. Selection is a **swap**, not a tint.

```css
::selection { background: var(--ink); color: var(--paper); }

/* Scoped on purpose. A blanket [data-state] rule repaints every Radix node that
   happens to be open, which turns menus and switches into black rectangles. */
[role="tab"][aria-selected="true"],
[role="option"][aria-selected="true"],
[role="tab"][data-state="active"],
a[aria-current="page"],
button[aria-current="page"],
[data-selected="true"] {
  background-color: var(--ink);
  color: var(--paper);
}
```

Applies to: segmented tabs, active nav item, current pagination page, checked checkbox/radio,
selected table row, chosen filter chip, active sidebar item, the "on" side of a switch, and the
selected day in the calendar. In light mode a selected thing is **black on white**; in dark mode
the same component is **white on black**. Nothing else marks selection.

Inverted regions (a black header on a white page) are legitimate and encouraged — inside them,
`--paper` and `--ink` are locally swapped via a `.invert-surface` utility so that children keep
working without special-casing:

```css
.invert-surface {
  --paper: #000000; --ink: #ffffff;
  --surface: #1a1a1a; --surface-hover: #2b2b2b;
  --line: #2e2e2e; --muted: #a3a3a3;
  background-color: var(--paper); color: var(--ink);
}
.dark .invert-surface {
  --paper: #ffffff; --ink: #000000;
  --surface: #f3f3f3; --surface-hover: #e2e2e2;
  --line: #e2e2e2; --muted: #6e6e6e;
}
```

### 2.2 Status without color

Order/payment/assignment statuses currently lean on yellow and semantic hues. Replace with a
**shape + fill + icon** system. Every badge MUST carry an icon and a text label; the treatment
only reinforces.

| Meaning | Treatment | Class sketch |
| --- | --- | --- |
| Active / in progress | Solid inverted chip | `bg-[--ink] text-[--paper] rounded-full px-2.5 h-6` |
| Completed / success | Outlined chip, ink border + ink text, check icon | `border border-[--ink] text-[--ink]` |
| Pending / waiting | Outlined chip, **dashed** border, muted text, clock icon | `border border-dashed border-[--line-strong] text-[--muted]` |
| Failed / cancelled | Outlined chip, ink border, **strikethrough label**, x icon | `border border-[--ink] line-through` |
| Draft / inactive | Filled quiet chip on `--surface`, muted text | `bg-[--surface] text-[--muted]` |

**Charts (recharts).** Series colors come from a five-step ramp —
`#000000, #4b4b4b, #757575, #a3a3a3, #d4d4d4` in light mode, reversed in dark. Multi-line charts
MUST additionally differentiate by `strokeDasharray` (`0`, `6 3`, `2 3`, `10 4`, `1 3`) because
the ramp alone fails for colorblind and low-contrast displays. Grid lines use `--line`, axis text
uses `--muted` at 12px/400.

---

## 3. Typography

### 3.1 The single import

Replace the three-family import at the top of `client/src/index.css` with exactly this:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
```

```css
:root { --font-sans: 'DM Sans', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif; }
html { font-family: var(--font-sans); font-size: 16px; }
```

**Delete:** the `Google Sans`, `IBM Plex Mono`, and `Space Grotesk` imports; all three duplicate
`@utility font-ui` blocks (one of them declares a monospace stack — that is the exact thing this
system forbids); the `font-family` declaration inside the `*` selector; and the `font-size: 14px`
on `*` and `body` — the app moves to a 16px root with rem-based sizing.

Numerals: DM Sans has proportional figures by default. For table cells, money, phone numbers, and
counters, use `font-variant-numeric: tabular-nums` — **not** a monospace font. Ship it as a
`.tabular` utility.

### 3.2 Scale

DM Sans is geometric and sets tight; large sizes need negative tracking, small sizes need none.

**No letter-spacing anywhere.** DM Sans is drawn to sit correctly at every size; tracked-out
uppercase micro-labels are the single strongest "generated template" tell, and negative tracking
on headlines is the other half of the same habit. There is no `tracking-*` utility in this
codebase and no `letter-spacing` declaration in `index.css`. Section labels are sentence case at
normal spacing, or they are deleted.

| Role | Size | Line height | Weight |
| --- | --- | --- | --- |
| Display (hero h1) | `clamp(2.25rem, 1.6rem + 2.4vw, 3.25rem)` — 36→52px | 1.08 | 500 |
| h2 (section) | `clamp(1.75rem, 1.3rem + 1.8vw, 2.25rem)` — 28→36px | 1.15 | 500 |
| h3 | 1.5rem / 24px | 1.25 | 500 |
| h4 / card title | 1.125rem / 18px | 1.4 | 500 |
| Body | 1rem / 16px | 1.6 | 400 |
| Body small | 0.875rem / 14px | 1.55 | 400 |
| Label / nav / button | 0.875rem / 14px | 1.2 | 500 |
| Caption / meta | 0.8125rem / 13px | 1.5 | 400 |
| Section eyebrow | 0.75rem / 12px | 1.4 | 500, sentence case |

Rules:
- Hierarchy comes from **size, spacing, and color** — never from weight jumps. A 500 heading over
  400 body is the entire contrast budget.
- Body copy MUST NOT exceed **68ch**; hero subheads MUST NOT exceed **46ch**.
- Never set `font-weight` on an element that already inherits 500 to "make it pop".
- Uppercase is reserved for genuine short codes (language codes such as EN / FR / RW). No all-caps
  buttons, labels, eyebrows, or headings.
- No `text-shadow`, no letter-spacing on body copy, no justified text.

---

## 4. Space, radius, layout

**Spacing scale (4px base):** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128. Nothing else.

**Radius:**

```css
--radius-control: 8px;   /* buttons, inputs, selects, textareas, menus, popovers */
--radius-card:    12px;  /* cards, image slots, modal panels */
--radius-pill:    999px; /* nav items, chips, badges, segmented tabs, avatars */
```

Do not introduce a fourth value. `--radius: 0.625rem` (10px) in the current file is replaced.

**Container:** `max-width: 1280px`, `margin-inline: auto`, horizontal padding `20px` mobile /
`32px` sm / `40px` lg. This matches the measured Uber content width.

**Section rhythm:** vertical padding `56px` mobile, `72px` md, `88px` lg. (128px on every section
in a row reads as padding, not rhythm — the page stops having a shape.) Adjacent sections are
separated by whitespace or a single `--line` hairline — never by a colored band.

**Header:** `64px` tall, `position: sticky`, `top: 0`, `z-index: 50`, background `--ink` with
`.invert-surface` applied (black bar on the white site; white bar in dark mode). No border, no
shadow, no blur, no scroll-triggered resize.

**Grid:** 12 columns desktop, 4 mobile, gutter 24px. Card grids: 3-up desktop / 2-up tablet /
1-up mobile with a 24px gap.

---

## 5. Motion tokens

Measured from Uber; use these four and nothing else.

```css
--ease-flat:  cubic-bezier(0, 0, 1, 1);        /* linear — background/color changes */
--ease-menu:  cubic-bezier(0.2, 0.8, 0.4, 1);  /* menu and popover entrance */
--ease-glide: cubic-bezier(0.22, 1, 0.36, 1);  /* underline sweeps, icon nudges */

--dur-menu:  100ms;  /* menu open/close */
--dur-state: 200ms;  /* hover, color, background */
--dur-sweep: 500ms;  /* link underline */
```

- Transition **only** `background-color`, `color`, `border-color`, `box-shadow`, `opacity`, and
  `transform` on icons. Never `all`. (`transition-all` in the current `button.tsx` must go.)
- Page/section entrance animation is a single `opacity 0→1` plus `translateY(8px→0)` over 200ms.
  No stagger cascades, no spring physics, no parallax, no scroll-jacking.
- `@media (prefers-reduced-motion: reduce)`: all durations → 1ms, transforms → none. The existing
  block in `index.css` is correct — keep it and extend it to the new utilities.

---

## 6. Components

### 6.1 Buttons

Rewrite `client/src/components/ui/button.tsx`. Base (all variants):

```
inline-flex items-center justify-center gap-2 whitespace-nowrap
rounded-[--radius-control] text-sm font-medium cursor-pointer
transition-[background-color,color,border-color,box-shadow]
duration-200 ease-[cubic-bezier(0,0,1,1)]
disabled:pointer-events-none disabled:opacity-40
outline-none
```

| Variant | Rest | Hover | Active (press) |
| --- | --- | --- | --- |
| `primary` (default) | `bg-[--ink] text-[--paper]` | `bg-[color-mix(in_oklab,var(--ink)_88%,var(--paper))]` | inset overlay `--press-on-ink` |
| `secondary` | `bg-[--surface] text-[--ink]` | `bg-[--surface-hover]` | inset overlay `--press-on-paper` |
| `outline` | `bg-transparent text-[--ink] border border-[--ink]` | `bg-[--surface]` | inset overlay `--press-on-paper` |
| `ghost` | `bg-transparent text-[--ink]` | `bg-[--surface]` | inset overlay `--press-on-paper` |
| `link` | `text-[--ink] p-0 h-auto` + animated underline (§6.4) | underline sweeps to 100% | `color: var(--muted)` |

**The press effect — this is the signature move. Copy it exactly:**

```css
.btn:active            { box-shadow: var(--press-on-ink)   999px 999px 0 inset; }
.btn-on-paper:active   { box-shadow: var(--press-on-paper) 999px 999px 0 inset; }
```

A 999px inset spread floods the entire control with a translucent overlay regardless of its size.
**Do not** substitute `scale(0.98)`, `translateY(1px)`, or an opacity change. Remove the global
`button:active { transform: translateY(1px) }` currently in `index.css` — it conflicts.

**Focus (both a11y and the inversion idea):**

```css
.btn:focus-visible {
  box-shadow: var(--paper) 0 0 0 2px inset, var(--ink) 0 0 0 2px;
}
```

An inner ring in the ground color and an outer ring in the ink color — legible on any surface,
in either theme, with zero hue. This replaces the yellow `:focus-visible` outline in `index.css`.

**Sizes:** `sm` 36px / `px-4`; `default` 44px / `px-5`; `lg` 48px / `px-6` `text-base` (the hero
CTA size — Uber's is 48px tall, `14px 25px`, 16px/500); `icon` square at the matching height.

### 6.2 Nav items and menus

**Nav item (in the black header):** pill, `rounded-full`, padding `10px 12px`, 14px/500,
`transition: background-color 200ms var(--ease-flat)`. Hover fills with `--surface` **inside the
inverted context** (so: near-black `#1a1a1a` fill on the black bar) and the label goes to full
`--ink` of that context. No underline, no color shift, no scale.

**Dropdown / popover panel:** paper with a hairline, so it matches the inputs that open it.

```css
background: var(--paper);
border: 1px solid var(--line);
border-radius: var(--radius-control);   /* 8px */
box-shadow: var(--shadow-menu);         /* 0 4px 16px rgba(0,0,0,.16) */
padding: 8px 0;
transition: opacity var(--dur-menu) var(--ease-menu),
            transform var(--dur-menu) var(--ease-menu);
```

Entrance: `opacity 0 → 1`, `translateY(-4px) → 0` in 100ms. Menu items are full-width rows,
`44px` tall, `padding-inline: 16px`, 14px/400, hover `background: var(--surface-hover)`. The
active/current item follows the inversion rule (§1.1). No checkmark colors, no nested flyouts
deeper than one level.

**Mobile menu:** full-screen sheet on `--paper`, items stacked at 18px/400 with `--line` dividers,
close affordance top-right, no slide-in from the side.

### 6.3 Inputs

**One input, everywhere.** Regular bordered fields on paper — not Uber's borderless-on-gray
group. Uber can afford a bespoke hero input because its hero form is the entire product; this app
puts the same fields in the hero, in auth, and in twelve dashboard forms, so a hero-only
treatment reads as two different design systems on one site.

```
h-12 (48px) w-full rounded-(--radius-control)
border border-(--line) bg-(--paper)
px-3.5 text-base text-(--ink) placeholder:text-(--muted)
hover:border-(--line-strong)
focus-visible:border-(--ink) focus-visible:shadow-[var(--ink)_0_0_0_1px_inset]
disabled:border-(--line) disabled:bg-(--surface) disabled:text-(--disabled-fg)
```

- **48px, every input, every context** — hero, auth, and dense dashboard forms alike. Do not
  introduce a second height.
- Labels sit above at 14px/500 (`field-label`), flush with the field's left edge — no indent.
  Helper text below at 13px/400 `--muted`.
- **Error state without color:** `--ink` border + 1px inset ring, plus a message row with a
  warning icon and 13px `--ink` text. Never a red border.
- `ui/input.tsx`, `inputs/Input.tsx`, `TelInput`, `PlaceSearch`, `Select`, `Textarea`, and
  `DatePicker` must all render this exact treatment. When you change one, change all seven.
- The phone field's country prefix is a `--surface` cell with a `--line` right divider and
  `--muted` text. It is not a filled block — never paint it with `--muted` as a background.

### 6.4 Surfaces

- **Card:** `bg-[--paper]`, `border border-[--line]`, `rounded-[--radius-card]`, padding 24px.
  Hover (only if interactive): `border-color: var(--ink)`. No lift, no shadow, no scale.
- **Quiet card:** `bg-[--surface]`, no border — for stats and inert grouping.
- **Modal:** panel `--paper`, `rounded-[--radius-card]`, `--shadow-modal`, max-width 560px,
  scrim `--overlay`; enter with opacity + `translateY(8px)` over 200ms.
- **Table:** header row 13px/500 `--muted` uppercase-free, `--line` bottom border; body rows 14px
  /400, 56px tall, hover `--surface`, selected row per §1.1; zebra via `--surface-sunken` only in
  tables over 10 rows. No vertical rules.
- **Toast (sonner):** `--paper` panel, `--line` border, `--shadow-menu`, icon + text, no colored
  variants — success/error differ by icon and copy.

### 6.5 Images

Flat, `rounded-[--radius-card]`, `object-cover`, explicit aspect ratio (`4/3` or `1/1`) to prevent
layout shift. **No gradient scrims, no color overlays.** If text must sit on an image, put it in an
inverted solid chip (`--ink` fill, `--paper` text, `--radius-pill`) anchored in a corner.

---

## 7. Interaction recipes (copy verbatim)

### 7.1 Press
See §5.1 — `box-shadow: <overlay> 999px 999px 0 inset` on `:active`.

### 7.2 Focus
See §5.1 — double ring, inner `--paper` inset, outer `--ink`.

### 7.3 Hover fill
`transition: background-color 200ms cubic-bezier(0,0,1,1)` — deliberately linear, so it reads as
instant and mechanical rather than eased and soft.

### 7.4 Animated link underline

Uber grows this underline with `background-size` on a `linear-gradient`. This system has no
gradients, so the same motion comes from a pseudo-element — identical result, nothing to smuggle
past the gradient check.

```css
.link-sweep {
  position: relative;
}
.link-sweep::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: -2px;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--dur-sweep) var(--ease-glide);
}
.link-sweep:hover::after,
.link-sweep:focus-visible::after { transform: scaleX(1); }
```

Thickness stays 1px. The 500ms glide is what makes it read as Uber rather than as a generic
hover underline — do not shorten it to 200ms.

### 7.5 Arrow nudge

```css
.link-arrow:hover [data-slot="icon"] { transform: translateX(12px); }
[data-slot="icon"] { transition: transform 200ms var(--ease-glide); }
```

Applies to "Learn more →" style links only. This is the **only** permitted hover transform in the
system; the global `img, svg { transition: transform }` rule in `index.css` must be removed so
images stop moving on hover.

---

## 8. The hero

Uber's split, Peekaboo's content, this system's inputs. Left column is copy and the booking form;
right column is the product visual.

```
┌───────────────────────────── container 1280 ─────────────────────────────┐
│  [ Personal | Business ]  ← segmented pills, active = inverted           │
│                                                                          │
│  ◎ Kigali, RW · Change city   ← 14px muted, pin icon; link-sweep on the  │
│                                  "Change city" control                   │
│  Send anything,                          ┌────────────────────────────┐  │
│  anywhere in Kigali.                     │                            │  │
│  ← 36→52px, weight 500, no tracking      │   route card: street grid, │  │
│                                          │   dashed route, pickup ring,│ │
│  One-line subhead, 16px/400, --muted,    │   drop-off square, rider   │  │
│  max 46ch.                               │   dot mid-route            │  │
│                                          │  [● Rider on the way  12m] │  │
│  ┌───────────────┐ ┌───────────────┐     └────────────────────────────┘  │
│  │Pickup location│ │Drop-off loc.  │  ← 2×2 grid of REGULAR inputs,      │
│  ├───────────────┤ ├───────────────┤     48px, bordered, labels above    │
│  │Pickup phone   │ │Recipient phone│                                     │
│  └───────────────┘ └───────────────┘                                     │
│                                                                          │
│  [ Book delivery ]  │  Track an order    ← 48px primary, 1px divider,    │
│                                             text link                    │
│  2 active customers · Verified riders · Kigali-wide  ← 13px --muted      │
└──────────────────────────────────────────────────────────────────────────┘
```

**Specification**

- Grid `lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]`, `gap: 64px` at lg, items centered.
  Single column below `lg`; the route card is hidden below `lg` rather than stacked, because it
  is atmosphere, not information.
- Section padding `40px` top / `56px` bottom, `56px / 80px` at lg. The hero is sized by its
  content — **never** `min-h-[calc(100vh-7rem)]`. The whole thing fits above the fold at 1280×720
  and that is the point.
- Background is flat `--paper`.
- The **eyebrow is deleted**. "Same-day delivery in Kigali" as a tracked-out micro-label above a
  headline that says the same thing is decoration restating content.
- Headline: two lines maximum, weight 500, no tracking, no colored span.
- The form is a 2×2 grid of the standard 48px input (§6.3) — four fields, four identical boxes.
  No gray group, no dot-and-square rail, no `<details>` disclosure.
- CTA row: 48px primary button, a 1px `--line` vertical divider, then a text link. This is Uber's
  "See prices │ Log in to see your recent activity" arrangement.
- Trust indicators: one plain text row, `·` separated. No chips, no icons, no cards.
- Entrance: the left column fades and rises 8px over 200ms, once. No stagger cascade.

**The route card is the signature element.** It is the one place the page is allowed to be
interesting, and it earns its place by being the product: the same route rendering the tracking
screen uses, in the same monochrome, showing a real Kigali trip mid-delivery. It replaces the
2.3MB 12573×12573 logo JPEG that was previously stretched into the hero's right column.

**Retired:** the three.js `HeroScene`. A WebGL scene cannot honour no-gradient / no-hue without
collapsing into a flat rectangle. `BusinessScene.tsx` and its use in `AuthPageShell.tsx` go with
it, then `three`, `@react-three/fiber`, and `@react-three/drei` leave `package.json`.

## 9. Migration plan

Work in this order; each step leaves the app in a runnable state.

**Step 1 — tokens.** Rewrite `client/src/index.css` per §1, §2.1, §3, §4. Delete: the yellow
ramp, all three `@utility font-ui` blocks, the `*` font-family/font-size rules, the
`button:active { transform }` rule, the `img, svg` transform transition, `hover-glow`,
`hover-lift`, and the yellow `::selection` and `:focus-visible` rules. Add: `.invert-surface`,
`.link-sweep`, `.link-arrow`, `.tabular`.

**Step 2 — primitives.** `components/ui/button.tsx` (§5.1), then `input.tsx`, `select.tsx`,
`textarea.tsx`, `dropdown-menu.tsx`, `navigation-menu.tsx`, `tabs.tsx`, `badge.tsx`, `card.tsx`,
`table.tsx`, `dialog.tsx`, `sonner.tsx`.

**Step 3 — purge.** Known counts from the current tree:

| Target | Count | Action |
| --- | --- | --- |
| `font-semibold` | 129 | → `font-medium` |
| `font-bold` | 20 | → `font-medium` |
| `font-extrabold` | 7 | → `font-medium` |
| `text-secondary` | 24 | → `text-foreground` or `text-[--muted]` |
| `bg-secondary` | 22 | → `bg-[--surface]`, or inverted fill if it marked selection |
| `peekaboo-yellow` | 12 | → remove; if it marked state, apply §1.1 |
| `gradient` | 8 across 6 files | → flat `--surface` or `--paper` |

Gradient files: `containers/navigation/AuthenticatedNavbar.tsx`,
`pages/home/components/ImageSlot.tsx`, `pages/auth/AuthPageShell.tsx`,
`pages/common/UnauthorizedPage.tsx`, `pages/common/NotFoundPage.tsx`,
`pages/batches/ImportBatch.tsx`.

**Step 4 — hero** (§7). **Step 5 — public pages** (services, about, contact, legal, public order
tracking). **Step 6 — dashboard** (sidebar, navbar, metric cards, charts, tables, modals).

---

## 10. Verification

Run these from `client/`. Every one MUST return zero matches.

```bash
grep -rEn '\-\[--[a-z-]+\]' --include='*.tsx' src
```
```bash
grep -rniE "gradient|\\\\000067" --include='*.tsx' --include='*.css' src
```
```bash
grep -rn "tracking-" --include='*.tsx' --include='*.css' src
```
```bash
grep -rEn "font-(semibold|bold|extrabold|black)|font-\[?[6-9]00" --include='*.tsx' src
```
```bash
grep -rEn "peekaboo-yellow|#edb100|#ffc400|#ffd900|secondary-[0-9]{2,3}" --include='*.tsx' --include='*.css' src
```
```bash
grep -rEn "font-mono|IBM Plex|Space Grotesk|Google Sans|ui-monospace" --include='*.tsx' --include='*.css' src
```
```bash
grep -rEn "#[0-9a-fA-F]{3,6}|rgb\(|oklch\(" --include='*.tsx' src
```

The last one enforces "tokens, never literals" in components — hex belongs in `index.css` only.
It currently matches **162 lines**, so treat it as the long tail of Step 6 rather than a blocker
on Steps 1–4; the first four greps must be clean before the hero ships.

### Acceptance checklist

- [ ] `grep -rE '\-\[--[a-z-]+\]'` returns nothing — no silently-dropped Tailwind classes.
- [ ] Every color in a rendered screenshot is white, black, or a neutral gray.
- [ ] No page stacks two full-bleed black surfaces; heroes and sidebars are on paper.
- [ ] Every input on every page is the same 48px bordered field.
- [ ] No `tracking-*` class and no uppercase label outside language codes.
- [ ] Toggling dark mode inverts the page; no element becomes unreadable or keeps a light panel.
- [ ] No text on the site renders above weight 500.
- [ ] Every button presses with the inset flood, not a movement.
- [ ] Every focusable control shows the double ring on keyboard focus, on both themes.
- [ ] Selected tab, current nav item, and checked box are all filled inverted — and nothing else is.
- [ ] Body text is ≥ 4.5:1 against its ground; `--muted-weak` appears only at ≥ 18.66px or on
      non-text.
- [ ] Status is legible in a grayscale screenshot **and** to a screen reader (icon + label, never
      fill alone).
- [ ] `prefers-reduced-motion` kills every transition and transform.
- [ ] One font family loads in the network panel: DM Sans.

---

## 11. Notes for the implementing agent

- When a component's meaning depended on hue, replace it with **icon + label + inversion**, then
  re-read the screen and confirm it still parses at a glance. If it does not, the fix is more
  spacing or a clearer label — not a reintroduced color.
- Prefer deleting a decorative element over restyling it. This system's character comes from
  restraint; a monochrome version of a busy component is still a busy component.
- Do not add a new token, radius, duration, or font weight without adding it to this document in
  the same change.
