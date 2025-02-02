"use client";
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react';
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

      // Move the ball to the chosen answer
      const button = buttonRefs.current[index];
      if (button) {
        const rect = button.getBoundingClientRect();
        setBallPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      }

      // Delay moving to the next question to allow the ball animation to complete
      setTimeout(() => {
        if (currIndex === 9) {
          setGameOver(true);
        } else {
          setCurrIndex((prev) => prev + 1);
        }
      }, 1000); // 1 second delay, matching the ball transition duration
    }
  };

  return (
    <div>
      <style jsx>{`
        button:hover::before {
          opacity: 1 !important;
        }
      `}</style>
      {gameOver ? (
        <div>
          <h2>Game Over!</h2>
          <p>Your final score: {userScore} / 10</p>
          <button onClick={() => router.push("/")}>Back to Home</button>
        </div>
      ) : gameData.length > 0 ? (
        <div style={{ textAlign: "center", justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column", height: "100vh" }}>
          <h2>Question {currIndex + 1}</h2>
          <p>{gameData[currIndex]?.question}</p>
          <p>Score: {userScore}</p>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            {gameData[currIndex].choices.map((choice, index) => (
              <div key={index} style={{ margin: "10px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "100px", wordWrap: "break-word" }}>
                <div style={{ color: "blue", fontWeight: "bold", marginBottom: "5px" }}>{choice}</div>
                <button
                  ref={(el) => {
                    if (el) buttonRefs.current[index] = el;
                  }}                  
                  onClick={() => userChoice(choice, index)}
                  style={{
                    padding: "0",
                    borderRadius: "50%",
                    width: "100px",
                    height: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "transparent", // Change this to transparent
                    border: "2px solid #000",
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                    fontSize: "16px",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "visible", // Change this to visible
                  }}
                >
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "red",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    zIndex: 1, // Add this line
                  }}>
                    <div style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "red",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "white",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
          <div 
            className="absolute w-0 h-0 transition-all duration-1000 ease-in-out"
            style={{
              left: `${ballPosition.x}px`,
              top: `${ballPosition.y}px`,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '20px solid red',
              transform: 'translate(-50%, -50%)'
            }}
          />
          <div 
            ref={blueRectRef}
            className='w-24 h-6 bg-blue-500' 
            style={{ marginTop: '20rem' }}
          />
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
}
