import { getAPI, getKeyring } from "../utils/polkadot";
import cache from "../utils/store";
import * as util from "../utils";
import { refreshBalance } from "./account";
import moment from "moment";
import { getMachineList, getMachineDetailByUuid } from "./machine";
import webconfig from "../webconfig";
import { formatAddress, formatBalance } from "../utils/formatter";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { getTimeDiff } from "time-difference-js";

export async function getOrderList(pageIndex, filter) {
  try {
    let obj = cache.get("order-list");
    if (webconfig.isDebug && obj) {
      return obj;
    }
    let apiUrl = "/api/order/mine";
    let options = {
      data: {
        Page: pageIndex,
        PageSize: 10,
      },
    };
    if (filter) {
      for (let k in filter) {
        let v = filter[k];
        if (v && v != "all") {
          if (k == "Status") v = parseInt(v);
          options.data[k] = v;
        }
      }
    }
    let Account = localStorage.getItem("addr");
    if (Account) {
      options.headers = {
        Account,
      };
    }
    let ret = await util.request.post(apiUrl, options);
    if (ret.Msg != "success") {
      util.alert(ret.msg);
      return null;
    }
    let total = ret.Data.Total;
    let list = ret.Data.List;
    for (let item of list) {
      formatOrder(item);
    }
    console.log(list);
    obj = { list, total };
    cache.set("order-list", obj);
    return obj;
  } catch (e) {
    console.log(e);
    return null;
  }
}
function formatOrder(item) {
  try {
    if (item.Metadata) {
      item.Metadata = JSON.parse(item.Metadata);
    }
    item.Buyer = formatAddress(item.Buyer);
    item.Seller = formatAddress(item.Seller);
    item.Price = formatBalance(item.Price);
    item.Total = formatBalance(item.Total);
    if (item.Status == 0) {
      let endTime = moment(item.OrderTime).add(item.Duration, "hours").toDate();
      let result = getTimeDiff(new Date(), endTime);
      item.RemainingTime = result.value + " " + result.suffix;
    } else {
      item.RemainingTime = "--";
    }
    item.StatusName =
      item.Status == 0 ? "Traning" : item.Status == 1 ? "Completed" : "Failed";
  } catch (e) {}
}
export async function getFilterData() {
  let list = [];
  list.push({
    name: "Direction",
    arr: [
      { label: "All Orders", value: "all" },
      { label: "Buy", value: "buy" },
      { label: "Sell", value: "sell" },
    ],
  });
  list.push({
    name: "Status",
    arr: [
      { label: "All Status", value: "all" },
      { label: "Training", value: "0" },
      { label: "Completed", value: "1" },
      { label: "Failed", value: "2" },
    ],
  });
  return list;
}
export async function getDetailByUuid(uuid) {
  let obj = cache.get("order-list");
  if (!obj) {
    util.showError("Order list not found.");
    return null;
  }
  let orderDetail = obj.list.find((t) =>t.Uuid == uuid);
  if (!orderDetail) {
    util.showError("Order detail of " + uuid + " not found.");
    console.log(obj.list);
    return null;
  }
  return orderDetail;
}

export async function placeOrder(machineInfo, formData, total, cb) {
  let orderId = new Date().valueOf();
  orderId = "999" + orderId.toString();
  let seller = machineInfo.Owner;
  let machineId = machineInfo.Uuid;
  formData.buyTime = moment().format("YYYY-MM-DD HH:mm:ss");
  let metadata = JSON.stringify({ machineInfo, formData });
  util.loading(true);
  let api = await getAPI();
  let addr = localStorage.getItem("addr");
  await web3Enable("my cool dapp");
  const injector = await web3FromAddress(addr);
  api.tx.hashrateMarket
    .placeOrder(orderId, seller, machineId, formData.duration, metadata)
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
            util.showOK("Place order success!");
            refreshBalance();
            cb(true);
          }
        } catch (e) {
          util.alert(e.message);
          util.loading(false);
          cb(false);
        }
      },
      (e) => {
        console.log("===========", e);
        cb(false);
      }
    )
    .then(
      (t) => console.log,
      (ee) => {
        util.loading(false);
        // setBuySpacing(false);
      }
    );
}
export async function renewOrder(orderId, duration, cb) {
  util.loading(true);
  let api = await getAPI();
  let addr = localStorage.getItem("addr");
  await web3Enable("my cool dapp");
  const injector = await web3FromAddress(addr);
  api.tx.hashrateMarket
    .renewOrder(orderId, duration)
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
            util.showOK("Place order success!");
            refreshBalance();
            cb(true);
          }
        } catch (e) {
          util.alert(e.message);
          util.loading(false);
          cb(false);
        }
      },
      (e) => {
        console.log("===========", e);
        cb(false);
      }
    )
    .then(
      (t) => console.log,
      (ee) => {
        util.loading(false);
        // setBuySpacing(false);
      }
    );
}

export async function getLiberyList() {
  return [
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
  ];
}
export async function getModelList() {
  return [
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
    { label: "aaaaaa", value: "aaaaaaa" },
  ];
}
export async function getLogList(orderUuid, pageIndex, pageSize) {
  try {
    orderUuid='0xb711ebf34e474f4db43198e23a59d433';

    let obj = cache.get("log-list");
    if (webconfig.isDebug && obj) {
      return obj;
    }
    let apiUrl = "/api/log/list";
    let options = {
      data: {
        Page: pageIndex || 1,
        OrderUuid: orderUuid,
        PageSize: pageSize || 20,
      },
    };
    let ret = await util.request.post(apiUrl, options);
    if (ret.Msg != "success") {
      util.alert(ret.msg);
      return null;
    }
    let total = ret.Data.Total;
    let list = ret.Data.List;
    for (let item of list) {
      item.CreatedAtStr = moment(item.CreatedAt).format("MM-DD HH:mm:ss");
    }
    console.log(list);
    obj = { list, total };
    cache.set("log-list", obj);
    return obj;
  } catch (e) {
    console.log(e);
    return null;
  }
}
