package chain

import "github.com/centrifuge/go-substrate-rpc-client/v4/scale"

const (
	IDLE     uint8 = 0
	FOR_RENT uint8 = 1
	RENTING  uint8 = 2
)

type MachineStatus struct {
	Value uint8
}

func (m *MachineStatus) Decode(decoder scale.Decoder) error {
	b, err := decoder.ReadOneByte()
	if err != nil {
		return err
	}

	m.Value = b
	return nil
}

func (m MachineStatus) Encode(encoder scale.Encoder) error {
	var err error
	err = encoder.PushByte(m.Value)
	if err != nil {
		return err
	}

	return nil
}
