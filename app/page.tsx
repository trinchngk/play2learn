"use client";

import { useRouter } from 'next/navigation';
import { IoSearch } from "react-icons/io5";
import { useState } from 'react';
import Head from 'next/head';
import './globals.css';

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=VT323&display=swap" rel="stylesheet" />
      </Head>

      <div 
        className="h-full min-h-screen font-Pixelify Sans text-white p-10 flex flex-col items-center justify-center sliding-background"
        style={{
          backgroundImage: "url('/Checkered.png')",
          backgroundSize: "contain",  
          backgroundPosition: "center", 
          backgroundAttachment: "fixed", 
          // backgroundColor: "",
          maxWidth: "100vw", 
          maxHeight: "100vh" 
        }}
      >
        <img 
          src="/ArcadeMachine.png" 
          alt="Arcade Machine" 
          className="fixed top-3/16 w-full max-w-[1100px] h-auto items-center z-[1]" 
        />

        <img 
          src="/logo.png" 
          alt="Logo" 
          className="flex top-0 w-85vh center items-center max-w-[900px] h-85vh z-[1]" 
        />

        <div className="flex justify-center items-center gap-x-4 w-1/3 z-[2]">
          <input
            type="text"
            value={search}
            className="bg-white text-black p-3 rounded-xl w-full ml-10 mr-3 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Choose Your Topic..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 m-10 z-[2]">
          {["True or False", "Multiple Choice", "Right or Wrong"].map((game, index) => (
            <div
              key={index}
              className="rounded-xl border border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-PixelifySans text-sm sm:text-base w-full aspect-square hover:cursor-pointer"
              onClick={() => {
                router.push(`/game${index + 1}?search=${encodeURIComponent(search)}`);
              }}
            >
              {game}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
