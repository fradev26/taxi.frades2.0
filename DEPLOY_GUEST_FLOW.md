# Guest Booking Flow Deployment Guide

This short guide explains the new guest booking flow functions and how to deploy them.

Functions added:
- `create-guest-booking` - create a server-side pending booking for guests and returns a `guest_token`.
- `create-booking-with-lock` - for logged-in users: atomically locks vehicle and creates booking.
- `claim-guest-booking` - claim a guest booking token after user signs up / logs in.

Deployment steps (Supabase):
1. Ensure your environment variables are set for the Supabase project (on the server where you'll deploy functions):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY` (for some functions if needed)
   - `VITE_SUPABASE_URL` (client)
2. Deploy functions using the Supabase CLI:

   ```bash
   supabase functions deploy create-guest-booking
   supabase functions deploy create-booking-with-lock
   supabase functions deploy claim-guest-booking
   ```

3. Configure CORS/redirects as needed and ensure that your frontend `VITE_SUPABASE_URL` points to your Supabase project URL.

Frontend integration notes:
- `handleGuestBooking` in `src/components/BookingForm.tsx` now calls `create-guest-booking` and stores returned token as `pendingGuestBookingToken` in `localStorage` and redirects to `/login?postPayment=true&guestBooking=true&token=<token>`.
- After user completes payment, login flow should call the `claim-guest-booking` endpoint with the token and user `Authorization: Bearer <access_token>` header to associate the booking with the user.

Payment/webhook notes:
- Webhook or `process-booking-payment` function should update `bookings` by booking id or `guest_token` as appropriate. If payment completes and you only have `guest_token`, locate booking by token and set `payment_status=paid` and `status='confirmed'`.

Testing locally:
- Deploy functions to your staging Supabase, then run the app.
- Create a guest booking, observe returned token in redirect URL, then call:

  ```bash
  curl -X POST $SUPABASE_URL/functions/v1/claim-guest-booking \
    -H "Authorization: Bearer <user_access_token>" \
    -H "Content-Type: application/json" \
    -d '{"token":"<token>"}'
  ```

- Verify booking row updated with `user_id` and status updated accordingly.

