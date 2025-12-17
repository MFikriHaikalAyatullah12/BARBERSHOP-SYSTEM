# Google OAuth Setup Guide for Gmail and Calendar Integration

## Overview
This guide explains how to set up Google OAuth2 authentication for Gmail and Google Calendar integration in your Booking Barber application.

## Step 1: Google Cloud Console Setup

### 1.1 Create or Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Note your project ID for reference

### 1.2 Enable Required APIs
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Gmail API** (for sending booking notifications)
   - **Google Calendar API** (for creating calendar events)

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - App name: "Booking Barber Admin"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `../auth/gmail.send` (for sending emails)
   - `../auth/calendar` (for calendar management)
5. Add test users (if in testing phase):
   - Add the admin email address that will be used

### 1.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure:
   - Name: "Booking Barber Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-domain.com/api/auth/callback/google` (for production)
5. Save and copy the Client ID and Client Secret

## Step 2: Environment Configuration

### 2.1 Development Environment
Add to your `.env` file:
```
GOOGLE_CLIENT_ID="your-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 2.2 Production Environment
Add to your production environment variables:
```
GOOGLE_CLIENT_ID="your-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## Step 3: Admin Email Setup

### 3.1 Initial Configuration
1. Start your application
2. Login as admin
3. Go to Admin Panel > Email Settings
4. Click "Connect Google Account"
5. Authorize the application with your admin Gmail account
6. The system will automatically store the OAuth tokens

### 3.2 Google Calendar Setup
1. After connecting Gmail, the system will list available calendars
2. Select the calendar where booking events should be created
3. Save the configuration

## Step 4: Testing the Integration

### 4.1 Test Email Sending
1. Create a test booking
2. Check that confirmation emails are sent to customers
3. Check that notification emails are sent to admin

### 4.2 Test Calendar Integration
1. Create a test booking
2. Check that an event is created in the selected Google Calendar
3. Verify event details (time, customer info, service details)

## Security Considerations

### 4.1 OAuth Token Security
- OAuth tokens are encrypted and stored securely in the database
- Refresh tokens allow automatic renewal of access tokens
- Admin can revoke access anytime through Google Account settings

### 4.2 Scope Limitations
- Application only requests minimal required scopes
- Gmail scope is limited to sending emails only
- Calendar scope allows event creation but not full calendar access

### 4.3 Production Security
- Use HTTPS in production for all OAuth flows
- Regularly review OAuth token usage in Google Cloud Console
- Monitor API usage and set up quotas if needed

## Troubleshooting

### Common Issues

#### "OAuth client not found" error
- Check that Client ID and Secret are correctly set in environment variables
- Ensure the OAuth client is properly configured in Google Cloud Console

#### "Invalid redirect URI" error
- Verify redirect URIs in Google Cloud Console match your application URLs
- Check that NEXTAUTH_URL is correctly set for production

#### "Access denied" error
- Ensure the admin email is added as a test user (during testing phase)
- Check that required scopes are properly configured

#### Calendar not showing events
- Verify calendar permissions in Google Calendar settings
- Check that the correct calendar ID is selected in admin settings

### API Quotas and Limits
- Gmail API: 1 billion quota units per day (sufficient for most applications)
- Calendar API: 1 million requests per day (sufficient for most applications)
- Monitor usage in Google Cloud Console if needed

## Support
For additional support:
1. Check Google Cloud Console logs
2. Review application logs for OAuth errors
3. Consult Google API documentation:
   - [Gmail API](https://developers.google.com/gmail/api)
   - [Calendar API](https://developers.google.com/calendar/api)

## Next Steps After Setup
1. Test email notifications with real bookings
2. Configure email templates (if needed)
3. Set up monitoring for email delivery
4. Configure calendar event templates
5. Train admin users on the email settings interface