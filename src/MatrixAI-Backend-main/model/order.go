package model

import "time"

type Order struct {
	Id          uint      `gorm:"primarykey"`
	Uuid        string    `gorm:"size:34;not null;unique;uniqueIndex"`
	Buyer       string    `gorm:"size:48;not null"`
	Seller      string    `gorm:"size:48;not null"`
	MachineUuid string    `gorm:"size:34;not null"`
	Price       string    `gorm:"size:20;not null"`
	Duration    uint32    `gorm:"not null"`
	Total       string    `gorm:"size:20;not null"`
	Metadata    string    `gorm:"size:2048;not null"`
	Status      uint8     `gorm:"not null"`
	OrderTime   time.Time `gorm:"autoCreateTime"`
}
