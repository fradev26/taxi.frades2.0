# OAuth Integration Setup Guide

This guide will help you configure Google and Apple sign-in for the FRADES taxi application.

## Prerequisites

- Supabase project with authentication enabled
- Google Cloud Console account
- Apple Developer account (for Apple Sign In)

## Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Apple OAuth Setup](#apple-oauth-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API"
   - Click **Enable**

### Step 2: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Configure the OAuth consent screen if prompted:
   - Choose **External** user type
   - Fill in the application name: "FRADES Taxi Service"
   - Add support email
   - Add authorized domains (your app domain)
   - Save and continue

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "FRADES Web Client"
   - Authorized JavaScript origins:
     - `https://your-domain.com`
     - `http://localhost:5173` (for development)
   - Authorized redirect URIs:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (for local development)

5. Click **Create** and save your:
   - Client ID
   - Client Secret

### Step 3: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Add the following scopes:
   - `email`
   - `profile`
   - `openid`
3. Add test users (during development)
4. Submit for verification (for production)

---

## Apple OAuth Setup

### Step 1: Create an App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** > **+** (Add new)
4. Select **App IDs** and continue
5. Configure:
   - Description: "FRADES Taxi Service"
   - Bundle ID: `be.frades.taxi` (or your domain in reverse)
   - Enable **Sign in with Apple** capability
   - Save

### Step 2: Create a Services ID

1. Go to **Identifiers** > **+** (Add new)
2. Select **Services IDs** and continue
3. Configure:
   - Description: "FRADES Web Service"
   - Identifier: `be.frades.taxi.web`
   - Enable **Sign in with Apple**
   - Click **Configure** next to Sign in with Apple
   
4. In the configuration modal:
   - Primary App ID: Select the App ID created in Step 1
   - Domains and Subdomains:
     - Add: `your-supabase-project.supabase.co`
     - Add: `your-domain.com`
   - Return URLs:
     - Add: `https://your-supabase-project.supabase.co/auth/v1/callback`
   - Click **Save** and **Continue**
   - Click **Register**

### Step 3: Create a Sign in with Apple Key

1. Go to **Keys** > **+** (Add new)
2. Configure:
   - Key Name: "FRADES Sign in with Apple Key"
   - Enable **Sign in with Apple**
   - Click **Configure** and select your Primary App ID
   - Click **Save** and **Continue**
3. Click **Register**
4. Download the `.p8` key file (you can only download this once!)
5. Note the Key ID (10 characters)
6. Note your Team ID (found in the top right of the Apple Developer portal)

---

## Supabase Configuration

### Step 1: Enable OAuth Providers

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**

### Step 2: Configure Google Provider

1. Find **Google** in the list of providers
2. Enable the provider
3. Add your credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
4. Add authorized redirect URLs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Click **Save**

### Step 3: Configure Apple Provider

1. Find **Apple** in the list of providers
2. Enable the provider
3. Add your credentials:
   - **Services ID**: The identifier from Step 2 of Apple setup (e.g., `be.frades.taxi.web`)
   - **Team ID**: Your Apple Team ID (10 characters)
   - **Key ID**: From the key you created
   - **Private Key**: Open the `.p8` file and paste the entire contents
4. Add authorized redirect URLs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Click **Save**

---

## Environment Variables

### Step 1: Copy the Example File

```bash
cp .env.example .env
```

### Step 2: Fill in Your Values

Edit the `.env` file with your actual credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Google OAuth (Optional - configured in Supabase)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth (Optional - configured in Supabase)
VITE_APPLE_CLIENT_ID=be.frades.taxi.web
VITE_APPLE_TEAM_ID=YOUR_TEAM_ID
VITE_APPLE_KEY_ID=YOUR_KEY_ID
VITE_APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

**Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

---

## Testing

### Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page: `http://localhost:5173/login`

3. Test each OAuth provider:
   - Click "Doorgaan met Google"
   - Click "Doorgaan met Apple"

4. Verify the login flow:
   - You should be redirected to the provider's login page
   - After authentication, you should be redirected back to the app
   - You should be logged in and see your profile

### Google Testing Tips

- During development, add test users to the OAuth consent screen
- Check the browser console for any errors
- Verify redirect URIs match exactly (including trailing slashes)

### Apple Testing Tips

- Apple Sign In requires HTTPS in production
- For local testing, use ngrok or a similar tool
- Test on Safari first (Apple's preferred browser)
- Check that the Services ID matches exactly

---

## Troubleshooting

### Common Issues

#### "redirect_uri_mismatch" Error (Google)

**Problem**: The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution**:
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add the exact URL from the error message to Authorized redirect URIs
4. Make sure there are no trailing slashes or differences in protocol (http vs https)

#### "invalid_client" Error (Apple)

**Problem**: Apple credentials are incorrect or Services ID is wrong.

**Solution**:
1. Verify your Services ID matches exactly (case-sensitive)
2. Check that the Team ID is correct (10 characters)
3. Ensure the private key is copied correctly (including BEGIN and END lines)
4. Verify the Key ID matches the key you created

#### User Not Redirected After Login

**Problem**: User stays on the provider's page after authenticating.

**Solution**:
1. Check that return URLs in Supabase match the provider configuration
2. Verify CORS settings in Supabase
3. Check browser console for JavaScript errors
4. Ensure cookies are enabled in the browser

#### "Email already registered" Error

**Problem**: User tries to sign in with OAuth but email is already used with password auth.

**Solution**:
1. This is expected behavior - emails must be unique
2. User should sign in with their original method
3. Or implement account linking (advanced feature)

### Debug Mode

To enable debug logging for OAuth:

1. Open browser DevTools
2. Go to Console tab
3. Check for messages starting with "Supabase Auth:"

### Getting Help

If you encounter issues:

1. Check Supabase logs: Dashboard > Logs > Auth logs
2. Review provider documentation:
   - [Google Sign-In](https://developers.google.com/identity/sign-in/web)
   - [Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
3. Check Supabase documentation:
   - [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
   - [Apple OAuth](https://supabase.com/docs/guides/auth/social-login/auth-apple)

---

## Security Best Practices

1. **Never commit credentials**: Always use environment variables
2. **Rotate keys regularly**: Change OAuth secrets periodically
3. **Use HTTPS in production**: OAuth requires secure connections
4. **Validate redirect URIs**: Only allow trusted domains
5. **Review OAuth scopes**: Only request necessary permissions
6. **Monitor auth logs**: Check for suspicious activity
7. **Keep dependencies updated**: Update Supabase client regularly

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Remove test users from Google OAuth consent screen
- [ ] Submit Google OAuth app for verification
- [ ] Verify all redirect URIs use production domains
- [ ] Test OAuth on production domain before launch
- [ ] Enable rate limiting in Supabase
- [ ] Set up monitoring for auth failures
- [ ] Document recovery procedures for key loss

### Domain Configuration

Update the following with your production domain:

1. Google Cloud Console:
   - Authorized JavaScript origins
   - Authorized redirect URIs

2. Apple Developer Portal:
   - Domains and Subdomains
   - Return URLs

3. Supabase Dashboard:
   - Redirect URLs (Authentication > URL Configuration)
   - Site URL

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/documentation/sign_in_with_apple)
- [OAuth 2.0 Simplified](https://www.oauth.com/)

---

## Support

For issues specific to this application, contact the development team or open an issue on GitHub.
