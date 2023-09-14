# MatrixAI-Backend

## System Requirements
- Linux-amd64

## Build
Requires Go1.20 or higher.
```
GOOS=linux GOARCH=amd64 go build
```
If all goes well, you will get a program called `matrixai-backend`.

## Run
### Step 1: Prepare configuration file
- Copy `/config` folder to where `matrixai-backend` program locate.
- Edit Database configuration in `./config/config.yml`.
```
Server:
  Mode: release
  Port: 8888

Database:
  Host:
  Port: 3306
  UserName:
  Password:
  Database: matrix-ai

Mailbox:
  Host:
  Port: 25
  Username:
  Password:

Chain:
  Rpc: wss://rpc.matrixai.cloud/ws/
```

### Step 2: Start the matrixai-backend service
- New a screen window
```
screen -S matrixai-backend
```
- start service
```
./matrixai-backend
```
When the service is started, the `machines` and `orders` tables in database will be cleared, the latest data on the chain will be pulled.

## Stop
- Attach the screen window
```
screen -r matrixai-backend
```
- stop service

`CTRL +  C`
