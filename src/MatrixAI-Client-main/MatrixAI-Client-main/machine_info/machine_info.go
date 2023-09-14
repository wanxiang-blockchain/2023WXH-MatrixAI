package machine_info

import (
	"MatrixAI-Client/machine_info/cpu"
	"MatrixAI-Client/machine_info/disk"
	"MatrixAI-Client/machine_info/flops"
	"MatrixAI-Client/machine_info/gpu"
	"MatrixAI-Client/machine_info/location"
	"MatrixAI-Client/machine_info/machine_uuid"
	"MatrixAI-Client/machine_info/memory"
	"MatrixAI-Client/machine_info/speedtest"
)

// MachineInfo 用于存储所有硬件(cpu\disk\flops\gpu\memory)信息
type MachineInfo struct {
	MachineUUID  machine_uuid.MachineUUID `json:"MachineUUID"`  // 机器 UUID
	Addr         string                   `json:"Addr"`         // 用户钱包地址
	CPUInfo      cpu.InfoCPU              `json:"CPUInfo"`      // CPU 信息
	DiskInfo     disk.InfoDisk            `json:"DiskInfo"`     // 硬盘信息
	Score        float64                  `json:"Score"`        // 得分
	MemoryInfo   memory.InfoMemory        `json:"InfoMemory"`   // 内存信息
	GPUInfo      gpu.InfoGPU              `json:"GPUInfo"`      // GPU 信息（仅限英特尔显卡）
	LocationInfo location.InfoLocation    `json:"LocationInfo"` // IP 对应的地理位置
	SpeedInfo    speedtest.InfoSpeed      `json:"SpeedInfo"`    // 上传下载速度
	FlopsInfo    flops.InfoFlop           `json:"InfoFlop"`     // FLOPS 信息
	// AIModelInfo  []ai_model.InfoAIModel   `json:"AIModel"`      // AI 模型信息
}

// GetMachineInfo 函数收集并返回全部硬件信息
func GetMachineInfo() (MachineInfo, error) {
	var hwInfo MachineInfo

	// 获取 CPU 信息
	cpuInfo, err := cpu.GetCPUInfo()
	if err != nil {
		return hwInfo, err
	}
	hwInfo.CPUInfo = cpuInfo

	// 获取内存信息
	memInfo, err := memory.GetMemoryInfo()
	if err != nil {
		return hwInfo, err
	}
	hwInfo.MemoryInfo = memInfo

	// 获取 GPU 信息
	gpuInfo, err := gpu.GetIntelGPUInfo()
	if err != nil {
		return hwInfo, err
	}
	hwInfo.GPUInfo = gpuInfo

	// 获取 IP 对应的地理位置信息
	locationInfo, err := location.GetLocationInfo()
	if err != nil {
		return hwInfo, err
	}
	hwInfo.LocationInfo = locationInfo

	// 测算网络上传下载速率
	speedInfo, err := speedtest.GetSpeedInfo()
	if err != nil {
		return hwInfo, err
	}
	hwInfo.SpeedInfo = speedInfo

	// 获取 FLOPS 信息
	if cpuInfo.Cores > 0 {
		flopsInfo := flops.GetFlopsInfo(int(cpuInfo.Cores))
		hwInfo.FlopsInfo = flopsInfo
	}

	// aiModelInfos, err := ai_model.GetAIModelInfo()
	// if err != nil {
	// 	return hwInfo, err
	// }
	// hwInfo.AIModelInfo = aiModelInfos

	return hwInfo, nil
}
