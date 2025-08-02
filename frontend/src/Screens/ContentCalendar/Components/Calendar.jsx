import React, { useState, useEffect } from "react";
import Inputfield from "../../../Components/InputField";
import { carddata } from "../../../Utils/DummyData";
import moment from "moment";
import CardCalendar from "./CardCalendar";
import { IMAGES } from "../../../Utils/Images";

const Calendar = () => {
  const today = moment();
  const [userDate, setUserDate] = useState(today.format("YYYY-MM-DD"));
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(today.format("ddd"));

  const filterData = (selectedDate) => {
    const formattedDate = moment(selectedDate, "YYYY-MM-DD").format("ddd / D");
    const filtered = carddata.filter((item) => {
      const cardDate = `${item.day} / ${item.date}`;
      return cardDate === formattedDate;
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData(userDate);
  }, [userDate]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    console.log(newDate);
    const dayOfWeek = moment(newDate, "YYYY-MM-DD").format("ddd");

    setSelectedDay([dayOfWeek]);
    setUserDate(newDate);
  };
  console.log(userDate);

  return (
    <div className="p-4">
      <div
        className="w-fit flex flex-rows gap-4 shadow-custom p-5 rounded-lg cursor-pointer bg-white"
        onClick={() => {
          document.querySelector("input[type='date']").showPicker();
        }}
      >
        <p className="lg:text9 md:text8 sm:text4 text9 ">{selectedDay}</p>
        <span className="lg:text9 md:text8 sm:text4 text9 text-gray1">|</span>
        <p className="lg:text9 md:text8 sm:text4 text9 ">{userDate}</p>
        <div className="relative flex items-center">
          <input
            type="date"
            value={userDate}
            onChange={handleDateChange}
            className="cursor-pointer border rounded-md shadow-sm w-full opacity-0 absolute inset-0 z-10"
          />
          <img
            src={IMAGES.DROPDOWN}
            alt="dropdown"
            className="cursor-pointer md:w-[15px] sm:h-[10px] w-[13px] h-[8px]"
          />
        </div>
      </div>

      <div className="mt-6">
        {filteredData.length > 0 ? (
          <CardCalendar card={filteredData} />
        ) : (
          <p className="text-gray-500 dark:text-white">
            No cards available for the selected date.
          </p>
        )}
      </div>
    </div>
  );
};

export default Calendar;
