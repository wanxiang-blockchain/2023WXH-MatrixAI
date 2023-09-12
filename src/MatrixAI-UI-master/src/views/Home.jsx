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
import { Modal, Alert, Menu, message, Popconfirm, Empty } from "antd";
import React, { useState, useEffect } from "react";
import PolkadotLogo from "../statics/polkadot-logo.svg";
import { getAPI, getKeyring } from "../utils/polkadot";
import { formatAddress } from "../utils";
import Identicon from "@polkadot/react-identicon";
import Footer from "../components/footer";
import Img from "../components/Img";
import * as util from "../utils";
import { formatImgUrl, formatterSize } from "../utils/formatter";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { subscribe } from "../services/mailbox";

function Home({ className }) {
  document.title = "MatrixAI Home";
  const [email, setEmail] = useState();
  const onInputEmail = (e) => {
    let v = e.target.value;
    console.log(v);
    setEmail(v);
  };
  const onSubmitEmail = () => {
    if (!validateEmail(email)) {
      return message.error("Email error.");
    }
    message.loading("loading...");
    let data = { mailbox: email };
    subscribe(data).then((t) => {
      console.log(t);
      message.destroy();
      message.success("Success.");
    });
  };
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  return (
    <div className={className}>
      <div className="content">
        {/* <div className="hold"></div> */}
        <div className="box1">
          <h1>Decentralized AI Computing Power Network</h1>
          <a
            className="play-btn"
            href="https://www.youtube.com/watch?v=KW5pfcClfuM"
            target="_blank"
          >
            {" "}
            Play Video
          </a>
        </div>
        <div className="box2">
          <div className="con">
            <h1>How to buy computing power with wallet</h1>
            <div className="line-box1"></div>
            <div className="line-box2"></div>
            <div className="mini-boxs">
              <div className="img-box">
                <img src="/img/home/box2-1.png" />
                <span>Create an account on polkadot.js</span>
              </div>
              <div className="img-box">
                <img src="/img/home/box2-2.png" />
                <span>Select a provider of computing power</span>
              </div>
              <div className="img-box">
                <img src="/img/home/box2-3.png" />
                <span>Buy the computing power</span>
              </div>
            </div>
            <div className="mini-boxs2">
              <div className="left">
                <h2>What is MatrixAI</h2>
                <span>
                  MatrixAI is a user-friendly, efficient AI computing power
                  network. With the protocol of the calculation proof, we aim to
                  provide a secure and simple trading experience. On MatrixAI,
                  it connects idle machines in global, and only takes you a few
                  minutes to buy computing power from anywhere at any time, then
                  training your AI model.
                </span>
              </div>
              <div className="right"></div>
            </div>
          </div>
        </div>
        <div className="box3">
          <div className="con">
            <h3>Why buy computing power with MatrixAI</h3>
            <div>
              <span
                style={{
                  backgroundImage: "url(/img/home/box3-1.png)",
                  backgroundSize: 64,
                }}
              >
                <font>Fast</font>
                <label>
                  MatrixAI users can instantly buy computing power with crypto
                  and uses the algorithm to start traning the AI model in
                  minutes
                </label>
              </span>
              <span style={{ backgroundImage: "url(/img/home/box3-2.png)" }}>
                <font>Low Cost</font>
                <label>
                  MatrixAI uses idle resources to support user training AI
                  models
                </label>
              </span>
              <span style={{ backgroundImage: "url(/img/home/box3-3.png)" }}>
                <font>Proof of Calculation</font>
                <label>
                  MatrixAI will provide a dynamic proof of calculation to ensure
                  that the provider's machine is truthful working
                </label>
              </span>
            </div>
          </div>
        </div>
        <div className="box4">
          <div className="box4-1">
            <div className="box4-2">
              <div className="t1">Polkadot Hackathon</div>
              <div className="t2">2023 Summer</div>
              <div className="t3">Second Place</div>
              <a
                className="t4"
                target="_blank"
                href="https://medium.com/@OneBlockplus/awards-announcement-polkadot-hackathon-2023-summer-demoday-has-concluded-successfully-9194a321af73"
              >
                More Details &gt;&gt;&gt;
              </a>
              <div className="t5">
                <a className="t5-1" href="#"></a>
                <a className="t5-2" href="#"></a>
              </div>
            </div>
          </div>
        </div>
        <div className="box5">
          <div className="con">
            <div className="t1">Backer</div>
            <div className="pater">
              <a className="l1"></a>
              <a className="l3"></a>
              <a className="l4"></a>
            </div>
          </div>
        </div>
        <div className="box6">
          <div className="con">
            <div className="t1">Learn more about MatrixAI</div>
            <div className="t2">
              Subscribe to the latest news from MatrixAI to stay informed about
              project updates in real time.
            </div>
            <div className="sub-box">
              <input
                onChange={onInputEmail}
                onKeyUp={onInputEmail}
                placeholder="email@your.domain"
                type="text"
                className="tb-mail"
              />
              <span onClick={onSubmitEmail}>Subscribe</span>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default styled(Home)`
  display: block;
  font-family: "Montserrat", "Montserrat Bold", "Montserrat Regular", sans-serif;
  @font-face {
    font-family: "Montserrat Bold";
    src: url("/font/Montserrat-Bold.ttf");
  }
  @font-face {
    font-family: "Montserrat Regular";
    src: url("/font/Montserrat-Regular.ttf");
  }
  @font-face {
    font-family: "Montserrat";
    src: url("/font/Montserrat.ttf");
  }
  .content {
    min-width: 1200px;
    display: block;
    overflow: hidden;
  }
  .con {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    padding: 0 20px;
  }
  .block {
    display: block;
    overflow: hidden;
  }
  .hold {
    display: block;
    overflow: hidden;
    width: 100%;
    height: 56px;
    clear: both;
    background-color: rgb(0, 0, 0);
  }
  .box1 {
    background-image: url(/img/home/u29.png);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 600px;
    display: block;
    overflow: hidden;
    h1 {
      width: 100%;
      line-height: 100px;
      text-align: center;
      color: #000;
      font-weight: bold;
      font-size: 48px;
      margin-top: 220px;
    }
    .play-btn {
      background-image: url(/img/home/u44.svg);
      background-repeat: no-repeat;
      background-size: 20px;
      background-position: 10px;
      width: 150px;
      height: 40px;
      line-height: 40px;
      text-indent: 49px;
      display: block;
      margin: 42px auto;
      background-color: rgba(0, 0, 0, 1);
      border-radius: 5px;
      font-family: "Montserrat", sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: #ffffff;
      text-decoration: none;
    }
    .play-btn:hover {
      background-color: rgb(49 49 49);
    }
  }
  .box2 {
    text-align: center;
    background-color: #000;
    padding: 100px 0;
    color: #fff;
    .con {
      position: relative;
      top: 0;
    }
    h1 {
      text-align: center;
      display: block;
      width: 100%;
      font-size: 40px;
    }
    .line-box1,
    .line-box2 {
      width: 155px;
      height: 2px;
      display: block;
      overflow: hidden;
      position: absolute;
      top: 235px;
      background-image: url(/img/home/box-2-line.svg);
      background-repeat: repeat-x;
      background-position: center;
    }
    .line-box1 {
      left: 22%;
    }
    .line-box2 {
      left: 62%;
    }
    .mini-boxs {
      display: flex;
      flex-direction: row;
      width: 100%;
      margin: 100px auto;
      justify-content: space-between;
      .img-box {
        width: 25%;
        img {
          width: 114px;
        }
        .box-line {
          width: 75%;
          margin-top: 79px;
        }
        span {
          display: block;
          clear: both;
          height: 80px;
          line-height: 80px;
          font-size: 16px;
          color: #fff;
          text-align: center;
          overflow: hidden;
          font-family: "Montserrat", sans-serif;
        }
      }
    }
    .mini-boxs2 {
      display: flex;
      flex-direction: row;
      width: 100%;
      padding: 69px 0px 20px;
      .left {
        width: 50%;
        text-align: left;
        padding-top: 100px;
        h2 {
          margin-top: 0;
          margin-bottom: 0.5em;
          font-family: "Montserrat Bold", "Montserrat Regular", "Montserrat",
            sans-serif;
          font-weight: 700;
          font-style: normal;
          font-size: 40px;
        }
        span {
          font-family: "Montserrat", sans-serif;
          font-weight: 400;
          font-style: normal;
          font-size: 16px;
          color: #ffffff;
          line-height: 24px;
          max-width: 550px;
          overflow: hidden;
          display: block;
        }
      }
      .right {
        width: 50%;
        background-image: url(/img/home/box-2-4.png);
        background-repeat: no-repeat;
        background-size: 74%;
        background-position: right;
        height: 451px;
      }
    }
  }
  .box3 {
    background-color: rgb(146 213 225);
    height: 600px;
    display: block;
    overflow: hidden;
    .con {
      display: block;
      padding: 117px 0;
      h3 {
        font-family: "Montserrat Bold", "Montserrat Regular", "Montserrat",
          sans-serif;
        font-weight: 700;
        font-style: normal;
        font-size: 40px;
        color: #000000;
        text-align: center;
      }
      div {
        display: flex;
        flex-direction: row;

        span {
          width: 27.33%;
          margin: 0 3%;
          display: flex;
          flex-direction: column;
          background-repeat: no-repeat;
          background-position: top;
          background-size: 84px;
          margin-top: 57px;
          font {
            width: 100%;
            font-family: "Montserrat Bold", "Montserrat Regular", "Montserrat",
              sans-serif;
            font-weight: 700;
            font-style: normal;
            font-size: 18px;
            color: #000000;
            text-align: center;
            line-height: 50px;
            margin-top: 122px;
          }
          label {
            font-family: "Montserrat", sans-serif;
            font-weight: 400;
            font-style: normal;
            font-size: 14px;
            color: #000000;
            text-align: center;
            line-height: 23px;
          }
        }
      }
    }
  }
  .box4 {
    display: block;
    width: 100%;
    height: 600px;
    overflow: hidden;
    background-color: rgba(40, 17, 61, 1);
    .box4-1,
    .box4-2 {
      width: 100%;
      height: 600px;
      display: block;
      overflow: hidden;
      background-repeat: no-repeat;
      background-size: contain;
    }
    .box4-1 {
      background-position: left;
      background-image: url(/img/home/box4-1.png);
    }
    .box4-2 {
      background-position: right;
      background-image: url(/img/home/box4-2.png);
      padding: 38px 0;
    }
    .t1 {
      text-align: center;
      height: 60px;
      line-height: 60px;
      color: #fff;
      font-size: 48px;
      margin-top: 43px;
    }
    .t2 {
      text-align: center;
      line-height: 48px;
      font-weight: 700;
      font-style: normal;
      font-size: 48px;
      color: #c8ff00;
    }
    .t3 {
      width: 300px;
      height: 74px;
      display: block;
      margin: 69px auto 30px;
      background-color: rgba(200, 255, 0, 1);
      border-radius: 20px;
      font-size: 36px;
      color: #28113d;
      text-align: center;
      line-height: 74px;
      font-family: "Montserrat", sans-serif;
    }
    .t4 {
      font-size: 14px;
      color: #c8ff00;
      text-align: center;
      width: 100%;
      display: block;
    }
    .t5 {
      width: 240px;
      display: block;
      overflow: hidden;
      height: 200px;
      margin: 15px auto 0;
      background-image: url(/img/home/box4-3.png);
      background-repeat: no-repeat;
      background-size: 100%;
      background-position: center;
    }
  }
  .box5 {
    background-color: #000;
    display: block;
    padding: 50px 0;
    height: 600px;
    overflow: hidden;
    .con {
      flex-direction: column;
      .t1 {
        font-weight: 700;
        font-size: 40px;
        color: #ffffff;
        text-align: center;
        margin-top: 88px;
        line-height: 95px;
      }
      .pater {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 200px;
        a {
          width: 25%;
          background-repeat: no-repeat;
          background-position: center;
          height: 200px;
          display: block;
          overflow: hidden;
          background-size: 70%;
          margin: 0 4.16%;
        }
        .l1 {
          background-image: url(/img/home/box5-1.png);
        }
        .l2 {
          background-size: 80%;
          background-image: url(/img/home/box5-2.png);
        }
        .l3 {
          background-size: 25%;
          background-image: url(/img/home/box5-3.png);
        }
        .l4 {
          background-image: url(/img/home/box5-4.png);
        }
      }
    }
  }
  .box6 {
    background-color: #000;
    display: block;
    padding: 80px 0 76px;
    .con {
      flex-direction: column;
      .t1 {
        font-weight: 700;
        font-size: 40px;
        color: #ffffff;
        text-align: center;
        font-family: "Montserrat Bold", "Montserrat Regular", "Montserrat",
          sans-serif;
      }
      .t2 {
        width: 653px;
        font-size: 16px;
        color: #ffffff;
        text-align: center;
        overflow: hidden;
        display: block;
        line-height: 24px;
        margin: 20px auto;
        font-family: "Montserrat", sans-serif;
      }
      .sub-box {
        display: flex;
        flex-direction: row;
        width: 700px;
        overflow: hidden;
        margin: 50px auto;
        input {
          width: 560px;
          height: 50px;
          padding: 2px 10px 2px 10px;
          font-family: "Montserrat", sans-serif;
          font-size: 14px;
          color: #ffffff;
          background-color: transparent;
          border: 1px solid #fff;
          border-radius: 5px;
          margin-right: 10px;
          outline: none;
        }
        span {
          width: 130px;
          height: 50px;
          line-height: 50px;
          text-align: center;
          background-color: rgba(148, 214, 226, 1);
          border-width: 1px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 1);
          border-radius: 5px;
          font-family: "Montserrat", sans-serif;
          color: #070706;
          font-size: 14px;
          cursor: pointer;
        }
        span:hover {
          background-color: rgba(186, 229, 238, 1);
        }
      }
    }
  }
`;
