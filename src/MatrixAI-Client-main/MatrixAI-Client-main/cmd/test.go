package cmd

import (
	"MatrixAI-Client/docker/utils"
	"MatrixAI-Client/logs"
	"bufio"
	"context"
	"os"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/urfave/cli"
)

var PaddleCommand = cli.Command{
	Name:  "test",
	Usage: "Training test.",
	Subcommands: []cli.Command{
		{
			Name:  "score",
			Usage: "Calculate Score.",
			//Flags: []cli.Flag{
			//	&cli.StringFlag{
			//		Name:     "mnemonic, m",
			//		Required: true,
			//		Usage:    "Mnemonics used to complete transactions",
			//	},
			//},
			Action: func(c *cli.Context) error {

				logs.Result("test Score model")

				image := "hsiaojo/score:0.1"
				containerName := "score_container"

				ctx, cancel := context.WithCancel(context.Background())
				defer cancel()

				cli, err := client.NewClientWithOpts(client.FromEnv)
				if err != nil {
					return err
				}

				err = docker_utils.DeleteContainerAndImage(ctx, cli, containerName, "", image)
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

				scanner1 := bufio.NewScanner(reader)
				for scanner1.Scan() {
					logs.Result("111111" + scanner1.Text())

					index := strings.Index(scanner1.Text(), "score:")
					if index <= 0 {
						logs.Normal("no score")
					} else {
						score := strings.TrimSpace(scanner1.Text()[index+len("score:"):])
						logs.Normal("score:" + score)
					}
				}

				stdcopy.StdCopy(os.Stdout, os.Stderr, reader)
				logs.Result("done Score model")

				return nil
			},
		},
	},
}
