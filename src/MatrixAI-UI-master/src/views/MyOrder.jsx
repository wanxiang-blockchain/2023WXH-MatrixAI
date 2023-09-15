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
import { Modal, Alert, Select, message, Table, Empty } from "antd";
import React, { useState, useEffect } from "react";
import PolkadotLogo from "../statics/polkadot-logo.svg";
import { getAPI, getKeyring } from "../utils/polkadot";
import { formatAddress } from "../utils";
import Identicon from "@polkadot/react-identicon";
import Img from "../components/Img";
import OrderList from "../components/OrderList";
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
// import { getList } from "../services/machine";
import { getOrderList, getFilterData } from "../services/order";
import { formatBalance } from "../utils/formatter";
import Pager from "../components/pager";
import Footer from "../components/footer";

let filter = {};

function Home({ className }) {
  document.title = "My Order";
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({});
  const [filterData, setFilterData] = useState([]);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterValue, setFilterValue] = useState({});

  const loadList = async (curr) => {
    setLoading(true);
    let res = await getOrderList(curr, filter);
    console.log("Order List", res);
    setTotal(res.total);
    setList(res.list);
    setLoading(false);
  };
  const loadFilterData = async () => {
    let res = await getFilterData();
    console.log("FilterData", res);
    setFilterData(res);
    res.forEach((t) => {
      filter[t.name] = "all";
    });
    setFilterValue(filter);
  };

  useEffect(() => {
    let addr = localStorage.getItem("addr");
    if (!addr) {
      window.showLoginBox();
    }
    loadFilterData();
    loadList(1);
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
        <h1 className="title">My Orders</h1>
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
          <span className="btn-txt" onClick={onResetFilter}>
            reset
          </span>
        </div>
        <div className="con-table">
          <OrderList list={list} loading={loading} />
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
        </div>
      </div>

      
      <Footer />
    </div>
  );
}

export default styled(Home)`
  display: block;
  width: 100%;
  height: 100vh;
  background-color: #000;
  color: #fff;
  .pager{
    margin:0 auto;
    width:400px;
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
  .con {
    width: 1200px;
    padding: 0 20px;
    margin: 10px auto;
    display: block;
    .title {
      font-family: "Montserrat Bold", "Montserrat", sans-serif;
      font-weight: 700;
      font-style: normal;
      font-size: 28px;
      color: #ffffff;
      padding-left: 36px;
      background-image: url(/img/market/2.png);
      background-repeat: no-repeat;
      background-size: 26px;
      background-position: left;
      margin-top: 25px;
    }
  }
  .block {
    display: block;
    overflow: hidden;
  }
`;
