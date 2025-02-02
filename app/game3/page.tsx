"use client";
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import axios from 'axios';
import React from "react";

export default function game2() {
  
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic");
  const router = useRouter();

  const [gameData, setGameData] = useState<{ question: string; choices: string[]; correctAnswer: string[]}[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedChoices, setSelectedChoices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/rightorwrongopenai`, {
          topic: topic
        });

        console.log(response)
        
        if (response.data?.questions) {
          setGameData(response.data.questions);
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };
    fetchData();
  }, [topic]);

  const toggleChoice = (choice: string): void => {
    setSelectedChoices((prev) => {
      const newSelections = new Set(prev);
      if (newSelections.has(choice)) {
        newSelections.delete(choice);
      } else {
        newSelections.add(choice);
      }
      return newSelections;
    });
  };

  const submitAnswer = (): void => {
    const correctAnswers = new Set(gameData[currIndex]?.correctAnswer || []);
    const selected = new Set(selectedChoices);
    
    const isFullyCorrect = correctAnswers.size === selected.size && [...correctAnswers].every(ans => selected.has(ans));
    const isPartiallyCorrect = [...selected].some(ans => correctAnswers.has(ans)) && !isFullyCorrect;

    if (isFullyCorrect) {
      setUserScore((prev) => prev + 1);
    } else if (isPartiallyCorrect) {
      setUserScore((prev) => prev + 0.5);
    }

    setSelectedChoices(new Set()); // Reset selections for next question

    if (currIndex === 9) {
      setGameOver(true);
    } else {
      setCurrIndex((prev) => prev + 1);
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
            <button 
              onClick={() => toggleChoice(gameData[currIndex].choices[0])} 
              style={{ 
                margin: "10px", 
                padding: "10px 20px",
                backgroundColor: selectedChoices.has(gameData[currIndex].choices[0]) ? "red" : "black"
              }}
            >
              {gameData[currIndex].choices[0]}
            </button>

            <button 
              onClick={() => toggleChoice(gameData[currIndex].choices[1])} 
              style={{ 
                margin: "10px", 
                padding: "10px 20px",
                backgroundColor: selectedChoices.has(gameData[currIndex].choices[1]) ? "red" : "black"
              }}
            >
              {gameData[currIndex].choices[1]}
            </button>

            <button 
              onClick={() => toggleChoice(gameData[currIndex].choices[2])} 
              style={{ 
                margin: "10px", 
                padding: "10px 20px",
                backgroundColor: selectedChoices.has(gameData[currIndex].choices[2]) ? "red" : "black"
              }}
            >
              {gameData[currIndex].choices[2]}
            </button>

            <button 
              onClick={() => toggleChoice(gameData[currIndex].choices[3])} 
              style={{ 
                margin: "10px", 
                padding: "10px 20px",
                backgroundColor: selectedChoices.has(gameData[currIndex].choices[3]) ? "red" : "black"
              }}
            >
              {gameData[currIndex].choices[3]}
            </button>
        </div>
        <button 
          onClick={submitAnswer} 
          style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "green", color: "white" }}
        >
          Submit Answer
        </button>

        <p>Score: {userScore}</p>
          <p>Score: {userScore}</p>
        </div>
      ) : (
        <p>Loading Game...</p>
      )}
    </div>
  );
}