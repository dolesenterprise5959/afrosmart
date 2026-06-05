# AfroSmart — Production Monitoring & Observability

Concrete recommendations for running AfroSmart in production on Google Cloud /
Firebase. Pairs with `docs/LAUNCH_RUNBOOK.md` §6.

## Golden signals & SLOs (beta targets)

| Signal | Target (beta) | Source |
|---|---|---|
| Availability (uptime) | ≥ 99.5% | Cloud Monitoring uptime check on `/` |
| p95 page latency | < 2.5s on 3G/low-end mobile | Firebase Performance Monitoring (web) |
| Error rate (5xx) | < 1% of requests | Cloud Logging log-based metric |
| Auth success rate | > 95% OTP verifications | Firebase Auth metrics |
| Firestore reads/day | within budget envelope | Firestore usage dashboard |

## Dashboards to create

1. **App health** — request rate, 5xx rate, p50/p95/p99 latency, instance count (Cloud Monitoring).
2. **Firestore usage** — reads/writes/deletes per collection, hot documents; watch `rateLimits` and `listings` read volume (catches runaway cost or abuse).
3. **Auth & SMS** — OTP sends, verification success/failure, **SMS spend** (phone auth costs money — a key abuse vector).
4. **Business funnel** (GA4) — browse → message → call-unlock → repeat. Call-unlocks are the truest "real intent" metric.

## Alerts (route to on-call via email/SMS/Slack)

- 5xx rate > 2% for 5 min.
- p95 latency > 4s for 10 min.
- Uptime check failing.
- **Budget alerts at 50% / 90% / 100%** of the monthly Google Cloud budget (hard guardrail against bill blowups from traffic or abuse).
- Firestore read/write spike (> N× baseline) — possible abuse or a caching regression.
- OTP/SMS send rate spike — phone-auth abuse.
- Spike in HTTP 429s — rate limiting firing heavily (could be attack or a UX problem).

## Tooling checklist

- [ ] **Cloud Logging**: structured logs from App Hosting/Cloud Run; log-based metrics for 5xx and 429. **Never log phone numbers or session cookies.**
- [ ] **Cloud Monitoring**: dashboards + uptime check + alerting policies above.
- [ ] **Error tracking**: Sentry (or Cloud Error Reporting) wired into route handlers / server actions for stack traces + release tracking.
- [ ] **Firebase Performance Monitoring (web)** + **Google Analytics 4** for real-user metrics on Liberian networks.
- [ ] **Google Cloud Budget** with alerts + (optional) a billing kill-switch function.
- [ ] **Firestore/Storage backups**: scheduled daily export to GCS; test a restore.
- [ ] **Uptime/status**: a simple public status page or internal uptime check.

## Application-level signals already built in

- **Rate limiting** returns HTTP **429** — alert on its rate to spot abuse early.
- **Reports queue** (admin console) is a human signal of scams/spam — track open-report age.
- **Suspensions / listing removals** — track moderation volume as a community-health metric.

## Scale follow-ups (post-beta)

- The browse data cache (`unstable_cache`, 30s TTL) is **per-instance** by default. For multi-instance scale, add a **shared cache handler** (e.g., Redis/Memorystore) so cache hits are global and Firestore read volume stays flat.
- Move browse ordering/pagination to Firestore using the composite indexes in `firestore.indexes.json` (removes the 60-doc in-memory window).
