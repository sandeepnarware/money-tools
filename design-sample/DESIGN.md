---
name: Fiscal Precision Light
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3f493f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6f7a6e'
  outline-variant: '#becabc'
  surface-tint: '#006d30'
  primary: '#00652c'
  on-primary: '#ffffff'
  primary-container: '#15803d'
  on-primary-container: '#d3ffd5'
  inverse-primary: '#79db8d'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#005c8e'
  on-tertiary: '#ffffff'
  tertiary-container: '#2075ae'
  on-tertiary-container: '#eef5ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#95f8a7'
  primary-fixed-dim: '#79db8d'
  on-primary-fixed: '#00210a'
  on-primary-fixed-variant: '#005323'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#94ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004b74'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for high-stakes financial environments where clarity, precision, and trust are paramount. It targets analysts, portfolio managers, and institutional investors who require a high-density information display that remains legible over long periods of use.

The aesthetic follows a **Corporate / Modern** approach with a lean toward **Minimalism**. It prioritizes a clear information hierarchy, utilizing a restrained color palette and a structured grid to eliminate cognitive load. The atmosphere is professional and grounded, evoking the stability of a legacy financial institution with the efficiency of a modern SaaS platform.

## Colors

The palette is anchored by a high-contrast foundation to ensure absolute readability of numerical data.

- **Primary (Forest Green):** Used for growth indicators, primary actions, and "positive" financial states. Adjusted to a deeper forest tone to ensure AA accessibility on light surfaces.
- **Secondary (Charcoal/Dark Blue):** The primary color for text, iconography, and structural elements. It provides a softer, more professional alternative to pure black.
- **Neutral:** A range of cool grays used for backgrounds, borders, and subtle UI layering.
- **Status Colors:** Utilize a standard semantic range: Red (#DC2626) for deficits, Amber (#D97706) for warnings, and Blue (#2563EB) for information.

## Typography

The typography system uses a tri-font approach to maximize utility and character:
- **Work Sans** provides a sturdy, professional presence for headlines and titles.
- **IBM Plex Sans** is the workhorse for body text, chosen for its excellent readability and technical feel.
- **JetBrains Mono** is utilized for tabular data, currency values, and technical labels where character alignment is critical for scanning columns of numbers.

Maintain tight line heights for data density but ensure paragraph text has sufficient leading (1.5x) for long-form reports.

## Layout & Spacing

This design system employs a **Fixed Grid** on desktop (max-width: 1440px) and a **Fluid Grid** for mobile devices. 

- **Grid:** A 12-column system is used for dashboards. Elements should align to the 4px baseline grid to maintain vertical rhythm.
- **Data Density:** In data-heavy views, reduce vertical padding to `sm` (8px). In marketing or high-level overview pages, increase padding to `lg` (24px) to allow the UI to breathe.
- **Breakpoints:** 
  - Mobile: < 640px (4 columns)
  - Tablet: 640px - 1024px (8 columns)
  - Desktop: > 1024px (12 columns)

## Elevation & Depth

To maintain a professional financial feel, depth is communicated through **Low-contrast outlines** combined with **Ambient shadows**.

- **Surface Level:** The main background is a clean off-white (#F9FAFB).
- **Cards & Containers:** White (#FFFFFF) with a 1px border (#E2E8F0) and a subtle, highly diffused shadow (Y: 2px, Blur: 4px, Color: rgba(15, 23, 42, 0.05)).
- **Interactive States:** On hover, cards should lift slightly with a more pronounced shadow and a primary-colored accent border on the left or top edge.
- **Modals:** Use a heavy backdrop blur (8px) and a higher elevation shadow (Y: 10px, Blur: 20px) to focus attention.

## Shapes

The shape language is "Soft" (0.25rem / 4px). This minimal rounding retains a precise, mathematical feel while avoiding the aggressive sharpness of pure 90-degree angles.

- **Buttons & Inputs:** Use the base `rounded` (4px).
- **Cards:** Use `rounded-lg` (8px) to soften the large surface areas.
- **Selection Indicators:** Use `rounded-xl` (12px) for things like status chips or toggle switches to provide a distinct visual contrast from functional buttons.

## Components

- **Buttons:** Primary buttons use the Forest Green background with white text. Secondary buttons use a Charcoal border with Charcoal text. Minimal padding: 10px top/bottom, 16px left/right.
- **Input Fields:** Use a light gray background (#F1F5F9) and a 1px border. On focus, the border transitions to Forest Green with a 2px outer glow.
- **Cards:** Dashboard cards must include a header section with a 1px bottom divider. Titles in `headline-md`.
- **Data Tables:** Use alternating row stripes (Zebra striping) with the lightest gray (#F8FAFC). Headers must be in `label-mono` with all-caps styling.
- **Chips/Badges:** Small, low-saturation backgrounds with high-saturation text for status (e.g., a very light green background for a "Growth" chip).
- **Charts:** Use a custom-tinted palette for data visualization that avoids pure primaries. Use Forest Green, Deep Sea Blue, and Slate Gray as the first three series colors.