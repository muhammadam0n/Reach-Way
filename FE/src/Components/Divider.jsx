import React from "react";

const Divider = ({ dividerwithtext, text, borderStyle, textStyle }) => {
  return (
    <>
      {dividerwithtext ? (
        <div className="flex items-center my-1 w-full">
          <div
            className={`flex-grow border-t border-gray-300 ${borderStyle}`}
          />
          <span className={`mx-2 text10 text-gray-500 ${textStyle}`}>{text}</span>
          <div
            className={`flex-grow border-t border-gray-300 ${borderStyle}`}
          />
        </div>
      ) : (
        <div className="w-full">
          <div
            className={`${
              borderStyle ? borderStyle : "border-borderColor"
            } border-[1px] my-1`}
          />
        </div>
      )}
    </>
  );
};

export default Divider;
