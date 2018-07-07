import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      shells: [
        { x: 150, y: 100 },
        { x: 350, y: 100 },
        { x: 550, y: 100 },
      ],

      movesDone: 0,
      movesMax: 3,
      shellWinIndex: 0,
      isBallVisible: false,
      isGameActive: false,
      isChoiceCorrect: undefined,
    };

    this.tableWidth = 800;
    this.tableHeight = 600;
    this.shellSize = 100;
    this.gameSpeed = 700;
  }

  handleStartGame = () => {
    const { isGameActive, shells } = this.state;

    if (isGameActive) {
      return;
    }

    this.setState({
      movesDone: 0,
      shellWinIndex: Math.floor(Math.random() * shells.length),
      isGameActive: true,
      isBallVisible: true,
      isChoiceCorrect: undefined,
    });

    setTimeout(() => {
      this.setState({ isBallVisible: false });
      this.shuffleShells()
    }, 1500);
  }

  handleDifficultyChange(e) {
    const value = parseInt(e.target.value, 10);
    this.setState({ movesMax: value });
  }

  handleChoice(index) {
    const {
      movesDone,
      movesMax,
      shellWinIndex,
      isGameActive,
    } = this.state;

    if (isGameActive || movesDone < movesMax) {
      return;
    }

    const newisChoiceCorrect = index === shellWinIndex;

    this.setState({ isChoiceCorrect: newisChoiceCorrect });
  }

  shuffleShells() {
    const { shells, movesMax } = this.state;

    const {
      tableWidth,
      tableHeight,
      shellSize,
      gameSpeed,
    } = this;

    const interval = setInterval(() => {
      function generateNewPos(cur) {
        cur.x = Math.floor(Math.random() * (tableWidth - shellSize));
        cur.y = Math.floor(Math.random() * (tableHeight - shellSize));
        return cur;
      }

      const updatedShells = shells.slice().reduce((acc, cur) => {
        const clonedShell = Object.assign({}, cur);

        let newPos = generateNewPos(clonedShell);

        function isShellOverlap() {
          return acc.some(({ x, y }) => {
            const overlapX = (newPos.x >= x - shellSize) && (newPos.x <= x + shellSize);
            const overlapY = (newPos.y >= y - shellSize) && (newPos.y <= y + shellSize);
            return overlapX && overlapY;
          });
        }

        while(isShellOverlap()) {
          newPos = generateNewPos(clonedShell);
        }

        acc.push(newPos);
        return acc;
      }, []);

      this.setState(
        ({ movesDone }) => ({
          movesDone: movesDone + 1,
          shells: updatedShells,
        }),
        () => {
          if (this.state.movesDone >= movesMax) {
            clearInterval(interval);
            this.setState(() => ({ isGameActive: false }))
          }
        }
      )
    }, gameSpeed);
  }

  render() {
    const {
      shells,
      shellWinIndex,
      movesMax,
      isGameActive,
      isBallVisible,
      isChoiceCorrect,
    } = this.state;

    const shellElements = shells.map((shell, index) => (
      <div
        key={index}
        className="game-shell"
        onClick={() => this.handleChoice(index)}
        style={{transform: `translate(${shell.x}px, ${shell.y}px)`}}>
        <div
          className="game-ball"
          style={{ opacity: isBallVisible && shellWinIndex === index ? '1' : '0' }}>
        </div>
      </div>
    ));

    return (
      <div className="App">
        <h1>Street game</h1>

        <h2 className="game-result-text">
          { isChoiceCorrect !== undefined
            ? (isChoiceCorrect ? 'YOU WIN!' : 'YOU LOSE')
            : '\xa0'
          }
        </h2>

        <select
          value={movesMax}
          onChange={(e) => this.handleDifficultyChange(e)}
          disabled={isGameActive}>
          <option value="3">Beginner</option>
          <option value="5">Intermediate</option>
          <option value="10">Expert</option>
        </select>

        <button
          onClick={this.handleStartGame}
          disabled={isGameActive}>
          Start
        </button>

        <div className="game-table">
          {shellElements}
        </div>
      </div>
    );
  }
}

export default App;
