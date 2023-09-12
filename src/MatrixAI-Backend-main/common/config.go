package common

import (
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
	"os"
)

type Config struct {
	Server   Server
	Database Database
	Mailbox  Mailbox
	Chain    Chain
}

type Server struct {
	Mode string
	Port string
}

type Database struct {
	Host     string
	Port     string
	Username string
	Password string
	Database string
}

type Mailbox struct {
	Host     string
	Port     int
	Username string
	Password string
}

type Chain struct {
	Rpc string
}

func InitConfig() {
	viper.SetConfigType("yaml")
	configEnv := os.Getenv("GO_ENV")
	switch configEnv {
	case "dev":
		viper.SetConfigFile("config/config-dev.yml")
	default:
		viper.SetConfigFile("config/config.yml")
	}

	err := viper.ReadInConfig()
	if err != nil {
		panic(err)
	}
	err = viper.Unmarshal(&Conf)
	if err != nil {
		panic(err)
	}
	viper.WatchConfig()
	viper.OnConfigChange(func(in fsnotify.Event) {
		err = viper.Unmarshal(&Conf)
		if err != nil {
			panic(err)
		}
	})
}
