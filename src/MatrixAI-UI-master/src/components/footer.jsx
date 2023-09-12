import { NavLink, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

function Header({ className }) {
  return (
    <div className={className}>
      <div className="pater">
        <a
          className="l1"
          target="_blank"
          href="https://github.com/MatrixAI-Lab"
        ></a>
        <a
          className="l2"
          target="_blank"
          href="https://www.youtube.com/watch?v=KW5pfcClfuM"
        ></a>
        <a
          className="l3"
          target="_blank"
          href="https://twitter.com/MatrixAI_web3"
        ></a>
        <a className="l4" target="_blank" href="https://t.me/hanleeeeeee"></a>
      </div>
      <div className="copyright">
        Copyright © MatrixAI 2023 All Rights Reserved
      </div>
    </div>
  );
}

export default styled(Header)`
  padding: 40px 0;
  display: block;
  overflow: hidden;
  clear: both;
  .pater {
    display: flex;
    flex-direction: row;
    width: 300px;
    height: 20px;
    margin: 20px auto;
    a {
      width: 25%;
      background-repeat: no-repeat;
      background-position: center;
      height: 20px;
      display: block;
      overflow: hidden;
      background-size: 29%;
    }
    .l1 {
      background-image: url(/img/home/box-5-1.png);
    }
    .l2 {
      background-image: url(/img/home/box-5-2.png);
    }
    .l3 {
      background-image: url(/img/home/box-5-3.png);
    }
    .l4 {
      background-image: url(/img/home/box-5-4.png);
    }
  }
  .copyright {
    width: 100%;
    height: 20px;
    color: #666666;
    text-align: center;
    display: block;
    line-height: 20px;
    font-size: 13px;
  }
`;
