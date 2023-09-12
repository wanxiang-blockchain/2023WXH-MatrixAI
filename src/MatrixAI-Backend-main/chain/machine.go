package chain

import (
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types/codec"
	"github.com/vedhavyas/go-subkey/sr25519"
	"log"
	"matrixai-backend/common"
	"matrixai-backend/model"
)

func fetchAllMachine(headerHash types.Hash) {
	prefixedKey := createPrefixedKey(_MACHINE, _HASHRATE_MARKET)
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

	var machines []model.Machine
	for _, elem := range set {
		for _, change := range elem.Changes {
			pubKey, err := sr25519.Scheme{}.FromPublicKey(change.StorageKey[48:80])
			if err != nil {
				log.Printf("Decode PublicKey error: %s \n", err)
				continue
			}
			owner := pubKey.SS58Address(42)
			uuid := change.StorageKey[96:].Hex()

			var md MachineDetails
			if err := codec.Decode(change.StorageData, &md); err != nil {
				log.Printf("Decode 'MachineDetails' error: %s \n", err)
				continue
			}

			machine := md.toMachineModel(owner, uuid)
			machines = append(machines, machine)
		}
	}

	if len(machines) > 0 {
		if dbResult := common.Db.Create(&machines); dbResult.Error != nil {
			log.Printf("Database error: %s \n", dbResult.Error)
		}
	}
}

func addMachine(owner, uuid []byte, blockHash types.Hash) {
	key, err := types.CreateStorageKey(meta, _HASHRATE_MARKET, _MACHINE, owner, uuid)
	if err != nil {
		return
	}
	var md MachineDetails
	ok, err := api.RPC.State.GetStorage(key, &md, blockHash)
	if ok {
		log.Println(md)
	}

	//machine := model.Machine{}
	//common.Db.UpdateColumns(&machine)
}
