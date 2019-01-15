import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        [
          { x: 150, y: 100, hasBall: false },
          { x: 300, y: 100, hasBall: false },
          { x: 450, y: 100, hasBall: false },
        ]
      ],
      numMovesLimitLocked: 3,
      numMovesLimit: 3,
      shellChoice: null,
    };

    this.boardWidth = 700;
    this.boardHeight = 500;
    this.numTransitions = 0;
  }

  numMovesDone() {
    return this.state.history.length - 1;
  }

  // Step 1
  isStarted() {
    return this.state.history[0].some(shell => shell.hasBall);
  }

  // Step 1.1
  isBallVisible() {
    return this.state.history.length === 1 && this.isStarted();
  }

  // Step 2
  isShuffling() {
    return this.state.history.length > 1 && this.numMovesDone() < this.state.numMovesLimitLocked;
  }

  // Step 3
  isFinished() {
    return this.numMovesDone() === this.state.numMovesLimitLocked;
  }

  handleDifficultyChange = e => {
    e.persist();
    this.setState({
      numMovesLimit: parseInt(e.target.value, 10)
    });
  }

  handleStartGame = e => {
    e.preventDefault();

    this.numTransitions = 0;

    const currShells = this.state.history[this.state.history.length - 1];
    const winningIndex = Math.floor(Math.random() * currShells.length);
    const newShells = currShells.map((shell, shellIndex) => {
      const newShell = Object.assign({}, shell);
      newShell.hasBall = shellIndex === winningIndex;
      return newShell;
    });

    this.setState({
      history: [newShells],
      shellChoice: null,
      numMovesLimitLocked: this.state.numMovesLimit
    });
  }

  handleTransitionEnd = () => {
    this.numTransitions++;
    if (this.numTransitions % 3 === 0) {
      this.shuffleShells();
    }
  }

  generateNewPositions() {
    const shellSize = 100;
    const { boardWidth, boardHeight } = this;

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

    const newPositions = this.state.history[this.state.history.length - 1]
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

  shuffleShells = () => {
    if (this.isFinished()) {
      return;
    }

    const { history, numMovesLimit } = this.state;
    const isFinalMove = this.numMovesDone() === numMovesLimit - 1;

    const newShellPositions = isFinalMove
      ? this.finalShuffle(history[0])
      : this.generateNewPositions();

    this.setState({
      history: history.concat([newShellPositions]),
    });
  }

  finalShuffle(shells) {
    const avalablePositions = shells.map(({ x }) => x);

    const shuffledShells = shells.map(shell => {
      const randomIndex = Math.floor(Math.random() * avalablePositions.length);
      shell.x = avalablePositions[randomIndex];
      avalablePositions.splice(randomIndex, 1);
      return shell;
    });

    return shuffledShells;
  }

  render() {
    const {
      history,
      numMovesLimit,
      numMovesLimitLocked,
      shellChoice,
    } = this.state;

    const ballClassNames = ['ball'];

    if (this.isBallVisible()) {
      ballClassNames.push('ball--start');
    }

    if (shellChoice && shellChoice.hasBall) {
      ballClassNames.push('ball--win');
    }

    const Ball = () => <div
      className={ballClassNames.join(' ')}
      onAnimationEnd={this.shuffleShells}>
    </div>

    const shellElements = history[history.length - 1]
      .map((shell, index) =>
        <button
          key={index}
          className="shell"
          onClick={() => this.setState({ shellChoice: shell })}
          onTransitionEnd={this.handleTransitionEnd}
          style={{transform: `translate(${shell.x}px, ${shell.y}px)`}}
          disabled={!this.isFinished()}>
          { shell.hasBall && <Ball/> }
        </button>
      );

    return (
      <div className="App" style={{ width: this.boardWidth }}>
        <h1>Shell game</h1>

        <form className="form" onSubmit={this.handleStartGame}>
          <div>
            <button
              type="submit"
              className="form__btn"
              disabled={this.isStarted() && this.numMovesDone() < numMovesLimitLocked}>
              START
            </button>
          </div>

          <div className="form__options">
            <label className="form__label">
              <input
                type="radio"
                name="difficulty"
                value="3"
                onChange={this.handleDifficultyChange}
                checked={numMovesLimit === 3}
                disabled={this.isStarted() && !this.isFinished()}/>
                Beginner
            </label>

            <label className="form__label">
              <input
                type="radio"
                name="difficulty"
                value="5"
                onChange={this.handleDifficultyChange}
                checked={numMovesLimit === 5}
                disabled={this.isStarted() && !this.isFinished()}/>
                Intermediate
            </label>

            <label className="form__label">
              <input
                type="radio"
                name="difficulty"
                value="10"
                onChange={this.handleDifficultyChange}
                checked={numMovesLimit === 10}
                disabled={this.isStarted() && !this.isFinished()}/>
                Expert
            </label>
          </div>
        </form>

        <div className="board" style={{ height: this.boardHeight }}>
          <div className="board__result">
            { shellChoice && (shellChoice.hasBall ? 'FOUND IT!' : 'TRY ANOTHER') }
          </div>
          {shellElements}
        </div>
      </div>
    );
  }
}

export default App;
