/*
  Simple test script to exercise guest booking -> process payment (simulated) -> claim
  Usage:
    SUPABASE_URL=https://your-project.supabase.co SUPABASE_ANON_KEY=anon... SUPABASE_SERVICE_ROLE_KEY=service_role... node scripts/test-guest-claim.js

  This script won't call Stripe. It simulates a successful payment by calling the process-booking-payment function with guest_token and a "mock" payment method. Then it calls claim-guest-booking.
*/

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  console.error('Please set SUPABASE_URL in env')
  process.exit(1)
}

async function main() {
  // Create guest booking
  console.log('Creating guest booking via create-guest-booking function...')
  const createRes = await fetch(`${SUPABASE_URL}/functions/v1/create-guest-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY || '', 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || ''}` },
    body: JSON.stringify({
      pickup_address: 'Teststraat 1',
      pickup_lat: 50.85,
      pickup_lng: 4.35,
      destination_address: 'Bestemming 2',
      destination_lat: 50.86,
      destination_lng: 4.36,
      scheduled_time: new Date().toISOString(),
      payment_method: 'stripe',
      guest_name: 'Test Guest',
      guest_email: 'guest@example.com',
      guest_phone: '+320000000',
    })
  })

  const created = await createRes.json().catch(() => ({}))
  console.log('create-guest-booking response:', created)
  const token = created?.token
  if (!token) {
    console.error('No guest token returned; aborting')
    process.exit(1)
  }

  // Simulate process-booking-payment (the function will accept guest_token)
  console.log('Simulating process-booking-payment...')
  const paymentRes = await fetch(`${SUPABASE_URL}/functions/v1/process-booking-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY || '', 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || ''}` },
    body: JSON.stringify({
      guest_token: token,
      paymentMethodId: 'pm_mock_visa',
      amount: 1500, // cents
    })
  })

  const paymentResult = await paymentRes.json().catch(() => ({}))
  console.log('process-booking-payment response:', paymentResult)

  // Now claim the booking (unauthenticated) - should return booking info but not attach
  console.log('Calling claim-guest-booking without auth...')
  const claimRes1 = await fetch(`${SUPABASE_URL}/functions/v1/claim-guest-booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY || '', 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || ''}` },
    body: JSON.stringify({ token })
  })
  console.log('claim (no auth) status:', claimRes1.status)
  console.log(await claimRes1.json().catch(() => ({})))

  // If service role key provided, call claim as admin to attach to a test user (for test only)
  if (SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Calling claim-guest-booking with service role (simulated attach)...')
    const claimRes2 = await fetch(`${SUPABASE_URL}/functions/v1/claim-guest-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      body: JSON.stringify({ token })
    })
    console.log('claim (service role) status:', claimRes2.status)
    console.log(await claimRes2.json().catch(() => ({})))
  }
}

main().catch(err => { console.error(err); process.exit(1) })
