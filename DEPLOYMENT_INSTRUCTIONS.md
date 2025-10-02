# 🚀 Supabase Edge Functions Deployment Guide

## ⚠️ Deployment Status
De Edge Functions zijn klaar voor deployment, maar vereisen **handmatige authenticatie** met je Supabase account.

## 📋 Deployment Instructies

### 1. Login naar Supabase
```bash
cd /workspaces/taxi.frades2.0
supabase login
```
- Er opent een browser venster
- Log in met je Supabase account
- Kopieer de access token terug naar de terminal

### 2. Link je Project
```bash
supabase link --project-ref vydfhhkqymwtmfjabwjc
```

### 3. Deploy alle Edge Functions
```bash
# Deploy alle functions in één keer
./deploy-stripe-functions.sh

# Of deploy individueel:
supabase functions deploy create-payment-intent
supabase functions deploy create-setup-intent  
supabase functions deploy payment-methods
supabase functions deploy process-booking-payment
supabase functions deploy stripe-webhook
```

### 4. Run Database Migration
```bash
supabase db push
```

## 🔧 Environment Variables Configureren

Na deployment, ga naar je **Supabase Dashboard > Settings > Edge Functions** en voeg toe:

```env
STRIPE_SECRET_KEY=sk_live_...  # Of sk_test_... voor testing
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🎯 Stripe Webhook Configureren

1. Ga naar **Stripe Dashboard > Webhooks**
2. Voeg endpoint toe: `https://vydfhhkqymwtmfjabwjc.supabase.co/functions/v1/stripe-webhook`
3. Selecteer events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed` 
   - `setup_intent.succeeded`
   - `payment_method.attached`
4. Kopieer webhook secret naar environment variables

## ✅ Edge Functions Overzicht

**Alle functies zijn geïmplementeerd en klaar voor deployment:**

### 1. create-payment-intent
- **Endpoint**: `/functions/v1/create-payment-intent`
- **Functie**: Credit opwaarderingen via Stripe
- **Status**: ✅ Klaar

### 2. create-setup-intent  
- **Endpoint**: `/functions/v1/create-setup-intent`
- **Functie**: Payment methods opslaan
- **Status**: ✅ Klaar

### 3. payment-methods
- **Endpoint**: `/functions/v1/payment-methods`
- **Functie**: GET/DELETE payment methods
- **Status**: ✅ Klaar

### 4. process-booking-payment
- **Endpoint**: `/functions/v1/process-booking-payment`
- **Functie**: Booking betalingen verwerken
- **Status**: ✅ Klaar

### 5. stripe-webhook
- **Endpoint**: `/functions/v1/stripe-webhook`
- **Functie**: Stripe webhook events verwerken
- **Status**: ✅ Klaar

## 🗄️ Database Schema
- **Migration**: `20251002104500_add_stripe_payment_integration.sql`
- **Tabellen**: `profiles`, `transactions`, `bookings` updates
- **RLS**: Proper security policies geconfigureerd

## 🧪 Testing na Deployment

1. **Test Stripe Test Cards**:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`

2. **Test Credit Top-up**:
   - Ga naar `/wallet`
   - Klik "Opwaarderen"
   - Gebruik test card

3. **Test Payment Methods**:
   - Ga naar `/wallet`
   - Klik "Betaalmethode toevoegen"
   - Voer test card gegevens in

## 🎯 Na Deployment

**Je Stripe integratie is dan volledig functioneel:**
- ✅ Credit top-ups werken
- ✅ Payment methods opslaan werkt  
- ✅ Booking betalingen werken
- ✅ Webhook confirmatie werkt
- ✅ Social login werkt al

**Run de deployment commands hierboven om live te gaan!** 🚀