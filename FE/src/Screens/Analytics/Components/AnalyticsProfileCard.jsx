import React from "react";
import { profileCard } from "../../../Utils/DummyData";

const AnalyticsProfileCard = () => {
  return (
    <div
      className="md:w-[110px] w-full custom-scrollbar mx-auto overflow-x-auto md:h-[100%] 
        md:py-6 py-4 px-2 md:px-0 bg-whiteColor shadow-custom rounded-xl flex md:flex-col 
        flex-row items-end justify-between md:gap-6 gap-4"
    >
      {profileCard.map((member, ind) => (
        <div key={ind} className="cursor-pointer relative shrink-0">
          {member.rank && (
            <div
              className="bg-lightblueColor md:w-[20px] w-[19px] md:h-[20px] h-[19px] 
              flex items-center justify-center rounded-full text-gray absolute z-20"
            >
              <p className="text16">{member.rank}</p>
            </div>
          )}
          <img
            src={member.img}
            alt={member.img}
            draggable={false}
            className="md:w-[60px] w-[50px] shadow-custom object-contain rounded-full"
          />
          <div className="shrink-0 absolute w-[22px] z-20 md:ml-9 ml-8 -mt-4">
            <img
              src={member.platform}
              alt={member.platform}
              draggable={false}
              className="lg:w-8 w-8"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsProfileCard;
