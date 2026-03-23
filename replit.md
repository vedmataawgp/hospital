# MediCare — Hospital Digital Platform

## Overview
Next.js 16 (Turbopack) frontend for a hospital management system. Runs on **port 5000**, bound to `0.0.0.0` for Replit compatibility. The Django backend is expected at `http://localhost:8080` — all `/api/*` requests are proxied there via `next.config.ts`.

---

## Architecture

### Directory Layout
```
frontend/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Home (+ dept/doctor API with fallback)
│   ├── doctors/page.tsx      # Doctor listing with filters
│   ├── departments/page.tsx  # Department grid
│   ├── appointments/page.tsx # 5-step booking wizard
│   ├── consultation/page.tsx # Chat UI with optimistic messages
│   ├── contact/page.tsx      # Contact form
│   ├── auth/login/page.tsx   # JWT login form
│   ├── auth/register/page.tsx# Registration form
│   ├── dashboard/
│   │   ├── patient/page.tsx  # Patient portal (tabs)
│   │   ├── doctor/page.tsx   # Doctor portal (tabs)
│   │   └── admin/page.tsx    # Admin portal (sidebar)
│   ├── layout.tsx            # Root layout + Bootstrap Icons CSS
│   └── globals.css           # Design system CSS
├── components/
│   ├── Navbar.tsx            # Sticky, scrolled-aware navigation
│   ├── Footer.tsx            # Full footer with contrast-safe text
│   ├── Skeleton.tsx          # Loading skeleton components
│   └── ApiError.tsx          # Error state component
└── lib/
    ├── api.ts                # Full Django REST API service layer
    ├── types.ts              # TypeScript interfaces (all entities)
    └── useApi.ts             # useApi + useMutation hooks
```

---

## Key Technical Details

### API Service Layer (`frontend/lib/api.ts`)
- **Base URL**: `/api` (proxied to Django at :8080 via `next.config.ts`)
- **JWT auth**: tokens stored in `sessionStorage` (tab-scoped, cleared on close)
- **CSRF**: `X-CSRFToken` header sent on all non-GET requests, read from `csrftoken` cookie
- **Security**: `sanitise()` helper strips HTML/script from all string inputs (passwords excluded)
- **Retry**: exponential back-off, max 3 attempts, 300ms base delay
- **Timeouts**: 15-second `AbortController` on every request
- **Rate limits**: auto-retries after `Retry-After` seconds on HTTP 429
- **401 handling**: clears token and redirects to `/auth/login`
- **Deduplication**: concurrent identical GET requests share one in-flight Promise
- **Endpoints**: auth, doctors, departments, appointments, consultation, patient portal, doctor portal, admin, contact

### Data Fetching Hooks (`frontend/lib/useApi.ts`)
- `useApi(fetcher, deps)` — fires on mount, cancels on unmount, exposes `{data, loading, error, refetch}`
- `useMutation(fn)` — returns `[mutate, {loading, error, success}]`

### Icons
- **Bootstrap Icons** (`bootstrap-icons` npm package) — imported globally in `layout.tsx`
- Used as `<i className="bi bi-{name}" />` — **no emojis anywhere**

### Contrast System (globals.css)
All text on dark (`#0A2647`, `#144272`) backgrounds uses:
- `text-white` or `text-slate-200` for primary text
- `text-slate-300` for secondary text (previously `text-white/50` — fixed)
- `text-sky-300` for section labels on dark backgrounds
- `text-red-300` for warning text on dark backgrounds

Status badge classes: `.badge-confirmed`, `.badge-pending`, `.badge-completed`, `.badge-cancelled`, `.badge-paid`, `.badge-active`, `.badge-inactive`

### Performance Patterns (100k users/second readiness)
- GET request deduplication prevents thundering herd
- Stale-while-revalidate pattern in `useApi`
- Optimistic updates in consultation chat
- Next.js Turbopack for fast rebuilds
- Static fallback data on home page if API is unavailable
- All components cancellable on unmount (no memory leaks)

---

## WhatsApp-like Consultation Chat (`/chat`)

### Files
- `frontend/app/chat/page.tsx` — Full chat UI (Client Component)
- `frontend/lib/chatWebSocket.ts` — WebSocket client class wired to Django Channels

### Features
- **Two-panel layout**: left conversation list + right chat area (mobile-responsive)
- **Real-time WebSocket**: connects to `ws(s)://{host}/ws/chat/{roomId}/?token={jwt}` (Django Channels)
- **Auto-reconnect**: exponential back-off, max 12 attempts, up to 30s delay
- **Offline simulation**: when Django backend is down, auto-replies simulate doctor responses
- **Message status**: sending → sent (✓) → delivered (✓✓) → read (✓✓ blue)
- **Typing indicator**: animated 3-dot bounce, shown when doctor is typing
- **Reactions**: hover any message to see emoji bar (❤️ 👍 😂 😮 😢 🙏), click to react/un-react
- **Media sharing**: paperclip button opens file picker, image preview shown before send
- **Reply-to**: hover message, click Reply → quoted context in next message
- **Emoji picker**: 20-emoji grid toggles above input
- **Search**: filters conversation list by name or last message
- **Online/offline**: green dot indicators + "last seen" text
- **Unread badges**: green badges with count on conversation list
- **Unsent queue**: messages queued locally, flushed on WebSocket reconnect

### WebSocket Events (spec from Django side)
| Event | Direction | Purpose |
|-------|-----------|---------|
| SEND_MESSAGE | Client→Server | Send a new message |
| RECEIVE_MESSAGE | Server→Client | Incoming message |
| TYPING_START / TYPING_STOP | Both | Typing indicators |
| MESSAGE_READ | Server→Client | Mark message as read |
| USER_ONLINE / USER_OFFLINE | Both | Presence |
| REACTION_ADD | Both | Add emoji reaction |

---

## Running
The "Start application" workflow runs `cd frontend && npm run dev` which starts Next.js on port 5000. The Django backend should run separately on port 8080.

## Environment
- **Package manager**: npm (package-lock.json)
- **Framework**: Next.js 16 with Turbopack
- **Styling**: Tailwind CSS v4 + custom CSS in globals.css
- **Icons**: Bootstrap Icons 1.x (CSS import)
- **Port**: 5000 (configured in package.json scripts)
