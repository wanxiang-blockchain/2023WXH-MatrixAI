import { NavLink, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import logo from "../statics/imgs/logo.png";

function Header({ className }) {
  let navigate = useNavigate();
  return (
    <div className={className}>
      <div className="con">
        <img
          src={logo}
          style={{
            width: "120px",
          }}
        />
        <span onClick={() => navigate("/market/")}>Launch APP</span>
      </div>
    </div>
  );
}

export default styled(Header)`
  width: 100%;
  height: 56px;
  line-height: 56px;
  background-color: #121212;
  display: block;
  .con {
    width: 1200px;
    background-color: #121212;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    overflow: hidden;
    margin: 0 auto;
    height: 56px;
    img {
      margin-left: 20px;
      cursor: pointer;
    }
    span {
      margin-right: 20px;
      color: rgb(148, 214, 226);
      line-height: 38px;
      height: 38px;
      text-align: center;
      display: block;
      overflow: hidden;
      border: 1px solid rgb(148, 214, 226);
      border-radius: 6px;
      padding: 0px 39px;
      cursor: pointer;
    }
  }
`;
