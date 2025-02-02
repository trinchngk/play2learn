"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';

export default function GamePage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const router = useRouter();

  const [gameData, setGameData] = useState<{ question: string; choices: string[]; correctAnswer: string }[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/multiplechoiceopenai', {
          topic: topic
        });
        setGameData(response.data.questions);
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
        <div style={{ textAlign: "center", justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
          <h2>Question {currIndex + 1}</h2>
          <p style={{ color: "blue" }}>{gameData[currIndex]?.question}</p>
          <p>Score: {userScore}</p>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            {gameData[currIndex].choices.map((choice, index) => (
              <div key={index} style={{ margin: "10px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "100px", wordWrap: "break-word" }}>
                <div style={{ color: "blue", fontWeight: "bold", marginBottom: "5px" }}>{choice}</div>
                <button
                  onClick={() => userChoice(choice)}
                  style={{
                    padding: "0",
                    borderRadius: "50%",
                    width: "100px",
                    height: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f0f0f0",
                    border: "2px solid #000",
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
                    fontSize: "16px",
                    cursor: "pointer",
                    position: "relative",
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
                          {/* Removed the choice text from here */}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
}