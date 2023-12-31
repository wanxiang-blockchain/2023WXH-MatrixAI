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
import { Input, Alert, Button, message, Spin, Empty } from "antd";
import React, { useState, useEffect, useRef } from "react";
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
import { getDetailByUuid, getLogList } from "../services/order";
import Footer from "../components/footer";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { XTerm } from "xterm-for-react";
const showLogType = "xterm";

function Home({ className }) {
  const xtermRef = useRef(null);
  const { id } = useParams();
  document.title = "Order detail";
  let navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [record, setRecord] = useState();
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLog, setLoadingLog] = useState(false);

  const loadDetail = async () => {
    setLoading(true);
    let res = await getDetailByUuid(id);
    console.log("----------getOrderDetailById--------------");
    console.log(res);
    setRecord(res);
    setLoading(false);
    loadLogs();
  };
  const loadLogs = async () => {
    setLoadingLog(true);
    let res = await getLogList(id, 1, 100);
    console.log("----------getOrderDetailById--------------");
    console.log(res);
    setLogs(res.list);
    setLoadingLog(false);
    if (showLogType == "xterm") {
      setTimeout(function () {
        initTerm(res.list);
      }, 1000);
    }
  };

  useEffect(() => {
    // getDetail(id).then((t) => {
    //   setRecord(t);
    // }, console.log);
    // let arr = [];
    // for (let i = 0; i < 1000; i++) {
    //   arr.push(
    //     "/home/aistudio/base/dataset_ui.py:324: GradioDeprecationWarning: The `style` method is deprecated. Please set these arguments in the constructor instead."
    //   );
    // }
    // setLogs(arr);
    loadDetail();
  }, [id]);

  const initTerm = (list) => {
    // const terminal = new Terminal();
    // const fitAddon = new FitAddon();
    // terminal.loadAddon(new WebLinksAddon());
    // terminal.loadAddon(fitAddon);
    // terminal.open(document.getElementById("terminal"));
    // fitAddon.fit();
    // list.forEach((t) => {
    //   t.ContentArr.forEach((c) => {
    //     console.log(c)
    //     if(c) terminal.writeln(c);
    //   });
    // });

    list.forEach((t) => {
      t.ContentArr.forEach((c) => {
        xtermRef.current.terminal.writeln(c);
      });
    });
  };

  return (
    <div className={className}>
      <div className="hold"></div>
      <div className="con">
        <h1 className="title">Details</h1>
        <div className="d" style={{ width: "70%" }}>
          {loading ? (
            <Spin />
          ) : record && record.Metadata.machineInfo ? (
            <div className="detail">
              <div className="info-box">
                <div className="info-box-title">Configuration</div>
                <div className="info-box-body">
                  <div className="title2">
                    # {record.Metadata.machineInfo.UuidShort}
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>
                        {record.Metadata.machineInfo.GpuCount +
                          "x " +
                          record.Metadata.machineInfo.Gpu}
                      </span>
                      <span>{record.Metadata.machineInfo.TFLOPS || "--"} TFLOPS</span>
                    </div>
                    <div className="r">
                      <span>Region</span>
                      <span>{record.Metadata.machineInfo.Region}</span>
                    </div>
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>RAM</span>
                      <span>{record.Metadata.machineInfo.RAM}</span>
                    </div>
                    <div className="r">
                      <span>Reliability</span>
                      <span>{record.Metadata.machineInfo.Reliability}</span>
                    </div>
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>CPU</span>
                      <span>{record.Metadata.machineInfo.Cpu}</span>
                    </div>
                    <div className="r">
                      <span>CPS</span>
                      <span>{record.Metadata.machineInfo.Score}</span>
                    </div>
                  </div>
                  <div className="line">
                    <div className="f">
                      <span>Internet Seed</span>
                      <span>
                        <img
                          src="/img/market/u27.svg"
                          style={{ transform: "rotate(180deg)" }}
                        />{" "}
                        {record.Metadata.machineInfo.UploadSpeed || "--"}{" "}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <img src="/img/market/u27.svg" />{" "}
                        {record.Metadata.machineInfo.DownloadSpeed || "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="info-box">
                <div className="info-box-title">Task Info</div>
                <div className="info-box-body">
                  <div className="title2">
                    {record.Metadata.formData.taskName}
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>Start Time</span>
                      <span>{record.Metadata.formData.buyTime}</span>
                    </div>
                    <div className="r">
                      <span>Remaining Time</span>
                      <span>{record.RemainingTime}</span>
                    </div>
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>Estimate the computing time</span>
                      <span>{record.Duration}h</span>
                    </div>
                    <div className="r">
                      <span>Duration</span>
                      <span>{record.Duration}h</span>
                    </div>
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>Provider</span>
                      <span>{record.Seller}</span>
                    </div>
                    {record.Metadata.formData.imageName ? (
                      <div className="r">
                        <span>Docker Image</span>
                        <span>
                          {record.Metadata.formData.imageName} :{" "}
                          {record.Metadata.formData.imageTag}
                        </span>
                      </div>
                    ) : (
                      <div className="r">
                        <span>Libery</span>
                        <span>{record.Metadata.formData.libery}</span>
                      </div>
                    )}
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>Dataset Size</span>
                      <span>{record.Metadata.formData.batchsize}MB</span>
                    </div>
                    <div className="r">
                      <span>Dataset URL</span>
                      <span>{record.Metadata.formData.dataUrl}</span>
                    </div>
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>Price</span>
                      <span>{record.Metadata.machineInfo.Price} MAI / h</span>
                    </div>
                    <div className="r">
                      <span>Total</span>
                      <span>{record.Total} MAI</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="info-box">
                <div className="info-box-title">Blockchain Info</div>
                <div className="info-box-body">
                  <div className="line">
                    <div className="l">
                      <span>Hash</span>
                      <span>{record.Uuid}</span>
                    </div>
                  </div>
                  <div className="line">
                    <div className="l">
                      <span>From</span>
                      <span>{record.Seller}</span>
                    </div>
                    <div className="r">
                      <span>To</span>
                      <span>{record.Buyer}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="color-box">
                <div className="l">
                  <span>Status</span>
                  <label>{record.StatusName}</label>
                </div>
                <div className="r">
                  <span className="pointer" onClick={() => setShowLogs(true)}>
                    LOG
                  </span>
                  {record.Status == 0 ? (
                    <label
                      className="pointer"
                      onClick={() =>
                        navigate("/extend-duration/" + record.Uuid)
                      }
                    >
                      Extend Duration
                    </label>
                  ) : record.Status == 1&& record.Metadata.formData.libType=='lib'? (
                    <label
                      className="pointer"
                      onClick={() =>
                        window.open(record.Metadata.formData.modelUrl)
                      }
                    >
                      Download Result
                    </label>
                  ) : (
                    <label className="disable">Extend Duration</label>
                  )}
                </div>
              </div>
            </div>
          ) : (
            "No Data"
          )}
        </div>
      </div>
      <div className={showLogs ? "log-box is-show" : "log-box"}>
        <div className="log-header">
          <div className="log-header-con">
            Log
            <div className="log-btn">
              <span onClick={loadLogs} title="Refresh">
                <i className={loadingLog ? "rotate" : ""}></i>
              </span>
              <label onClick={() => setShowLogs(false)} title="Close">
                <i></i>
              </label>
            </div>
          </div>
        </div>
        <div className="log-body">
          <div className="log-list">
            {logs.length == 0 ? <div className="log-item">No Data</div> : ""}
            <XTerm ref={xtermRef} />
            {/* {showLogType != "xterm" &&
              logs.map((l,i) => {
                return (
                  <div className="log-item" key={i}>
                    <span>{l.CreatedAtStr}</span>
                    {l.ContentArr.map((t,j) => {
                      return <label key={j}>{t}</label>;
                    })}
                  </div>
                );
              })} */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default styled(Home)`
  display: block;
  background-color: #000;
  color: #fff;
  .is-show {
    bottom: 0 !important;
  }
  .log-box {
    position: fixed;
    left: 0;
    bottom: -2000px;
    display: block;
    overflow: hidden;
    z-index: 999;
    background-color: #0f0f0f;
    width: 100%;
    transition: bottom 0.5s;
    .log-header {
      width: 100%;
      height: 40px;
      line-height: 40px;
      background-color: #282828;
      .log-header-con {
        width: 1160px;
        padding: 0 20px;
        margin: 0 auto;
        position: relative;
        left: 0;
        text-align: center;
        font-size: 16px;
        color: #fff;
        font-weight: bold;
        .log-btn {
          position: absolute;
          right: 0;
          top: 3px;
          display: flex;
          width: 88px;
          span,
          label {
            width: 36px;
            height: 18px;
            background-color: #373737;
            display: block;
            margin: 8px 4px;
            cursor: pointer;
            i {
              background-repeat: no-repeat;
              background-size: 11px;
              background-position: center;
              width: 18px;
              height: 18px;
              margin: 0 auto;
              display: block;
              overflow: hidden;
              transition: all 0.5s;
            }
          }
          span i {
            background-image: url(/img/market/reback.svg);
          }
          label i {
            background-image: url(/img/market/close.svg);
          }
          span:hover,
          label:hover {
            /* transform: rotate(360deg); */
            background-color: rgba(91, 91, 91, 1);
          }
        }
      }
    }
    .log-body {
      width: 100%;
      display: block;
      .log-list {
        width: 1160px;
        padding: 20px;
        background-color: #000;
        margin: 50px auto;
        height: 400px;
        display: block;
        overflow: hidden;
        border-radius: 5px;
        .log-item {
          display: block;
          overflow: hidden;
          word-wrap: break-word;
          clear: both;
          font-size: 14px;

          line-height: 24px;
          span {
            padding-right: 10px;
            color: #797979;
          }
          label {
            color: #fff;
            display: block;
            overflow: hidden;
            clear: both;
          }
        }
      }
    }
  }
  .con {
    width: 1160px;
    margin: 10px auto;
    padding: 0 20px;
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
  .info-box {
    display: block;
    .info-box-title {
      font-weight: bold;
      font-size: 16px;
      color: #ffffff;
      border-bottom: 1px solid #797979;
      line-height: 48px;
    }
    .info-box-body {
      padding: 5px 18px;
      display: block;
      .title2 {
        line-height: 20px;
        padding: 15px 0 7px;
        font-size: 18px;
        font-weight: bold;
      }
      .line {
        padding: 10px 0;
        display: flex;
        flex-direction: row;
        .f {
          width: 100%;
        }
        span {
          line-height: 24px;
          display: block;
          clear: both;
          font-size: 14px;
        }
        .l {
          width: 50%;
        }
        .r {
          width: 50%;
        }
      }
    }
  }
  .b-box {
    display: block;
    padding: 30px;
    border: 1px solid rgba(121, 121, 121, 1);
    border-radius: 5px;
    margin: 20px 0;
    .row {
      display: block;
      line-height: 30px;
      font-size: 14px;
      text-align: center;
      b {
        font-size: 24px;
      }
    }
  }
  .right-txt {
    display: block;
    overflow: hidden;
    text-align: right;
    line-height: 30px;
    font-size: 14px;
  }
  .color-box {
    border-radius: 5px;
    background-color: #151515;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 25px 10px;
    .l {
      display: flex;
      flex-direction: column;
      span {
        font-size: 14px;
        color: #ffffff;
        line-height: 25px;
      }
      label {
        font-size: 18px;
        color: #faffa6;
        font-weight: bold;
        line-height: 25px;
      }
    }
    .r {
      display: flex;
      flex-direction: row;
      align-items: center;
      span,
      .pointer,
      .disable {
        width: 150px;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        color: #151515;
        text-align: center;
        margin: 0 5px;
        border-radius: 4px;
      }
      span {
        background-color: #e0c5bd;
      }
      span:hover {
        background-color: #f7dfd8;
      }
      .pointer {
        background-color: #92d5e1;
      }
      .pointer:hover {
        background-color: #bae5ee !important;
      }
      .disable {
        cursor: not-allowed;
        background-color: #2f2f2f;
      }
    }
  }
`;
