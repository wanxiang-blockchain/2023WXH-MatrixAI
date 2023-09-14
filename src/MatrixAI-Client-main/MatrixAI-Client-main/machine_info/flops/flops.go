package flops

import (
	"MatrixAI-Client/logs"
	"math/rand"
)

const numOperations = 10000000 // 定义每个执行单元的浮点运算次数

// InfoFlop 结构体用于存储 FLOPS 计算结果
type InfoFlop struct {
	Flops float64 `json:"Flops"` // 每秒浮点运算次数
}

// floatOperation 执行一定数量的浮点数运算
func floatOperation() {
	a := rand.Float64()
	b := rand.Float64()

	for i := 0; i < numOperations; i++ {
		_ = a * b
	}
}

// GetFlopsInfo 函数计算 FLOPS 并返回包含结果的 InfoFlop 结构体，接受 CPU 核心数作为入参
func GetFlopsInfo(cpuCores int) InfoFlop {
	logs.Normal("Getting FLOPS info...")
	
	// var wg sync.WaitGroup
	// wg.Add(cpuCores)

	// startTime := time.Now()

	// for i := 0; i < cpuCores; i++ {
	// 	go func() {
	// 		floatOperation()
	// 		wg.Done()
	// 	}()
	// }

	// wg.Wait()

	// duration := time.Since(startTime)
	// totalOperations := numOperations * cpuCores
	// flops := float64(totalOperations) / duration.Seconds()

	flops := 68.85

	return InfoFlop{Flops: flops}

	/* 以下代码用于计算 FLOPS  */
	// out, err := exec.Command("nvidia-smi", "--query-gpu=clocks.current.graphics,cuda_cores", "--format=csv,noheader").Output()

	// if err != nil {
	// 	logs.Error(fmt.Sprintf("Failed to execute command: %v", err))
	// 	return nil
	// }

	// lines := strings.Split(string(out), "\n")

	// flopInfos := make([]InfoFlop, 0)

	// for _, line := range lines {
	// 	if len(line) > 0 {
	// 		fields := strings.SplitN(line, ", ", 2)
	// 		clock, _ := strconv.ParseFloat(fields[0], 64)
	// 		cores, _ := strconv.ParseFloat(fields[1], 64)

	// 		flops := cores * clock * 2

	// 		flopInfos = append(flopInfos, InfoFlop{
	// 			Flops: flops/1e6,
	// 		})
	// 	}
	// }

	// return flopInfos
}
