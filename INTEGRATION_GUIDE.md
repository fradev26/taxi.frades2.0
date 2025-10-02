# API Integration Guide

This document describes how Stripe, Google OAuth, and Apple ID OAuth are integrated into the FRADES taxi application.

## Table of Contents
- [Stripe Integration](#stripe-integration)
- [OAuth Integration (Google & Apple)](#oauth-integration)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

## Stripe Integration

Stripe is integrated for payment processing in the Wallet page. The integration allows users to:
- Add payment methods (credit/debit cards, Bancontact)
- Top up wallet credit

### Files Involved

#### 1. `/src/lib/stripe.ts`
Core Stripe utility functions:
- `getStripe()` - Returns the Stripe instance or null if not configured
- `isStripeConfigured()` - Checks if Stripe publishable key is set
- `createPaymentIntent()` - Placeholder for backend integration
- `createSetupIntent()` - Placeholder for backend integration

#### 2. `/src/components/AddPaymentMethodDialog.tsx`
Dialog component for adding payment methods via Stripe. Features:
- Shows error message when Stripe is not configured
- Supports credit/debit cards and Bancontact
- Gracefully handles missing API keys

#### 3. `/src/components/TopUpCreditDialog.tsx`
Dialog component for topping up wallet credit. Features:
- Preset amount buttons (€10, €25, €50, €100)
- Custom amount input
- Shows error message when Stripe is not configured
- Gracefully handles missing API keys

#### 4. `/src/pages/Wallet.tsx`
Main wallet page with Stripe integration:
- Balance display
- Payment methods list
- Transaction history
- "Opwaarderen" (Top-up) button opens TopUpCreditDialog
- "Betaalmethode toevoegen" button opens AddPaymentMethodDialog

### How It Works

1. **Configuration Check**: The app checks if `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env`
2. **Graceful Degradation**: If not configured, payment buttons show error messages instead of failing
3. **User Experience**: Users see clear messages about what needs to be configured
4. **Backend Ready**: Functions are structured to easily connect to backend APIs when ready

### Backend Integration Required

To make Stripe fully functional, you need to implement backend endpoints:

```javascript
// Example backend endpoints needed:

POST /api/payment-intent
// Create a payment intent for wallet top-up
// Input: { amount: number, currency: string }
// Output: { clientSecret: string }

POST /api/setup-intent
// Create a setup intent for adding payment methods
// Input: {}
// Output: { clientSecret: string }

POST /api/confirm-payment
// Confirm payment and update user balance
// Input: { paymentIntentId: string }
// Output: { success: boolean, balance: number }
```

## OAuth Integration

Google and Apple OAuth are already integrated via Supabase for authentication.

### Files Involved

#### 1. `/src/lib/supabase.ts`
Supabase authentication functions:
- `signInWithGoogle()` - Initiates Google OAuth flow
- `signInWithApple()` - Initiates Apple ID OAuth flow
- `signUp()` - Email/password sign up
- `signIn()` - Email/password sign in
- `signOut()` - Sign out user

#### 2. `/src/pages/Login.tsx`
Login/Register page with OAuth buttons:
- Google login button with Google logo
- Apple login button with Apple logo
- Email/password form
- Account type selection (personal/business)

### How It Works

1. **User Clicks OAuth Button**: Either "Doorgaan met Google" or "Doorgaan met Apple"
2. **Supabase Handles Flow**: The Supabase client redirects to OAuth provider
3. **Provider Authentication**: User authenticates with Google/Apple
4. **Redirect Back**: User is redirected to home page after successful authentication
5. **Session Management**: Supabase handles session persistence and refresh tokens

### OAuth Configuration

OAuth is configured through Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google and Apple providers
4. Add your OAuth credentials from:
   - Google: https://console.cloud.google.com/apis/credentials
   - Apple: https://developer.apple.com/account

The environment variables in `.env.example` are for reference, but Supabase handles the OAuth flow.

## Environment Variables

### Required Variables

```bash
# Supabase (for OAuth and database)
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key-here
```

### Optional Variables (for reference)

```bash
# These are managed through Supabase dashboard, not needed in .env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_APPLE_CLIENT_ID=your-apple-services-id-here
```

## Testing

### Test Without API Keys

The application is designed to run without API keys configured:

1. **Stripe Not Configured**:
   - Payment buttons show error messages
   - Clear instructions to add `VITE_STRIPE_PUBLISHABLE_KEY`
   - No crashes or broken functionality

2. **OAuth Working**:
   - Google/Apple login buttons are visible
   - They trigger Supabase OAuth flow
   - If Supabase credentials are missing, error messages are shown

### Test With API Keys

#### Stripe Testing

1. Get test keys from Stripe dashboard: https://dashboard.stripe.com/test/apikeys
2. Add to `.env`:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Restart dev server
4. Navigate to Wallet page
5. Click "Opwaarderen" or "Betaalmethode toevoegen"
6. Dialogs should open without errors

#### OAuth Testing

1. Configure OAuth providers in Supabase dashboard
2. Test Google login:
   - Click "Doorgaan met Google"
   - Should redirect to Google login
   - After authentication, redirects back to app
3. Test Apple login:
   - Click "Doorgaan met Apple"
   - Should redirect to Apple login
   - After authentication, redirects back to app

### Manual Testing Steps

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Add your API keys to .env
# Edit .env and add:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_PUBLISHABLE_KEY
# - VITE_STRIPE_PUBLISHABLE_KEY

# 4. Start dev server
npm run dev

# 5. Test in browser
# - Navigate to http://localhost:8080
# - Go to Login page - test OAuth buttons
# - Go to Wallet page - test payment dialogs
```

## Deployment Checklist

Before deploying to production:

- [ ] Add all environment variables to your hosting platform
- [ ] Configure OAuth redirect URLs in Google and Apple dashboards
- [ ] Configure Supabase authentication settings
- [ ] Implement backend endpoints for Stripe payment processing
- [ ] Enable Stripe webhooks for payment confirmation
- [ ] Test all payment flows in Stripe test mode
- [ ] Test OAuth flows from production domain
- [ ] Switch to production Stripe keys
- [ ] Monitor error logs and user feedback

## Support

For issues or questions:
- Stripe Documentation: https://stripe.com/docs
- Supabase Documentation: https://supabase.com/docs
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Apple Sign In: https://developer.apple.com/sign-in-with-apple/

## Security Notes

⚠️ **Important Security Practices**:

1. **Never expose secret keys**: Only use publishable keys in frontend
2. **Backend Processing**: Always process payments on the backend
3. **Validate on Server**: Never trust client-side validation for payments
4. **Use HTTPS**: Always use HTTPS in production
5. **Webhook Validation**: Verify webhook signatures from Stripe
6. **Environment Variables**: Never commit `.env` to version control
