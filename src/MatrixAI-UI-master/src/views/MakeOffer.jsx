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
import { Input, Alert, Button, message, notification, Empty } from "antd";
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
import { refreshBalance } from "../services/account";
import { getMachineDetailByUuid } from "../services/machine";

let inputValues = {
  price: 0,
  duration: 0,
  disk: 0,
};

function Home({ className }) {
  const { id } = useParams();
  let navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deviceDetail, setDeviceDetail] = useState({});
  const [maxStorge, setMaxStorge] = useState(0);

  const init = async () => {
    let detail = await getMachineDetailByUuid(id);
    if (detail) {
      setDeviceDetail(detail);
      setMaxStorge(parseInt(detail.Metadata?.DiskInfo?.TotalSpace));
      // if (t.addr == addr) {
      //   util.alert("Unable to purchase one's own machine");
      //   navigate("/market/");
      // }
    }
    console.log("***********device detail*****************");
    console.log(detail);
  };

  useEffect(() => {
    document.title = "Make Offer";
    let addr = localStorage.getItem("addr");
    if (!addr) {
      window.showLoginBox();
    }
    init();    
  }, [id]);
  const onInput = (e, n) => {
    let v = parseInt(e.target.value);
    if (!e.target.value || isNaN(e.target.value)) {
      v = 0;
    }
    inputValues[n] = v;
  };
  const onSubmit = async () => {
    let tprice = inputValues.price * 1000000000000;
    let maxDuration = inputValues.duration;
    let disk = inputValues.disk;
    if (tprice <= 0) {
      return util.showError("The price must be an integer greater than 0");
    }
    if (maxDuration <= 0) {
      return util.showError(
        "The max duration must be an integer greater than 0"
      );
    }
    if (disk <= 0) {
      return util.showError("The disk must be an integer greater than 0");
    }
    if (disk > maxStorge) {
      return util.showError("Max storage is " + maxStorge+'GB.');
    }

    util.loading(true);
    setLoading(true);
    let api = await getAPI();
    let addr = localStorage.getItem("addr");
    await web3Enable("my cool dapp");
    const injector = await web3FromAddress(addr);
    api.tx.hashrateMarket
      .makeOffer(id, tprice, maxDuration, disk)
      .signAndSend(
        addr,
        { signer: injector.signer },
        (status) => {
          console.log("status****", status);
          try {
            console.log("status.status.toJSON()", status.status.toJSON());
            console.log("isFinalized", status.isFinalized);
            if (status.isFinalized) {
              //ok
              util.loading(false);
              setLoading(false);
              util.showOK("Make offer success!");
              refreshBalance();
              window.freshBalance();
              navigate("/mydevice/");
            }
          } catch (e) {
            util.alert(e.message);
            util.loading(false);
            setLoading(false);
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
          setLoading(false);
          // setBuySpacing(false);
        }
      );
  };

  return (
    <div className={className}>
      <div className="hold"></div>
      <div className="con">
        <h1 className="title">Make Offer</h1>
        <div className="myform">
          <div className="form-row">
            <div className="row-txt">Price (per hour)</div>
            <Input
              onChange={(e) => onInput(e, "price")}
              type="number"
              className="my-input"
              placeholder="Enter an integer"
              max={99999}
            />
            <span className="uni">MAI</span>
          </div>
          <div className="form-row">
            <div className="row-txt">Max duration</div>
            <Input
              onChange={(e) => onInput(e, "duration")}
              type="number"
              className="my-input"
              placeholder="Enter an integer"
              max={99999}
            />
            <span className="uni">Hour</span>
          </div>
          <div className="form-row">
            <div className="row-txt">Max disk storage</div>
            <div className="row-title2">Avail Disk Storage: {maxStorge}GB</div>
            <Input
              onChange={(e) => onInput(e, "disk")}
              type="number"
              className="my-input"
              placeholder="Enter an integer"
              max={99999}
            />
            <span className="uni">GB</span>
          </div>
          {/* <div className="form-row">
            <div className="row-txt drow">
              <img src="/img/dot.svg" />
              <span className="num" style={{fontSize:28}}>{price}</span>
              <label style={{fontSize:13,color:"#bbb",fontWeight:'normal'}}>MAI</label>
            </div>
          </div> */}
          <div className="form-row">
            <Button
              loading={loading}
              disabled={loading}
              type="primary"
              style={{ marginTop: 30 }}
              onClick={onSubmit}
              className="cbtn"
            >
              Confirm
            </Button>
          </div>
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
  .mini-btn {
    border: 1px solid #fff;
  }
  .drow {
    display: flex !important;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    width: 200px;
    margin-top: 20px;
  }
  .uni {
    position: absolute;
    bottom: 16px;
    font-size: 14px;
    right: 15px;
    color: #fff;
  }
  .row-title2 {
    font-size: 14px;
    color: #e0c4bd;
    line-height: 24px;
    display: block;
    margin-bottom: 10px;
  }
  .con {
    width: 1200px;
    padding: 0 20px;
    margin: 10px auto;
    display: block;
    overflow: hidden;
    .title {
      font-family: "Montserrat Bold", "Montserrat", sans-serif;
      font-weight: 700;
      font-style: normal;
      font-size: 28px;
      color: #ffffff;
      margin-top: 25px;
      line-height: 70px;
    }
  }
  .block {
    display: block;
    overflow: hidden;
  }
  .mini-btn {
    color: #fff;
    border: 1px solid #fff;
    border-radius: 4px;
    padding: 0 10px;
    height: 30px;
    line-height: 30px;
    cursor: pointer;
  }
  .ant-btn-primary {
    background-color: rgba(148, 214, 226, 1) !important;
    color: #000;
    height: 50px;
    line-height: 40px;
    width: 130px;
  }
  .mytable {
    display: table;
    border: 1px solid #fff;
    border-radius: 10px;
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    overflow: hidden;
    .link {
      color: #fff;
      cursor: pointer;
    }
    .btn-link {
      color: #fff;
      cursor: pointer;
      text-decoration: underline;
    }
    th {
      background-color: #92d5e1;
      color: #000;
      height: 40px;
      line-height: 40px;
      text-align: left;
      padding: 0 10px;
    }
    tr td {
      border-bottom: 1px solid #fff;
      border-collapse: collapse;
      height: 40px;
      line-height: 40px;
      padding: 0 10px;
    }
    tr:last-children {
      td {
        border-bottom: none;
      }
    }
  }
`;
