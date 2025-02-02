"use client";
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react';
import { PropagateLoader } from 'react-spinners';
import axios from 'axios';
import React from "react";

export default function Game2() {
  
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic");
  const router = useRouter();
  const [ballPosition, setBallPosition] = useState({ x: 250, y: 450 });
  const [gameData, setGameData] = useState<{ question: string; choices: string[]; correctAnswer: string }[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const blueRectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/multiplechoiceopenai`, {
          topic: topic
        });
        
        if (response.data?.questions) {
          setGameData(response.data.questions);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };
    fetchData();
  }, [topic]);

  useEffect(() => {
    const updateBallPosition = () => {
      if (blueRectRef.current) {
        const rect = blueRectRef.current.getBoundingClientRect();
        setBallPosition({ x: rect.left + rect.width / 2, y: rect.top });
      }
    };

    updateBallPosition();
    window.addEventListener('resize', updateBallPosition);

    return () => window.removeEventListener('resize', updateBallPosition);
  }, [gameData, currIndex]);

  const userChoice = (choice: string, index: number): void => {
    if (gameData[currIndex]?.correctAnswer) {
      const isCorrect = choice === gameData[currIndex].correctAnswer;
      if (isCorrect) {
        setUserScore((prev) => prev + 1);
      }

      const button = buttonRefs.current[index];
      if (button) {
        const rect = button.getBoundingClientRect();
        setBallPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      }

      setTimeout(() => {
        if (currIndex === 9) {
          setGameOver(true);
        } else {
          setCurrIndex((prev) => prev + 1);
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 zoom-bg bg-background bg-[url('/closeup.png')] bg-no-repeat bg-center bg-fixed"></div>  
        <div className="relative z-10 w-full text-center flex flex-col items-center justify-center">
        {gameOver ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p className="text-lg mt-2">Your final score: {userScore} / 10</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => router.push("/")}>Back to Home</button>
          </div>
        ) : gameData.length > 0 ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-xl font-semibold">Question {currIndex + 1}</h2>
            <p className="text-lg mt-2">{gameData[currIndex]?.question}</p>
            <p className="mt-2 text-lg">Score: {userScore}</p>
            <div className="flex flex-row justify-center items-center mt-4 mb-20">
              {gameData[currIndex].choices.map((choice, index) => (
                <div key={index} className="flex flex-col items-center w-[140px] text-center">
                <div className="text-yellow-400 font-bold mb-2 text-center w-full min-h-[50px] flex items-center justify-center">{choice}</div>
                  <button
                    ref={(el) => { if (el) buttonRefs.current[index] = el; }}
                    onClick={() => userChoice(choice, index)}
                    className="w-24 h-24 flex justify-center items-center bg-transparent border-2 border-black shadow-lg rounded-full relative overflow-visible"
                  >
                    <div className="w-20 h-20 bg-red-600 rounded-full flex justify-center items-center">
                      <div className="w-16 h-16 bg-white rounded-full flex justify-center items-center">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex justify-center items-center">
                          <div className="w-6 h-6 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            <div 
              className="absolute transition-all duration-1000 ease-in-out w-0 h-0 bottom-4"
              style={{
                left: `${ballPosition.x}px`,
                top: `${ballPosition.y}px`,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '20px solid #d8492b',
                transform: 'translate(-50%, -50%)'
              }}
            />
            <div ref={blueRectRef} className="w-24 h-6 bg-blue-500 mt-20" />
          </div>
        ) : (
          <div className="text-center py-8">
            <PropagateLoader color="#8075ff" size={25} />
          </div>
        )}
    </div>
    </div>
  );
}
