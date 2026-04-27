# DESIGN.md — Peekaboo Website Redesign

## 1. Design Direction

Peekaboo should feel **modern, trusted, fast, and service-focused**, using a strong **yellow + black brand system** inspired by MTN’s visual style, but adapted for Peekaboo’s delivery/logistics identity.

The website should communicate:

* Fast and reliable deliveries
* Professional company image
* Easy booking and tracking
* Strong presence across Kigali and provinces
* Trust, safety, and customer support

The design should be **mobile-first**, then expanded cleanly for desktop.

---

## 2. Brand Style

### Primary Colors

Use a bold yellow and black identity.

```css
--peekaboo-yellow: #ffc400;
--peekaboo-yellow-dark: #e6ad00;
--peekaboo-black: #050505;
--peekaboo-dark: #111111;
--peekaboo-gray: #f5f5f5;
--peekaboo-text: #1f1f1f;
--peekaboo-muted: #6b7280;
--peekaboo-white: #ffffff;
```

### Color Usage

* **Yellow**: main CTA buttons, highlights, cards, icons, active nav states
* **Black**: header, hero background, footer, strong text areas
* **White**: content sections, cards, form backgrounds
* **Gray**: section separation and subtle backgrounds

Avoid overusing yellow on every section. Use it as a strong brand accent.

---

## 3. Typography

Use clean, modern, bold typography.

Recommended fonts:

* Headings: `Inter`, `Poppins`, or `Montserrat`
* Body: `Inter` or `system-ui`

### Type Style

* Headlines should be bold and confident.
* Body text should be short and easy to scan.
* Buttons should use uppercase or strong sentence case.

Example:

```tsx
<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
  Fast delivery across Rwanda
</h1>
```

---

## 4. Layout Inspiration from MTN Website

Use these patterns from the MTN reference:

### Header

* Black top area or black navigation bar
* Yellow highlight navigation strip or active state
* Clear logo on the left
* Main actions on the right: `Track Package`, `Book Delivery`, `Contact Us`
* Mobile hamburger menu

### Hero Section

Large black hero section with yellow accents.

Content:

* Big headline
* Short supporting text
* Two CTA buttons
* Delivery-related visual: rider, package, map, van, or route graphic

Example hero copy:

> Reliable delivery made simple.
> Send packages across Kigali and beyond with Peekaboo.

CTA buttons:

* `Book a Delivery`
* `Track Package`

### Quick Action Icons

Below the hero, add 4 quick action cards similar to MTN’s icon row:

1. Book Delivery
2. Track Package
3. Become a Rider
4. Contact Support

Each item should have:

* Simple line icon
* Short title
* Optional short subtitle

---

## 5. Homepage Structure

### Section 1: Header / Navigation

Mobile-first:

* Logo
* Menu icon
* Main CTA button visible if space allows

Desktop:

* Logo
* Navigation links
* CTA button

Suggested nav links:

* Home
* Services
* How It Works
* Coverage
* Riders
* Contact

---

### Section 2: Hero

Design:

* Black background
* Yellow badge or accent text
* Big white headline
* Short gray/white paragraph
* Yellow primary button
* White outline secondary button
* Hero image or illustration on desktop

Suggested copy:

**Headline:**

> Fast, trusted delivery across Rwanda

**Subtext:**

> Peekaboo helps individuals and businesses send packages quickly, safely, and affordably across Kigali and provinces.

Buttons:

* `Book Delivery`
* `Track Package`

---

### Section 3: Quick Actions

Use 4 rounded cards.

Cards:

* Send a Package
* Track Your Delivery
* Business Deliveries
* Rider Support

Style:

```tsx
className="rounded-2xl bg-white shadow-sm border p-5 hover:shadow-md transition"
```

---

### Section 4: Services / Top Solutions

Inspired by MTN’s “Top deals” cards.

Use horizontal scroll on mobile and grid on desktop.

Service cards:

1. Same-day Delivery
2. Business & E-commerce Delivery
3. Province Delivery
4. Document Delivery
5. Food & Small Package Delivery

Each card should have:

* Yellow or black background
* Big service title
* Short description
* Arrow button

---

### Section 5: How Peekaboo Works

Use 3 simple steps:

1. Request a delivery
2. Rider picks up your package
3. Package is delivered safely

Each step should be visual and simple.

---

### Section 6: Why Choose Peekaboo

Inspired by MTN’s “Get doing with MTN”.

Use 3 columns on desktop, stacked cards on mobile.

Points:

* Reliable riders
* Fast delivery updates
* Business-friendly service
* Kigali and province coverage
* Easy support through phone or WhatsApp

---

### Section 7: Coverage Section

Use a full-width visual banner.

Design:

* Background image or yellow/black gradient
* Big headline
* Short description
* CTA button

Suggested headline:

> Delivering beyond Kigali

Suggested text:

> Peekaboo is building a stronger delivery network across Rwanda, helping customers and businesses move packages with confidence.

---

### Section 8: Business / Corporate Delivery

Create a strong yellow card section.

Content:

* E-commerce delivery
* Scheduled deliveries
* Bulk delivery support
* Delivery tracking
* Monthly business support

CTA:

* `Request Business Account`

---

### Section 9: Help / Support

Inspired by MTN’s help search section.

Include:

* Search input: `How can we help you?`
* Quick links:

  * Track a package
  * Delivery pricing
  * Coverage areas
  * Contact support

---

### Section 10: Footer

Dark footer with yellow links.

Include:

* Peekaboo logo
* Short company description
* Contact details
* Social links
* Quick links
* Legal links

---

## 6. Component Guidelines

Use **React + Vite + Tailwind + shadcn/ui**.

Recommended shadcn components:

* `Button`
* `Card`
* `CardContent`
* `Input`
* `Accordion`
* `Sheet` for mobile menu
* `Badge`

Recommended icons:

Use `lucide-react` icons:

* `Truck`
* `Package`
* `MapPin`
* `Phone`
* `MessageCircle`
* `Clock`
* `ShieldCheck`
* `ArrowRight`
* `Menu`

---

## 7. Tailwind Style Rules

### Buttons

Primary button:

```tsx
<Button className="bg-[#ffc400] text-black hover:bg-[#e6ad00] font-bold rounded-full px-6">
  Book Delivery
</Button>
```

Secondary button:

```tsx
<Button variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-full px-6">
  Track Package
</Button>
```

### Cards

```tsx
<Card className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all">
  <CardContent className="p-6">
    ...
  </CardContent>
</Card>
```

### Section Spacing

Mobile:

```tsx
className="px-4 py-12"
```

Desktop:

```tsx
className="md:px-10 lg:px-20 md:py-20"
```

---

## 8. Responsive Rules

### Mobile First

* Keep text short.
* Use one-column layout.
* Make cards horizontally scrollable where needed.
* Keep CTA buttons large and easy to tap.
* Header should be simple and not crowded.

### Desktop

* Use wider hero layout with text on left and image/illustration on right.
* Use 3–4 column grids.
* Increase whitespace.
* Keep the yellow/black branding strong but clean.

---

## 9. Suggested Page Sections for Codex

Ask Codex to build the homepage in this order:

1. `Navbar`
2. `HeroSection`
3. `QuickActions`
4. `ServicesSection`
5. `HowItWorks`
6. `WhyChooseUs`
7. `CoverageBanner`
8. `BusinessDeliverySection`
9. `SupportSection`
10. `Footer`

Recommended file structure:

```txt
src/
  components/
    Navbar.tsx
    HeroSection.tsx
    QuickActions.tsx
    ServicesSection.tsx
    HowItWorks.tsx
    WhyChooseUs.tsx
    CoverageBanner.tsx
    BusinessDeliverySection.tsx
    SupportSection.tsx
    Footer.tsx
  pages/
    Home.tsx
  lib/
    utils.ts
  App.tsx
  main.tsx
```

---

## 10. Codex Prompt

Use this prompt in Codex:

```txt
Improve the Peekaboo website using the DESIGN.md file as the design source.

Tech stack:
- React.js with Vite
- Tailwind CSS
- shadcn/ui
- lucide-react icons

Design direction:
- Mobile-first
- Yellow and black branding
- Clean, modern, trusted delivery/logistics feel
- Inspired by MTN Rwanda’s strong yellow-black layout, but do not copy it directly

Build the homepage with these components:
- Navbar
- HeroSection
- QuickActions
- ServicesSection
- HowItWorks
- WhyChooseUs
- CoverageBanner
- BusinessDeliverySection
- SupportSection
- Footer

Requirements:
- Use reusable components
- Use responsive Tailwind classes
- Use shadcn/ui Button, Card, Input, Sheet, Badge, Accordion where useful
- Use lucide-react icons
- Keep copy short and professional
- Make CTAs clear: Book Delivery, Track Package, Contact Support
- Ensure the site looks premium on mobile and desktop
- Avoid generic AI-looking gradients; use strong blocks of black, white, and yellow
- Improve spacing, typography, visual hierarchy, and call-to-action placement
```

---

## 11. Do Not Copy Directly

The website should not copy MTN’s layout exactly. It should only borrow the design principles:

* Strong black/yellow branding
* Large hero visual
* Clear quick action icons
* Card-based service layout
* Helpful support section
* Strong footer
* Clean spacing and hierarchy

Peekaboo should still feel like a delivery and logistics brand, not a telecom brand.
