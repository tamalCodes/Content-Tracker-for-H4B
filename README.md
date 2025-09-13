# H4B Tracker — Social Content Scheduling for Teams

A lightweight, mobile-first planner to align **content**, **marketing**, and **admin** teams on _what to post, when, and with which assets_. Think “Google Calendar for social posts,” built in-house to keep timelines, copy, and media in one place.

## Core Features

- **Timeline scheduling**: Create calendar entries with title, rich text, and publish time.
- **Rich content editor**: Draft copy for different channels; attach notes and variants.
- **Media workflow**: Upload and link assets stored in **Google Drive**; teammates can download the final files for posting.
- **Team visibility**: Daily view to see “what’s scheduled today” at a glance.
- **Responsive UI**: Works cleanly on mobile for on-the-go posting.

## Tech Stack

- **Frontend**: React + Vite (fast HMR, modern tooling).
- **Language**: JavaScript (primary).
- **Build/Deploy**: Vite; Vercel config present in repo.
- **Integrations**: Google Drive API for media storage and retrieval.

## Structure

```
client/
├─ src/
│ ├─ components/ # UI building blocks (forms, editor, calendar/timeline)
│ ├─ pages/ # Views (Today, Timeline, Admin)
│ ├─ hooks/ # Data + UI hooks (e.g., useDriveAssets, useSchedule)
│ ├─ services/ # API clients (Google Drive, backend endpoints)
│ └─ styles/ # Global + modular styles
│
server/
├─ routes/ # REST endpoints for schedules, assets, users
├─ services/ # Google Drive service, auth helpers
└─ lib/ # Utilities (validation, date/time)
```

## Key Use Cases

- Content lead drafts posts with assets → schedules them on the timeline.
- Marketer opens **Today** view on mobile → downloads media from Drive → posts.
- Admin configures calendars, categories, and review status.

## Getting Started

```bash
# 1) Install
npm i

# 2) Dev
npm run dev

# 3) Build
npm run build && npm run preview
```
