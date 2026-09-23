# CactusByte Ecosystem Doctrine & Capability Registry

**Canonical continuity document — v1.0 — September 23, 2026**

> **Implementation truth:** the current repository/version.  
> **Architectural continuity truth:** this document.

## Purpose

Preserve the architecture, business rules, ownership boundaries, release discipline, monetization rules, and anti-duplication controls of the Cactus🌵Byte Studios™ ecosystem so future chats, ABLs, developers, and product decisions can re-ground from one source of truth.

## 1. Canonical Doctrine

- **DON'T BUILD IT TWICE.** Before any feature enters an ABL, audit the target product and the wider CactusByte ecosystem. **Existing → reuse. Partial → extend. Missing → build. Duplicate → kill.**
- **BUILD IT AT THE RIGHT LAYER.** Universal capabilities belong in shared CactusByte infrastructure. Domain-specific intelligence remains with the product that owns the domain.
- **EVERY PRODUCT STANDS ALONE.** Each serious product must remain independently useful. Integration may increase value, but basic value must not depend on buying unrelated products.
- **EVERY PRODUCT GETS A MONEY PATH.** Define who pays, what value they receive, the monetization mechanism, cost-to-serve, and why an upgrade or subscription is justified.
- **INTEGRATE THROUGH CONTRACTS.** Products communicate through explicit, versioned APIs, schemas, events, and interfaces—not tangled internals or hidden cross-product assumptions.
- **CUSTOMER DATA HAS BOUNDARIES.** Shared infrastructure does not imply indiscriminate cross-product data sharing. Tenant, customer, authorization, and privacy boundaries remain explicit.
- **SHARED INFRASTRUCTURE IS NOT A MONOLITH.** CactusByte provides common rails. Products retain their identities, roadmaps, data boundaries, economics, failure domains, and distribution choices.
- **MCX IS A PROVING GROUND, NOT A CRUTCH.** Medicine Creek Exterior Co. may validate Matrix and RIVETEX with real jobs, but neither software product may become dependent on MCX.
- **ABL BEFORE BUILD. QA BEFORE RELEASE. APPROVAL BEFORE PRODUCTION.** Work is organized into atomic, recoverable batches. Production remains untouched until gates pass and explicit authorization is given.

## 2. Ecosystem Architecture

**Cactus🌵Byte Studios™** is the portfolio and technology owner. The ecosystem should behave like a platform with independent products—not a collection of isolated apps and not one giant application.

### Shared CactusByte layer

- CactusByte ID™ identity
- Entitlements and product access
- Subscriptions and billing infrastructure
- Recovery and account continuity
- Linked Devices where appropriate
- App/product registry
- Telemetry, health, and operational diagnostics
- Update/release infrastructure
- Shared Android/store-readiness infrastructure
- Common reusable components only when truly domain-neutral

### Established portfolio/workstreams

- CactusByte Hub
- Pressure Washing Matrix
- RIVETEX™
- MachZero™
- Rapid Takeoff™
- Acelynn Pro™
- PocketStomp™ / PocketStomp V2
- GhostLane™
- First Bearing™
- Fantasy Football Matrix
- ScoutTrace™
- ShadowNex Prime™
- TerraFlow Matrix™
- OrbitGather™
- Kalshi project / trading application workstream

### Operating companies vs. software products

**Medicine Creek Exterior Co. (MCX)** is an operating exterior-cleaning company and real-world customer/proving ground. It is not merely another CactusByte software app. MCX generates service revenue; software products generate their own software revenue.

## 3. Five Mandatory Gates Before Any New Feature

1. **Duplicate Gate** — Does this capability already exist in the target app or anywhere else in CactusByte? Search first.
2. **Ownership Gate** — Which layer should own it: shared platform, product-specific domain logic, or operating-company configuration?
3. **Standalone Value Gate** — Does the product remain independently useful and monetizable without another product?
4. **Integration Gate** — Would connecting existing capabilities create the value instead of building another implementation?
5. **Revenue Gate** — Who pays, what problem does it solve, and does it improve acquisition, retention, margin, expansion, or direct revenue?

## 4. ABL and Release Discipline

- **Ideas → Build → QA → Ready → Live.**
- Use contained atomic build lists, recoverable Git history, and explicit QA/regression gates.
- Preserve working functionality; do not rewrite healthy systems merely to standardize them.
- No production deployment merely because code is ready. **Live requires explicit authorization.**
- Prefer one intentional deployment per approved batch rather than deployment churn.
- Keep version, registry, schema, and release metadata aligned.
- Avoid service workers unless explicitly justified/approved.
- Mobile-first quality matters, including Samsung Galaxy Z Fold usability.
- Google Play/store readiness is ecosystem infrastructure; publication still requires explicit approval.

## 5. MCX / Matrix / RIVETEX Architecture

**Canonical flow:**  
**Matrix intelligence → RIVETEX operations → MCX real-world execution**

### Medicine Creek Exterior Co. (MCX)

- Role: customer-facing exterior-cleaning operating company.
- Revenue: service revenue + recurring commercial work.
- Rule: must retain operational continuity even if optional software integration is unavailable.

### Pressure Washing Matrix

- Role: exterior-cleaning estimating, photo/property intelligence, scope, field planning, chemicals, and pricing intelligence.
- Revenue: standalone vertical SaaS.
- Rule: must not require RIVETEX or MCX for basic value.

### RIVETEX™

- Role: field-service/business operations, job execution, scheduling, evidence, change orders, recurring work, and performance/calibration.
- Revenue: standalone operations SaaS.
- Rule: must not require Matrix or MCX for basic value.

### Matrix + RIVETEX

Premium integrated **evidence → prediction → execution → variance → governed learning** loop. Connection enhances both products without merging them.

## 6. MCX Launch Policy Boundary

MCX launch restrictions are policy/configuration, not reasons to delete broader Matrix capabilities. Initial MCX posture:

- one-story work
- no roofs
- no ladder-dependent work
- safe-access requirement
- approved launch services
- territory checks
- profitability thresholds

## 7. Verified Ownership — Do Not Rebuild

### Matrix already owns

AI/photo property analysis; surface/contaminant detection; photo coverage/missing views; confidence/uncertainty; hazards; scope recommendations; labor/time prediction; crew/equipment recommendations; chemical prescription; water-use prediction; technician execution instructions; customer proposal intelligence.

### RIVETEX already owns

Leads; accepted lead → job; estimates and estimate lifecycle; scheduling; jobs/job lifecycle; follow-ups; accounts/properties; crews; equipment; capacity intelligence; territories/service zones; before/during/after evidence; client/internal communications; change orders; original-scope preservation; recurring plans; renewal foundation; account-expansion signals; actual field-hours capture; planned-vs-actual comparison; historical calibration; sample-confidence/no-fake-AI guardrails; audit history.

**Do not rebuild these capabilities. Reuse, connect, or extend only proven gaps.**

## 8. Current MCX Integration Work — True Gaps Only

### MCX-01A — Matrix/RIVETEX Integration Contract

Versioned mapping from accepted Matrix estimate objects into existing RIVETEX quote/job structures. Preserve estimate ID/provenance, frozen accepted snapshot, unique IDs/idempotency, audit timestamps, backward compatibility, fixtures/tests, and prevent duplicate job creation.

### MCX-01B — MCX Policy Adapter

Thin rules/config layer over existing Matrix evidence. Apply one-story/no-roof/no-ladder/safe-access/allowed-service/territory/profitability rules and return **ACCEPT / MANUAL REVIEW / DECLINE**.

### MCX-01C — Economics Extension

Only after re-auditing current code. Extend existing records with revenue, chemical cost, fuel/travel, payment fees, equipment allocation, direct labor, owner-time economic cost, cash contribution, economic contribution, and contribution per field hour. Do not create a separate job-costing product.

### MCX-01D — Calibration Extension

Extend RIVETEX's existing historical planned-vs-actual calibration. Candidate segmentation: service, size band, contamination, property type, equipment, crew size/configuration, access difficulty, and later route/neighborhood, model version, weather/season when evidence supports it.

## 9. Governed Learning Loop

**Existing Matrix evidence/prediction → versioned bridge → existing RIVETEX execution/performance → variance analysis → extended calibration → human-governed change**

**PROPOSED → REVIEWED → APPROVED → ACTIVE**

No blind self-modifying pricing. Classify anomalous causes so abnormal jobs do not contaminate normal calibration cohorts.

## 10. Economics and Monetization Doctrine

- **MCX:** exterior-cleaning service revenue and recurring commercial contracts.
- **Pressure Washing Matrix:** standalone vertical SaaS.
- **RIVETEX:** standalone field-service/operations SaaS.
- **Matrix + RIVETEX:** premium integrated bundle.
- **Every other serious CactusByte product:** its own customer, value proposition, monetization thesis, and economics.

### MCX flywheel

**MCX performs real jobs → real jobs test Matrix/RIVETEX → software improves → stronger software becomes more sellable → software revenue funds development → improved software makes MCX more efficient.**

## 11. Capability Registry — Required Schema

Every future ABL consults the capability registry before feature design.

Required fields:

- Capability
- Product/layer
- Status: **Exists / Partial / Missing / N/A**
- Evidence/source/version
- Owner system
- Reusable component/interface
- Action: **Reuse / Connect / Extend / Build / Ignore**
- Revenue/customer rationale
- ABL assignment
- Last verified date

## 12. Cross-Ecosystem Reuse Rules

- Search the target repository first, then the broader CactusByte ecosystem.
- Do not copy domain logic merely because another app has a visually similar feature.
- Generalize only when the underlying capability is truly reusable and total complexity falls.
- Keep product-specific branding, workflows, business rules, and data contracts separate.
- Do not cross-contaminate repositories.
- Shared visual language/component libraries do not imply shared business logic.
- Prefer explicit adapters at product boundaries over hidden shared-database coupling.

## 13. Distribution and Product Lifecycle

**Build → QA → Ready → Distribution → Acquisition → Activation → Retention → Monetization → Support → Telemetry → Improvement**

A technically finished app is not automatically a business. Web, Direct Android, Google Play, and other appropriate channels may coexist without creating accidental product forks. Publication/deployment remains approval-gated.

## 14. Failure Isolation and Independence

- A RIVETEX outage should not inherently make Matrix unusable.
- A Matrix outage should not inherently make RIVETEX unusable.
- MCX retains an operational fallback if optional integrations fail.
- Shared identity/billing failures should not unnecessarily destroy already-authorized/offline product value.
- Cross-product integrations fail explicitly and observably rather than silently corrupting or duplicating records.

## 15. Future-Chat Handoff Protocol

When a conversation becomes too long or a new chat is started, use:

> **Continue CactusByte. Read the CactusByte Ecosystem Doctrine & Capability Registry first. Audit the current product/repo before proposing an ABL. Do not rebuild existing capabilities.**

The new chat then inspects the latest code/project files for the product being changed. This document preserves doctrine and known ownership; the current repository/version remains implementation truth.

## 16. Change Control

Update this document when:

- a product is added or retired;
- a shared capability changes owner;
- a major monetization decision is made;
- a capability moves from Partial/Missing to Exists;
- a new ecosystem-wide rule is adopted.

Record material architectural changes and their reason.

## 17. Non-Negotiable Summary

- CactusByte is the ecosystem/platform owner.
- Products are independent businesses, not tabs inside one mega-app.
- Shared infrastructure is built once at the correct layer.
- Every serious product needs standalone value and a revenue path.
- Integrations enhance products; they do not manufacture dependency.
- MCX is an operating company and proving ground, not a hard dependency.
- Matrix owns exterior-cleaning intelligence; RIVETEX owns operations; connect rather than duplicate.
- Audit before every ABL. **Reuse → Connect → Extend → Build only the proven gap.**
- QA and explicit approval gate production.
- **Current repository/version = implementation truth. This document = architectural continuity truth.**
