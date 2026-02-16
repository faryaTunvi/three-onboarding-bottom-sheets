package main

import (
	"log"
	"os"

	"onboarding-backend/internal/api"
	"onboarding-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize services
	emailService := services.NewEmailService()
	authService := services.NewAuthService(emailService)
	feedbackService := services.NewFeedbackService()
	slackService := services.NewMockSlackService()

	// Create Gin router
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"} // In production, specify exact origins
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// Initialize API handlers
	authHandler := api.NewAuthHandler(authService)
	feedbackHandler := api.NewFeedbackHandler(feedbackService, slackService, authService)

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth routes
	authRoutes := router.Group("/api/auth")
	{
		authRoutes.POST("/request-link", authHandler.RequestMagicLink)
		authRoutes.GET("/verify", authHandler.VerifyMagicLink)
		authRoutes.POST("/refresh", authHandler.RefreshToken)
	}

	// Feedback routes (protected)
	feedbackRoutes := router.Group("/api/feedback")
	feedbackRoutes.Use(authHandler.AuthMiddleware())
	{
		feedbackRoutes.POST("/submit", feedbackHandler.SubmitFeedback)
		feedbackRoutes.GET("/list", feedbackHandler.ListFeedback)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
