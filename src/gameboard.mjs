// gameboard.mjs
import { Ship } from "./ship.mjs";

class Gameboard {
  constructor() {
    this.gameboard = Array.from({ length: 10 }, () => Array(10).fill('~'));
    this.ships = [];
  }

  getGameboard() {
    return this.gameboard;
  }

  canPlaceShip(length, [r,c], rotated) {
    const coords = this._getCoordinates(length, [r,c], rotated);
    // Check bounds + adjacency
    for (const [x,y] of coords) {
      if (x<0 || x>9 || y<0 || y>9) return false; // out-of-bounds
      if (!this.isCellFreeOfShips(x,y)) return false;
    }
    return true;
  }

  placeShip(length, [r,c], rotated, symbol='S') {
    const coords = this._getCoordinates(length, [r,c], rotated);
    const newShip = new Ship(length, coords);
    this.ships.push(newShip);
    coords.forEach(([x,y]) => {
      this.gameboard[x][y] = symbol;
    });
  }

  _getCoordinates(length, [r,c], rotated) {
    const out = [];
    for (let i=0; i<length; i++) {
      const x = rotated ? r+i : r;
      const y = rotated ? c : c+i;
      out.push([x,y]);
    }
    return out;
  }

  // Ensure 1-cell gap (including diagonals)
  isCellFreeOfShips(x, y) {
    for (let dx=-1; dx<=1; dx++){
      for (let dy=-1; dy<=1; dy++){
        const nx = x+dx, ny = y+dy;
        if (nx>=0 && nx<10 && ny>=0 && ny<10) {
          const val = this.gameboard[nx][ny];
          if (val !== '~' && val !== 'M' && val !== 'H') {
            return false;
          }
        }
      }
    }
    return true;
  }

  receiveAttack([x,y]) {
    const val = this.gameboard[x][y];
    if (val==='~') {
      this.gameboard[x][y] = 'M';
      return false;
    } else if (val==='M' || val==='H') {
      return false;
    } else {
      // It's a ship symbol
      this.gameboard[x][y] = 'H';
      this._registerHit(x,y);
      return true;
    }
  }

  _registerHit(x,y) {
    for (const ship of this.ships) {
      for (const [sx,sy] of ship.getCoordinates()) {
        if (sx===x && sy===y) {
          ship.addHit();
          return;
        }
      }
    }
  }

  allShipsSunk() {
    return this.ships.every(s => s.isSunk());
  }
}

export { Gameboard };
