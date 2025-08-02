import React from 'react'
import Button from '../../../Components/Button'
Button
const PostNow = () => {
  return (
    <div className='flex flex-row justify-center items-center mt-10 '>
        <Button
        divstyle="bg-black dark:bg-cgreen px-10 py-2 rounded-full"
        btnStyle="text-white"
        btnname="Post Now"
        />    
        </div>
  )
}

export default PostNow