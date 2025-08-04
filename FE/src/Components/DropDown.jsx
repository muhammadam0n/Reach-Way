import React from "react";
import { IMAGES } from "../Utils/Images";

function DropDown({ selectValue, onSelect, className, optionStyle, onPress, divStyle}) {
  const handleSelectChange = (event) => {
    const selectedOption = event.target.value;
    onSelect(selectedOption); // Notify parent about the change
  };

  return (
    <div className={divStyle ? `relative  ${divStyle}` :`relative`}>
      <select
        onClick={onPress}
        onChange={handleSelectChange}
        className={
          className
            ? className
            : `w-full border border-primaryColor text-primaryColor
          font-medium py-2 text12 rounded-md focus:outline-none mb-2 px-2`
        }
        defaultValue="" // Important for default "Select Platform"
      >
        {/* Default placeholder option */}
        <option value="" disabled>
          Select Platform
        </option>

        {/* Map through actual values */}
        {selectValue?.map((value, index) => (
          <option
            className={`${optionStyle ? optionStyle : "bg-secondaryColor text-black"}`}
            key={index}
            value={value.toLowerCase()}
          >
            {value}
          </option>
        ))}
      </select>

      <div class="absolute inset-y-0 right-[15px] flex items-center pointer-events-none">
        <img src={IMAGES.DROPDOWN} className="md:w-4 md:h-2 w-2 h-2" />
      </div>
    </div>
  );
}

export default DropDown;
