// Test comment for hot reload check
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import bgImage from './img/bg.jpeg';
import xImage from './img/x.png';
import oImage from './img/o.png';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null); // 'X' или 'O'
  const [gameStarted, setGameStarted] = useState(false);

  // Получение chat_id из URL параметра
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');

    if (idFromUrl) {
      setChatId(parseInt(idFromUrl, 10));
    } else {
      // Значение по умолчанию для теста, если id не передан
      setChatId(12345);
    }
  }, []);

  // Устанавливаем фоновое изображение для body
  useEffect(() => {
    document.body.style.backgroundImage = `url(${bgImage})`;
    document.body.style.backgroundRepeat = 'repeat';
    document.body.style.backgroundSize = '300px 300px';  // Уменьшаем изображение на 50% (оригинал 768x768)
    document.body.style.backgroundPosition = 'center';

    // Очищаем стиль при размонтировании компонента
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
    };
  }, []);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null;
  };

  // Функция для хода компьютера (случайный выбор пустой клетки)
  const computerMove = () => {
    if (gameOver) return;

    const availableMoves = [];
    board.forEach((cell, index) => {
      if (cell === null) {
        availableMoves.push(index);
      }
    });

    if (availableMoves.length === 0) return;

    const randomIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';

    const newBoard = [...board];
    newBoard[randomIndex] = computerSymbol;
    setBoard(newBoard);
    setIsXNext(true);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
      notifyGameResult(gameWinner === playerSymbol);
    } else if (!newBoard.includes(null)) {
      setGameOver(true);
      notifyGameResult(false); // Ничья
    }
  };

  // Вызов хода компьютера после хода игрока или в начале игры (если игрок выбрал O)
  useEffect(() => {
    if (gameStarted && !isXNext && !gameOver) {
      const timer = setTimeout(() => {
        computerMove();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Если игрок выбрал O и игра только началась, компьютер (X) должен ходить первым
    if (gameStarted && playerSymbol === 'O' && isXNext && board.every(cell => cell === null)) {
      const timer = setTimeout(() => {
        computerMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameStarted, gameOver, playerSymbol]);

  // Функция для выбора символа игроком
  const selectSymbol = (symbol) => {
    setPlayerSymbol(symbol);
    setGameStarted(true);
    // X всегда ходит первым по правилам игры
    // Если игрок выбрал X, он ходит первым
    // Если игрок выбрал O, компьютер (X) ходит первым
    setIsXNext(true);
  };

  const handleClick = (i) => {
    if (gameOver || board[i] || !gameStarted || !isXNext) {
      return;
    }

    const newBoard = [...board];
    newBoard[i] = playerSymbol;
    setBoard(newBoard);
    setIsXNext(false);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
      notifyGameResult(gameWinner === playerSymbol);
    } else if (!newBoard.includes(null)) {
      setGameOver(true);
      notifyGameResult(false); // Ничья
    }
  };

  const notifyGameResult = async (isWin) => {
    if (!chatId) return;

    try {
      const endpoint = isWin ? '/win' : '/lose';
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${backendUrl}${endpoint}`, {
        chat_id: chatId
      });
    } catch (error) {
      console.error('Ошибка отправки результата игры:', error);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    // X всегда ходит первым по правилам
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
  };

  const renderSquare = (i) => {
    return (
      <button
        className={`square ${board[i] === 'X' ? 'x' : board[i] === 'O' ? 'o' : ''}`}
        onClick={() => handleClick(i)}
        disabled={gameOver || board[i] !== null}
      >
        {board[i] === 'X' && <img src={xImage} alt="X" className="symbol-image" />}
        {board[i] === 'O' && <img src={oImage} alt="O" className="symbol-image" />}
      </button>
    );
  };

  const getStatus = () => {
    if (gameOver) {
      if (winner) {
        return winner === playerSymbol ? 'Вы победили! 🎉' : 'Компьютер победил! 🤖';
      } else {
        return 'Ничья! 🤝';
      }
    } else {
      if (isXNext) {
        return playerSymbol === 'X' ? 'Ваш ход (X)' : 'Ход компьютера (X)';
      } else {
        return playerSymbol === 'O' ? 'Ваш ход (O)' : 'Ход компьютера (O)';
      }
    }
  };

  // Экран выбора символа
  if (!gameStarted) {
    return (
      <div className="game">
        <div className="game-header">
          <h1>Крестики-нолики</h1>
          <p className="selection-prompt">Выберите, кем будете играть:</p>
        </div>

        <div className="symbol-selection">
          <button className="symbol-button x-button" onClick={() => selectSymbol('X')}>
            <img src={xImage} alt="X" className="selection-symbol-image" />
          </button>
          <button className="symbol-button o-button" onClick={() => selectSymbol('O')}>
            <img src={oImage} alt="O" className="selection-symbol-image" />
          </button>
        </div>

        <p className="computer-info">Вы будете играть против компьютера 🤖</p>
      </div>
    );
  }

  return (
    <div className="game">
      <div className="game-header">
        <h1>Крестики-нолики</h1>
        <div className="player-info">
          Вы: <span className="player-symbol">{playerSymbol === 'X' ? <img src={xImage} alt="X" className="info-symbol-image" /> : <img src={oImage} alt="O" className="info-symbol-image" />}</span> |
          Компьютер: <span className="player-symbol">{playerSymbol === 'X' ? <img src={oImage} alt="O" className="info-symbol-image" /> : <img src={xImage} alt="X" className="info-symbol-image" />}</span>
        </div>
      </div>

      <div className="status">{getStatus()}</div>

      <div className="board">
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>

      {gameOver && (
        <button className="reset-button" onClick={resetGame}>
          Играть снова
        </button>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TicTacToe />
  </React.StrictMode>
);