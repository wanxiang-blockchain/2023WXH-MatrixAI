import "./App.css";
import Header from "./components/Header2";
import HeaderSimple from "./components/HeaderSimple";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Home from "./views/Home";
import Buy from "./views/Buy";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import webconfig from "./webconfig";
import Market from "./views/Market";
import MakeOffer from "./views/MakeOffer";
import OrderDetail from "./views/OrderDetail";
import MyDevice from "./views/MyDevice";
import MyOrder from "./views/MyOrder";
import Faucet from "./views/Faucet";
import ExtendDuration from "./views/ExtendDuration";
import { ConfigProvider, theme } from "antd";
let tout = "";

function App() {
  // const location = useLocation();
  const [isHome, setIsHome] = useState(true);
  useEffect(() => {
    tout = setInterval(function () {
      let tmp = window.location.pathname == "/";
      if (tmp != isHome) {
        setIsHome(tmp);
        console.log(" window.location.pathname", window.location.pathname);
      }
    }, 1000);
    return () => {
      clearInterval(tout);
    };
  }, []);
  console.log("webconfig.isUpgrading", webconfig.isUpgrading);
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        {isHome ? (
          <HeaderSimple className="page-header" />
        ) : (
          <Header className="page-header" />
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market/" element={<Market />} />
          <Route path="/makeoffer/:id" element={<MakeOffer />} />
          <Route path="/order-detail/:id" element={<OrderDetail />} />
          <Route path="/buy/:id" element={<Buy />} />
          <Route path="/mydevice/" element={<MyDevice />} />
          <Route path="/myorder/" element={<MyOrder />} />
          <Route path="/extend-duration/:id" element={<ExtendDuration />} />
          <Route path="/faucet/" element={<Faucet />} />
        </Routes>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
