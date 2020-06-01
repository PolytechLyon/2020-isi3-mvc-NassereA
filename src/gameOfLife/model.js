import {
  GAME_SIZE,
  CELL_STATES,
  DEFAULT_ALIVE_PAIRS,
  RENDER_INTERVAL
} from "./constants";

export class Model {
  constructor(callback) {
    this.width = GAME_SIZE;
    this.height = GAME_SIZE;
    this.raf = null;
    this.callback = callback;
  }

  init() {
    this.state = Array.from(new Array(this.height), () =>
      Array.from(new Array(this.width), () => CELL_STATES.NONE)
    );
    DEFAULT_ALIVE_PAIRS.forEach(([x, y]) => {
      this.state[y][x] = CELL_STATES.ALIVE;
    });
    this.updated();
  }

  run(date = new Date().getTime()) {
    this.raf = requestAnimationFrame(() => {
      const currentTime = new Date().getTime();
      if (currentTime - date > RENDER_INTERVAL) {
        let change = Array.from(new Array(this.height), () =>
          Array.from(new Array(this.width), () => CELL_STATES.NONE)
        );
        for (let i = 0; i < this.width; i++) {
          for (let j = 0; j < this.width; j++) {
            change[j][i] = this.state[j][i];
          }
        }
        for (let i = 0; i < this.width; i++) {
          for (let j = 0; j < this.width; j++) {
            const nbAlive = this.aliveNeighbours(i, j);
            switch (this.state[j][i]) {
              case CELL_STATES.ALIVE:
                if (!(nbAlive === 2 || nbAlive === 3)) {
                  change[j][i] = CELL_STATES.DEAD;
                }
                break;
              default:
                if (nbAlive === 3) {
                  change[j][i] = CELL_STATES.ALIVE;
                }
                break;
            }
          }
        }
        this.state = change;
        this.updated();
        this.run(currentTime);
      } else {
        this.run(date);
      }
    });
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  reset() {
    this.stop();
    this.init();
  }

  isCellAlive(x, y) {
    return x >= 0 &&
      y >= 0 &&
      y < this.height &&
      x < this.height &&
      this.state[y][x] === CELL_STATES.ALIVE
      ? 1
      : 0;
  }
  aliveNeighbours(x, y) {
    let number = 0;
    for (let i = x - 1; i < x + 2; i++) {
      number += this.isCellAlive(i, y - 1);
    }
    for (let i = x - 1; i < x + 2; i = i + 2) {
      number += this.isCellAlive(i, y);
    }
    for (let i = x - 1; i < x + 2; i++) {
      number += this.isCellAlive(i, y + 1);
    }

    return number;
  }

  updated() {
    this.callback(this);
  }
}
