package docker_utils

import (
	"MatrixAI-Client/logs"
	"context"
	"fmt"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

// 查询镜像是否已存在
func ImageExist(ctx context.Context, cli *client.Client, imageName string) bool {
	images, err := cli.ImageList(ctx, types.ImageListOptions{All: true})
	if err != nil {
		return false
	}

	for _, image := range images {
		for _, name := range image.RepoTags {
			if strings.Contains(imageName, name) {
				logs.Normal(fmt.Sprintf("Image %s exists", imageName))
				return true
			}
		}
	}
	logs.Normal(fmt.Sprintf("Image %s does not exist", imageName))
	return false
}

// 查询容器是否已存在
func ContainerExist(ctx context.Context, cli *client.Client, containerName string) (bool, string) {
	containers, err := cli.ContainerList(ctx, types.ContainerListOptions{All: true})
	if err != nil {
		return false, ""
	}

	for _, container := range containers {
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

// 创建容器
func CreateContainer(ctx context.Context, cli *client.Client, imageName string, containerName string, config *container.Config, hostConfig *container.HostConfig) (string, error) {
	isCreated, containerID := ContainerExist(ctx, cli, containerName)
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
func DeleteContainerAndImage(ctx context.Context, cli *client.Client, containerName string, imageName string) error {
	isCreated, containerID := ContainerExist(ctx, cli, containerName)
	if isCreated {
		err := cli.ContainerRemove(ctx, containerID, types.ContainerRemoveOptions{Force: true})
		if err != nil {
			return err
		}
	}

	isCreated = ImageExist(ctx, cli, imageName)
	if isCreated {
		_, err := cli.ImageRemove(ctx, imageName, types.ImageRemoveOptions{Force: true})
		if err != nil {
			return err
		}
	}
	return nil
}