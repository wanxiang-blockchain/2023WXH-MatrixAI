package machine_uuid

import (
	"MatrixAI-Client/logs"
	"os"
	"strings"
)

type MachineUUID string

func GetInfoMachineUUID() (MachineUUID, error) {
	logs.Normal("Getting machine ID...")

	mID, err := os.ReadFile("/etc/machine-id")
	if err != nil {
		return "", err
	}

	return MachineUUID(strings.TrimSpace(string(mID))), nil
	// return MachineUUID("ec226411f4afcde6fa8764b242b51b02"), nil

	// output, err := exec.Command("bash", "-c", "sudo dmidecode -s system-uuid").Output()
	// if err != nil {
	// 	return "", err
	// }

	// uuid := strings.TrimSpace(string(output))
	// if uuid == "" {
    //     return "", fmt.Errorf("UUID not found")
    // }

	// lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	// if len(lines) == 2 {
	// 	// 第一行为 "UUID"，第二行为实际 UUID
	// 	return MachineUUID(strings.TrimSpace(lines[1])), nil
	// 	//return "E39911FB-03C7-A00A-B29E-50EBF6B66202", nil
	// }
	// return "", fmt.Errorf("failed to parse UUID")
}
