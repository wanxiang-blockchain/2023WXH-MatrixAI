import styled from "styled-components";
import _ from "lodash";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  MenuOutlined,
  CloudUploadOutlined,
  WalletOutlined,
  SearchOutlined,
  HomeOutlined,
  GlobalOutlined,
  LoginOutlined,
  CloseCircleOutlined,
  SwapOutlined,
  CheckOutlined,
  UserOutlined,
  UnorderedListOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import {
  Modal,
  Menu,
  message,
  Empty,
  Avatar,
  Button,
  List,
  Checkbox,
  Form,
  Input,
  Skeleton,
} from "antd";
import PolkadotLogo from "../statics/polkadot-logo.svg";
import { getAPI, getKeyring, toPublickKey } from "../utils/polkadot";
import { formatAddress, formatAddressLong } from "../utils/formatter";
import { formatBalance } from "../utils/formatter";
import Identicon from "@polkadot/react-identicon";
import store from "../utils/store";
import webconfig from "../webconfig";
import BuySpace from "../components/BuySpace";

import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import copy from "copy-to-clipboard";
import * as util from "../utils";
import logo from "../statics/imgs/logo.png";
import { encodeAddress } from "@polkadot/util-crypto";
let timeout = null;
let lockMenu = false;

function Header({ className }) {
  let navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [keyword, setKeyword] = useState();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isModalConfig, setIsModalConfig] = useState(false);
  const [menuLeft, setMmenuLeft] = useState(null);
  const [menuTop, setMmenuTop] = useState("-200px");
  const [showMenu, setShowMenu] = useState(false);


  const [account, setAccount] = useState();
  const [accounts, setAccounts] = useState();

  const [config, setConfig] = useState({});

  const freshAccountBalance = async () => {
    let api = await getAPI();
    let addr = localStorage.getItem("addr");
    let acc = account;
    if (!acc) {
      acc = store.get("account");
    }
    const { nonce, data: balance } = await api.query.system.account(addr);
    // console.log("balance", balance);
    // console.log(`balance of ${balance.free} and a nonce of ${nonce}`);
    acc.nonce = nonce;
    acc.balance = formatBalance(balance);
    acc.balance_str = acc.balance + " MAI";
    store.set("account", account);
    saveAccount(acc);
  };

  useEffect(() => {
    window.showLoginBox = function () {
      setModalOpen(true);
    };
    window.freshBalance = function () {
      freshAccountBalance();
    };
  }, []);

  useEffect(() => {
    getAPI().then((t) => {
      if (localStorage.getItem("addr")) {
        onLogin();
      }
    }, console.log);
    setConfig({
      videoApiUrl: webconfig.videoApiUrl,
      apiUrl: webconfig.apiUrl,
      contractAddress: webconfig.contractAddress,
      nodeURL: webconfig.wsnode.nodeURL,
    });
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const onMenuClick = ({ item, key, keyPath, domEvent }) => {
    if (key == "sub") return;
    navigate(key);
    toggleCollapsed();
  };
  const onShowLoginBox = () => {
    setModalOpen(true);
  };
  window.onShowLoginBox=onShowLoginBox;
  const onLogin = async () => {
    const allInjected = await web3Enable("my cool dapp");
    console.log("allInjected", allInjected);
    let accounts = await web3Accounts();
    console.log("accounts", accounts);
    if (accounts && accounts.length > 0) {
      // saveAccount(accounts[0]);
      setModalOpen(false);
      message.success("Login success!");
      try {
        let api = await getAPI();
        for (let a of accounts) {
          // a.base58=encodeAddress(a.address, 11330);
          const { nonce, data: balance } = await api.query.system.account(
            a.address
          );
          console.log("balance", balance);
          console.log(`balance of ${balance.free} and a nonce of ${nonce}`);
          a.nonce = nonce;
          a.balance = formatBalance(balance);
          a.balance_str = a.balance + " MAI";
        }
      } catch (e) {
        console.log("query balance error");
        console.error(e);
        let lastAccounts = store.get("accounts");
        accounts.forEach((a) => {
          let tmp = lastAccounts.find((l) => l.address == a.address);
          if (tmp) {
            a.nonce = tmp.nonce;
            a.balance = tmp.balance;
            a.balance_str = tmp.balance_str;
          }
        });
      }
      let lastAddr = localStorage.getItem("addr");
      accounts = accounts.sort((t1, t2) => t2.balance - t1.balance);
      let index = 0;
      if (lastAddr) {
        index = accounts.findIndex((t) => t.address == lastAddr);
        if (index == -1) {
          index = 0;
        }
      }
      setAccounts(accounts);
      store.set("accounts", accounts);
      saveAccount(accounts[index]);
      // openAccountBox(accounts);
    }
  };
  const saveAccount = async (account) => {
    setAccount(account);
    store.set("account", account);
    console.log("saveAccount", account);
    if (account) {
      let publicKey = toPublickKey(account.address);
      localStorage.setItem("publicKey", publicKey);
      localStorage.setItem("addr", account.address);
      // localStorage.setItem("base58",account.base58);
    } else {
      localStorage.removeItem("publicKey");
      localStorage.removeItem("addr");
      // localStorage.removeItem("base58");
    }
  };
  const openAccountBox = (list) => {
    if (!list) {
      list = accounts;
    }
    if (!list || list.length == 0) {
      return util.alert("account not found");
    }
    setIsAccountsModalOpen(true);
  };
  const onLogout = () => {
    store.remove("accounts");
    store.remove("account");
    saveAccount(null);
    setAccounts(null);
    setIsAccountsModalOpen(false);
  };
  const onSwitchAccount = (item) => {
    saveAccount(item);
    window.location.reload();
  };

  const onFinish = (values) => {
    console.log("Success:", values);
    store.set("webconfig", values);
    util.alert("Save Success!", () => {
      window.location.reload();
    });
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className={className}>
      <div className="con">
        <img
          className="logo"
          src={logo}
          style={{
            width: "120px",
          }}
        />
        <div className="content-nav">
          <span onClick={() => navigate("/market")}>Market</span>
          <span onClick={() => navigate("/mydevice")}>Share Device</span>
          <span onClick={() => navigate("/myorder")}>My Orders</span>
          <span onClick={() => navigate("/faucet")}>Faucet</span>
        </div>
        <div className="right-btn">
          {account ? (
            <div className="icon" onClick={()=>setShowMenu(!showMenu)} onDoubleClick={openAccountBox}>
              {/* <Identicon
                value={account.address}
                size={36}
                theme={"polkadot"}
                style={{ marginTop: 0 }}
              /> */}
              <img className="user-header" src="/img/header.svg" />
              {
                showMenu?(
                  <div className="menu">
                    {/* <span onClick={openAccountBox}>Account</span> */}
                    <span onClick={onLogout}>Log out</span>
                  </div>
                ):("")
              }              
            </div>
          ) : (
            <div className="btn" onClick={onShowLoginBox}>
              Connect
            </div>
          )}
        </div>
      </div>
      <Modal
        width={800}
        title="Config API URL"
        open={isModalConfig}
        onOk={() => setIsModalConfig(false)}
        onCancel={() => setIsModalConfig(false)}
        footer={null}
      >
        <div>
          <Form
            name="basic"
            labelCol={{
              span: 4,
            }}
            wrapperCol={{
              span: 20,
            }}
            initialValues={config}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Video API"
              name="videoApiUrl"
              rules={[
                {
                  required: true,
                  message: "Please input video API!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="NFT API"
              name="apiUrl"
              rules={[
                {
                  required: true,
                  message: "Please input NFT API!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Contract Address"
              name="contractAddress"
              rules={[
                {
                  required: true,
                  message: "Contract Address!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Node RPC"
              name="nodeURL"
              rules={[
                {
                  required: true,
                  message: "Please input Node RPC!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 4,
                span: 20,
              }}
            >
              <Button className="btn-bg" type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        className="login-modal"
        width={1000}
        bodyStyle={{backgroundColor:"#000"}}
        open={isModalOpen}
        onOk={() => setModalOpen(false)}
        onCancel={() => {
          setModalOpen(false);
          if (!localStorage.getItem("addr")) {
            navigate("/market/");
          }
        }}
        footer={null}
      >
        <div className="login-box">
          <p className="big-title">Connect Your Wallet</p>
          <p className="con-title">
            If you don't have a wallet yet, you can select a provider and create
            one now
          </p>
          <p></p>
          <div className="login-line" onClick={onLogin}>
            <img src="/img/market/u14.svg" />
            <span>polkadot{"{.js}"} extension</span>
            <label>Polkadot</label>
          </div>
        </div>
      </Modal>
      <Modal
        width={800}
        title="Switch Account"
        open={isAccountsModalOpen}
        onCancel={() => setIsAccountsModalOpen(false)}
        footer={null}
      >
        {accounts && accounts.length > 0 ? (
          <div className="block">
            <List
              className="demo-loadmore-list"
              itemLayout="horizontal"
              dataSource={accounts}
              pagination={{ position: "bottom", pageSize: 5 }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    account.address == item.address ? (
                      <Button disabled={true} icon={<CheckOutlined />}>
                        Current
                      </Button>
                    ) : (
                      <Button
                        icon={<SwapOutlined />}
                        disabled={account.address == item.address}
                        onClick={() => onSwitchAccount(item)}
                      >
                        Switch
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Identicon
                        value={item.address}
                        size={36}
                        theme={"polkadot"}
                        style={{ marginTop: 0 }}
                        onCopy={() => copy(item.address)}
                      />
                    }
                    title={item.meta.name || formatAddress(item.address)}
                    description={formatAddressLong(item.address)}
                  />
                  <div>{item.balance_str}</div>
                </List.Item>
              )}
            />
            <div className="block">
              <Button
                onClick={onLogout}
                style={{ width: "32%", marginTop: "20px" }}
                size="large"
                danger
                icon={<LoginOutlined />}
              >
                Logout
              </Button>
              <Button
                onClick={() => {
                  navigate("/myorder");
                  setIsAccountsModalOpen(false);
                }}
                style={{
                  width: "32%",
                  marginLeft: "10px",
                  marginTop: "20px",
                }}
                type="default"
                size="large"
                icon={<UserOutlined />}
              >
                My Order
              </Button>
              <Button
                onClick={() => setIsAccountsModalOpen(false)}
                style={{
                  width: "32%",
                  marginLeft: "10px",
                  marginTop: "20px",
                  backgroundColor: "#a4cb29",
                }}
                type="primary"
                size="large"
                icon={<CloseCircleOutlined />}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <Empty />
        )}
      </Modal>
      {isSpaceModalOpen ? (
        <Modal
          width={700}
          title="My Space"
          open={true}
          onCancel={() => setIsSpaceModalOpen(false)}
          footer={null}
        >
          <BuySpace />
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
}

export default styled(Header)`
  width: 100%;
  height: 56px;
  line-height: 56px;
  background-color: #121212;
  display: block;
  .user-header{
    width:36px;
    height:36px;
    display: block;
    overflow: hidden;
  }
  .con {
    width: 1200px;
    background-color: #121212;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin: 0 auto;
    height: 56px;
    .logo {
      margin-left: 20px;
      cursor: pointer;
    }
    .content-nav {
      width: 600px;
      margin: 0 auto;
      height: 56px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-direction: row;
      span {
        color: #fff;
        font-size: 14px;
        cursor: pointer;
      }
    }
    .right-btn {
      margin-right: 20px;
      position: relative;
      top: 0;
      .btn {
        color: rgb(148, 214, 226);
        line-height: 38px;
        height: 38px;
        text-align: center;
        display: block;
        overflow: hidden;
        border: 1px solid rgb(148, 214, 226);
        border-radius: 6px;
        padding: 0px 39px;
        cursor: pointer;
      }
      .icon {
        width: 115px;
        height: 36px;
      }
      .menu {
        position: absolute;
        top: 51px;
        right: 0px;
        width: 186px;
        height: 50px;
        background-color: rgba(32, 32, 32, 1);       
        color: #fff;
        border-radius: 5px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        span{
          height: 50px;
          line-height: 50px;
          text-align: center;
        }
        span:hover{
          background-color: #272727;
        }
      }
    }
  }
`;
