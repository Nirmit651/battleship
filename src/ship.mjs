// ship.mjs
class Ship {
    constructor(length, coordinates = []) {
      this.length = length;
      this.coordinates = coordinates;
      this.numberOfTimesHit = 0;
    }
  
    getCoordinates() {
      return this.coordinates;
    }
  
    addHit() {
      this.numberOfTimesHit++;
    }
  
    isSunk() {
      return this.numberOfTimesHit >= this.length;
    }
  }
  
  export { Ship };
  