package chain

import (
	"fmt"
	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v4"
	"github.com/centrifuge/go-substrate-rpc-client/v4/registry"
	"github.com/centrifuge/go-substrate-rpc-client/v4/registry/retriever"
	"github.com/centrifuge/go-substrate-rpc-client/v4/registry/state"
	"github.com/centrifuge/go-substrate-rpc-client/v4/rpc/chain"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/centrifuge/go-substrate-rpc-client/v4/xxhash"
	"github.com/vedhavyas/go-subkey/sr25519"
	"log"
	"matrixai-backend/common"
	"matrixai-backend/model"
	"strings"
)

const (
	// Pallet
	_HASHRATE_MARKET = "HashrateMarket"
	// Chain state
	_MACHINE = "Machine"
	_ORDER   = "Order"
	// Event
	_MachineAdded   = "HashrateMarket.MachineAdded"
	_MachineRemoved = "HashrateMarket.MachineRemoved"
	_OfferMade      = "HashrateMarket.OfferMade"
	_OfferCanceled  = "HashrateMarket.OfferCanceled"
	_OrderPlaced    = "HashrateMarket.OrderPlaced"
	_OrderRenewed   = "HashrateMarket.OrderRenewed"
	_OrderCompleted = "HashrateMarket.OrderCompleted"
	_OrderFailed    = "HashrateMarket.OrderFailed"
)

var (
	api            *gsrpc.SubstrateAPI
	meta           *types.Metadata
	sub            *chain.NewHeadsSubscription
	eventRetriever retriever.EventRetriever
)

func newSubstrateAPI() {
	var err error
	api, err = gsrpc.NewSubstrateAPI(common.Conf.Chain.Rpc)
	if err != nil {
		panic(fmt.Sprintf("Couldn't connect to '%s': %s", common.Conf.Chain.Rpc, err))
	}

	meta, err = api.RPC.State.GetMetadataLatest()
	if err != nil {
		log.Printf("GetMetadataLatest error: '%s' \n", err)
	}

	eventRetriever, err = retriever.NewDefaultEventRetriever(state.NewEventProvider(api.RPC.State), api.RPC.State)
	if err != nil {
		log.Printf("Couldn't create event eventRetriever: %s", err)
	}
}

func subscribeNewHeads() {
	var err error
	sub, err = api.RPC.Chain.SubscribeNewHeads()
	if err != nil {
		log.Printf("SubscribeNewHeads error: '%s' \n", err)
		return
	}
}

func Sync() {
	newSubstrateAPI()

	header, err := api.RPC.Chain.GetHeaderLatest()
	if err != nil {
		log.Printf("Couldn't get latest header: %s\n", err)
		return
	}
	headerNumber := uint64(header.Number)
	headerHash, err := api.RPC.Chain.GetBlockHash(headerNumber)
	if err != nil {
		log.Printf("Couldn't get latest header: %s\n", err)
		return
	}

	fetchAllMachine(headerHash)
	fetchAllOrder(headerHash)

	sync := model.Sync{BlockNumber: headerNumber}
	if dbResult := common.Db.Create(&sync); dbResult.Error != nil {
		log.Printf("Database error: %s \n", dbResult.Error)
	}

	go subEvents()
}

func subEvents() {
	subscribeNewHeads()
	defer sub.Unsubscribe()

	for {
		select {
		case head := <-sub.Chan():
			headerNumber := uint64(head.Number)
			log.Printf("Chain is at block: #%v\n", headerNumber)
			blockHash, err := api.RPC.Chain.GetBlockHash(headerNumber)
			if err != nil {
				log.Printf("Couldn't retrieve blockHash for block number %d: %s\n", headerNumber, err)
				continue
			}

			events, err := eventRetriever.GetEvents(blockHash)
			if err != nil {
				log.Printf("Couldn't retrieve events for block number %d: %s\n", headerNumber, err)
				continue
			}

			for _, event := range events {
				if strings.HasPrefix(event.Name, _HASHRATE_MARKET) {
					log.Printf("Event ID: %x \n", event.EventID)
					log.Printf("Event Name: %s \n", event.Name)
				}
				switch event.Name {
				case _MachineAdded:
					owner := decodeValueInEvent(event.Fields[0].Value.(registry.DecodedFields)[0])
					uuid := decodeValueInEvent(event.Fields[1])
					addMachine(owner, uuid, blockHash)
				case _MachineRemoved:
					owner := decodeValueInEvent(event.Fields[0].Value.(registry.DecodedFields)[0])
					uuid := decodeValueInEvent(event.Fields[1])
					removeMachine(owner, uuid)
				case _OfferMade, _OfferCanceled:
					owner := decodeValueInEvent(event.Fields[0].Value.(registry.DecodedFields)[0])
					uuid := decodeValueInEvent(event.Fields[1])
					updateMachine(owner, uuid, blockHash)
				case _OrderPlaced:
					orderUuid := decodeValueInEvent(event.Fields[0])
					seller := decodeValueInEvent(event.Fields[2].Value.(registry.DecodedFields)[0])
					machineUuid := decodeValueInEvent(event.Fields[3])
					updateMachine(seller, machineUuid, blockHash)
					addOrder(orderUuid, blockHash)
				case _OrderRenewed:
					orderUuid := decodeValueInEvent(event.Fields[0])
					updateOrder(orderUuid, blockHash)
				case _OrderCompleted, _OrderFailed:
					orderUuid := decodeValueInEvent(event.Fields[0])
					seller := decodeValueInEvent(event.Fields[2].Value.(registry.DecodedFields)[0])
					machineUuid := decodeValueInEvent(event.Fields[3])
					updateMachine(seller, machineUuid, blockHash)
					updateOrder(orderUuid, blockHash)
				}
			}

			sync := model.Sync{Id: 1, BlockNumber: headerNumber}
			if dbResult := common.Db.Updates(&sync); dbResult.Error != nil {
				log.Printf("Database error: %s \n", dbResult.Error)
			}
		case err := <-sub.Err():
			log.Printf("SubscribeNewHeads error: %v \n", err)
			newSubstrateAPI()
			subscribeNewHeads()
		}
	}
}

func createPrefixedKey(method, prefix string) types.StorageKey {
	return append(xxhash.New128([]byte(prefix)).Sum(nil), xxhash.New128([]byte(method)).Sum(nil)...)
}

func formatSS58Address(bytes []byte) string {
	pubKey, err := sr25519.Scheme{}.FromPublicKey(bytes)
	if err != nil {
		log.Printf("Decode PublicKey error: %s \n", err)
		return ""
	}
	return pubKey.SS58Address(42)
}

func decodeValueInEvent(field *registry.DecodedField) []byte {
	var bytes []byte
	value1 := field.Value.([]any)
	for _, elem := range value1 {
		e := elem.(types.U8)
		bytes = append(bytes, byte(e))
	}
	return bytes
}
