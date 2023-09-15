import styled from "styled-components";
import moment from "moment";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import { Select, Modal, Alert, Spin, message, Table, Empty } from "antd";
import React, { useState, useEffect } from "react";
import { formatDataSource } from "../utils/format-show-type";

function Header({ className, list, loading }) {
  let navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(loading);
  let addr = localStorage.getItem("addr");
  let columnsS = [
    {
      title: "Time",
      width: "14%",
      key: "BuyTime",
      render: (text, record, index) => {
        return (
          <div className="time">
            <div className="y">
              {moment(record.OrderTime).format("YYYY.MM.DD")}
            </div>
            <div className="h">
              {moment(record.OrderTime).format("HH:mm:ss")}
            </div>
          </div>
        );
      },
    },
    {
      title: "Task Name",
      width: "10%",
      key: "TaskName",
      render: (text, record, index) => {
        return record.Metadata?.formData?.taskName || "--";
      },
    },
    {
      title: "Libery/Docker",
      width: "10%",
      key: "Libery",
      render: (text, record, index) => {
        return (
          record.Metadata?.formData?.imageName?record.Metadata?.formData?.imageName+':'+record.Metadata?.formData?.imageTag:
          record.Metadata?.formData?.libery
        );
      },
    },
    {
      title: "Price (h)",
      width: "14%",
      key: "Price",
      render: (text, record, index) => {
        return (
          <div className="price">
            <img src="/img/market/u36.svg" />
            <span>{record.Price}</span>
          </div>
        );
      },
    },
    {
      title: "Remaining Time",
      width: "10%",
      key: "RemainingTime",
      render: (text, record, index) => {
        return <div>{record.RemainingTime}</div>;
      },
    },
    {
      title: "Total",
      width: "10%",
      key: "Total",
      render: (text, record, index) => {
        return (
          <div className="total">
            <label>{text}</label>
            <span>{record.Seller == addr ? "sell" : "buy"}</span>
          </div>
        );
      },
    },
    {
      title: "Status",
      width: "10%",
      key: "StatusName",
      render: (text, record, index) => {
        return <div className={"status-" + record.StatusName}>{text}</div>;
      },
    },
    {
      title: "",
      width: "14%",
      key: "Uuid",
      showType: "btn",
      btnLabel: "Details",
      fun: (text, record, index) => {
        navigate("/order-detail/" + text);
      },
    },
  ];
  useEffect(() => {
    formatDataSource(columnsS, list);
    setColumns(columnsS);
  }, [list]);
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);
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
        {list.length == 0 || isLoading ? (
          <tbody>
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                {isLoading ? (
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
  .mini-btn {
    color: #171717;
    border-radius: 4px;
    padding: 0 11px;
    height: 31px;
    line-height: 31px;
    cursor: pointer;
    font-size: 14px;
    background-color: rgba(148, 214, 226, 1);
    display: inline-block;
    text-align: center;
    overflow: hidden;
  }
  .mini-btn:hover {
    background-color: #bae5ee !important;
  }
  .spin-box {
    width: 100%;
    height: 50px;
    padding: 100px 0;
    display: block;
    overflow: hidden;
    text-align: center;
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
      font-size: 14px;
      color: #ffffff;
      line-height: 20px;
      margin-left: 5px;
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
    font-size: 14px;
    line-height: 20px;
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
      height: 37px;
      line-height: 18px;
      text-align: left;
      padding: 8px 10px;
      font-weight: normal;
    }
    tr td {
      border-bottom: 1px solid #1a1a1a;
      border-collapse: collapse;
      padding: 20px 10px;
      overflow: hidden;
    }
    tr:last-children {
      td {
        border-bottom: none;
      }
    }
  }
  .total {
    display: flex;
    flex-direction: column;
    label {
      font-weight: 700;
      font-style: normal;
      font-size: 14px;
      color: #ffffff;
      text-align: left;
    }
    span {
      padding: 1px;
      background-color: #000;
      color: #797979;
      font-size: 12px;
      border-radius: 6px;
      width: 31px;
      text-align: center;
    }
  }
  .status-Training {
    color: #faffa6;
  }
  .status-Completed {
    color: #bdff95;
  }
  .status-Failed {
    color: #ffb9b9;
  }
`;
