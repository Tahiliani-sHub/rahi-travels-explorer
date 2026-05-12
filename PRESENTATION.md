# Rahi Travels Explorer — Presentation Notes

## Elevator Pitch
A full-stack travel booking platform built on Cloudflare Workers + React. Users can search flights, trains, hotels, and holiday packages — then pay by card or wallet, manage bookings, and leave reviews. Everything is persisted to a real database with session-based auth.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TanStack Router, TanStack Query, Tailwind CSS |
| Backend | Hono (runs on Cloudflare Workers edge runtime) |
| Database | Prisma ORM — SQLite in dev, Cloudflare D1 in production |
| Payments | Razorpay (live keys, real card processing) |
| Flight Search | Duffel API (falls back to realistic mock data) |
| Email | Resend (booking confirmations) |
| Hosting | Cloudflare Workers + Cloudflare Pages |
| Dev Server | Node.js (mirrors all API routes for local development) |

---

## Pages & Features

### Public
- **Home (`/`)** — Hero with search bar, featured packages, animated splash screen
- **About (`/about`)** — Company info

### Search & Browse
- **Flights (`/flights`)** — One-way and return search with passenger count, cabin class, filters (price, stops, airline), sorting. Return mode lets you select outbound then return — bundled into one booking.
- **Trains (`/trains`)** — Same one-way / return bundle pattern as flights
- **Hotels (`/hotels`)** — Search by destination and date
- **Holidays (`/holidays`)** — Curated holiday packages
- **Packages (`/packages`)** — All packages with filters; compare up to 3 side-by-side
- **Package Detail (`/packages/:id`)** — Full details, reviews, ratings, book/save

### User
- **Login / Signup (`/login`, `/signup`)** — Session-based auth, tokens stored in DB
- **Account (`/account`)** — Edit name/phone, change password, wallet balance + top-up via Razorpay, transaction history
- **Bookings (`/bookings`)** — All bookings from DB, cancel (triggers Razorpay refund or wallet refund), PDF download
- **Saved (`/saved`)** — Wishlist persisted to DB per user

### Admin
- **Coupon Manager (`/admin/coupons`)** — Create percentage or fixed-amount coupons with validity dates and usage limits

---

## Key Features to Demo

### 1. Search → Book → Confirm flow
1. Go to Flights, search any route (e.g. London → Paris)
2. Select a flight → Payment modal opens
3. Pay by card (Razorpay checkout) or wallet balance
4. Apply a coupon code at checkout for a discount
5. Booking appears in `/bookings` with confirmed status
6. Confirmation email sent (if `RESEND_API_KEY` is set)

### 2. Return trip bundling
1. On Flights, toggle "Return"
2. Click "Select outbound" on a flight — button turns green
3. Click "Book return bundle" on a return flight — shows combined price
4. Single payment → single booking record with both legs

### 3. Wallet top-up
1. Open wallet drawer (top-right) or go to `/account`
2. Choose preset amount (€100 / €200 / €500 / €1000)
3. Razorpay checkout opens — real payment
4. Balance updates instantly after verification

### 4. Reviews & Ratings
1. On any package or search result card, expand the reviews section
2. Authenticated users can submit a star rating + written review
3. Average rating shown on card

### 5. Package Compare
1. On `/packages`, toggle compare on up to 3 packages
2. Side-by-side comparison table on `/compare`

### 6. Coupon codes
1. Go to `/admin/coupons`, create a coupon (e.g. `DEMO20` — 20% off)
2. At payment, enter the code in the coupon field
3. Price updates, discount applied to final charge

---

## Database Models
- **User** — name, email, phone, hashed password
- **Session** — token + expiry (server-side session management)
- **Wallet** — balance per user
- **Booking** — type, details (JSON), amount, currency, status, dates
- **Review** — rating (1–5), title, comment, per user per item
- **Coupon** — code, discount type/value, validity window, usage limit
- **SavedItem** — wishlist items per user
- **Transaction** — charge/refund audit log

---

## Security
- Passwords hashed (bcrypt) — never stored in plain text
- Session tokens in DB with expiry — not JWT
- CSRF protection: all mutating API endpoints require `X-Rahi-Request: true` custom header
- Razorpay payment verification via HMAC-SHA256 signature check — amount cannot be tampered client-side
- Auth middleware on all protected endpoints (profile, bookings, saved items, wallet)

---

## What's Live vs. Mock

| Feature | Status |
|---------|--------|
| Payments (card + wallet) | **Live** — real Razorpay keys |
| Auth + sessions | **Live** — DB-backed |
| Bookings (create, cancel, refund) | **Live** — DB-backed |
| Reviews + ratings | **Live** — DB-backed |
| Saved items | **Live** — DB-backed |
| Coupons | **Live** — DB-backed |
| Flight search | **Live with Duffel key** / realistic mock fallback |
| Booking confirmation email | **Live with Resend key** / silent fallback |
| Hotel search | Mock data (static) |
| Train search | Mock data (static) |

---

## Candidate API Integrations (next steps)
- **Trains**: [transport.rest](https://transport.rest) — free, no key, European rail
- **Hotels**: [Travelpayouts](https://www.travelpayouts.com/developers/api) — free affiliate account
- **Flights alt**: [Kiwi.com Tequila](https://tequila.kiwi.com) — free sandbox
- **Weather**: [OpenWeatherMap](https://openweathermap.org/api) — destination weather cards
- **Photos**: [Unsplash](https://unsplash.com/developers) — dynamic destination imagery

---

## Running Locally
```bash
npm install
npx prisma db push      # create SQLite DB
npm run dev:api         # API server on :3001
npm run dev             # Vite + proxy on :5173
```

Add to `.env`:
```
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RESEND_API_KEY=re_...
DUFFEL_API_KEY=duffel_live_...
```
