// import React from "react";

// const CardCalendar = ({ card = [] }) => {
//   return (
//     <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2  grid-cols-1 ">
//       {card.map((member, ind) => (
//         <div
//           key={ind}
//           className="rounded-lg shadow-custom bg-white overflow-hidden p-4"
//         >
//           {/* Image Section */}
//           <div className="relative h-[220px]">
//             <img
//               src={member.img1}
//               alt="Main"
//               className="w-full h-full object-cover rounded-xl"
//             />
//             <img
//               src={member.img3}
//               alt="Icon"
//               className="absolute left-4 -bottom-4 w-10 h-10"
//             />
//           </div>

//           {/* Edit Icon */}
//           <div className="flex justify-end mt-4">
//             <img
//               src={member.img2}
//               alt="Edit Icon"
//               className="w-6 h-6 cursor-pointer"
//             />
//           </div>

//           {/* Card Details */}
//           <div className="mt-4">
//             <div className="flex justify-between">
//               <p className="text-black font-semibold text-lg">
//                 {member.heading}
//               </p>
//               <div className="flex items-center gap-2">
//                 <p className="text-black font-medium text-sm">{member.day}</p>
//                 <span>|</span>
//                 <p className="text-gray-600 text-sm">{member.date}</p>
//               </div>
//             </div>
//             <p className="text-gray-600 mt-2 text-sm">{member.para}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CardCalendar;
const CardCalendar = ({ card = [] }) => {  // Ensure card is always an array
  return (
    <div className="gridclass gap-10 pt-5">
      {
        card.map((member, ind) => (
          <div key={ind} className="rounded-lg shadow-custom bg-white overflow-hidden p-4">
            {/* ImageSection */}
            <div className="relative h-[220px]">
              <img src={member.img1} alt="Main" className="w-full h-full relative rounded-xl" />
              <img src={member.img3} alt="Icon" className="absolute left-4 -bottom-4 w-[40px] h-[40px]" />
            </div>

            {/* Text1 */}
            <div className="flex flex-row justify-end mt-4">
              <img src={member.img2} alt="Edit Icon" className="sm:w-[20px] sm:h-[20px] w-[25px] h-[25px]" />
            </div>

            {/* Text2 */}
            <div className="flex flex-row justify-between mt-4">
              <p className="text-black lg:text10 md:text11 text9 font-Barlow font-semibold">{member.heading}</p>
              <div className="flex flex-row justify-between">
                <p className="text-black lg:text10 md:text11 text9 font-semibold">{member.day}</p>
                <span className="px-2 text9 text-gray1">|</span>
                <p className="text-black lg:text10 md:text11 text9">{member.date}</p>
              </div>
            </div>

            {/* Text3 */}
            <p className="lg:text11 md:text11 mt-2">{member.para}</p>
          </div>
        ))
      }
    </div>
  );
};

export default CardCalendar;