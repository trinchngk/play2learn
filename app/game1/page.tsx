'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { PropagateLoader } from 'react-spinners'
import axios from 'axios'
import React from 'react'

interface Question {
  question: string
  correctAnswer: string
  choices: string[]
}

interface GameData {
  questions: Question[]
}

function GameContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic")
  const [gameData, setGameData] = useState<Question[]>([])
  const [currIndex, setCurrIndex] = useState(0)
  const [userScore, setUserScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [paddleX, setPaddleX] = useState(50)
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0 })
  const [message, setMessage] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post<GameData>('https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/truefalseopenai', {
          topic: topic
        })
        setGameData(response.data.questions)
      } catch (err) {
        console.error('Error fetching questions:', err)
        setMessage('Failed to load questions. Please try again.')
      }
    }
    fetchData()
  }, [topic])

  const handleUserChoice = (choice: string): void => {
    if (isAnimating || !gameData[currIndex]) return
    setIsAnimating(true)
    const correctAnswer = gameData[currIndex].correctAnswer
    const isCorrect = choice === correctAnswer
    
    if (isCorrect) {
      setUserScore(userScore + 1)
      setMessage('Blocked!')
    } else {
      setMessage('Scored!')
    }

    animateBallAndPaddle(choice, correctAnswer, isCorrect)
  }

  const animateBallAndPaddle = (choice: string, correctAnswer: string, isBlocked: boolean) => {
    const targetX = choice === 'True' ? 30 : 70
    setPaddleX(targetX)

    const ballTargetX = correctAnswer === 'True' ? 30 : 70
    
    setBallPosition({ x: 50, y: 0 })
    
    setTimeout(() => {
      if (isBlocked) {
        setBallPosition({ x: ballTargetX, y: 70 })
      } else {
        setBallPosition({ x: ballTargetX, y: 90 })
      }
      
      setTimeout(() => {
        setBallPosition({ x: 50, y: 0 })
        setPaddleX(50)
        setIsAnimating(false)
        setMessage('')
        
        if (currIndex === gameData.length - 1) {
          setGameOver(true)
        } else {
          setCurrIndex(currIndex + 1)
        }
      }, 1000)
    }, 100)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 zoom-bg bg-background bg-[url('/closeup.png')] bg-no-repeat bg-center bg-fixed"></div>
      <div className="relative z-10 Screen w-full">
        <div className="max-w-2xl mx-auto pt-4 mt-12">
          {gameOver ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Game Over!</h2>
              <p className="text-xl">Final Score: {userScore} / {gameData.length}</p>
              <button 
                onClick={() => router.push('/')}
                className="bg-[#111d4a] hover:bg-[#644ca8] text-white px-6 py-2 rounded-2xl transition-colors"
              >
                Back to Home
              </button>
            </div>
          ) : gameData.length > 0 ? (
            <div className="space-y-6 p-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Question {currIndex + 1} / {gameData.length}</h2>
                <h2 className="text-xl font-semibold">Score: {userScore}</h2>
              </div>
              
              <p className="text-lg text-white bg-[#111d4a] p-4 rounded-lg shadow">
                {gameData[currIndex]?.question}
              </p>

              <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                <div 
                  className={`absolute inset-0 flex items-center justify-center z-10 text-2xl font-bold ${
                    message === 'Blocked!' ? 'text-[#46f0df]' : 'text-red-500'
                  }`}
                >
                  {message}
                </div>
                <div 
                  className="absolute w-6 h-6 bg-[#46f0df] rounded-full transition-all duration-1000 ease-in-out"
                  style={{
                    left: `${ballPosition.x}%`,
                    top: `${ballPosition.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <div 
                  className="absolute bottom-8 w-24 h-2 bg-[#8075ff] transition-all duration-300 ease-in-out"
                  style={{
                    left: `${paddleX}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
                <div className="absolute bottom-0 left-1/2 w-96 h-2 bg-[#f2dc16] -translate-x-1/2" />
              </div>

              <div className="flex justify-center gap-4">
                {gameData[currIndex]?.choices.map((choice: string) => (
                  <button
                    key={choice}
                    onClick={() => !isAnimating && handleUserChoice(choice)}
                    disabled={isAnimating}
                    className={`px-8 py-3 rounded-lg text-white bg-[#111d4a] hover:bg-[#644ca8] font-semibold transition-all
                      ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:scale-105'}
                    `}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <PropagateLoader color="#8075ff" size={25}/>
            </div>
          )}
        </div>   
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function Game1() {
  return (
    <Suspense fallback={<PropagateLoader color="#8075ff" size={25}/>}>
      <GameContent />
    </Suspense>
  )
}
