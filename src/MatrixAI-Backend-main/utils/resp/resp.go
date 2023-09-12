package resp

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

const (
	SUCCESS = 1
	FAIL    = 0
	EXIST   = -1
)

type Resp struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func Success(context *gin.Context, data interface{}) {
	context.JSON(http.StatusOK, Resp{SUCCESS, "success", data})
}

func Fail(context *gin.Context, msg string) {
	context.JSON(http.StatusOK, Resp{FAIL, msg, ""})
}

func Exist(context *gin.Context, data interface{}) {
	context.JSON(http.StatusOK, Resp{EXIST, "exist", data})
}
