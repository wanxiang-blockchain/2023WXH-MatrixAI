package main

import (
	"github.com/gin-gonic/gin"
	"matrixai-backend/chain"
	"matrixai-backend/common"
	"matrixai-backend/middleware"
	"matrixai-backend/routes"
)

func main() {
	common.InitConfig()
	common.InitDatabase()
	chain.Sync()

	gin.SetMode(common.Conf.Server.Mode)
	router := gin.Default()
	router.Use(middleware.Cors())
	routes.RegisterRoutes(router)
	if err := router.Run(":" + common.Conf.Server.Port); err != nil {
		panic(err)
	}
}
