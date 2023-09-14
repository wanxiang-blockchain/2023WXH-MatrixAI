package gpu

import (
	"MatrixAI-Client/logs"
	"bytes"
	"os/exec"
	"strconv"
	"strings"
)

// import (
// 	"bytes"
// 	"fmt"
// 	"os/exec"
// 	"strings"
// )

// InfoGPU 定义 InfoGPU 结构体
type InfoGPU struct {
	Model  string `json:"Model"`  // GPU显卡型号
	Number int    `json:"Number"` // GPU显卡数量
}

// GetIntelGPUInfo 获取 Intel GPU 信息并返回一个包含 InfoGPU 结构体的切片
func GetIntelGPUInfo() (InfoGPU, error) {
	logs.Normal("Getting GPU info...")

	// gpuInfo := InfoGPU{
	// 	Model:  "NVIDIA A40",
	// 	Number: 1,
	// }

	cmd := exec.Command("nvidia-smi", "--query-gpu=count,gpu_name", "--format=csv,noheader")
	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		return InfoGPU{}, err
	}

	result := strings.Split(strings.TrimSpace(out.String()), ", ")

	var gpuInfo InfoGPU
	if len(result) >= 2 {

		number, err := strconv.Atoi(result[0])
		if err != nil {
			number = 0			
		}

		gpuInfo = InfoGPU{
			Model:  result[1],
			Number: number,
		}
	}
	return gpuInfo, nil
}
