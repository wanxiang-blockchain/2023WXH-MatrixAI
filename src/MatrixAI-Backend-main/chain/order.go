package chain

import (
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types/codec"
	"log"
	"matrixai-backend/common"
	"matrixai-backend/model"
)

func fetchAllOrder(headerHash types.Hash) {
	prefixedKey := createPrefixedKey(_ORDER, _HASHRATE_MARKET)
	keys, err := api.RPC.State.GetKeys(prefixedKey, headerHash)
	if err != nil {
		log.Printf("GetKeys error: %s \n", err)
		return
	}

	set, err := api.RPC.State.QueryStorageAt(keys, headerHash)
	if err != nil {
		log.Printf("QueryStorage error: %s \n", err)
		return
	}

	var orders []model.Order
	for _, elem := range set {
		for _, change := range elem.Changes {
			uuid := change.StorageKey[48:].Hex()

			var od OrderDetails
			if err := codec.Decode(change.StorageData, &od); err != nil {
				log.Printf("Decode 'OrderDetails' error: %s \n", err)
				continue
			}

			order := od.toOrderModel(uuid)
			orders = append(orders, order)
		}
	}

	if len(orders) > 0 {
		if dbResult := common.Db.Create(&orders); dbResult.Error != nil {
			log.Printf("Database error: %s \n", dbResult.Error)
		}
	}
}
