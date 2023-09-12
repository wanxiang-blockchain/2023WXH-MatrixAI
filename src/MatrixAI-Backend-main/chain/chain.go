package chain

import (
	"fmt"
	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v4"
	"github.com/centrifuge/go-substrate-rpc-client/v4/registry/retriever"
	"github.com/centrifuge/go-substrate-rpc-client/v4/registry/state"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/centrifuge/go-substrate-rpc-client/v4/xxhash"
	"log"
	"matrixai-backend/common"
	"matrixai-backend/model"
	"reflect"
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
	api  *gsrpc.SubstrateAPI
	meta *types.Metadata
)

func Sync() {
	var err error
	api, err = gsrpc.NewSubstrateAPI(common.Conf.Chain.Rpc)
	if err != nil {
		panic(fmt.Sprintf("Couldn't connect to '%s': %s", common.Conf.Chain.Rpc, err))
	}

	meta, err = api.RPC.State.GetMetadataLatest()
	if err != nil {
		log.Printf("GetMetadataLatest error: '%s' \n", err)
		return
	}

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

	//subEvents()
}

func subEvents() {
	eventRetriever, err := retriever.NewDefaultEventRetriever(state.NewEventProvider(api.RPC.State), api.RPC.State)
	if err != nil {
		log.Printf("Couldn't create event eventRetriever: %s", err)
		return
	}

	sub, err := api.RPC.Chain.SubscribeNewHeads()
	if err != nil {
		log.Printf("SubscribeNewHeads error: '%s' \n", err)
		return
	}
	defer sub.Unsubscribe()

	for {
		head := <-sub.Chan()
		headerNumber := uint64(head.Number)
		fmt.Printf("Chain is at block: #%v\n", headerNumber)
		blockHash, err := api.RPC.Chain.GetBlockHash(headerNumber)
		if err != nil {
			log.Printf("Couldn't retrieve blockHash for block number %d: %s\n", headerNumber, err)
			return
		}

		events, err := eventRetriever.GetEvents(blockHash)
		if err != nil {
			log.Printf("Couldn't retrieve events for block number %d: %s\n", headerNumber, err)
			return
		}

		for _, event := range events {
			log.Printf("Event ID: %x \n", event.EventID)
			log.Printf("Event Name: %s \n", event.Name)
			log.Printf("Event Fields Count: %d \n", len(event.Fields))
			for _, field := range event.Fields {
				log.Printf("Field Name: %s \n", field.Name)
				log.Printf("Field Type: %v \n", reflect.TypeOf(field.Value))
				log.Printf("Field Value: %v \n", field.Value)
			}
			switch event.Name {
			case _MachineAdded:
				owner := reflect.ValueOf(event.Fields[0]).Bytes()
				uuid := reflect.ValueOf(event.Fields[1]).Bytes()
				addMachine(owner, uuid, blockHash)
			case _MachineRemoved:

			case _OfferMade:

			case _OfferCanceled:

			case _OrderPlaced:
			case _OrderRenewed:
			case _OrderCompleted:
			case _OrderFailed:

			}
		}
	}
}

func createPrefixedKey(method, prefix string) types.StorageKey {
	return append(xxhash.New128([]byte(prefix)).Sum(nil), xxhash.New128([]byte(method)).Sum(nil)...)
}
