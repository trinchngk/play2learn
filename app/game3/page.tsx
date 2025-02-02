'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { PropagateLoader } from 'react-spinners'
import axios from 'axios'

const PLAYER_SIZE = 40
const MISSILE_SIZE = 20
const GAME_HEIGHT = 400
const GAME_WIDTH = 600
const MAX_SCORE = 10
const SCORE_INCREMENT = 1
const LIVES_DECREMENT = 1
const STARTING_LIVES = 3

interface Question {
  question: string
  choices: string[]
  correctAnswer: string[]
}

interface Missile {
  x: number
  y: number
  speed: number
  choice: string
  isCorrect: boolean
}

interface Player {
  x: number
  y: number
}

// Separate game content component
function GameContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic")
  const [gameData, setGameData] = useState<Question[]>([])
  const [currIndex, setCurrIndex] = useState(0)
  const [userScore, setUserScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [playerPosition, setPlayerPosition] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - PLAYER_SIZE - 10 })
  const [missiles, setMissiles] = useState<Missile[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [lives, setLives] = useState(STARTING_LIVES)
  const [missilesSpawned, setMissilesSpawned] = useState(false)
  const [loading, setLoading] = useState(false)
  const gameLoopRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.post("https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/rightorwrongopenai", {
          topic: topic,
        })

        if (response.data?.questions) {
          setGameData(response.data.questions)
        }

        setLoading(false)
      } catch (err) {
        setLoading(false)
        console.error("Error fetching questions:", err)
      }
    }

    fetchData()
  }, [topic])

  useEffect(() => {
    if (isPlaying && gameData[currIndex]) {
      setMissiles([])
      setMissilesSpawned(false)
    }
  }, [currIndex, isPlaying])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver || gameWon) return

      const MOVE_AMOUNT = 20

      switch(e.key) {
        case 'ArrowLeft':
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.max(0, prev.x - MOVE_AMOUNT)
          }))
          break
        case 'ArrowRight':
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.min(GAME_WIDTH - PLAYER_SIZE, prev.x + MOVE_AMOUNT)
          }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, gameOver, gameWon])

  const checkCollision = (missile: Missile, player: Player) => {
    return (
      missile.x < player.x + PLAYER_SIZE &&
      missile.x + MISSILE_SIZE > player.x &&
      missile.y < player.y + PLAYER_SIZE &&
      missile.y + MISSILE_SIZE > player.y
    )
  }

  useEffect(() => {
    if (!isPlaying || gameOver || gameWon || !gameData[currIndex]) return

    const gameLoop = () => {
      if (!missilesSpawned) {
        const choices = gameData[currIndex].choices
        const spacing = GAME_WIDTH / choices.length

        const newMissiles = choices.map((choice, index) => ({
          x: spacing * index + (spacing - MISSILE_SIZE) / 2,
          y: -MISSILE_SIZE,
          speed: 0.75,
          choice: choice,
          isCorrect: gameData[currIndex].correctAnswer.includes(choice)
        }))

        setMissiles(newMissiles)
        setMissilesSpawned(true)
      }

      setMissiles(prev => {
        const updatedMissiles = prev.map(missile => ({
          ...missile,
          y: missile.y + missile.speed
        }))

        let hitMissile = null
        
        for (const missile of updatedMissiles) {
          if (checkCollision(missile, playerPosition)) {
            hitMissile = missile
            break
          }
        }

        if (hitMissile) {
          if (hitMissile.isCorrect) {
            const nextScore = userScore + SCORE_INCREMENT
            setUserScore(nextScore)
            
            if (nextScore < MAX_SCORE) {
              const nextIndex = currIndex + 1
              if (nextIndex < gameData.length) {
                setCurrIndex(nextIndex)
                setMissilesSpawned(false)
              }
            } else {
              setGameWon(true)
              setIsPlaying(false)
            }
            return []
          } else {
            const nextLives = lives - LIVES_DECREMENT
            setLives(nextLives)
            if (nextLives <= 0) {
              setGameOver(true)
              setIsPlaying(false)
              return []
            }
            setMissilesSpawned(false)
            return []
          }
        }

        return updatedMissiles.filter(missile => missile.y < GAME_HEIGHT)
      })

      if (!gameOver && !gameWon) {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [isPlaying, gameOver, gameWon, playerPosition, currIndex, gameData, missilesSpawned, userScore, lives])

  const startGame = () => {
    setIsPlaying(true)
    setGameOver(false)
    setGameWon(false)
    setLives(STARTING_LIVES)
    setUserScore(0)
    setCurrIndex(0)
    setMissiles([])
    setMissilesSpawned(false)
    setPlayerPosition({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - PLAYER_SIZE - 10 })
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 zoom-bg bg-background bg-[url('/closeup.png')] bg-no-repeat bg-center bg-fixed"></div>
      <div className="relative z-10 Screen w-full">
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-4 max-w-2xl mx-auto pt-4 mt-5">
          {loading ? (
            <div className="text-center py-8">
              <PropagateLoader color="#8075ff" size={25}/>
            </div>
          ) : (
            <>
              {(gameOver || gameWon) ? (
                <div className="text-center mb-4">
                  <h2 className="text-2xl mb-2">{gameWon ? 'Congratulations!' : 'Game Over!'}</h2>
                  <p className="mb-4">Final Score: {userScore} points</p>
                  <button 
                    onClick={startGame}
                    className="px-6 py-2 bg-[#111d4a] rounded-lg hover:bg-[#644ca8] transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              ) : (
                <div className="mb-4 text-xl">
                  Lives: {lives} | Score: {userScore} | Question: {currIndex + 1}/10
                </div>
              )}
              
              <div 
                className="relative bg-gray-800 rounded-lg overflow-hidden"
                style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
              >
                <div
                  className="absolute bg-[#F2DC16] rounded-lg transition-all duration-100"
                  style={{
                    width: PLAYER_SIZE,
                    height: PLAYER_SIZE,
                    left: playerPosition.x,
                    top: playerPosition.y,
                  }}
                />
                
                {missiles.map((missile, index) => (
                  <div key={index} className="absolute" style={{ left: missile.x, top: missile.y }}>
                    <div 
                      className="absolute bg-gray-800 bg-opacity-75 px-2 py-1 rounded transform -translate-x-1/2 whitespace-nowrap"
                      style={{
                        left: MISSILE_SIZE / 2,
                        top: -30,
                        maxWidth: '150px'
                      }}
                    >
                      <div className="text-xs font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {missile.choice}
                      </div>
                    </div>
                    
                    <div
                      className="absolute rounded-full bg-[#8075ff]"
                      style={{
                        width: MISSILE_SIZE,
                        height: MISSILE_SIZE,
                      }}
                    />
                  </div>
                ))}
              </div>
              {!isPlaying && !gameOver && !gameWon && (
                <button 
                  onClick={startGame}
                  className="mt-4 px-6 py-2 bg-[#111d4a] rounded-lg hover:bg-[#644ca8] transition-colors mb-4"
                >
                  Start Game
                </button>
              )}
              {isPlaying && gameData[currIndex] && (
                <div className="mt-4 text-center max-w-xl">
                  <p className="mb-2 text-lg font-semibold">{gameData[currIndex].question}</p>
                  <p className="text-sm text-gray-400">Collect the correct answers by touching them with your player!</p>
                </div>
              )}              
            </>
          )}
        </div>   
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function Game3() {
  return (
    <Suspense fallback={<PropagateLoader color="#8075ff" size={25}/>}>
      <GameContent />
    </Suspense>
  )
}
