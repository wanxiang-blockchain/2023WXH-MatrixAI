package routes

import (
	"github.com/gin-gonic/gin"
	"matrixai-backend/handlers"
)

func RegisterRoutes(engine *gin.Engine) {
	mailbox := engine.Group("/mailbox")
	{
		mailbox.POST("/subscribe", handlers.Subscribe)
		mailbox.POST("/unsubscribe", handlers.Unsubscribe)
	}
	machine := engine.Group("/machine")
	{
		machine.POST("/filter", handlers.MachineFilter)
		machine.POST("/market", handlers.MachineMarket)
		machine.POST("/mine", handlers.MachineMine)
	}
	order := engine.Group("/order")
	{
		order.POST("/mine", handlers.OrderMine)
	}
	log := engine.Group("/log")
	{
		log.POST("/add", handlers.LogAdd)
		log.POST("/list", handlers.LogList)
	}
}
