import React from "react";
import Inputfield from "../../../Components/InputField";
import Button from "../../../Components/Button";

const DataPickerComponent = () => {
  return (
    <div className="py-6 flex items-center md:gap-4 gap-2">
      <div
        className="w-[74%] md:w-[90%] flex items-center justify-between pr-2 bg-whiteColor 
    shadow-slate-400 shadow-lg rounded-md"
      >
        <Button
          btnname="Shedule Uploads"
          btnStyle="bg-lightblueColor dark:bg-cgreen text13 text-whiteColor rounded-md sm:px-6 px-4 py-3"
        />
        <Inputfield type="date" />
      </div>
      <Button
        btnname="Edit"
        btnStyle="bg-primaryColor dark:bg-cgreen text13 text-whiteColor rounded-md sm:px-10 px-6 py-3"
      />
    </div>
  );
};

export default DataPickerComponent;
