# API Keys & Configuration Documentation

## 🔐 **API Keys Management System**

This document provides comprehensive documentation for all API keys and configuration needed for the FRADES taxi application.

## 📁 **Quick Setup**

1. Copy `.env.example` to `.env`
2. Fill in your actual API keys
3. Never commit `.env` files to version control
4. Use the API Key Validator to verify configurations

## 🔑 **API Keys Categories**

### **1. Core Database & Authentication**

#### Supabase
- **Purpose**: Backend database, authentication, real-time subscriptions
- **Required Keys**:
  - `VITE_SUPABASE_URL`: Your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY`: Public anon key for client-side operations
  - `SUPABASE_SERVICE_ROLE_KEY`: Admin key for server-side operations
- **Documentation**: [Supabase API Keys](https://supabase.com/docs/guides/api#api-keys)
- **Security Level**: 🔴 Critical

### **2. Payment Processing**

#### Stripe
- **Purpose**: Credit card processing, subscriptions
- **Required Keys**:
  - `VITE_STRIPE_PUBLISHABLE_KEY`: Client-side key for Stripe Elements
  - `STRIPE_SECRET_KEY`: Server-side key for payment processing
  - `STRIPE_WEBHOOK_SECRET`: Webhook signature verification
- **Test Mode**: Use `pk_test_` and `sk_test_` prefixed keys
- **Documentation**: [Stripe API Keys](https://stripe.com/docs/keys)
- **Security Level**: 🔴 Critical

#### Mollie (Belgium Payment Processor)
- **Purpose**: iDEAL, Bancontact, and other European payment methods
- **Required Keys**:
  - `VITE_MOLLIE_PROFILE_ID`: Profile ID for payment processing
  - `MOLLIE_API_KEY`: Server-side API key
- **Documentation**: [Mollie API](https://docs.mollie.com/overview/authentication)
- **Security Level**: 🔴 Critical

### **3. Mapping & Location Services**

#### Google Maps Platform
- **Purpose**: Maps display, geocoding, directions, places autocomplete
- **Required Keys**:
  - `VITE_GOOGLE_MAPS_API_KEY`: Client-side maps rendering
  - `GOOGLE_PLACES_API_KEY`: Places API for address autocomplete
  - `GOOGLE_DIRECTIONS_API_KEY`: Route calculation and navigation
- **APIs to Enable**:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API
  - Distance Matrix API
- **Documentation**: [Google Maps Platform](https://developers.google.com/maps/documentation)
- **Security Level**: 🟡 High

#### Mapbox (Alternative)
- **Purpose**: Alternative mapping solution
- **Required Keys**:
  - `VITE_MAPBOX_ACCESS_TOKEN`: Access token for Mapbox services
- **Documentation**: [Mapbox API](https://docs.mapbox.com/api/)
- **Security Level**: 🟡 High

### **4. Communication Services**

#### Twilio SMS
- **Purpose**: SMS notifications, booking confirmations, driver updates
- **Required Keys**:
  - `TWILIO_ACCOUNT_SID`: Account identifier
  - `TWILIO_AUTH_TOKEN`: Authentication token
  - `TWILIO_PHONE_NUMBER`: Sender phone number
- **Documentation**: [Twilio SMS API](https://www.twilio.com/docs/sms)
- **Security Level**: 🟡 High

#### SendGrid Email
- **Purpose**: Email notifications, receipts, marketing emails
- **Required Keys**:
  - `SENDGRID_API_KEY`: API key for email sending
  - `SENDGRID_FROM_EMAIL`: Verified sender email
- **Documentation**: [SendGrid API](https://docs.sendgrid.com/)
- **Security Level**: 🟡 High

### **5. Push Notifications**

#### Firebase Cloud Messaging
- **Purpose**: Push notifications to mobile apps and web browsers
- **Required Keys**:
  - `VITE_FIREBASE_API_KEY`: Client-side Firebase config
  - `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
  - `VITE_FIREBASE_PROJECT_ID`: Firebase project identifier
  - `VITE_FIREBASE_STORAGE_BUCKET`: Storage bucket name
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`: FCM sender ID
  - `VITE_FIREBASE_APP_ID`: Firebase app identifier
  - `FIREBASE_ADMIN_SDK_KEY`: Server-side admin SDK key
- **Documentation**: [Firebase Setup](https://firebase.google.com/docs/web/setup)
- **Security Level**: 🟡 High

### **6. Analytics & Monitoring**

#### Google Analytics 4
- **Purpose**: Website analytics, user behavior tracking
- **Required Keys**:
  - `VITE_GA_MEASUREMENT_ID`: GA4 measurement ID
- **Documentation**: [GA4 Setup](https://developers.google.com/analytics/devguides/collection/ga4)
- **Security Level**: 🟢 Medium

#### Sentry Error Tracking
- **Purpose**: Error monitoring, performance tracking
- **Required Keys**:
  - `VITE_SENTRY_DSN`: Client-side error reporting
  - `SENTRY_AUTH_TOKEN`: Release management token
- **Documentation**: [Sentry Configuration](https://docs.sentry.io/platforms/javascript/)
- **Security Level**: 🟢 Medium

### **7. Fleet Management & Tracking**

#### GPS Tracking Service
- **Purpose**: Real-time vehicle location tracking
- **Required Keys**:
  - `GPS_TRACKER_API_KEY`: GPS device communication
  - `FLEET_MANAGEMENT_API_KEY`: Fleet management integration
- **Security Level**: 🟡 High

### **8. File Storage & CDN**

#### AWS S3
- **Purpose**: File storage for receipts, documents, profile images
- **Required Keys**:
  - `AWS_ACCESS_KEY_ID`: AWS access key
  - `AWS_SECRET_ACCESS_KEY`: AWS secret key
  - `AWS_REGION`: AWS region (e.g., eu-west-1)
  - `AWS_S3_BUCKET`: S3 bucket name
- **Documentation**: [AWS S3 API](https://docs.aws.amazon.com/s3/)
- **Security Level**: 🟡 High

## 🔧 **Environment Configuration**

### **Development Environment**
```bash
NODE_ENV=development
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8080
```

### **Production Environment**
```bash
NODE_ENV=production
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.frades.be
```

## 🚀 **Getting Started**

### **Phase 1: Essential Keys (Minimum Viable Product)**
1. Supabase (Database & Auth)
2. Google Maps (Basic mapping)
3. Stripe (Payments)

### **Phase 2: Enhanced Features**
1. Twilio (SMS notifications)
2. SendGrid (Email)
3. Firebase (Push notifications)

### **Phase 3: Advanced Features**
1. Analytics (Google Analytics)
2. Error tracking (Sentry)
3. GPS tracking
4. File storage (AWS S3)

## 🛡️ **Security Best Practices**

### **Environment Variables**
- Never commit `.env` files
- Use different keys for development/production
- Rotate keys regularly
- Use minimum required permissions

### **Key Management**
- Store production keys in secure vault
- Use environment-specific configurations
- Implement key rotation schedules
- Monitor key usage and access

### **Client-Side Keys**
- Only expose necessary client-side keys
- Use domain restrictions where possible
- Implement rate limiting
- Monitor for suspicious usage

## 📊 **API Key Validation**

The system includes an API Key Validator component that:
- Tests connectivity to each service
- Validates key permissions
- Reports configuration issues
- Provides setup guidance

## 🔄 **Integration Status**

| Service | Status | Priority | Implementation |
|---------|--------|----------|----------------|
| Supabase | ✅ Active | Critical | Complete |
| Google Maps | 🟡 Partial | High | Needs API key |
| Stripe | 🔴 Missing | Critical | Needs setup |
| Twilio | 🔴 Missing | Medium | Future phase |
| SendGrid | 🔴 Missing | Medium | Future phase |
| Firebase | 🔴 Missing | Low | Future phase |

## 📞 **Support & Troubleshooting**

### **Common Issues**
1. **Invalid API Key**: Check key format and permissions
2. **CORS Errors**: Verify domain restrictions
3. **Rate Limits**: Implement proper throttling
4. **SSL Errors**: Ensure HTTPS in production

### **Getting Help**
- Check service-specific documentation
- Use the built-in API validator
- Review error logs in monitoring tools
- Contact service support teams

## 📝 **Change Log**

All API key changes and rotations should be documented with:
- Date of change
- Reason for change
- Services affected
- Rollback procedures

---

**Last Updated**: October 1, 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team