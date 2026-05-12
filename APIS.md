# API Integrations — Rahi Travels Explorer

## Currently Integrated

| API | Purpose | Env Var | Status |
|-----|---------|---------|--------|
| [Razorpay](https://razorpay.com) | Payment processing (card + wallet top-up) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Live keys set — working |
| [Duffel](https://duffel.com) | Live flight search | `DUFFEL_API_KEY` | Falls back to mock data if key not set |
| [Resend](https://resend.com) | Booking confirmation emails | `RESEND_API_KEY` | Silently skipped if key not set |
| [Prisma + SQLite](https://www.prisma.io) | Database ORM (dev: SQLite, prod: Cloudflare D1) | `DATABASE_URL` | Working |
| [Cloudflare Workers](https://workers.cloudflare.com) | Hosting + edge runtime | `wrangler.jsonc` config | Configured |

---

## Candidate APIs (not yet integrated)

### Flights
| API | Free Tier | Notes |
|-----|-----------|-------|
| [Kiwi.com Tequila](https://tequila.kiwi.com) | Free sandbox | Flight search, requires approval for live |
| [Aviasales / Travelpayouts](https://www.travelpayouts.com/developers/api) | Free with affiliate account | Covers flights + hotels in one account |
| [AviationStack](https://aviationstack.com) | 500 calls/month | Schedules and live status, not bookable fares |

### Hotels
| API | Free Tier | Notes |
|-----|-----------|-------|
| [Travelpayouts Hotels](https://www.travelpayouts.com/developers/api) | Free with affiliate account | Same account as Aviasales flights |
| [Makcorps](https://rapidapi.com/makcorps/api/makcorps-hotel-api) | 10 calls/day (RapidAPI) | Very limited, demo only |

### Trains
| API | Free Tier | Notes |
|-----|-----------|-------|
| [transport.rest](https://transport.rest) | Unlimited, no key needed | European rail — no signup required |
| [SNCF](https://numerique.sncf.com/startup/api) | Free | France only |
| [Deutsche Bahn via transport.rest](https://v6.db.transport.rest) | Free, no key | German rail, part of transport.rest |

### Supporting / Enrichment
| API | Free Tier | Notes |
|-----|-----------|-------|
| [RestCountries](https://restcountries.com) | Unlimited, no key | Country info, flags, currencies |
| [Unsplash](https://unsplash.com/developers) | 50 req/hour | Destination photography |
| [OpenWeatherMap](https://openweathermap.org/api) | 1,000 calls/day | Weather at destinations |

---

## Notes for Presentation

- **Payments**: Razorpay live keys are active. Card payments and wallet top-ups go through real Razorpay checkout.
- **Flights**: Duffel integration is complete. With a live `DUFFEL_API_KEY` the search returns real fares; without it the UI shows realistic mock data.
- **Emails**: Resend sends HTML booking confirmations. Requires adding `RESEND_API_KEY` to `.env`.
- **Hotels / Trains**: Currently powered by static mock data. Sufficient for demo purposes.
- **Auth**: Session-based, tokens stored in DB (Prisma `Session` table), no third-party auth provider.
- **Currency**: EUR throughout. Razorpay supports EUR natively.
