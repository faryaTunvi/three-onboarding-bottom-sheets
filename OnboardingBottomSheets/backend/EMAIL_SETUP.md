# Email Configuration Guide

## Overview
The backend now supports sending actual magic link emails via SMTP. Without email configuration, magic links will only be printed to the console.

## Quick Setup Options

### Option 1: Gmail (Recommended for Testing)

1. **Create an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Sign in with your Google account
   - Create a new app password for "Mail"
   - Copy the 16-character password

2. **Set Environment Variables**
   ```bash
   export SMTP_HOST=smtp.gmail.com
   export SMTP_PORT=587
   export SMTP_USERNAME=your-email@gmail.com
   export SMTP_PASSWORD=your-app-password
   export FROM_EMAIL=your-email@gmail.com
   export FROM_NAME="Onboarding App"
   ```

3. **Run the server**
   ```bash
   go run main.go
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up at https://sendgrid.com** (free tier: 100 emails/day)

2. **Create an API Key**
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the key

3. **Set Environment Variables**
   ```bash
   export SMTP_HOST=smtp.sendgrid.net
   export SMTP_PORT=587
   export SMTP_USERNAME=apikey
   export SMTP_PASSWORD=your-sendgrid-api-key
   export FROM_EMAIL=noreply@yourdomain.com
   export FROM_NAME="Your App Name"
   ```

### Option 3: Other SMTP Services

**Mailgun**
```bash
export SMTP_HOST=smtp.mailgun.org
export SMTP_PORT=587
export SMTP_USERNAME=postmaster@yourdomain.mailgun.org
export SMTP_PASSWORD=your-mailgun-password
```

**AWS SES**
```bash
export SMTP_HOST=email-smtp.us-east-1.amazonaws.com
export SMTP_PORT=587
export SMTP_USERNAME=your-aws-access-key
export SMTP_PASSWORD=your-aws-secret-key
```

## Using .env File

1. **Copy the example file**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your credentials**
   ```bash
   nano .env
   ```

3. **Load environment variables**
   ```bash
   source .env
   go run main.go
   ```

## Testing Without Email (Development Mode)

If you don't configure email settings, the backend will:
- ✅ Still generate valid magic links
- ✅ Return tokens in the API response
- ✅ Print magic links to the console
- ⚠️ NOT send actual emails

The mobile app will show the token in a development alert for testing.

## Troubleshooting

### Gmail: "Username and Password not accepted"
- Enable 2-factor authentication on your Google account
- Use an App Password instead of your regular password
- Make sure "Less secure app access" is OFF (use App Passwords instead)

### SendGrid: Emails not arriving
- Verify your sender email address in SendGrid dashboard
- Check spam folder
- Review SendGrid activity log for delivery status

### Connection timeout
- Check if your firewall is blocking port 587
- Try port 465 (SSL) instead of 587 (TLS)
- Verify SMTP host is correct

## Email Template

The magic link email includes:
- ✅ Branded HTML design
- ✅ Clear call-to-action button
- ✅ Plaintext link fallback
- ✅ 15-minute expiration warning
- ✅ Security notice
- ✅ Mobile-responsive design

## Production Recommendations

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES)
2. **Verify your domain** to improve deliverability
3. **Set up SPF and DKIM** records
4. **Monitor bounce and complaint rates**
5. **Keep FROM_EMAIL consistent** to build sender reputation
6. **Don't use Gmail for production** (rate limits and deliverability issues)

## Security Notes

- Never commit `.env` file or credentials to git
- Use environment variables in production
- Rotate SMTP passwords regularly
- Monitor for unusual sending patterns
