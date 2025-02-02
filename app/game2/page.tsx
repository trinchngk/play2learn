'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function game2() {
  
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic");
  const [gameData, setGameData] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/multiplechoiceopenai`, {
          topic: topic
        });
        setGameData(response);
        console.log(response);
      } catch (err) {
        console.error('error:', err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 zoom-bg bg-background bg-[url('/closeup.png')] bg-no-repeat bg-center bg-fixed"></div>
      <div className="relative z-10 Screen">
        <h1> </h1>
      </div>
    </div>
  );
}
