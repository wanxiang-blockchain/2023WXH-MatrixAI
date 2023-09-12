import styled from "styled-components";
import _ from "lodash";
import { useNavigate, useParams, NavLink } from "react-router-dom";

import { Select, Modal, Spin, Menu, message, Table, Empty } from "antd";
import React, { useState, useEffect } from "react";
import { getAPI, getKeyring } from "../utils/polkadot";
import * as util from "../utils";
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

function Header({ className, list, isMyDevice, loading,reloadFunc }) {
  let navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const cancelOffer = async (row) => {
    let id = row.Uuid;
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
              if(reloadFunc){
                reloadFunc();
              }
              row.Status = 0;
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
  let columnsS = [
    {
      title: isMyDevice ? "Device" : "Provider",
      width: "14%",
      key: "addr",
      render: (text, record, index) => {
        return (
          <div className="provider">
            {isMyDevice && record.Status > 0 ? (
              <div className={"status status" + record.Status}>
                {record.Status == 1 ? "Listing" : "Training"}
              </div>
            ) : (
              ""
            )}
            <div className="addr">{record.Addr}</div>
            <div className="id"># {record.UuidShort}</div>
            <div className="reliability">
              <span className="l">
                <label>{record.Reliability || "--"}</label>
                <span>Reliability</span>
              </span>
              <span className="r">
                <label>{record.Score}</label>
                <span>CPS</span>
              </span>
            </div>
            <div className="region">
              <img src="/img/market/global.svg" />
              <span>{record.Region}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Configuration",
      width: "15%",
      key: "Algorithm",
      render: (text, record, index) => {
        return (
          <div className="configuration">
            <div className="gpu">{record.GpuCount + "x " + record.Gpu}</div>
            <div className="graphicsCoprocessor">#{record.Cpu}</div>
            <div className="more">
              <span className="l">
                <label>{record.TFLOPS || "--"}</label>
                <span>TFLOPS</span>
              </span>
              <span className="l">
                <label>{record.RAM}</label>
                <span>RAM</span>
              </span>
              <span className="l">
                <label>{record.Disk} GB</label>
                <span>Avail Disk Storage</span>
              </span>
            </div>
            <div className="dura">
              <label>Max Duration: {record.MaxDuration}</label>
              <span>
                <img className="t180" src="/img/market/u26.svg" />{" "}
                {record.UploadSpeed}
              </span>
              <font>
                <img src="/img/market/u26.svg" /> {record.DownloadSpeed}
              </font>
            </div>
          </div>
        );
      },
    },
    {
      title: "Price (h)",
      width: "12%",
      key: "Price",
      render: (text, record, index) => {
        if (record.Status == 0) {
          return <span className="no-price">- -</span>;
        }
        return (
          <div className="price">
            <img src="/img/market/u36.svg" />
            <span>{record.Price}</span>
          </div>
        );
      },
    },
    {
      title: "",
      width: "13%",
      key: "Id",
      render: (text, record, index) => {
        return (
          <span
            className={isMyDevice?"mini-btn mini-btn" + record.Status:"mini-btn mini-btn0"}
            onClick={() => {
              let addr = localStorage.getItem("addr");
              if (!addr && window.onShowLoginBox) {
                return window.onShowLoginBox();
              }
              if (!isMyDevice) {
                return navigate("/buy/" + record.Uuid);
              }
              if (record.Status == 0) {
                return navigate("/makeoffer/" + record.Uuid);
              }
              if (record.Status == 1) {
                return cancelOffer(record);
              }
              return util.alert("Is training status.");
            }}
          >
            {!isMyDevice
              ? "Select"
              : record.Status == 0
              ? "Make Offer"
              : "Unlist"}
          </span>
        );
      },
    },
  ];
  useEffect(() => {
    formatDataSource(columnsS, list);
    setColumns(columnsS);
  }, [list]);

  return (
    <div className={className}>
      <table className="mytable">
        <thead className="table-thead">
          <tr>
            {columns.map((c) => {
              return (
                <th key={c.title} style={{ width: c.width }}>
                  {c.title}
                </th>
              );
            })}
          </tr>
        </thead>
        {list.length == 0 ||loading? (
          <tbody>
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                {loading ? (
                  <div className="spin-box">
                    <Spin tip="Loading..." size="large" />
                  </div>
                ) : (
                  <Empty
                    description={"No item yet"}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {list.map((d, index) => {
              return (
                <tr key={index}>
                  {columns.map((c, i) => {
                    if (c.render) {
                      return (
                        <td style={{ width: c.width }} key={i}>
                          {c.render(d[c.key], d, i)}
                        </td>
                      );
                    } else {
                      return (
                        <td key={i} style={{ width: c.width }}>
                          {d[c.key]}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        )}
      </table>
    </div>
  );
}

export default styled(Header)`
  .spin-box {
    width: 100%;
    height: 50px;
    padding: 100px 0;
    display: block;
    overflow: hidden;
    text-align: center;
  }
  .no-price {
    font-weight: 700;
    font-style: normal;
    font-size: 20px;
    color: #ffffff;
  }
  .mini-btn {
    color: #171717;
    border-radius: 4px;
    height: 31px;
    line-height: 31px;
    cursor: pointer;
    font-size: 14px;
    display: block;
    text-align: center;
    overflow: hidden;
    margin-right: 10px;
    width: 102px;
    float: right;
  }
  .mini-btn0 {
    background-color: rgba(148, 214, 226, 1);
  }
  .mini-btn0:hover {
    background-color: #bae5ee;
  }
  .mini-btn1 {
    background-color: rgba(255, 185, 185, 1);
  }
  .mini-btn2 {
    background-color: rgba(70, 70, 70, 1);
  }
  .mini-btn1:hover {
    background-color: rgba(255, 214, 214, 1);
  }
  .t180 {
    transform: rotate(180deg);
  }
  .price {
    display: flex;
    clear: both;
    flex-direction: row;
    align-items: center;
    img {
      width: 20px;
    }
    span {
      font-size: 20px;
      color: #ffffff;
      line-height: 20px;
      margin-left: 5px;
      font-weight: bold;
    }
  }
  .mytable {
    display: table;
    background-color: #222;
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
      background-color: #151515;
      color: #fff;
      height: 40px;
      line-height: 40px;
      text-align: left;
      padding: 0 10px;
      font-weight: normal;
    }
    tr td {
      border-bottom: 1px solid #1a1a1a;
      border-collapse: collapse;
      padding: 0 10px;
      overflow: hidden;
    }
    tr:last-children {
      td {
        border-bottom: none;
      }
    }
  }
  .provider {
    width: 237px;
    padding: 20px 0 15px;
    .status {
      width: 77px;
      height: 19px;
      line-height: 19px;
      color: #333;
      border-radius: 4px;
      display: block;
      overflow: hidden;
      text-align: center;
      font-size: 12px;
      margin-bottom: 10px;
    }
    .status0 {
      display: none;
    }
    .status1 {
      background-color: #f7ffad;
    }
    .status2 {
      background-color: #b6ff9e;
    }
    .addr {
      display: block;
      font-size: 16px;
      color: #94d6e2;
      line-height: 20px;
    }
    .id {
      font-size: 13px;
      color: #797979;
      line-height: 15px;
    }
    .reliability {
      display: flex;
      clear: both;
      flex-direction: row;
      padding: 13px 0;
      .l {
        width: 50%;
        display: flex;
        flex-direction: column;
        label {
          font-size: 16px;
          color: #e0c4bd;
          font-weight: bold;
          line-height: 20px;
        }
        span {
          color: #797979;
          font-size: 13px;
          line-height: 15px;
        }
      }
      .r {
        width: 50%;
        display: flex;
        flex-direction: column;
        label {
          font-size: 16px;
          color: #efc6ff;
          font-weight: bold;
          line-height: 20px;
        }
        span {
          color: #797979;
          font-size: 13px;
          line-height: 15px;
        }
      }
    }
    .region {
      display: flex;
      clear: both;
      flex-direction: row;
      align-items: center;
      img {
        width: 14px;
      }
      span {
        font-size: 14px;
        color: #ffffff;
        line-height: 20px;
        margin-left: 5px;
      }
    }
  }
  .configuration {
    width: 573px;
    padding: 10px 0 0px;
    .gpu {
      font-size: 24px;
      color: #ffffff;
      line-height: 20px;
    }
    .graphicsCoprocessor {
      font-size: 14px;
      color: #d7ff65;
      background-image: url(/img/market/u70.svg);
      background-size: 16px;
      background-repeat: no-repeat;
      background-position: left;
      text-indent: 20px;
      line-height: 40px;
    }
    .more {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      margin-top: 11px;
      .l {
        margin-right: 69px;
        label {
          display: block;
          font-size: 16px;
          line-height: 26px;
          color: #ffffff;
        }
        span {
          display: block;
          color: #797979;
          font-size: 13px;
          line-height: 13px;
        }
      }
    }
    .dura {
      color: #ffffff;
      font-size: 13px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      height: 40px;
      line-height: 40px;
      label {
        width: 200px;
      }
      span {
        width: 120px;
        text-indent: 20px;
        img {
          width: 11px;
        }
      }
      font {
        background-size: 10px;
        background-position: left;
        background-repeat: no-repeat;
        width: 120px;
        text-indent: 20px;
        position: relative;
        top: 0;
        img {
          width: 11px;
        }
      }
    }
  }
`;
