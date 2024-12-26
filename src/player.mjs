// player.mjs
import { Gameboard } from "./gameboard.mjs";

class Player {
  constructor(isAI = false) {
    this.board = new Gameboard();
    this.isAI = isAI;
    this.attackedCoordinates = [];
  }

  canPlaceShip(length, head, rotated) {
    return this.board.canPlaceShip(length, head, rotated);
  }

  placeShip(length, head, rotated, symbol='S') {
    this.board.placeShip(length, head, rotated, symbol);
  }

  getGameboard() {
    return this.board.getGameboard();
  }

  receiveAttack(coord) {
    return this.board.receiveAttack(coord);
  }

  areAllShipsSunk() {
    return this.board.allShipsSunk();
  }

  getAIMove() {
    let x,y;
    do {
      x = Math.floor(Math.random()*10);
      y = Math.floor(Math.random()*10);
    } while (this.attackedCoordinates.some(([xx,yy])=> xx===x && yy===y));
    this.attackedCoordinates.push([x,y]);
    return [x,y];
  }
}

export { Player };
