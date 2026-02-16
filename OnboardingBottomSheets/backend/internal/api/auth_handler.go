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
