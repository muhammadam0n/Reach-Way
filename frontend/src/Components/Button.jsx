import React from "react";

const Button = ({
  image,
  imagediv,
  imageStyle,
  divstyle,
  btnStyle,
  btnname,
  type,
  onPress,
  disabled,
}) => {
  return (
    <>
      <button
        className={divstyle}
        type={type}
        onClick={onPress}
        disabled={disabled}
      >
        {image ? (
          <div className={imagediv}>
            <img src={image} className={imageStyle} />
            <p className={btnStyle}>{btnname}</p>
          </div>
        ) : (
          <p className={btnStyle}>{btnname}</p>
        )}
      </button>
    </>
  );
};

export default Button;
