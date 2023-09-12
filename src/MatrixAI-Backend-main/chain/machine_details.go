package chain

import (
	"encoding/json"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"log"
	"matrixai-backend/model"
)

type MachineDetails struct {
	Metadata       types.Bytes
	Status         MachineStatus
	Price          types.U128
	MaxDuration    types.U32
	Disk           types.U32
	CompletedCount types.U32
	FailedCount    types.U32
	Score          types.U32
}

type MetadataJson struct {
	GPUInfo      GPUInfo
	LocationInfo LocationInfo
}

type GPUInfo struct {
	Model  string
	Number uint32
}

type LocationInfo struct {
	Country string
}

func (md MachineDetails) toMachineModel(owner, uuid string) model.Machine {
	var mj MetadataJson
	if err := json.Unmarshal(md.Metadata, &mj); err != nil {
		log.Printf("Unmarshal 'Metadata' error: %s \n", err)
	}

	return model.Machine{
		Owner:          owner,
		Uuid:           uuid,
		Metadata:       string(md.Metadata),
		Status:         md.Status.Value,
		Price:          md.Price.String(),
		MaxDuration:    uint32(md.MaxDuration),
		Disk:           uint32(md.Disk),
		CompletedCount: uint32(md.CompletedCount),
		FailedCount:    uint32(md.FailedCount),
		Score:          uint32(md.Score),
		Gpu:            mj.GPUInfo.Model,
		GpuCount:       mj.GPUInfo.Number,
		Region:         mj.LocationInfo.Country,
	}
}
