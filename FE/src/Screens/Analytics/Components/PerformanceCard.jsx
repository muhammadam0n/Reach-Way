import React from "react";
import DropDown from "../../../Components/DropDown";
import { months, performanceData } from "../../../Utils/DummyData";

const PerformanceCard = () => {
  return (
    <div>
      <div className="w-full h-auto  bg-whiteColor shadow-custom rounded-lg md:px-6 px-3 py-2">
        <h1 className="font-semibold text10 md:pb-4 pb-2">Performance</h1>
        <div className="grid grid-cols-3 py-4 md:gap-6 gap-2">
          {performanceData.map((data) => (
            <div>
              <h1 className="text-[#B3B3B3] pb-1 text14 font-medium">
                {data.name}
              </h1>
              <div className="flex items-center md:gap-2 gap-1">
                <h2 className="text-primaryColor text14 font-bold">
                  {data.number}
                </h2>
                <p className="text-lightblueColor text16">{data.pernt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;
