import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <>
    <div className='min-h-screen flex items-center justify-center bg-gray-100 text-grey-500'>
    <div>
        <img src="https://cdn-icons-png.flaticon.com/512/1216/1216895.png" alt="404" className='w-1/2 mx-auto font-red-400  ' />
    

        <h1 className='text-3xl font-bold text-center'>404</h1>
        <h2 className='text-2xl font-bold text-center'> Oops! Page Not Found</h2>
        <Link to='/' className='text-blue-500 hover:underline'>Go back to Home</Link>
</div>
    </div>
      
    </>
  )
}

export default NotFound
