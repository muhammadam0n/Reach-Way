import React from "react";
import Container from "../../Components/Container";
import AnalyticsProfileCard from "./Components/AnalyticsProfileCard";
import PerformanceCard from "./Components/PerformanceCard";
import { IMAGES } from "../../utils/Images";
import Chart from "./Components/Chart";
import DropDown from "../../Components/DropDown";
import { months } from "../../Utils/DummyData";

const Analytics = () => {
  return (
    <Container search>
      <div className="flex md:flex-row flex-col gap-4">
        <div className="flex flex-col w-full">
          {/* DropDown section  */}
          <div className="w-full hidden md:flex items-center justify-end md:pb-4 pb-4">
            <DropDown
              className="w-auto bg-whiteColor appearance-none outline-none text14 shadow-custom rounded-lg px-6 py-2"
              selectValue={months}
            />
          </div>
          {/* DropDown section  */}
          <div className="w-full flex md:flex-row flex-col gap-4">
            <AnalyticsProfileCard />
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex md:hidden items-center justify-end md:pb-4">
                <DropDown
                  className="w-auto bg-whiteColor appearance-none outline-none text14 shadow-custom rounded-lg px-6 py-2"
                  selectValue={months}
                />
              </div>
              <PerformanceCard />

              {/* Graph Section Start here  */}
              <div className="w-full bg-white px-6 py-4 rounded-lg shadow-custom">
                <div className="w-full flex justify-between md:pb-6 pb-2">
                  <h1 className="font-semibold text10 ">Total Followers</h1>
                  <img
                    className="w-[28px] object-contain"
                    src={IMAGES.INSTA}
                    alt={IMAGES.INSTA}
                    draggable={false}
                  />
                </div>
                <Chart />
              </div>
              {/* Graph Section Start here  */}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Analytics;
