package docker

import (
	"MatrixAI-Client/docker/utils"
	"MatrixAI-Client/logs"
	"MatrixAI-Client/utils"
	"bufio"
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
)

func RunTrainContainer(image string, dirpath string, orderId string) error {
	logs.Normal(fmt.Sprintf("Start to run train container, image: %v, dirpath: %v, orderId: %v", image, dirpath, orderId))

	containerName := "train_container"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return err
	}

	err = docker_utils.PullImage(ctx, cli, image)
	if err != nil {
		return err
	}

	containerID, err := docker_utils.CreateContainer(ctx, cli, image, containerName,
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

	_ = docker_utils.DeleteContainerAndImage(ctx, cli, containerName, containerID, image)
	return nil
}

func RunScoreContainer() (float64, error) {
	logs.Normal("Start to run score container")

	image := "hsiaojo/score:0.1"
	containerName := "score_container"
	score := 0.0

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return score, err
	}

	err = docker_utils.DeleteContainerAndImage(ctx, cli, containerName, "", image)
	if err != nil {
		return score, err
	}

	err = docker_utils.PullImage(ctx, cli, image)
	if err != nil {
		return score, err
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
		return score, err
	}

	if err := cli.ContainerStart(ctx, containerID, types.ContainerStartOptions{}); err != nil {
		return score, err
	}

	reader, err := cli.ContainerLogs(ctx, containerID, types.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Timestamps: true})
	if err != nil {
		return score, err
	}
	defer reader.Close()

	scanner1 := bufio.NewScanner(reader)
	for scanner1.Scan() {
		out := scanner1.Text()
		logs.Normal("score logs : " + out)

		index := strings.Index(out, "score:")
		if index <= 0 {
			logs.Normal("score logs : no score")
		} else {
			scoreStr := strings.TrimSpace(out[index+len("score:"):])
			score, err = strconv.ParseFloat(scoreStr, 64)
			if err != nil {
				return score, err
			}
			return score, nil
		}
	}
	return score, nil
}

func RunFixedContainer(dirpath string, orderId string, iters string, batchsize string, rate string) error {
	logs.Normal(fmt.Sprintf("Start to run fixed container, dirpath: %v, orderId: %v", dirpath, orderId))

	image := "hsiaojo/test:0.2"
	containerName := "fixed_container"

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ctx := context.Background()

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return err
	}

	err = docker_utils.PullImage(ctx, cli, image)
	if err != nil {
		return err
	}

	containerID, err := docker_utils.CreateContainer(ctx, cli, image, containerName,
		&container.Config{
			Image: image,
			Env:   []string{"MATRIX_PATH=" + dirpath},
			Cmd:   []string{"python", "main.py", "--save-model", "--epochs", iters, "--batch-size", batchsize, "--lr", rate},
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
	return nil
}
