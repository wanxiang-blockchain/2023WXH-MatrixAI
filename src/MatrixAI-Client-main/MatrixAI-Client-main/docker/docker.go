package docker

import (
	"MatrixAI-Client/docker/utils"
	"MatrixAI-Client/logs"
	"MatrixAI-Client/utils"
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
)

func RunTrainContainer(image string, dirpath string, orderId string) error {
	logs.Normal("Start to run train container")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return err
	}

	if !docker_utils.ImageExist(ctx, cli, image) {
		cmd := exec.Command("docker", "pull", image)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Start(); err != nil {
			return fmt.Errorf("error : Start pulling image: %v", err)
		}
		if err := cmd.Wait(); err != nil {
			return fmt.Errorf("error : Wait pulling image: %v", err)
		}
	}

	containerID, err := docker_utils.CreateContainer(ctx, cli, image, "",
		&container.Config{
			Image: image,
			Env:   []string{"MATRIX_PATH=" + dirpath},
			// Cmd:   []string{"python", "main.py", "--save-model", "--epochs", "2"},
		},
		&container.HostConfig{
			Resources: container.Resources{
				DeviceRequests: []container.DeviceRequest{
					{
						Driver:       "nvidia",
						Count:        -1,
						DeviceIDs:    []string{},
						Capabilities: [][]string{{"gpu"}},
						Options:      nil,
					},
				},
			},
		})
	if err != nil {
		return err
	}

	if err := cli.ContainerStart(ctx, containerID, types.ContainerStartOptions{}); err != nil {
		return err
	}

	reader, err := cli.ContainerLogs(ctx, containerID, types.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Timestamps: true})
	if err != nil {
		return err
	}
	defer reader.Close()

	containerLogs := "containerLogs.txt"

	logFile, err := os.Create(containerLogs)
	if err != nil {
		panic(err)
	}
	defer logFile.Close()

	go utils.ReadLogsAndSend(containerLogs, orderId)
	stdcopy.StdCopy(logFile, logFile, reader)

	_, err = logFile.WriteString("\nContainer Completed\n")
	if err != nil {
		return fmt.Errorf("error writing container logs: %v", err)
	}

	_ = docker_utils.DeleteContainerAndImage(ctx, cli, containerID, image)
	return nil
}

func RunScoreContainer() (float64, error) {
	logs.Normal("Start to run score container")

	image := "hsiaojo/score:0.1"
	containerName := "score_container"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return 0, err
	}

	if !docker_utils.ImageExist(ctx, cli, image) {
		cmd := exec.Command("docker", "pull", image)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Start(); err != nil {
			return 0, err
		}
		if err := cmd.Wait(); err != nil {
			return 0, err
		}
	}

	containerID, err := docker_utils.CreateContainer(ctx, cli, image, containerName,
		&container.Config{
			Image: image,
		},
		&container.HostConfig{
			Resources: container.Resources{
				DeviceRequests: []container.DeviceRequest{
					{
						Driver:       "nvidia",
						Count:        -1,
						DeviceIDs:    []string{},
						Capabilities: [][]string{{"gpu"}},
						Options:      nil,
					},
				},
			},
		})
	if err != nil {
		return 0, err
	}

	if err := cli.ContainerStart(ctx, containerID, types.ContainerStartOptions{}); err != nil {
		return 0, err
	}

	statusCh, errCh := cli.ContainerWait(ctx, containerID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			return 0, err
		}
	case <-statusCh:
	}

	reader, err := cli.ContainerLogs(ctx, containerID, types.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Timestamps: true})
	if err != nil {
		return 0, err
	}
	defer reader.Close()

	score := readScore(reader)

	stdcopy.StdCopy(os.Stdout, os.Stderr, reader)

	return score, nil
}

func RunFixedContainer() (float64, error) {
	logs.Normal("Start to run fixed container")

	image := "hsiaojo/test:0.4"
	containerName := image + "_container"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return 0, err
	}

	_, err = cli.ImagePull(ctx, image, types.ImagePullOptions{})
	if err != nil {

		cmd := exec.Command("docker", "pull", image)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		if err := cmd.Start(); err != nil {
			return 0, err
		}
		if err := cmd.Wait(); err != nil {
			return 0, err
		}
	}

	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{})
	if err != nil {
		return 0, err
	}

	isCreated := false
	var containerID string

loop:
	for _, container := range containers {
		for _, name := range container.Names {
			if strings.Contains(name, containerName) {
				isCreated = true
				containerID = container.ID
				break loop
			}
		}
	}

	if !isCreated {
		resp, err := cli.ContainerCreate(
			ctx,
			&container.Config{
				Image: image,
			}, &container.HostConfig{
				Resources: container.Resources{
					DeviceRequests: []container.DeviceRequest{
						{
							Driver:       "nvidia",
							Count:        -1,
							DeviceIDs:    []string{},
							Capabilities: [][]string{{"gpu"}},
							Options:      nil,
						},
					},
				},
			}, nil, nil, containerName)
		if err != nil {
			return 0, err
		}
		containerID = resp.ID
	}

	if err := cli.ContainerStart(ctx, containerID, types.ContainerStartOptions{}); err != nil {
		return 0, err
	}

	statusCh, errCh := cli.ContainerWait(ctx, containerID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			return 0, err
		}
	case <-statusCh:
	}

	reader, err := cli.ContainerLogs(ctx, containerID, types.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Timestamps: true})
	if err != nil {
		return 0, err
	}
	defer reader.Close()

	score := readScore(reader)
	stdcopy.StdCopy(os.Stdout, os.Stderr, reader)
	return score, nil
}

func readScore(rd io.Reader) float64 {

	scanner := bufio.NewScanner(rd)
	var lastLine string
	for scanner.Scan() {
		lastLine = scanner.Text()
	}

	// 直接解析最后一行（输出的分数）为浮点数
	score, _ := strconv.ParseFloat(lastLine, 64)
	return score
}
