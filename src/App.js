import React, { useState } from 'react';
import './App.css';

function App() {
  const [history, setHistory] = useState([
    [
      { x: 150, y: 100, hasBall: false },
      { x: 300, y: 100, hasBall: false },
      { x: 450, y: 100, hasBall: false },
    ]
  ]);
  const [numMovesLimitLocked, setNumMovesLimitLocked] = useState(3);
  const [numMovesLimit, setNumMovesLimit] = useState(3);
  const [shellChoice, setShellChoice] = useState(null);
  const boardWidth = 700;
  const boardHeight = 500;
  let numTransitions = 0;

  function numMovesDone() {
    return history.length - 1;
  }

  function isStarted() {
    return history[0].some(shell => shell.hasBall);
  }

  function isBallVisible() {
    return history.length === 1 && isStarted();
  }

  function isFinished() {
    return numMovesDone() === numMovesLimitLocked;
  }

  function handleDifficultyChange(e) {
    setNumMovesLimit(Number(e.target.value));
  }

  function handleStartGame(e) {
    e.preventDefault();

    numTransitions = 0;

    const currShells = history[history.length - 1];
    const winningIndex = Math.floor(Math.random() * currShells.length);
    const newShells = currShells.map((shell, shellIndex) => {
      const newShell = Object.assign({}, shell);
      newShell.hasBall = shellIndex === winningIndex;
      return newShell;
    });

    setHistory([newShells]);
    setShellChoice(null);
    setNumMovesLimitLocked(numMovesLimit);
  }

  function handleTransitionEnd() {
    numTransitions++;
    if (numTransitions % 3 === 0) {
      shuffleShells();
    }
  }

  function generateNewPositions() {
    const shellSize = 100;

    function generateNewPosition(position) {
      position.x = Math.floor(Math.random() * (boardWidth - shellSize));
      position.y = Math.floor(Math.random() * (boardHeight - shellSize));
      return position;
    }

    function isShellOverlap(acc, newPos) {
      return acc.some(({ x, y }) => {
        const overlapX = (newPos.x >= x - shellSize) && (newPos.x <= x + shellSize);
        const overlapY = (newPos.y >= y - shellSize) && (newPos.y <= y + shellSize);
        return overlapX && overlapY;
      });
    }

    const newPositions = history[history.length - 1]
      .reduce((acc, cur) => {
        const shell = Object.assign({}, cur);
        let newPos = generateNewPosition(shell);

        while(isShellOverlap(acc, newPos)) {
          newPos = generateNewPosition(shell);
        }

        acc.push(newPos);
        return acc;
      }, []);

    return newPositions;
  }

  function shuffleShells() {
    if (isFinished()) {
      return;
    }

    const isFinalMove = numMovesDone() === numMovesLimitLocked - 1;

    const newShellPositions = isFinalMove
      ? finalShuffle(history[0])
      : generateNewPositions();

    setHistory(history.concat([newShellPositions]));
  }

  function finalShuffle(shells) {
    const avalablePositions = shells.map(({ x }) => x);

    const shuffledShells = shells.map(shell => {
      const randomIndex = Math.floor(Math.random() * avalablePositions.length);
      shell.x = avalablePositions[randomIndex];
      avalablePositions.splice(randomIndex, 1);
      return shell;
    });

    return shuffledShells;
  }

  function getBallClassNames() {
    const ballClassNames = ['ball'];

    if (isBallVisible()) {
      ballClassNames.push('ball--start');
    }

    if (shellChoice && shellChoice.hasBall) {
      ballClassNames.push('ball--win');
    }

    return ballClassNames.join(' ');
  }

  function Ball() {
    return <div
      className={getBallClassNames()}
      onAnimationEnd={shuffleShells}>
    </div>
  }

  const shellElements = history[history.length - 1]
    .map((shell, index) =>
      <div
        role="button"
        key={index}
        className="shell"
        onClick={() => setShellChoice(shell)}
        onTransitionEnd={handleTransitionEnd}
        style={{transform: `translate(${shell.x}px, ${shell.y}px)`}}
        disabled={!isFinished()}>
        { shell.hasBall && <Ball/> }
      </div>
    );

  return (
    <div className="App" style={{ width: boardWidth }}>
      <h1>Shell game</h1>

      <form className="form" onSubmit={handleStartGame}>
        <div>
          <button
            type="submit"
            className="form__btn"
            disabled={isStarted() && numMovesDone() < numMovesLimitLocked}>
            START
          </button>
        </div>

        <div className="form__options">
          <label className="form__label">
            <input
              type="radio"
              name="difficulty"
              value="3"
              onChange={handleDifficultyChange}
              checked={numMovesLimit === 3}
              disabled={isStarted() && !isFinished()}/>
              Beginner
          </label>

          <label className="form__label">
            <input
              type="radio"
              name="difficulty"
              value="5"
              onChange={handleDifficultyChange}
              checked={numMovesLimit === 5}
              disabled={isStarted() && !isFinished()}/>
              Intermediate
          </label>

          <label className="form__label">
            <input
              type="radio"
              name="difficulty"
              value="10"
              onChange={handleDifficultyChange}
              checked={numMovesLimit === 10}
              disabled={isStarted() && !isFinished()}/>
              Expert
          </label>
        </div>
      </form>

      <div className="board" style={{ height: boardHeight }}>
        <div className="board__result">
          { shellChoice && (shellChoice.hasBall ? 'FOUND IT!' : 'TRY ANOTHER') }
        </div>
        {shellElements}
      </div>
    </div>
  )
}

export default App;
