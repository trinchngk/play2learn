'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const PLAYER_SIZE = 40;
const MISSILE_SIZE = 20;
const GAME_HEIGHT = 400;
const GAME_WIDTH = 600;

export default function Game3() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const router = useRouter();
  
  const [gameData, setGameData] = useState([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const [playerPosition, setPlayerPosition] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - PLAYER_SIZE - 10 });
  const [missiles, setMissiles] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lives, setLives] = useState(3);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [missilesSpawned, setMissilesSpawned] = useState(false);
  const gameLoopRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("https://r9s90fv4id.execute-api.us-east-1.amazonaws.com/rightorwrongopenai", {
          topic: topic,
        });

        if (response.data?.questions) {
          setGameData(response.data.questions);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchData();
  }, [topic]);

  useEffect(() => {
    if (isPlaying && gameData[currIndex]) {
      setMissiles([]);
      setMissilesSpawned(false);
      setQuestionStartTime(Date.now());
    }
  }, [currIndex, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || gameOver) return;
      
      const MOVE_AMOUNT = 20;
      
      switch(e.key) {
        case 'ArrowLeft':
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.max(0, prev.x - MOVE_AMOUNT)
          }));
          break;
        case 'ArrowRight':
          setPlayerPosition(prev => ({
            ...prev,
            x: Math.min(GAME_WIDTH - PLAYER_SIZE, prev.x + MOVE_AMOUNT)
          }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (!isPlaying || gameOver || !gameData[currIndex]) return;

    const gameLoop = () => {
      if (!missilesSpawned) {
        const choices = gameData[currIndex].choices;
        const spacing = GAME_WIDTH / choices.length;
        
        const newMissiles = choices.map((choice, index) => ({
          x: spacing * index + (spacing - MISSILE_SIZE) / 2,
          y: -MISSILE_SIZE,
          speed: 1,
          choice: choice,
          isCorrect: gameData[currIndex].correctAnswer.includes(choice)
        }));
        
        setMissiles(newMissiles);
        setMissilesSpawned(true);
      }

      setMissiles(prev => {
        const updatedMissiles = prev.map(missile => ({
          ...missile,
          y: missile.y + missile.speed
        }));

        updatedMissiles.forEach(missile => {
          if (checkCollision(missile, playerPosition)) {
            if (missile.isCorrect) {
              setUserScore(prev => prev + 1);
            } else {
              setLives(prev => {
                const newLives = prev - 1;
                if (newLives === 0) {
                  setGameOver(true);
                  setIsPlaying(false);
                }
                return newLives;
              });
            }
            
            if (currIndex === gameData.length - 1) {
              setGameOver(true);
              setIsPlaying(false);
            } else {
              setCurrIndex(prev => prev + 1);
            }
          }
        });

        return updatedMissiles.filter(missile => missile.y < GAME_HEIGHT);
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [isPlaying, gameOver, playerPosition, currIndex, gameData, missilesSpawned]);

  const checkCollision = (missile, player) => {
    return (
      missile.x < player.x + PLAYER_SIZE &&
      missile.x + MISSILE_SIZE > player.x &&
      missile.y < player.y + PLAYER_SIZE &&
      missile.y + MISSILE_SIZE > player.y
    );
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setLives(3);
    setUserScore(0);
    setCurrIndex(0);
    setMissiles([]);
    setMissilesSpawned(false);
    setPlayerPosition({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - PLAYER_SIZE - 10 });
    setQuestionStartTime(Date.now());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="mb-4 text-xl">
        Lives: {lives} | Score: {userScore} | Question: {currIndex + 1}/10
      </div>
      
      {!isPlaying && !gameOver && (
        <button 
          onClick={startGame}
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          Start Game
        </button>
      )}
      
      {gameOver && (
        <div className="text-center mb-4">
          <h2 className="text-2xl mb-2">Game Over!</h2>
          <p className="mb-4">Final Score: {userScore} out of {gameData.length}</p>
          <button 
            onClick={startGame}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
      
      <div 
        className="relative bg-gray-800 rounded-lg overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Player */}
        <div
          className="absolute bg-blue-500 rounded-lg transition-all duration-100"
          style={{
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            left: playerPosition.x,
            top: playerPosition.y,
          }}
        />
        
        {/* Missiles with enhanced text labels */}
        {missiles.map((missile, index) => (
          <div key={index} className="absolute" style={{ left: missile.x, top: missile.y }}>
            {/* Background for text */}
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
            
            {/* Missile */}
            <div
              className={`absolute rounded-full ${missile.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
              style={{
                width: MISSILE_SIZE,
                height: MISSILE_SIZE,
              }}
            />
          </div>
        ))}
      </div>
      
      {isPlaying && gameData[currIndex] && (
        <div className="mt-4 text-center max-w-xl">
          <p className="mb-2 text-lg font-semibold">{gameData[currIndex].question}</p>
          <p className="text-sm text-gray-400">Collect the correct answers by touching them with your player!</p>
        </div>
      )}
    </div>
  );
}