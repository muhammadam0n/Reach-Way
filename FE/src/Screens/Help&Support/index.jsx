import React from "react";
import Send from "./Component/Send"
import Container from "../../Components/Container";
import SupportDropDown from "./Component/SupportDropDown";
import TextArea from "./Component/TextArea";
import UploadDoc from "./Component/UploadDoc";
const index = () => {
  return (
    <Container>
    <SupportDropDown/>
    <TextArea/>
    <UploadDoc/>
    <Send/>
    </Container>
  );
};

export default index;
