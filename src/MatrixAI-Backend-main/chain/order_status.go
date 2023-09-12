package chain

import "github.com/centrifuge/go-substrate-rpc-client/v4/scale"

const (
	TRAINING  uint8 = 0
	COMPLETED uint8 = 1
	FAILED    uint8 = 2
)

type OrderStatus struct {
	Value uint8
}

func (m *OrderStatus) Decode(decoder scale.Decoder) error {
	b, err := decoder.ReadOneByte()
	if err != nil {
		return err
	}

	m.Value = b
	return nil
}

func (m OrderStatus) Encode(encoder scale.Encoder) error {
	var err error
	err = encoder.PushByte(m.Value)
	if err != nil {
		return err
	}

	return nil
}
