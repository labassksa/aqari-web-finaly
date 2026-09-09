# Event Hall, Daily Rental, and Wallet Hold Completion Plan

## Handoff context

- Prepared on September 9, 2026 for work spanning:
  - Web: `/Users/mostafayassin/Projects/aQora/aqari-web8`
  - Backend: `/Users/mostafayassin/Projects/aQora/aqari-backend`
- This document records the agreed implementation plan. No implementation was performed while creating this handoff.
- The `aqari-web8` worktree was clean when this file was created. Recheck both repositories before editing because the state may change after this handoff.
- The web repository's `AGENTS.md` warns that its Next.js version has breaking changes. Before changing Next.js code, read the relevant guide under `node_modules/next/dist/docs/` and follow its current APIs and deprecation guidance.
- As of September 9, 2026, the live API does not expose the `event_hall` category. Deploy and verify the backend before enabling/deploying the web Event Halls CTA.

## Goal and product rules

Complete the missing category-aware Add Listing flow across the web and backend, and finish the daily-rental wallet-hold lifecycle.

The central product rules are:

1. Event halls can be created as `rent_short` listings, but remain contact-only. They must not expose or accept calendar booking or availability operations.
2. Daily rentals remain bookable through the calendar and use wallet holds.
3. Residential, commercial, and land forms expose only fields appropriate to their property type.
4. Stale values from a previously selected category must never leak into a listing submission.
5. Only pending bookings may be cancelled in this scope. Confirmed-booking refunds and disputes are explicitly out of scope.

## Backend implementation

### Category migration and production data

Add idempotent migrations that:

- Ensure the PostgreSQL enum behind `listing_categories.propertyType` accepts `event_hall`.
- Insert the active category with:
  - English name: `Event Hall`
  - Arabic name: `قاعة مناسبات واحتفالات`
  - `propertyType=event_hall`
  - `listingType=rent_short`
- Reactivate/update the existing row if it already exists instead of creating a duplicate.
- Execute migrations per file so the enum addition is committed before the category insert/upsert runs. PostgreSQL cannot safely use a newly added enum value in the same transaction on affected versions/configurations.
- On rollback, deactivate the category but leave the enum value in place.

Verify migration idempotency and behavior against PostgreSQL, not only mocks or an in-memory database.

### Listing-field normalization

Keep the existing listing DTO shape. Normalize category-specific values in the listing service before persistence:

| Category behavior | Fields retained | Fields cleared |
| --- | --- | --- |
| Event hall | `maxGuests`, `pricePerHalfDay`, `includedServices` | Daily-rental timing/minimum-night fields and unrelated residential/commercial fields |
| Daily rental | `maxGuests`, `checkInTime`, `checkOutTime`, `minNights` | Event-hall-only fields and unrelated property fields |
| Other listings | Fields appropriate to their category | All bookable/event-hall-only fields |

Do not rely only on the web client to sanitize these values. The backend is the final enforcement boundary.

### Contact-only event halls

Enforce this rule in every relevant backend entry point:

- Booking creation accepts daily-rental listings only.
- Availability checks accept daily-rental listings only.
- Direct requests for `event_hall` return a clear HTTP `400` contact-only error.
- Ensure shared helpers do not accidentally classify all `rent_short` listings as bookable; distinguish property type explicitly.

### Wallet hold lifecycle

Preserve the existing atomic confirmation workflow:

1. Lock the booking and relevant wallets.
2. Validate the booking is still confirmable and its dates do not conflict.
3. Validate sufficient guest balance.
4. Debit the guest.
5. Create the guest debit transaction, invoice, and wallet hold.
6. Block the dates.
7. Confirm the booking.
8. Commit once, with all preceding state changes in the same transaction.

After commit, send notifications on a best-effort basis. A notification failure must be logged/handled without making an already committed confirmation appear to have failed.

For scheduled hold release, perform one atomic and idempotent operation:

1. Lock the due hold, booking, and relevant wallet rows.
2. Confirm that the hold is still eligible and unreleased.
3. Credit the host exactly once.
4. Create the host credit transaction and invoice.
5. Mark the hold `released`.
6. Mark the booking `completed`.
7. Commit all changes together.

Concurrent/repeated release attempts must not duplicate credits, transactions, or invoices.

### Wallet transactions API

Extend `GET /wallet/transactions` with an optional query parameter:

- `type=credit`
- `type=debit`

Keep `referenceType` for semantic origins such as `booking` and `top_up`. Do not overload `referenceType` with debit/credit direction.

## Web implementation

### Shared property-type behavior

Add shared, tested helpers that classify residential, commercial, land, daily-rental, and event-hall behavior. Also add shared included-service constants/options for event halls. Reuse these helpers in step visibility, state cleanup, payload construction, and review rendering so category rules do not drift across components.

### Add Listing state

Extend wizard state with:

- `maxGuests`
- `checkInTime`
- `checkOutTime`
- `minNights`
- `pricePerHalfDay`
- `includedServices`

Add the corresponding set/reset/toggle actions. When category/property type changes, clear every incompatible field immediately. Payload building must independently whitelist fields for the selected category so hidden stale values cannot be posted even if state cleanup regresses.

### Dynamic steps

Make Step 5 property-type aware:

| Property type | Step 5 fields |
| --- | --- |
| Residential | Rooms, floor, age, street width, facade, and residential features |
| Commercial | Bathrooms, floor, age, street width, and facade only |
| Land | Street width and facade only |
| Event hall | Capacity, optional half-day price, and included-service checkboxes only |

Add Step 5b only when the selected listing has `listingType=rent_short` and `propertyType !== event_hall`. It should collect:

- Optional capacity (`maxGuests`)
- Optional check-in time
- Optional check-out time
- `minNights`, validated as an integer greater than or equal to 1

Update the review step to display and submit the relevant event-hall/daily-rental fields.

### Submission validation and errors

Before submission require:

- Non-empty title
- Positive price
- Positive area
- Selected city
- Valid map latitude and longitude

Render field-level API validation errors and keep the user on the relevant step. Do not silently advance or reduce the error to an opaque generic message when the API identifies a field.

Add complete Arabic and English messages for every new label, helper, error, retry state, and review value.

### Event Hall CTA, preset, and routing

- Enable the Event Halls page Add Listing CTA.
- Route it to `/add-listing?propertyType=event_hall`.
- In the Next.js 16 server page, read `searchParams` as a promise using the documented API, then pass the preset property type to the client wizard.
- Once active categories load, auto-select the matching `event_hall` category.
- If that active category cannot be found, show a blocking error/retry state; do not fall back to a different category.
- Preserve the entire query string through authentication by extending `AuthGuard` with an explicit return target.
- Add an `addHref` option to the reusable listings component. Event Halls supplies the preset URL; existing listing pages keep the generic `/add-listing` destination.

### Booking and wallet UI fixes

- Never show booking/calendar controls for event halls.
- After a guest cancels a pending booking, update its card/status to `cancelled` rather than removing the card from the list.
- Update wallet transaction filters to send `type=credit|debit`; continue to use `referenceType` only for values such as `booking` and `top_up`.

## Public interfaces after completion

- `GET /listing-categories` includes the active `event_hall` category.
- `POST /listings` keeps its current request shape and accepts/populates the six relevant bookable fields listed above.
- `GET /wallet/transactions` accepts optional `type=credit|debit`.
- Booking and availability endpoints return a clear `400` response for event halls.
- Web components gain:
  - A preset property type for Add Listing
  - An explicit authentication return target
  - A configurable Add Listing destination (`addHref`)

## Required test coverage

### Backend Jest/integration coverage

- Category enum migration and category insert/reactivation are idempotent.
- Category-specific listing fields are retained/cleared correctly.
- Event-hall booking creation and availability checks are rejected.
- Insufficient guest funds roll back all confirmation effects.
- Successful confirmation atomically creates the debit, invoice, hold, date blocks, and confirmed booking state.
- Duplicate confirmation/concurrent date conflicts cannot double-charge or double-book.
- Wallet hold summaries expose correct held/pending amounts.
- Hold release is idempotent and credits the host once.
- Release produces the correct host transaction and invoice and completes the booking.
- Wallet transaction `type` filtering works independently of `referenceType`.

### Web unit/component coverage

- Property grouping/classification helpers.
- Dynamic Step 5 and Step 5b visibility.
- Clearing incompatible values on category changes.
- Category-safe payload sanitization.
- Query preset category selection and unavailable-category blocking state.
- Required field, coordinate, and `minNights` validation.
- Field-level API error rendering.
- Cancelled booking cards remain visible with `cancelled` status.
- Wallet direction filters use `type`, not `referenceType`.

### Browser-flow coverage

- Residential, commercial, and land category-specific creation forms.
- Daily-rental Step 5b creation and booking.
- Event Hall preset creation with correct fields and no booking controls.
- Minimum-night and blocked-date enforcement.
- Guest request/cancel and owner confirm/decline flows.
- Guest wallet debit, held/pending balances, and eventual host credit.

## Verification and rollout

Run, at minimum:

- Web lint
- Web type-check and/or production build
- Relevant web unit/component tests
- Backend tests and production build
- Backend migration tests against PostgreSQL
- Browser flows for the affected paths where the project harness supports them

Roll out in this order:

1. Deploy backend migrations and backend code.
2. Verify the live `GET /listing-categories` response contains active `event_hall` with `listingType=rent_short`.
3. Verify direct event-hall booking/availability requests receive the intended `400` response.
4. Deploy the web creation flow and Event Halls CTA.
5. Run authenticated staging smoke tests with separate guest and host accounts.
6. Include insufficient-balance confirmation and a forced-due hold release to verify one-time payout and booking completion.

## Explicit non-goals

- Do not make event halls calendar-bookable.
- Do not add refunds or disputes for confirmed bookings.
- Do not change the existing `POST /listings` public shape beyond populating its already-defined category-specific fields.
- Do not remove the enum value during rollback.

## Resume checklist for the next agent

1. Read both repositories' `AGENTS.md` files and any more specific nested instructions.
2. Recheck `git status` in both repositories and preserve unrelated/user changes.
3. Inspect the current schema, migration runner, listing DTO/service, booking/availability services, wallet confirmation/release jobs, Add Listing wizard, Event Halls page, `AuthGuard`, reusable listings component, translations, and existing tests before editing.
4. Read the relevant Next.js guide in `aqari-web8/node_modules/next/dist/docs/` before touching routing or `searchParams` code.
5. Map existing field names and enums to this plan rather than assuming names from training data.
6. Implement backend enforcement and migrations before enabling the web CTA.
7. Verify atomicity and idempotency with database-backed tests, then run the full verification and rollout sequence above.
