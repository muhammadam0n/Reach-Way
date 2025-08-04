import React, { useState } from "react";
import { TiStarFullOutline } from "react-icons/ti";

export default function Rating({ eatery = { rating: 0 } }) {
  const [rating, setRating] = useState(eatery.rating);
  const [hoverValue, setHoverValue] = useState(undefined);

  const stars = Array(5).fill(0);

  const colors = { yellow: "#d0a704", grey: "#d3d3d3" };

  const handleMouseOverStar = (value) => {
    setHoverValue(value);
  };

  const handleMouseLeaveStar = () => {
    setHoverValue(undefined);
  };
  const handleClickStar = (value) => {
    setRating(value);
  };

  return (
    <div className="flex">
      {stars.map((_, index) => {
        return (
          <TiStarFullOutline
            key={index}
            size={24}
            value={rating}
            color={(hoverValue || rating) > index ? colors.yellow : colors.grey}
            onClick={() => handleClickStar(index + 1)}
            onMouseOver={() => handleMouseOverStar(index + 1)}
            onMouseLeave={() => handleMouseLeaveStar()}
          />
        );
      })}
    </div>
  );
}
