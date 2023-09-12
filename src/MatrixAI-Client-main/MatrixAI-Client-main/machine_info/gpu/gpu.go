package gpu

import (
	"MatrixAI-Client/logs"
	"bytes"
	"os/exec"
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
	Number string `json:"Number"` // GPU显卡数量
}

// GetIntelGPUInfo 获取 Intel GPU 信息并返回一个包含 InfoGPU 结构体的切片
func GetIntelGPUInfo() (InfoGPU, error) {
	logs.Normal("Getting GPU info...")

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

		gpuInfo = InfoGPU{
			Model:  result[1],
			Number: result[0],
		}
	}
	return gpuInfo, nil
}
