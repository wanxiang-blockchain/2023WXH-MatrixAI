package docker_utils

import (
	"MatrixAI-Client/logs"
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

// 查询镜像是否已存在
func ImageExist(ctx context.Context, cli *client.Client, imageName string) (bool, string) {
	images, err := cli.ImageList(ctx, types.ImageListOptions{All: true})
	if err != nil {
		return false, ""
	}

	for _, image := range images {
		for _, name := range image.RepoTags {
			if strings.Contains(imageName, name) {
				logs.Normal(fmt.Sprintf("Image %s exists", imageName))
				return true, image.ID
			}
		}
	}
	logs.Normal(fmt.Sprintf("Image %s does not exist", imageName))
	return false, ""
}

// 查询容器是否已存在
func ContainerExist(ctx context.Context, cli *client.Client, containerName string, containerId string) (bool, string) {
	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{All: true})
	if err != nil {
		return false, ""
	}

	for _, container := range containers {
		if container.ID == containerId {
			logs.Normal(fmt.Sprintf("Container %s exists", containerName))
			return true, container.ID
		}
		for _, name := range container.Names {
			if strings.Contains(name, containerName) {
				logs.Normal(fmt.Sprintf("Container %s exists", containerName))
				return true, container.ID
			}
		}
	}
	logs.Normal(fmt.Sprintf("Container %s does not exist", containerName))
	return false, ""
}

// 拉取镜像
func PullImage(ctx context.Context, cli *client.Client, imageName string) error {
	isCreated, _ := ImageExist(ctx, cli, imageName)
	if !isCreated {
		cmd := exec.Command("docker", "pull", imageName)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Start(); err != nil {
			return fmt.Errorf("error : Start pulling image: %v", err)
		}
		if err := cmd.Wait(); err != nil {
			return fmt.Errorf("error : Wait pulling image: %v", err)
		}
	}
	return nil
}

// 创建容器
func CreateContainer(ctx context.Context, cli *client.Client, imageName string, containerName string, config *container.Config, hostConfig *container.HostConfig) (string, error) {
	isCreated, containerID := ContainerExist(ctx, cli, containerName, "")
	if isCreated {
		return containerID, nil
	}

	resp, err := cli.ContainerCreate(
		ctx,
		config,
		hostConfig,
		nil,
		nil,
		containerName,
	)
	if err != nil {
		return "", err
	}
	return resp.ID, nil
}

// 删除容器和镜像
func DeleteContainerAndImage(ctx context.Context, cli *client.Client, containerName string, containerId string, imageName string) error {
	isCreated, containerID := ContainerExist(ctx, cli, containerName, containerId)
	if isCreated {
		err := cli.ContainerRemove(ctx, containerID, types.ContainerRemoveOptions{Force: true})
		if err != nil {
			return err
		}
	}

	isCreated, imageId := ImageExist(ctx, cli, imageName)
	if isCreated {
		_, err := cli.ImageRemove(ctx, imageId, types.ImageRemoveOptions{Force: true})
		if err != nil {
			return err
		}
	}
	return nil
}
