import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Button } from "antd";

function Header({ width,height,onClick,label }) {
  const [w, setW] = useState(width);
  const [h, setH] = useState(height);
  const onPagerChange = (c) => {
    setCurr(c);
    console.log(c);
    onChange(c);
  };
  useEffect(() => {
    setCurr(current);
  }, [current]);
  return (
    <Button className="mybutton" style={{width:width,height:height}} />
  );
}

export default styled(Header)`
  .mybutton{
    background-color: #92d5e1 !important;
  }
  .mybutton:hover{
    background-color: #aaa !important;
  }
`;
