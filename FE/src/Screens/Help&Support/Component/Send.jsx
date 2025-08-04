import React from "react";

import Button from "../../../Components/Button";
const NeedHelp = () => {

  return (
    <div className="lg:w-[50%] w-full flex justify-center items-center md:mt-5 mt-7">
      <Button
        btnname="Send"
        btnStyle="text10 text-white"
        divstyle="bg-black dark:bg-cgreen px-14 py-2 rounded-lg"
      />
    </div>
  );
};

export default NeedHelp;
