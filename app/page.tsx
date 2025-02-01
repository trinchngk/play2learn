'use client'
 
import { useRouter } from 'next/navigation'
import { IoSearch } from "react-icons/io5";
import { useState } from 'react';
import axios from 'axios';


export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <div className='h-full min-h-screen h-[calc(100vh)] font-sans text-white p-10'>
        <div className='flex justify-center items-center gap-x-4 w-2/3'>
          <input
            type="text"
            value={search}
            className=' bg-white text-black p-3 rounded-xl w-full ml-10 mr-3 focus:outline-none focus:ring focus:ring-blue-300' 
            placeholder='Choose Your Topic...'
            onChange={(e) => setSearch(e.target.value)}     
            >
          </input>       
        </div>
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 m-10'>
          <div
            className='rounded-xl border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base w-full aspect-square hover:cursor-pointer'
            onClick={() => {
              router.push(`/game1?topic=${encodeURIComponent(search)}`);
            }}
            >
            True or False
          </div>
          <div
            className='rounded-xl border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base w-full aspect-square hover:cursor-pointer'
            onClick={() => {
              router.push(`/game2?topic=${encodeURIComponent(search)}`);
            }}
            >
            Multiple Choice
          </div>
          <div
            className='rounded-xl border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base w-full aspect-square hover:cursor-pointer'
            onClick={() => {
              router.push(`/game3?topic=${encodeURIComponent(search)}`);
            }}
            >
            Right or Wrong
          </div>
        </div>
    </div>
  );
}