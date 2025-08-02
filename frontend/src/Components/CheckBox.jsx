import React, { useState } from "react";
import { IMAGES } from "../Utils/Images";

const CheckBox = () => {
  const [isChecked, setIsChecked] = useState(true);

  const handleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <>
      <div>
        <div
          onClick={handleCheckbox}
          className={`${
            isChecked ? "bg-checkBoxColor" : "bg-transparent"
          }  cursor-pointer flex items-center justify-center rounded-sm 
          lg:w-[18px] md:w-[16px] sm:w-[14px] w-[18px] lg:h-[18px] md:h-[16px] 
          sm:h-[14px] h-[18px]`}
        >
          {isChecked ? (
            <img
              className="w-[12px] h-[12px] object-contain"
              src={IMAGES.TICKMARK}
              alt={IMAGES.TICKMARK}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export default CheckBox;
