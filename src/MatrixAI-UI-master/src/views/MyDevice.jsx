import styled from "styled-components";
import _ from "lodash";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import {
  PlayCircleOutlined,
  CloudUploadOutlined,
  WalletOutlined,
  SearchOutlined,
  HomeOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Modal, Alert, Menu, message, Table, Empty } from "antd";
import React, { useState, useEffect } from "react";
import PolkadotLogo from "../statics/polkadot-logo.svg";
import { getAPI, getKeyring } from "../utils/polkadot";
import { formatAddress } from "../utils";
import Identicon from "@polkadot/react-identicon";
import Img from "../components/Img";
import * as util from "../utils";
import { formatImgUrl, formatterSize } from "../utils/formatter";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";

import {
  formatArr,
  formatOne,
  formatDataSource,
} from "../utils/format-show-type";
import { getMachineList } from "../services/machine";
import { refreshBalance } from "../services/account";
import { formatBalance } from "../utils/formatter";
import DeviceList from "../components/DeviceList";

function Home({ className }) {
  const { keyword, cat } = useParams();
  document.title = "Market";
  let navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let addr = localStorage.getItem("addr");
    if (!addr) {
      window.showLoginBox();
    }
  }, []);

  // const onItemBtnClick = (text, record, index) => {
  //   // console.log(text, record, index);
  //   // record.status=="Idle"?"Make Offer":"Cancel"
  //   if (record.status == "Idle") {
  //     navigate("/makeoffer/" + record.id);
  //   } else {
  //     //cacel
  //     cancelOffer(record.id);
  //   }
  // };

  const cancelOffer = async (id) => {
    util.loading(true);
    let api = await getAPI();
    let addr = localStorage.getItem("addr");
    await web3Enable("my cool dapp");
    const injector = await web3FromAddress(addr);
    api.tx.hashrateMarket
      .cancelOffer(id)
      .signAndSend(
        addr,
        { signer: injector.signer },
        (status) => {
          console.log("status****", status);
          try {
            console.log("status.status.toJSON()", status.status.toJSON());
            console.log("isFinalized", status.isFinalized);
            if (status.isFinalized) {
              util.showOK("Cancel offer success!");
              loadList();
              refreshBalance();
              util.loading(false);
            }
          } catch (e) {
            util.alert(e.message);
            util.loading(false);
          }
        },
        (e) => {
          console.log("===========", e);
        }
      )
      .then(
        (t) => console.log,
        (ee) => {
          util.loading(false);
          // setBuySpacing(false);
        }
      );
  };

  const loadList = async () => {
    setLoading(true);
    let res = await getMachineList(true, 1);
    console.log("List", res);
    setList(res.list);
    setLoading(false);
  };
  useEffect(() => {
    loadList();
  }, []);

  return (
    <div className={className}>
      <div className="hold"></div>
      <div className="con">
        <h1 className="title">Share My Device</h1>
        <div className="con-table">
          <DeviceList
            list={list}
            isMyDevice={true}
            loading={loading}
            reloadFunc={loadList}
          />
        </div>
      </div>
    </div>
  );
}

export default styled(Home)`
  display: block;
  width: 100%;
  height: 100vh;
  background-color: #000;
  color: #fff;
  .con {
    width: 1200px;
    margin: 10px auto;
    display: block;
    padding: 0 20px;
    .title {
      font-family: "Montserrat Bold", "Montserrat", sans-serif;
      font-weight: 700;
      font-style: normal;
      font-size: 28px;
      color: #ffffff;
      padding-left: 36px;
      background-image: url(/img/market/2.png);
      background-repeat: no-repeat;
      background-size: 32px;
      background-position: left;
      margin-top: 25px;
    }
    .filter {
      padding: 11px 0;
      display: flex;
      flex-direction: row;
      line-height: 30px;
      .txt {
        font-size: 14px;
        line-height: 30px;
        height: 30px;
        display: block;
      }
      .sel {
        padding: 0px 7px;
      }
      .btn-txt {
        font-weight: 700;
        font-size: 14px;
        text-decoration: underline;
        color: #ffffff;
        cursor: pointer;
      }
    }
  }
  .block {
    display: block;
    overflow: hidden;
  }
  .pager {
    display: flex;
  }
`;
