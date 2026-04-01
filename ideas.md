# AZ Tech Week 2026 — Design Brainstorm

## Context
A mobile-first interactive event calendar for Arizona Tech Week 2026 with 400+ events. Users need to quickly find events by day, topic, city, time of day, and keyword search. The current UX (Partiful scroll + AZ Commerce grid) is confusing. This needs to be 1000x better.

---

<response>
<text>

## Idea 1: "Desert Signal" — Brutalist Tech Wayfinding

**Design Movement**: Neo-Brutalist meets desert modernism. Raw, honest, functional — like a well-designed airport terminal in the Sonoran desert.

**Core Principles**: (1) Information density without clutter — show maximum events per viewport. (2) Stark contrast and bold typography as the primary visual language. (3) Color-coded wayfinding system — each day gets a distinct accent color. (4) Zero decoration that doesn't serve navigation.

**Color Philosophy**: Dark charcoal base (#1a1a1a) with a spectrum of warm desert-inspired accent colors — terracotta for Monday, burnt orange for Tuesday, golden sand for Wednesday, sage green for Thursday, dusty rose for Friday, copper for Saturday, deep indigo for Sunday. White text for readability. The palette evokes Arizona's landscape while serving as a functional day-coding system.

**Layout Paradigm**: Horizontal day tabs pinned at top (swipeable on mobile). Below, a dense card grid with events stacked in time-ordered columns. Left sidebar on desktop for filters (collapses to bottom sheet on mobile). No hero section — jump straight to content.

**Signature Elements**: (1) Thick 4px borders on cards with day-color coding on the left edge. (2) Monospaced time stamps that create a visual timeline rhythm. (3) Pill-shaped filter chips that stack and wrap naturally.

**Interaction Philosophy**: Tap to expand event details in-place (accordion style). No modals — everything stays in context. Filters apply instantly with count badges updating in real-time.

**Animation**: Cards slide in from bottom on filter changes. Day tab transitions use a horizontal wipe. Filter chips bounce slightly on toggle. Minimal — speed is the priority.

**Typography System**: Space Grotesk for headings (bold, geometric, tech-forward). IBM Plex Mono for times and metadata. System sans-serif for body text. Large 14px minimum on mobile.

</text>
<probability>0.06</probability>
</response>

<response>
<text>

## Idea 2: "Copper Circuit" — Warm Tech Dashboard

**Design Movement**: Scandinavian-meets-Southwest — clean, warm, approachable. Think of a beautifully designed productivity app with Arizona soul.

**Core Principles**: (1) Warmth through materials — soft shadows, rounded containers, warm neutrals. (2) Progressive disclosure — show just enough, expand on demand. (3) Contextual grouping — events cluster by time blocks (Morning/Afternoon/Evening) within each day. (4) Thumb-zone optimized for mobile.

**Color Philosophy**: Warm cream background (#faf7f2) with copper/bronze accents (#b87333) for interactive elements. Soft charcoal (#2d2d2d) for text. Category pills use muted earth tones — sage, clay, sand, slate. The warmth says "Arizona" without being literal. Dark cards with light text for featured/highlighted events.

**Layout Paradigm**: Vertical scroll with sticky day headers that transform as you scroll. On mobile: full-width cards with generous padding. On desktop: masonry-style 2-column layout with a persistent filter sidebar. Time blocks (Morning/Afternoon/Evening) act as collapsible sections within each day.

**Signature Elements**: (1) Rounded "copper" pill buttons with subtle metallic gradient on hover. (2) Thin horizontal timeline markers between time blocks. (3) Small circular city badges with first letter, color-coded by region (Phoenix metro = copper, Tucson = teal, Rural = sage).

**Interaction Philosophy**: Swipe between days on mobile (gesture-driven). Tap a card to see full details in a bottom sheet (mobile) or side panel (desktop). Long-press to "bookmark" events. Search is always accessible via a floating action button.

**Animation**: Smooth spring-based transitions between days. Cards fade-and-rise on scroll (intersection observer). Filter panel slides up from bottom on mobile with a drag handle. Time block sections accordion with easing.

**Typography System**: DM Sans for everything — clean, geometric, excellent at small sizes. Bold weight for headings, medium for card titles, regular for body. Tabular numbers for times. Generous line-height (1.6) for readability.

</text>
<probability>0.08</probability>
</response>

<response>
<text>

## Idea 3: "Neon Oasis" — Dark Mode Event Discovery

**Design Movement**: Cyberpunk-lite meets festival guide. High contrast, dark interface with vivid neon accents — like a tech conference app that actually looks exciting.

**Core Principles**: (1) Dark-first for outdoor mobile readability in Arizona sun (counterintuitive but OLED-friendly and reduces glare). (2) Neon color system where each category gets a vivid glow color. (3) Card-based discovery — swipe, filter, find. (4) Event density managed through smart grouping and lazy loading.

**Color Philosophy**: Near-black background (#0d0d0d) with category-specific neon accents — electric blue for AI, hot pink for Networking, lime green for Startups, amber for Tours, cyan for Health, violet for Space. White (#e8e8e8) for primary text, medium gray for secondary. The dark canvas makes the neon pops feel electric and exciting.

**Layout Paradigm**: Full-bleed mobile cards with edge-to-edge color accents. Top navigation: horizontal scrollable day selector with event count badges. Below: category quick-filter row (horizontal scroll of icon+label chips). Main content: time-sorted event cards with category color stripe on left. Desktop: 3-column grid with sticky filters.

**Signature Elements**: (1) Glowing left-border on cards matching category color with subtle box-shadow glow. (2) Animated gradient background on the day selector that shifts with the selected day. (3) Micro-icon system for categories (brain for AI, rocket for Space, handshake for Networking).

**Interaction Philosophy**: Everything is one-tap. Tap day = filter. Tap category chip = toggle filter. Tap card = expand inline with RSVP button prominent. Search overlay slides down from top. No page transitions — everything happens in-place.

**Animation**: Category chips pulse subtly when active. Cards have a slight scale-up on hover/press. Day transitions cross-fade. Skeleton loading states with shimmer effect. Scroll-triggered fade-in for cards below the fold.

**Typography System**: Outfit for headings (modern geometric sans with personality). Geist Sans for body (clean, technical, excellent legibility). Monospace numerals for event counts and times. Bold contrasts between heading sizes.

</text>
<probability>0.07</probability>
</response>
