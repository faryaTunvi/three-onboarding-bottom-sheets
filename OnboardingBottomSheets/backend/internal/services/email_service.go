package services

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
)

// EmailService handles sending emails
type EmailService struct {
	smtpHost     string
	smtpPort     string
	smtpUsername string
	smtpPassword string
	fromEmail    string
	fromName     string
}

// NewEmailService creates a new email service
func NewEmailService() *EmailService {
	return &EmailService{
		smtpHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		smtpPort:     getEnv("SMTP_PORT", "587"),
		smtpUsername: getEnv("SMTP_USERNAME", ""),
		smtpPassword: getEnv("SMTP_PASSWORD", ""),
		fromEmail:    getEnv("FROM_EMAIL", "noreply@yourapp.com"),
		fromName:     getEnv("FROM_NAME", "Onboarding App"),
	}
}

// SendMagicLink sends a magic link email to the user
func (e *EmailService) SendMagicLink(toEmail, magicLink, token string) error {
	// Check if email is configured
	if e.smtpUsername == "" || e.smtpPassword == "" {
		fmt.Printf("⚠️  Email not configured. Magic link for %s:\n", toEmail)
		fmt.Printf("🔗 %s\n", magicLink)
		fmt.Printf("🎫 Token: %s\n", token)
		return nil // Don't fail if email isn't configured
	}

	subject := "Your Login Link"
	body := e.generateMagicLinkHTML(magicLink, token)

	return e.sendEmail(toEmail, subject, body)
}

// sendEmail sends an email via SMTP
func (e *EmailService) sendEmail(to, subject, body string) error {
	// Build email message
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", e.fromName, e.fromEmail)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// SMTP authentication
	auth := smtp.PlainAuth("", e.smtpUsername, e.smtpPassword, e.smtpHost)

	// Send email
	addr := fmt.Sprintf("%s:%s", e.smtpHost, e.smtpPort)
	err := smtp.SendMail(addr, auth, e.fromEmail, []string{to}, []byte(message))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	fmt.Printf("✅ Email sent to %s\n", to)
	return nil
}

// generateMagicLinkHTML generates the HTML email template
func (e *EmailService) generateMagicLinkHTML(magicLink, token string) string {
	tmpl := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Login Link</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
        <h1 style="color: #2A75CF; margin: 0 0 20px 0; font-size: 24px;">Welcome Back!</h1>
        <p style="margin: 0 0 20px 0; font-size: 16px;">Click the button below to sign in to your account:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{.MagicLink}}" 
               style="display: inline-block; background-color: #2A75CF; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px 0;">
                Sign In to Your Account
            </a>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #2A75CF;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #333; font-weight: 600;">
                📱 On Mobile Device:
            </p>
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
                Tap the button above to open the app directly.
            </p>
            
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #333; font-weight: 600;">
                💻 On Computer:
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                Copy this link and paste it into your mobile device's browser or messaging app:
            </p>
            <p style="margin: 0; font-size: 12px; color: #666; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                {{.MagicLink}}
            </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                <strong>⏱️ This link will expire in 15 minutes</strong>
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                🔒 This link can only be used once for security reasons
            </p>
        </div>
    </div>
    
    <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
        <p style="margin: 5px 0;">If you didn't request this email, you can safely ignore it.</p>
        <p style="margin: 5px 0;">This is an automated email, please do not reply.</p>
    </div>
</body>
</html>
`

	data := struct {
		MagicLink string
		Token     string
	}{
		MagicLink: magicLink,
		Token:     token,
	}

	t := template.Must(template.New("email").Parse(tmpl))
	var buf bytes.Buffer
	t.Execute(&buf, data)
	return buf.String()
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
