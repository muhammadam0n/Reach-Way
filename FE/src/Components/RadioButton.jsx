import React, { useState } from 'react';

const RadioButton = ({
    auth,
    value,
    onSelect,
    label,
    desc,
    image,
    cardImage,
    cardImageStyle,
    imageStyle
}) => {

    return (
        <div>
            {
                auth ?
                    <div onClick={onSelect} className={`w-full cursor-pointer mt-2 md:p-4 p-2 flex items-center justify-between border-[1px]  ${value ? " border-goldColor" : "border-borderColor"} `}>
                        <div className='  flex-col items-center'>
                            <p className={`text8 ${value ? "text-goldColor " : "text-white"}`}> {label} </p>
                            {desc && <p className='text11 text-white w-[70%]  md:pt-2 pt-1'> {desc} </p>}
                        </div>

                        <div className={`${value && image ? "" : "border-[1px] border-white"}   rounded-full xl:w-[20px]  lg:w-[24px] md:w-[24px] w-[20px] h-[20px]`}>
                            {value && (
                                <img src={image} className={imageStyle} />
                            )}
                        </div>
                    </div>

                    :

                    <div onClick={onSelect} className='border-[1px] border-red-500 flex justify-between'>
                        <div className='gap-10 flex items-center'>
                            {value && (
                                <img src={image} className='w-[20px] h-[20px]' />
                            )}
                            <p> {label} </p>
                        </div>

                        <div>
                            <img src={cardImage} className={cardImageStyle} />
                        </div>
                    </div>
            }

        </div>
    );
};

export default RadioButton;