import React, { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import AnalyticsDetails from "./AnalyticsDetails";
const SelectedCards = () => {
  const [selected, setSelected] = useState("User Engagement");

  const handleChange = (selectedTab) => {
    setSelected(selectedTab);
  };
  return (
    <div className='md:p-4 p-2' >
      <div className="flex md:items-center md:justify-center gap-4 overflow-x-auto scroll-snap-x py-4">
        <div
          onClick={() => handleChange("User Engagement")}
          className="w-full bg-whiteColor flex items-center justify-between p-6 cursor-pointer rounded-lg shadow-md scroll-snap-start"
        >
          <span className='text9'>User Engagement</span>
          <span>
            {selected === "User Engagement" ? (
              <MdKeyboardArrowUp size={24} />
            ) : (
              <MdKeyboardArrowDown size={24} />
            )}
          </span>
        </div>

        <div
          onClick={() => handleChange("Follower Analysis")}
          className="w-full bg-whiteColor flex items-center justify-between p-6 cursor-pointer rounded-lg shadow-md scroll-snap-start"
        >
          <span className='text9'>Follower Analysis</span>
          <span>
            {selected === "Follower Analysis" ? (
              <MdKeyboardArrowUp size={24} />
            ) : (
              <MdKeyboardArrowDown size={24} />
            )}
          </span>
        </div>

        {/* Add more cards as needed */}
      </div>



      <AnalyticsDetails selected={selected} />
    </div>
  );
};

export default SelectedCards;
