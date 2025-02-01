"use client";
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import axios from 'axios';
import React from "react";

export default function game2() {
  
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic");
  const router = useRouter();

  const [gameData, setGameData] = useState<{ question: string; choices: string[]; correctAnswer: string }[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/multiplechoiceopenai`, {
          topic: topic
        });

        console.log(response)
        
        if (response.data?.questions) {
          setGameData(response.data.questions);
        }
        console.log(gameData[0])
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };
    fetchData();
  }, [topic]);

  const userChoice = (choice: string): void => {
    if (gameData[currIndex]?.correctAnswer) {
      const isCorrect = choice === gameData[currIndex].correctAnswer;
      if (isCorrect) {
        setUserScore((prev) => prev + 1);
      }

      if (currIndex === 9) {
        setGameOver(true);
      } else {
        setCurrIndex((prev) => prev + 1);
      }
    }
  };

  return (
    <div>
      {gameOver ? (
        <div>
          <h2>Game Over!</h2>
          <p>Your final score: {userScore} / 10</p>
          <button onClick={() => router.push("/")}>Back to Home</button>
        </div>
      ) : gameData.length > 0 ? (
        <div>
          <h2>Question {currIndex + 1}</h2>
          <p>{gameData[currIndex]?.question}</p>
          <div>
            <button onClick={() => userChoice(gameData[currIndex].choices[0])} style={{ margin: "10px", padding: "10px 20px" }}>
            {gameData[currIndex].choices[0]}
            </button>
            <button onClick={() => userChoice(gameData[currIndex].choices[1])} style={{ margin: "10px", padding: "10px 20px" }}>
            {gameData[currIndex].choices[1]}
            </button>
            <button onClick={() => userChoice(gameData[currIndex].choices[2])} style={{ margin: "10px", padding: "10px 20px" }}>
            {gameData[currIndex].choices[2]}
            </button>
            <button onClick={() => userChoice(gameData[currIndex].choices[3])} style={{ margin: "10px", padding: "10px 20px" }}>
            {gameData[currIndex].choices[3]}
            </button>
          </div>
          <p>Score: {userScore}</p>
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
}