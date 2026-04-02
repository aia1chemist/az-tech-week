# UI Declutter Plan

## Current clutter sources on each event card:
1. Top row: WAITLIST/SPOTS LEFT badge + High Networking badge + 4 action buttons (Google Cal, QR, Share, Heart)
2. Metadata: time, duration, city, invite-only
3. Title + organizer
4. Description (expandable)
5. Attendee counts + capacity bar
6. **Emoji reactions row (4 buttons) — REMOVE from default view**
7. Categories + RSVP button

## Changes to make:

### EventCard — Simplify
- REMOVE emoji reactions from default card view (move to expanded description or remove entirely)
- REMOVE QR code button from card top row (keep it only in the expanded/detail area or My Schedule)
- REMOVE Google Calendar button from card top row (keep it only when description is expanded)
- Keep only: Share + Heart in the top row (2 buttons, not 4)
- Keep networking badge only for scores >= 70 (not 60)

### Home page — Streamline
- REMOVE SmartScrollCounter (adds floating noise)
- REMOVE WeatherOverlay (nice but adds a row of noise between day selector and content)
- SIMPLIFY LiveTicker — make it smaller or remove if it adds too much
- Keep: Hero, Day Selector, Quick Stats, Trending, Filters, Sort, Event List, Footer
- Move weather info into the day selector pills as a small icon

### Bottom Nav — Already good
- 5 buttons is fine since they auto-hide
- Keep as-is

### Result: Cleaner cards, fewer floating elements, faster scan
