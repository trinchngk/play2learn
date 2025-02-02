"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { PropagateLoader } from 'react-spinners'
import axios from 'axios'
import React from "react"

interface Question {
  question: string
  choices: string[]
  correctAnswer: string
}

// Separate game content component
function GameContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic")
  const router = useRouter()
  const [ballPosition, setBallPosition] = useState({ x: 250, y: 450 })
  const [gameData, setGameData] = useState<Question[]>([])
  const [currIndex, setCurrIndex] = useState(0)
  const [userScore, setUserScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const blueRectRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/multiplechoiceopenai', {
          topic: topic
        })
       
        if (response.data?.questions) {
          setGameData(response.data.questions)
        }
      } catch (err) {
        console.error('Error fetching questions:', err)
      }
    }
    fetchData()
  }, [topic])

  useEffect(() => {
    const updateBallPosition = () => {
      if (blueRectRef.current) {
        const rect = blueRectRef.current.getBoundingClientRect()
        setBallPosition({ x: rect.left + rect.width / 2, y: rect.top })
      }
    }

    updateBallPosition()
    window.addEventListener('resize', updateBallPosition)
    return () => window.removeEventListener('resize', updateBallPosition)
  }, [gameData, currIndex])

  useEffect(() => {
    if (!gameOver && gameData.length > 0) {
      const cycleTargets = () => {
        setCurrentTargetIndex((prev) => (prev + 1) % gameData[currIndex].choices.length)
      }

      const intervalId = setInterval(cycleTargets, 1000)
      return () => clearInterval(intervalId)
    }
  }, [gameOver, gameData, currIndex])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameData.length > 0) {
        e.preventDefault()
        const choice = gameData[currIndex].choices[currentTargetIndex]
        const button = buttonRefs.current[currentTargetIndex]
       
        if (button) {
          const rect = button.getBoundingClientRect()
          setBallPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          })
        }

        const isCorrect = choice === gameData[currIndex].correctAnswer
        if (isCorrect) {
          setUserScore((prev) => prev + 1)
        }

        setTimeout(() => {
          if (currIndex === 9) {
            setGameOver(true)
          } else {
            setCurrIndex((prev) => prev + 1)
          }
        }, 1000)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentTargetIndex, gameData, currIndex])

  const userChoice = (choice: string, index: number) => {
    if (gameData[currIndex]?.correctAnswer) {
      const isCorrect = choice === gameData[currIndex].correctAnswer
      if (isCorrect) {
        setUserScore((prev) => prev + 1)
      }

      const button = buttonRefs.current[index]
      if (button) {
        const rect = button.getBoundingClientRect()
        setBallPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })
      }

      setTimeout(() => {
        if (currIndex === 9) {
          setGameOver(true)
        } else {
          setCurrIndex((prev) => prev + 1)
        }
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 zoom-bg bg-background bg-[url('/closeup.png')] bg-no-repeat bg-center bg-fixed"></div>  
      <div className="relative z-10 w-full text-center flex flex-col items-center justify-center">
        {gameOver ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p className="text-lg mt-2">Your final score: {userScore} / 10</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => router.push("/")}
            >
              Back to Home
            </button>
          </div>
        ) : gameData.length > 0 ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-xl font-bold mb-2">Question {currIndex + 1}</h2>
            <p className="mb-4">{gameData[currIndex]?.question}</p>
            <p className="text-lg font-bold mb-4">Score: {userScore}</p>
            <div className="flex flex-row justify-center items-center mb-8">
              {gameData[currIndex].choices.map((choice, index) => (
                <div key={index} className="mx-2 text-center flex flex-col items-center" style={{ maxWidth: "100px" }}>
                  <div className="text-yellow-400 font-bold mb-1">{choice}</div>
                  <button
                    ref={(el) => { buttonRefs.current[index] = el }}
                    onClick={() => userChoice(choice, index)}
                    className={`relative w-24 h-24 rounded-full focus:outline-none
                      ${currentTargetIndex === index ? 'ring-4 ring-[#D8482B] ring-opacity-50 animate-pulse' : ''}`}
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-black shadow-lg">
                      <div className="absolute inset-2 rounded-full bg-[#D8482B]">
                        <div className="absolute inset-3 rounded-full bg-white">
                          <div className="absolute inset-3 rounded-full bg-[#D8482B]">
                            <div className="absolute inset-3 rounded-full bg-white" />
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
                borderBottom: '20px solid #D8482B',
                transform: 'translate(-50%, -50%)'
              }}
            />
            <div
              ref={blueRectRef}
              className="w-24 h-6 bg-[#644CA8] mt-32"
            />
            <p className="mt-4 text-gray-600">Press SPACE to shoot when the target is highlighted!</p>
            <p className="mt-2 text-gray-600">Or click the targets directly!</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <PropagateLoader color="#8075ff" size={25}/>
          </div>
        )}
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function Game2() {
  return (
    <Suspense fallback={<PropagateLoader color="#8075ff" size={25}/>}>
      <GameContent />
    </Suspense>
  )
}
