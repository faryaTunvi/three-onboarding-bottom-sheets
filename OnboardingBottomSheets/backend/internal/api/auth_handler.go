package api

import (
	"fmt"
	"net/http"
	"strings"

	"onboarding-backend/internal/models"
	"onboarding-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// RequestMagicLink handles magic link generation
func (h *AuthHandler) RequestMagicLink(c *gin.Context) {
	var req models.RequestMagicLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
		return
	}

	token, err := h.authService.GenerateMagicLink(req.Email)
	if err != nil {
		if err == services.ErrRateLimitExceeded {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests. Please try again later."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate magic link"})
		return
	}

	// In production, send email with the link
	// For now, return the token for testing
	// Format: yourapp://auth/verify?token=TOKEN
	magicLink := fmt.Sprintf("onboardingapp://auth/verify?token=%s", token)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Magic link sent to your email",
		"magic_link": magicLink, // Remove this in production
		"token":      token,     // Remove this in production
	})
}

// VerifyMagicLink handles magic link verification
func (h *AuthHandler) VerifyMagicLink(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	authResponse, err := h.authService.VerifyMagicLink(token)
	if err != nil {
		if err == services.ErrTokenAlreadyUsed {
			c.JSON(http.StatusBadRequest, gin.H{"error": "This link has already been used"})
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired link"})
		return
	}

	c.JSON(http.StatusOK, authResponse)
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	userID, email, err := h.authService.ValidateJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Generate new token
	newToken, err := h.authService.GenerateJWT(userID, email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   newToken,
		"user_id": userID,
		"email":   email,
	})
}

// VerifyMagicLinkWeb handles web-based magic link verification (for email clicks)
func (h *AuthHandler) VerifyMagicLinkWeb(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.HTML(http.StatusBadRequest, "", gin.H{})
		c.Writer.WriteString(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invalid Link</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 20px; text-align: center;">
    <h1 style="color: #d32f2f;">Invalid Link</h1>
    <p>This link is invalid. Please request a new magic link.</p>
</body>
</html>
		`)
		return
	}

	// Generate the deep link URL
	deepLink := fmt.Sprintf("onboardingapp://auth/verify?token=%s", token)

	// Return HTML that redirects to the deep link
	c.Writer.Header().Set("Content-Type", "text/html; charset=utf-8")
	c.Writer.WriteHeader(http.StatusOK)
	c.Writer.WriteString(fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opening App...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 40px 20px;
            text-align: center;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2A75CF;
            margin-bottom: 20px;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #2A75CF;
            border-radius: 50%%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0%% { transform: rotate(0deg); }
            100%% { transform: rotate(360deg); }
        }
        .button {
            display: inline-block;
            background-color: #2A75CF;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .help-text {
            color: #666;
            font-size: 14px;
            margin-top: 30px;
        }
        .deep-link {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Opening Onboarding App...</h1>
        <div class="spinner"></div>
        <p>If the app doesn't open automatically, click the button below:</p>
        <a href="%s" class="button">Open App</a>
        
        <div class="help-text">
            <p><strong>On Mobile:</strong> The app should open automatically or after clicking the button.</p>
            <p><strong>On Desktop:</strong> Copy the link below and open it on your mobile device:</p>
            <div class="deep-link">%s</div>
        </div>
    </div>
    
    <script>
        // Attempt to redirect immediately
        window.location.href = '%s';
        
        // Also try using setTimeout as a fallback
        setTimeout(function() {
            window.location.href = '%s';
        }, 500);
    </script>
</body>
</html>
	`, deepLink, deepLink, deepLink, deepLink))
}

// AuthMiddleware validates JWT tokens
func (h *AuthHandler) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		userID, email, err := h.authService.ValidateJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", userID)
		c.Set("email", email)
		c.Next()
	}
}
