#!/bin/bash

# Deploy Stripe Edge Functions to Supabase
# Make sure you have the Supabase CLI installed: npm install -g supabase

echo "🚀 Deploying Stripe Edge Functions to Supabase..."

# Deploy all Edge Functions
echo "📦 Deploying create-payment-intent..."
supabase functions deploy create-payment-intent

echo "📦 Deploying create-setup-intent..."
supabase functions deploy create-setup-intent

echo "📦 Deploying payment-methods..."
supabase functions deploy payment-methods

echo "📦 Deploying process-booking-payment..."
supabase functions deploy process-booking-payment

echo "📦 Deploying stripe-webhook..."
supabase functions deploy stripe-webhook

echo "✅ All Edge Functions deployed successfully!"

echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in Supabase Dashboard:"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "2. Run database migrations:"
echo "   supabase db push"
echo ""
echo "3. Configure Stripe webhook endpoint:"
echo "   https://your-project-ref.supabase.co/functions/v1/stripe-webhook"
echo ""
echo "4. Test the integration with Stripe test cards"