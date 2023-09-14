package pattern

import (
	"github.com/centrifuge/go-substrate-rpc-client/v4/scale"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
)

// RPC is the url of the node
// const RPC = "ws://172.16.2.168:9944" // 强哥本机
// const RPC = "ws://139.196.35.64:9949" // 测试服务器
const RPC = "wss://rpc.matrixai.cloud/ws/" // 正式服务器

// DOT is "." character
const DOT = "."

// Pallets
const (
	// OSS is a module about DeOSS
	OSS = "Oss"

	// HASHRATE_MARKET is a module about DeOSS
	HASHRATE_MARKET = "HashrateMarket"

	// SYSTEM is a module about the system
	SYSTEM = "System"
)

// Chain state
const (
	// SYSTEM
	ACCOUNT = "Account"
	EVENTS  = "Events"

	MACHINE = "Machine"
)

// Extrinsic
const (
	// OSS
	TX_OSS_REGISTER = OSS + DOT + "authorize"

	// TX_HASHRATE_MARKET_REGISTER
	TX_HASHRATE_MARKET_REGISTER = HASHRATE_MARKET + DOT + "add_machine"

	TX_HASHRATE_MARKET_ORDER_COMPLETED = HASHRATE_MARKET + DOT + "order_completed"

	TX_HASHRATE_MARKET_ORDER_FAILED = HASHRATE_MARKET + DOT + "order_failed"

	TX_HASHRATE_MARKET_REMOVE_MACHINE = HASHRATE_MARKET + DOT + "remove_machine"
)

type FileHash [64]types.U8

type MachineUUID [16]types.U8

type OrderId [16]types.U8

const (
	ERR_Failed  = "failed"
	ERR_Timeout = "timeout"
	ERR_Empty   = "empty"
)

type MachineDetails struct {
	Metadata types.Text
	Status   MachineStatusEnum
	Price    types.OptionU128
}

type MachineStatusEnum struct {
	Idle    bool
	ForRent bool
	Renting bool
}

func (m *MachineStatusEnum) Decode(decoder scale.Decoder) error {
	b, err := decoder.ReadOneByte()
	if err != nil {
		return err
	}
	if b == 0 {
		m.Idle = true
	} else if b == 1 {
		m.ForRent = true
	} else if b == 2 {
		m.Renting = true
	}
	if err != nil {
		return err
	}
	return nil
}

type OrderPlacedMetadata struct {
	MachineInfo MachineInfo `json:"machineInfo"`
	FormData    FormData    `json:"formData"`
}

type MachineInfo struct {
	Id             int      `json:"Id"`
	Owner          string   `json:"Owner"`
	Uuid           string   `json:"Uuid"`
	Metadata       Metadata `json:"Metadata"`
	Status         int      `json:"Status"`
	Price          int      `json:"Price"`
	MaxDuration    int      `json:"MaxDuration"`
	Disk           int      `json:"Disk"`
	CompletedCount int      `json:"CompletedCount"`
	FailedCount    int      `json:"FailedCount"`
	Score          float32  `json:"Score"`
	Gpu            string   `json:"Gpu"`
	GpuCount       int      `json:"GpuCount"`
	Region         string   `json:"Region"`
	Tflops         float32  `json:"Tflops"`
	Addr           string   `json:"Addr"`
	UuidShort      string   `json:"UuidShort"`
	Cpu            string   `json:"Cpu"`
	RAM            string   `json:"RAM"`
	AvailHardDrive string   `json:"AvailHardDrive"`
	UploadSpeed    string   `json:"UploadSpeed"`
	DownloadSpeed  string   `json:"DownloadSpeed"`
	Reliability    string   `json:"Reliability"`
	TFLOPS         float32  `json:"TFLOPS"`
}

type Metadata struct {
	MachineUUID  string       `json:"MachineUUID"`
	Addr         string       `json:"Addr"`
	CPUInfo      CPUInfo      `json:"CPUInfo"`
	DiskInfo     DiskInfo     `json:"DiskInfo"`
	Score        float32      `json:"Score"`
	InfoMemory   InfoMemory   `json:"InfoMemory"`
	GPUInfo      GPUInfo      `json:"GPUInfo"`
	LocationInfo LocationInfo `json:"LocationInfo"`
	SpeedInfo    SpeedInfo    `json:"SpeedInfo"`
	InfoFlop     InfoFlop     `json:"InfoFlop"`
}

type CPUInfo struct {
	ModelName string  `json:"ModelName"`
	Cores     int     `json:"Cores"`
	Mhz       float32 `json:"Mhz"`
}

type DiskInfo struct {
	Path       string  `json:"Path"`
	TotalSpace float32 `json:"TotalSpace"`
}

type InfoMemory struct {
	RAM float32 `json:"RAM"`
}

type GPUInfo struct {
	Model  string `json:"Model"`
	Number int    `json:"Number"`
}

type LocationInfo struct {
	Country string `json:"Country"`
	Region  string `json:"Region"`
	City    string `json:"City"`
}

type SpeedInfo struct {
	Download string `json:"Download"`
	Upload   string `json:"Upload"`
}

type InfoFlop struct {
	Flops float32 `json:"Flops"`
}

type FormData struct {
	TaskName     string `json:"taskName"`
	ImageName    string `json:"imageName"`
	ImageTag     string `json:"imageTag"`
	Libery       string `json:"libery"`
	Model        string `json:"model"`
	DataUrl      string `json:"dataUrl"`
	Iters        string `json:"iters"`
	Batchsize    string `json:"batchsize"`
	Rate         string `json:"rate"`
	Duration     int    `json:"duration"`
	LibType      string `json:"libType"`
	BuyTime      string `json:"buyTime"`
	OrderTime    string `json:"orderTime"`
	ModelUrl     string `json:"modelUrl"`
	CompleteTime string `json:"completeTime"`
	Evaluate     string `json:"evaluate"`
}

// datasets
const (
	DATASETS_FOLDER = "./server"
	ZIP_NAME        = "/datasets.zip"
)
