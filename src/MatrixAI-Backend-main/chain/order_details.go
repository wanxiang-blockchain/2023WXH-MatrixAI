package chain

import (
	"encoding/json"
	"fmt"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/vedhavyas/go-subkey/sr25519"
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
	OrderTime time.Time
}

func (od OrderDetails) toOrderModel(uuid string) model.Order {
	pubKey, err := sr25519.Scheme{}.FromPublicKey(od.Buyer.ToBytes())
	if err != nil {
		log.Printf("Decode PublicKey error: %s \n", err)
	}
	buyer := pubKey.SS58Address(42)
	pubKey, err = sr25519.Scheme{}.FromPublicKey(od.Seller.ToBytes())
	if err != nil {
		log.Printf("Decode PublicKey error: %s \n", err)
	}
	seller := pubKey.SS58Address(42)

	var mj OrderMetadataJson
	if err := json.Unmarshal(od.Metadata, &mj); err != nil {
		log.Printf("Unmarshal 'Metadata' error: %s \n", err)
	}

	return model.Order{
		Uuid:        uuid,
		Buyer:       buyer,
		Seller:      seller,
		MachineUuid: fmt.Sprintf("%#x", od.MachineId),
		Price:       od.Price.String(),
		Duration:    uint32(od.Duration),
		Total:       od.Total.String(),
		Metadata:    string(od.Metadata),
		Status:      od.Status.Value,
		OrderTime:   mj.OrderTime,
	}
}
