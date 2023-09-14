package chain

import (
	"fmt"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types/codec"
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
			owner := formatSS58Address(change.StorageKey[48:80])
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
		machine := md.toMachineModel(formatSS58Address(owner), fmt.Sprintf("%#x", uuid))
		if dbResult := common.Db.Create(&machine); dbResult.Error != nil {
			log.Printf("Database error: %s \n", dbResult.Error)
		}
	}
}

func removeMachine(owner, uuid []byte) {
	dbResult := common.Db.
		Where("owner = ?", formatSS58Address(owner)).
		Where("uuid = ?", fmt.Sprintf("%#x", uuid)).
		Delete(&model.Machine{})
	if dbResult.Error != nil {
		log.Printf("Database error: %s \n", dbResult.Error)
	}
}

func updateMachine(owner, uuid []byte, blockHash types.Hash) {
	key, err := types.CreateStorageKey(meta, _HASHRATE_MARKET, _MACHINE, owner, uuid)
	if err != nil {
		return
	}
	var md MachineDetails
	ok, err := api.RPC.State.GetStorage(key, &md, blockHash)
	if ok {
		ownerStr := formatSS58Address(owner)
		uuidStr := fmt.Sprintf("%#x", uuid)
		var machine model.Machine
		dbResult := common.Db.
			Where("owner = ?", ownerStr).
			Where("uuid = ?", uuidStr).
			Take(&machine)
		if dbResult.Error != nil {
			log.Printf("Database error: %s \n", dbResult.Error)
			return
		}

		updateMachine := md.toMachineModel(ownerStr, uuidStr)
		updateMachine.Id = machine.Id
		dbResult = common.Db.Save(&updateMachine)
		if dbResult.Error != nil {
			log.Printf("Database error: %s \n", dbResult.Error)
		}
	}
}
