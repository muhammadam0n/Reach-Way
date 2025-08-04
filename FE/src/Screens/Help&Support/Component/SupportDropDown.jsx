import React from "react";
import DropDown from "../../../Components/DropDown"
import { needhelp } from "../../../Utils/DummyData";
const SupportDropDown = () => {
  return (
    <div>
      <DropDown
        divStyle="md:w-[50%] w-full"
        className="w-full border-none shadow-custom p-3 text11 rounded-lg text-black bg-gray-50
                  block pr-8 appearance-none"
        selectValue={needhelp}
      />
    </div>
  );
};

export default SupportDropDown;
