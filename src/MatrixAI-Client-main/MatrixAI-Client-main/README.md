# MatrixAI-Client

Share your unused computing capacity to provide support for more AI creators in need and earn profits at the same time.

## Disclaimer

This program is still in the development stage and includes testing and uncertainties. Please do not run it in a production environment.

## System requirements

- Operating System: Ubuntu 22.04 and above
- GPU：NVIDIA
- Go: 1.20.4 and above

## View Go version
```
   go version
```

## Prepare the dataset.

Provide dataset template.

Download link: https://ipfs.io/ipfs/QmSfzFjH1cRQ2jVoy5xHWM2XjDNf6t6QXibrDosWhjHFhA

## Instructions for use.

Before running the MatrixAI-Client, please ensure that the `Docker` program has been correctly installed and can run containers normally.

Start the client program: execute the following command in the command line, replacing `your_mnemonic_phrase` with the actual mnemonic phrase:
```
   ./bin/MatrixAI-Client client execute -d <your_dirpath> -m "your_mnemonic_phrase"
```

Stop the client program: execute the following command in the command line, replacing `your_mnemonic_phrase` with the actual mnemonic phrase:
```
   ./bin/MatrixAI-Client client stop -m "your_mnemonic_phrase"
```