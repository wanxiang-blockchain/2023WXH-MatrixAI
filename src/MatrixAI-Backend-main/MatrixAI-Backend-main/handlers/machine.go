package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"matrixai-backend/chain"
	"matrixai-backend/common"
	"matrixai-backend/model"
	"matrixai-backend/utils/resp"
)

type MachineFilterResponse struct {
	Gpu      []string
	GpuCount []uint32
	Region   []string
}

func MachineFilter(context *gin.Context) {
	var response MachineFilterResponse
	dbResult := common.Db.Model(&model.Machine{}).Select("gpu").Group("gpu").Find(&response.Gpu)
	if dbResult.Error != nil {
		resp.Fail(context, "Database error")
		return
	}
	dbResult = common.Db.Model(&model.Machine{}).Select("gpu_count").Group("gpu_count").Find(&response.GpuCount)
	if dbResult.Error != nil {
		resp.Fail(context, "Database error")
		return
	}
	dbResult = common.Db.Model(&model.Machine{}).Select("region").Group("region").Find(&response.Region)
	if dbResult.Error != nil {
		resp.Fail(context, "Database error")
		return
	}

	resp.Success(context, response)
}

type MachineListReq struct {
	Gpu      string
	GpuCount uint32
	Region   string
	OrderBy  string
	PageReq
}

type MachineListResponse struct {
	List []model.Machine
	PageResp
}

func MachineMarket(context *gin.Context) {
	var req MachineListReq
	err := context.ShouldBindBodyWith(&req, binding.JSON)
	if err != nil {
		resp.Fail(context, "Parameter missing")
		return
	}

	machine := &model.Machine{Status: chain.FOR_RENT, Gpu: req.Gpu, GpuCount: req.GpuCount, Region: req.Region}
	var response MachineListResponse
	tx := common.Db.Model(&machine).Where(&machine)
	dbResult := tx.Count(&response.Total)
	if dbResult.Error != nil {
		resp.Fail(context, "Database error")
		return
	}

	switch req.OrderBy {
	case "price", "price DESC", "score DESC", "tflops DESC":
		tx.Order(req.OrderBy)
	case "reliability":
		tx.Order("`completed_count`/(`completed_count` + `failed_count`) DESC")
	}
	dbResult = tx.Scopes(Paginate(context)).Find(&response.List)
	if dbResult.Error != nil {
		resp.Fail(context, "Database error")
		return
	}

	resp.Success(context, response)
}

func MachineMine(context *gin.Context) {
	var header HttpHearder
	err := context.ShouldBindHeader(&header)
	if err != nil {
		resp.Fail(context, "Parameter missing")
		return
	}

	machine := &model.Machine{Owner: header.Account}
	var response MachineListResponse
	tx := common.Db.Model(&machine).Where(&machine)
	dbResult := tx.Count(&response.Total)
	if dbResult.Error != nil {
		resp.Fail(context, "Database error")
		return
	}
	dbResult = tx.Scopes(Paginate(context)).Find(&response.List)
	if dbResult.Error != nil {
		resp.Fail(context, "Database error")
		return
	}

	resp.Success(context, response)
}
