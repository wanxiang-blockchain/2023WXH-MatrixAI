package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"matrixai-backend/common"
	"matrixai-backend/model"
	"matrixai-backend/utils/resp"
)

type OrderListReq struct {
	Direction string
	Status    *uint8
	PageReq
}

type OrderListResponse struct {
	List []model.Order
	PageResp
}

func OrderMine(context *gin.Context) {
	var header HttpHearder
	err := context.ShouldBindHeader(&header)
	if err != nil {
		resp.Fail(context, "Parameter missing")
		return
	}
	var req OrderListReq
	err = context.ShouldBindBodyWith(&req, binding.JSON)
	if err != nil {
		resp.Fail(context, "Parameter missing")
		return
	}

	tx := common.Db.Model(&model.Order{})
	if req.Status != nil {
		tx.Where("status = ?", *req.Status)
	}
	if req.Direction == "buy" {
		tx.Where("buyer = ?", header.Account)
	} else if req.Direction == "sell" {
		tx.Where("seller = ?", header.Account)
	} else {
		tx.Where("buyer = ? OR seller = ?", header.Account, header.Account)
	}
	var response OrderListResponse
	dbResult := tx.Count(&response.Total)
	if dbResult.Error != nil {
		fmt.Println(dbResult.Error)
		resp.Fail(context, "Database error")
		return
	}
	dbResult = tx.Order("order_time DESC").Scopes(Paginate(context)).Find(&response.List)
	if dbResult.Error != nil {
		resp.Fail(context, "Database error")
		return
	}

	resp.Success(context, response)
}
