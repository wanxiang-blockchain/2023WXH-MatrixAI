package utils

import (
	"MatrixAI-Client/logs"
	"MatrixAI-Client/pattern"
	"archive/zip"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
)

func ParseMachineUUID(uuidStr string) (pattern.MachineUUID, error) {

	/* windows */
	// var uuid [16]byte
	// var machineUUID pattern.MachineUUID

	// uuidParts := strings.Split(uuidStr, "-")
	// if len(uuidParts) != 5 {
	// 	return machineUUID, fmt.Errorf("invalid UUID format")
	// }

	// partLengths := []int{8, 4, 4, 4, 12}
	// dstIndex := 0

	// for i, part := range uuidParts {
	// 	data, err := hex.DecodeString(part)
	// 	if err != nil || len(data) != partLengths[i]/2 {
	// 		return machineUUID, fmt.Errorf("invalid UUID format")
	// 	}

	// 	copy(uuid[dstIndex:], data)
	// 	dstIndex += len(data)
	// }

	// for i := 0; i < len(machineUUID); i++ {
	// 	machineUUID[i] = types.U8(uuid[i])
	// }

	/* Linux */
	var machineUUID pattern.MachineUUID

	bytes, err := hex.DecodeString(uuidStr)
	if err != nil {
		return machineUUID, fmt.Errorf("error: %v", err)
	}

	for i := 0; i < len(machineUUID); i++ {
		machineUUID[i] = types.U8(bytes[i])
	}

	return machineUUID, nil
}

func Zip(src, dest string) error {
	destFile, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer func(destFile *os.File) {
		err := destFile.Close()
		if err != nil {

		}
	}(destFile)

	myZip := zip.NewWriter(destFile)
	defer func(myZip *zip.Writer) {
		err := myZip.Close()
		if err != nil {

		}
	}(myZip)

	err = filepath.Walk(src, func(filePath string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		relPath, err := filepath.Rel(src, filePath)
		if err != nil {
			return err
		}

		zipFile, err := myZip.Create(relPath)
		if err != nil {
			return err
		}

		fsFile, err := os.Open(filePath)
		if err != nil {
			return err
		}
		defer func(fsFile *os.File) {
			err := fsFile.Close()
			if err != nil {

			}
		}(fsFile)

		_, err = io.Copy(zipFile, fsFile)
		return err
	})
	if err != nil {
		return err
	}

	return nil
}

func EnsureHttps(url string) string {
	if !strings.HasPrefix(url, "https://") {
		return "https://" + url
	}
	return url
}

func Unzip(src string, dest string) ([]string, error) {
	var filenames []string

	r, err := zip.OpenReader(src)
	if err != nil {
		return filenames, err
	}
	defer func(r *zip.ReadCloser) {
		err := r.Close()
		if err != nil {

		}
	}(r)

	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)

		if !strings.HasPrefix(fpath, filepath.Clean(dest)+string(os.PathSeparator)) {
			return filenames, fmt.Errorf("illegal file path: %s", fpath)
		}

		filenames = append(filenames, fpath)

		if f.FileInfo().IsDir() {
			err := os.MkdirAll(fpath, os.ModePerm)
			if err != nil {
				return nil, err
			}
			continue
		}

		if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return filenames, err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return filenames, err
		}

		rc, err := f.Open()
		if err != nil {
			return filenames, err
		}

		_, err = io.Copy(outFile, rc)

		err = outFile.Close()
		if err != nil {
			return nil, err
		}
		err = rc.Close()
		if err != nil {
			return nil, err
		}

		if err != nil {
			return filenames, err
		}
	}
	return filenames, nil
}

func GetFreeSpace(path string) (uint64, error) {
	var stat syscall.Statfs_t
	err := syscall.Statfs(path, &stat)
	if err != nil {
		return 0, err
	}
	// 使用 Bsize * Bavail 获取可用的字节数
	return stat.Bavail * uint64(stat.Bsize), nil
}

func ReadLogsAndSend(filePath string, orderUUID string) {
	ticker := time.NewTicker(10 * time.Second)
	for range ticker.C {

		content, err := os.ReadFile(filePath)
		if err != nil {
			logs.Error(fmt.Sprintf("ReadLogs err : Unable to read file: %v", err))
			continue
		}

		contentStr := strings.ReplaceAll(string(content), "\u0000", "")

		if result := strings.Contains(contentStr, "Container Completed"); result {

			logs.Normal("ReadLogsAndSend done")

			newLogs := strings.Replace(contentStr, "Container Completed", "", -1) // Remove "Container completed"

			if strings.TrimSpace(newLogs) != "" { // 执行上传操作前先判断是否为空
				SendLogToServer(orderUUID, newLogs)
			}

			if err = os.Remove(filePath); err != nil { // 删除文件
				logs.Error(fmt.Sprintf("ReadLogs err : Unable to delete file: %v", err))
			}

			ticker.Stop() // 停止定时器
			return
		}

		f, err := os.OpenFile(filePath, os.O_WRONLY, 0644)
		if err != nil {
			logs.Error(fmt.Sprintf("ReadLogs err : Unable to open file: %v", err))
			return
		}

		err = f.Truncate(0) // Truncate file to 0 bytes
		if err != nil {
			f.Close()
			logs.Error(fmt.Sprintf("ReadLogs err : Unable to truncate file: %v", err))
			return
		}

		err = f.Sync() // Sync changes to storage
		if err != nil {
			f.Close()
			logs.Error(fmt.Sprintf("ReadLogs err : Unable to sync file: %v", err))
			return
		}

		// 如果文件内容为空，continue 进入下一次循环
		if strings.TrimSpace(contentStr) == "" {
			logs.Normal("ReadLogsAndSend next")
			continue
		}

		SendLogToServer(orderUUID, contentStr)
		f.Close()
	}
}
