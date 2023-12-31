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
import { submit } from "../services/faucet";
import { formatAddress } from "../utils";
import Identicon from "@polkadot/react-identicon";
import Img from "../components/Img";
import * as util from "../utils";

let formData = {};

function Home({ className }) {
  document.title = "Faucet";
  let addr = localStorage.getItem("addr");
  const [loading, setLoading] = useState(false);
  const [newAddr, setNewAddr] = useState();
  const onInput = (e) => {
    let v = e.target.value;
    setNewAddr(v);
  };
  useEffect(() => {
    setNewAddr(addr);
  }, []);
  const onSubmit = async () => {
    if (!newAddr) {
      return util.alert("Please Enter Your Wallet Address.");
    }
    setLoading(true);
    let t = await submit({
      Address: newAddr,
    });
    setLoading(false);
    if (t.Status && t.Status == "Success") {
      if (t.Result.AsInBlock) {
        util.alert("Submitted successfully!");
      } else {
        util.alert("Only submitted once in 24 hours.");
      }
    } else {
      util.alert(t.Result.Err);
    }
  };

  return (
    <div className={className}>
      <div className="hold"></div>
      <div className="con">
        <h1 className="title">MatrixAI Genesis MAI Faucet</h1>
        <h2 className="title2">Testnet faucet drips 100 MAI per day</h2>
        <div className="myform">
          <div className="form-row">
            <div className="tip1">
              1. Install the polkadot.js extension from the{" "}
              <a href="https://polkadot.js.org/extension/" target="_blank">
                Web Store.
              </a>
            </div>
            <div className="tip1">
              2. Create a new wallet OR import an existing wallet.
            </div>
            <Input
              className="my-input"
              data-name="taskName"
              onChange={onInput}
              onKeyUp={onInput}
              disabled={loading}
              value={newAddr}
              placeholder="Enter Your Wallet Address"
              allowClear={true}
            />
          </div>
          <div className="form-row">
            <Button
              className="mybtn22 cbtn"
              loading={loading}
              disabled={loading}
              style={{ width: 152 }}
              type="primary"
              onClick={onSubmit}
            >
              Send Me MAI
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default styled(Home)`
  display: block;
  overflow: hidden;
  width: 100%;
  height: 100vh;
  background-color: #000;
  color: #fff;
  .hold {
    display: block;
    overflow: hidden;
    width: 100%;
    height: 56px;
    clear: both;
  }
  .myform {
    width: 800px;
    background-color: #222;
    padding: 46px;
    display: block;
    overflow: hidden;
    margin: 40px auto;
    .form-row {
      .tip1,
      .tip2 {
        font-size: 16px;
        color: #797979;
        line-height: 30px;
        a {
          font-family: "Montserrat", sans-serif;
          font-weight: 400;
          font-style: normal;
          font-size: 16px;
          color: #94d6e2;
          line-height: 30px;
          text-decoration: none;
        }
      }
      .my-input {
        border: 1px solid #797979;
        margin: 24px 0;
        background-color: #222;
      }
      input{
        background-color: #222;
      }
      .mybtn22 {
        height: 50px;
        line-height: 40px;
        margin: 20px auto;
        display: block;
        color: #070706 !important;
      }
    }
  }
  .mini-btn {
    border: 1px solid #fff;
  }
  .con {
    width: 1210px;
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
      line-height: 24px;
      text-align: center;
    }
    .title2 {
      font-family: "Montserrat Bold", "Montserrat", sans-serif;
      font-size: 16px;
      color: #797979;
      text-align: center;
      line-height: 20px;
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
    color: #000;
    height: 50px;
    line-height: 40px;
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
