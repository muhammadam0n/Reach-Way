import React from "react";
import PostNow from "./Components/PostNow";
import Container from "../../Components/Container";
import Calendar from "./Components/Calendar";
const index = () => {
  return (
    <Container>
      <Calendar />
      <PostNow />
    </Container>
  );
};

export default index;
