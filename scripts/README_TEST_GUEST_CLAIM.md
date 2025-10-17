Test harness for guest booking -> payment -> claim

Purpose

This folder contains a simple test script that lets you exercise the guest flow without a full Stripe integration. It:

1. Calls `/functions/v1/create-guest-booking` to create a guest booking and returns a `guest_token`.
2. Calls `/functions/v1/process-booking-payment` with `guest_token` and a mock payment method id to simulate successful payment processing.
3. Calls `/functions/v1/claim-guest-booking` unauthenticated to retrieve the booking, and optionally with the service role key to attach it.

Usage

Set these environment variables and run the script with Node 18+:

```bash
export SUPABASE_URL=https://your-project-ref.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # optional
node scripts/test-guest-claim.js
```

Notes

- This script *does not* call Stripe. It's for quick verification that the functions are reachable and behave as expected in a dev environment.
- Ensure the Edge Functions are deployed and that the project has the required environment variables set in the Supabase dashboard.
