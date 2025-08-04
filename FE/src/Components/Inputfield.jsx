import React from "react";

const Inputfield = ({
  Labelname,
  type,
  placeholder,
  labelstyle,
  inputStyle,
  divstyle,
  name,
  htmlFor,
  id,
  onChange,
  values,
  errors,
  touched,
  disabled,
  maxLength,
  pattern,
  innerDiv,
  leadingImage, // New prop for the image
  imageStyle, // Optional: Style for the image
  accept,
  defaultValue,
  multiple
}) => {
  return (
    <div className={divstyle}>
      {Labelname && (
        <label htmlFor={htmlFor} className={labelstyle}>
          {Labelname}
        </label>
      )}
      <div className={`flex items-center  ${innerDiv}`}>
        {leadingImage && (
          <img src={leadingImage} alt="" className={imageStyle} />
        )}
        <input
          id={id}
          name={name}
          onChange={onChange}
          accept={accept}
          value={values}
          multiple={multiple}
          defaultValue={defaultValue}
          className={`placeholder-placeHolder  focus:outline-none ${inputStyle} ${leadingImage ? "pl-1" : ""
            }`} // Adds padding if image is present
          type={type}
          maxLength={maxLength}
          pattern={pattern}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
      </div>
      {errors && touched && (
        <div className="text-end mt-2  text10 text-red-500">
          {errors}
        </div>
      )}
    </div>
  );
};

export default Inputfield;
