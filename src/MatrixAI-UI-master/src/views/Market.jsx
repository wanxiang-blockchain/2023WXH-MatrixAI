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
import { Select, Modal, Alert, Menu, message, Table, Empty } from "antd";
import React, { useState, useEffect } from "react";
import PolkadotLogo from "../statics/polkadot-logo.svg";
import { getAPI, getKeyring } from "../utils/polkadot";
import { formatAddress } from "../utils";
import Identicon from "@polkadot/react-identicon";
import DeviceList from "../components/DeviceList";
import Pager from "../components/pager";
import Footer from "../components/footer";
import { getMachineList, getFilterData } from "../services/machine";

let filter = {};

function Home({ className }) {
  document.title = "Market";
  let navigate = useNavigate();
  const [list, setList] = useState([]);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [filterValue, setFilterValue] = useState({});

  const loadList = async (curr) => {
    setLoading(true);
    let res = await getMachineList(false, curr, filter);
    console.log("List", res);
    if (!res) {
      return;
    }
    setTotal(res.total);
    setList(res.list);
    setLoading(false);
  };
  const loadFilterData = async () => {
    setLoading(true);
    let res = await getFilterData();
    console.log("FilterData", res);
    setFilterData(res);
    res.forEach((t) => {
      filter[t.name] = "all";
    });
    setFilterValue(filter);
    setLoading(false);
  };

  useEffect(() => {
    loadFilterData();
    loadList();
  }, []);

  const onFilter = (v, n) => {
    filter[n] = v;
    console.log({ filter });
    setFilterValue(filter);
    setCurrent(1);
    loadList(1);
  };
  const onResetFilter = () => {
    filterData.forEach((t) => {
      filter[t.name] = "all";
    });
    setFilterValue(filter);
    setCurrent(1);
    loadList(1);
  };

  const onPagerChange = (curr) => {
    setCurrent(curr);
    loadList(curr);
  };

  return (
    <div className={className}>
      <div className="con">
        <h1 className="title">Computing Power Market</h1>
        <div className="filter">
          <span className="txt">Filter</span>
          {filterData.map((t) => {
            return (
              <span className="sel" key={t.name}>
                <Select
                  defaultValue="all"
                  value={filterValue[t.name]}
                  style={{ width: 160 }}
                  data-name={t.name}
                  onChange={(e) => onFilter(e, t.name)}
                  options={t.arr}
                />
              </span>
            );
          })}
          {loading ? (
            ""
          ) : (
            <span className="btn-txt" onClick={onResetFilter}>
              reset
            </span>
          )}
        </div>
        <div className="con-table">
          <DeviceList list={list} loading={loading} />
        </div>
        {total > 10 ? (
          <Pager
            current={current}
            total={total}
            pageSize={10}
            onChange={onPagerChange}
            className="pager"
          />
        ) : (
          ""
        )}
        <Footer />
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
  .hold {
    display: block;
    overflow: hidden;
    width: 100%;
    height: 56px;
    clear: both;
  }
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
      background-image: url(/img/market/1.png);
      background-repeat: no-repeat;
      background-size: 20px;
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
