package chain

import (
	"encoding/json"
	"fmt"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"log"
	"matrixai-backend/model"
	"time"
)

type OrderDetails struct {
	Buyer     types.AccountID
	Seller    types.AccountID
	MachineId types.Bytes16
	Price     types.U128
	Duration  types.U32
	Total     types.U128
	Metadata  types.Bytes
	Status    OrderStatus
}

type OrderMetadataJson struct {
	FormData `json:"formData"`
}

type FormData struct {
	OrderTime time.Time `json:"orderTime"`
}

func (od OrderDetails) toOrderModel(uuid string) model.Order {
	var mj OrderMetadataJson
	if err := json.Unmarshal(od.Metadata, &mj); err != nil {
		log.Printf("Unmarshal 'Metadata' error: %s \n", err)
	}

	return model.Order{
		Uuid:        uuid,
		Buyer:       formatSS58Address(od.Buyer.ToBytes()),
		Seller:      formatSS58Address(od.Seller.ToBytes()),
		MachineUuid: fmt.Sprintf("%#x", od.MachineId),
		Price:       od.Price.String(),
		Duration:    uint32(od.Duration),
		Total:       od.Total.String(),
		Metadata:    string(od.Metadata),
		Status:      od.Status.Value,
		OrderTime:   mj.FormData.OrderTime,
	}
}
