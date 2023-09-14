package cmd

import (
	"MatrixAI-Client/chain"
	"MatrixAI-Client/chain/pallets"
	"MatrixAI-Client/docker"
	"MatrixAI-Client/machine_info/disk"
	"MatrixAI-Client/machine_info/machine_uuid"
	"encoding/json"

	"MatrixAI-Client/chain/subscribe"
	"MatrixAI-Client/config"
	"MatrixAI-Client/logs"
	"MatrixAI-Client/machine_info"
	"MatrixAI-Client/pattern"
	"MatrixAI-Client/utils"
	"fmt"

	"os"

	"github.com/centrifuge/go-substrate-rpc-client/v4/types/codec"

	"github.com/urfave/cli"

	"time"
)

var ClientCommand = cli.Command{
	Name:  "client",
	Usage: "Starting or terminating a client.",
	Subcommands: []cli.Command{
		{
			Name:  "execute",
			Usage: "Upload hardware configuration and initiate listening events.",
			Flags: []cli.Flag{
				&cli.StringFlag{
					Name:  "dirpath, d",
					Value: "/home", // 默认目录为/home
					Usage: "Directory provided for training models",
				},
				&cli.StringFlag{
					Name:     "mnemonic, m",
					Required: true,
					Usage:    "Mnemonics used to complete transactions",
				},
			},
			Action: func(c *cli.Context) error {

				// _, _, _, err := getMatrix(c)
				// if err != nil {
				// 	logs.Error(err.Error())
				// 	return err
				// }
				// return nil

				matrixWrapper, hwInfo, chainInfo, err := getMatrix(c, true)
				if err != nil {
					logs.Error(err.Error())
					return err
				}

				machine, err := matrixWrapper.GetMachine(*hwInfo)
				if err != nil {
					logs.Error(fmt.Sprintf("Error: %v", err))
					return err
				}

				if machine.Metadata == "" {
					logs.Normal("Machine does not exist")
					hash, err := matrixWrapper.AddMachine(*hwInfo)
					if err != nil {
						logs.Error(fmt.Sprintf("Error block : %v, msg : %v\n", hash, err))
						return err
					}
				} else {
					logs.Normal("Machine already exists")
				}

				for {
					subscribeBlocks := subscribe.NewSubscribeWrapper(chainInfo)
					orderId, orderPlacedMetadata, err := subscribeBlocks.SubscribeEvents(hwInfo)
					if err != nil {
						logs.Error(err.Error())
						return err
					}
					logs.Normal("subscribe done")

					if codec.Eq(orderId, pattern.OrderId{}) {
						logs.Result("Stop the client.")
						return nil
					}

					// err = trainingModel(conn, &orderPlacedMetadata)
					byteArray := make([]byte, len(orderId))
					for i, v := range orderId {
						byteArray[i] = byte(v)
					}

					logs.Normal(fmt.Sprintf("Start training model, orderId: %v", fmt.Sprintf("%#x", byteArray)))
					jsonData, err := json.Marshal(orderPlacedMetadata)
					if err != nil {
						return fmt.Errorf("error marshaling the struct to JSON: %v", err)
					}
					logs.Normal(fmt.Sprintf("Start training model, orderPlacedMetadata: %v", string(jsonData)))

					switch orderPlacedMetadata.FormData.LibType {
					case "lib":
						err = docker.RunFixedContainer(
							c.String("dirpath"),
							fmt.Sprintf("%#x", byteArray),
							orderPlacedMetadata.FormData.Iters,
							orderPlacedMetadata.FormData.Batchsize,
							orderPlacedMetadata.FormData.Rate)
					case "docker":
						imageName := orderPlacedMetadata.FormData.ImageName + ":" + orderPlacedMetadata.FormData.ImageTag
						err = docker.RunTrainContainer(imageName, c.String("dirpath"), fmt.Sprintf("%#x", byteArray))
					default:
						logs.Error(fmt.Sprintf("libType error: %v", orderPlacedMetadata.FormData.LibType))
						return nil
					}

					if err != nil {
						logs.Error(fmt.Sprintf("Container operation failed\n%v", err))
						_, err = matrixWrapper.OrderFailed(orderId, orderPlacedMetadata)
						if err != nil {
							logs.Error(err.Error())
							return err
						}
						logs.Normal("OrderFailed done")
					} else {

						orderPlacedMetadata.FormData.ModelUrl = "https://ipfs.io/ipfs/QmPHdMGXiuzxeQB5xyn6fqjKLGPUo4rxircpMzzd9cVomF?filename=model.pt"

						_, err = matrixWrapper.OrderCompleted(orderId, orderPlacedMetadata)
						if err != nil {
							return err
						}
						logs.Normal("OrderCompleted done")
					}

					time.Sleep(1 * time.Second)
				}
			},
		},
		{
			Name:  "stop",
			Usage: "Stop the client.",
			Flags: []cli.Flag{
				&cli.StringFlag{
					Name:     "mnemonic, m",
					Required: true,
					Usage:    "Mnemonics used to complete transactions",
				},
			},
			Action: func(c *cli.Context) error {
				matrixWrapper, hwInfo, _, err := getMatrix(c, false)
				if err != nil {
					logs.Error(err.Error())
					return err
				}

				hash, err := matrixWrapper.RemoveMachine(*hwInfo)
				if err != nil {
					logs.Error(fmt.Sprintf("Error block : %v, msg : %v\n", hash, err))
					return err
				}
				return nil
			},
		},
	},
}

func getFreeSpace(c *cli.Context) (disk.InfoDisk, error) {
	logs.Normal("Getting free space info...")

	dirpath := c.String("dirpath")
	if _, err := os.Stat(dirpath); os.IsNotExist(err) {
		logs.Normal(fmt.Sprintf("%s does not exist. Using default directory /home", dirpath))
		dirpath = "/home"
	}

	freeSpace, err := utils.GetFreeSpace(dirpath)
	if err != nil {
		return disk.InfoDisk{}, fmt.Errorf("error calculating free space: %v", err)
	}

	diskInfo := disk.InfoDisk{
		Path:       dirpath,
		TotalSpace: float64(freeSpace) / 1024 / 1024 / 1024,
	}

	return diskInfo, nil
}

func getMatrix(c *cli.Context, isHw bool) (*pallets.WrapperMatrix, *machine_info.MachineInfo, *chain.InfoChain, error) {
	logs.Result("-------------------- start --------------------")

	mnemonic := c.String("mnemonic")

	// 获取机器ID信息
	machineUUID, err := machine_uuid.GetInfoMachineUUID()
	if err != nil {
		return nil, nil, nil, err
	}

	newConfig := config.NewConfig(
		mnemonic,
		pattern.RPC,
		1)

	var chainInfo *chain.InfoChain
	chainInfo, err = chain.GetChainInfo(newConfig)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("error getting chain info: %v", err)
	}

	var hwInfo machine_info.MachineInfo

	if isHw {
		hwInfo, err = machine_info.GetMachineInfo()
		if err != nil {
			return nil, nil, nil, fmt.Errorf("error getting hardware info: %v", err)
		}

		diskInfo, err := getFreeSpace(c)
		if err != nil {
			return nil, nil, nil, err
		}

		score, err := docker.RunScoreContainer()
		if err != nil {
			return nil, nil, nil, err
		}

		hwInfo.Score = score
		hwInfo.DiskInfo = diskInfo
	}

	hwInfo.Addr = chainInfo.Wallet.Address
	hwInfo.MachineUUID = machineUUID

	jsonData, _ := json.Marshal(hwInfo)
	logs.Normal(fmt.Sprintf("Hardware Info : %v", string(jsonData)))

	return pallets.NewMatrixWrapper(chainInfo), &hwInfo, chainInfo, nil
}
