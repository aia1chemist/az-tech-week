# AZ Tech Week — Feature Tracker

## v4.0 Core Features
- [x] Countdown timer in hero section
- [x] Dark mode toggle
- [x] Personal stats in My Schedule
- [x] Google Calendar one-click buttons on event cards
- [x] Shareable schedule link (encode bookmarks in URL)
- [x] Map view toggle
- [x] QR code generator for event Partiful links
- [x] Event reactions (emoji)
- [x] Crossover analysis
- [x] Category insights in hero section
- [x] Weather overlay per day
- [x] Uber/Lyft deep links
- [x] Popularity sparklines (RSVP momentum)
- [x] Smart scroll counter
- [x] Swipe gestures on mobile
- [ ] PWA / Add to Home Screen
- [ ] Accessibility audit (ARIA, keyboard nav)
- [ ] Multi-language (Spanish)
- [ ] Food & drink nearby
- [ ] Speaker/panelist info

## v5.0 Features
- [x] Curated Tracks (pre-built event bundles)
- [x] Organizer Profiles
- [x] Happening Now live indicator
- [x] First-Timer Guide
- [x] Live Ticker

## v6.0 Features
- [x] Animated page transitions (Framer Motion)
- [x] Skeleton loading shimmer
- [x] Parallax hero effect
- [x] Plan My Day wizard
- [x] Event popularity sparklines

## v7.0 Features (10 new)
- [x] Who's Going avatars on event cards
- [x] Live Attendee Pulse (trending RSVP ticker)
- [x] Event Matchmaker quiz (5 questions -> top 10)
- [x] Schedule Roast (tongue-in-cheek analysis)
- [x] City Hopper Badges
- [x] Bingo Card Generator
- [x] After-Party Finder
- [x] Weather-Aware Suggestions
- [x] Daily Digest email signup
- [x] Parking & Venue Notes

## v8.0 Features
- [x] Bingo card image export (html2canvas)
- [x] Remove cover images from event cards
- [x] Remove LiveTicker and TrendingSection (user request)
- [x] Full-stack upgrade (tRPC + database + auth)
- [x] Partiful scraper API endpoint for live RSVP data
- [x] Social login (Manus OAuth) with persistent bookmarks
- [x] Bookmark sync (localStorage + server DB merge on login)
- [x] Sign in / Account button in hero section
- [x] Database schema: bookmarks + rsvp_snapshots tables
- [x] Vitest tests for bookmark and RSVP routers
- [x] Remove LivePulse trending bar (user request)
- [x] Visually connect day selector to weather/stats content below (user request)
- [x] Fix eventId sent as string instead of number in bookmark mutations (bug)
- [x] Design Daily Digest email template (visual HTML preview)
- [x] Add subscriber table to DB and wire DailyDigest signup to tRPC
- [x] Build server-side email generation and notification endpoint
- [x] Build ChooseYourPath visual section with 3 discovery mode cards
- [x] Update CuratedTracks with availability health and "Save Available" logic
- [x] Wire ChooseYourPath into Home.tsx replacing inline Plan My Day + Tracks
- [x] Verify /digest-preview route renders correctly in browser
- [x] Implement digest send workflow (admin trigger to send to all subscribers)
- [x] Add vitest tests for digest router procedures
- [x] Center the day context info bar (user request)
