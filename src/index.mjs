// index.mjs
import './styles.css';
import { Player } from './player.mjs';

/* 
SHIP_SPECS: lengths of ships we want to place 
*/
const SHIP_SPECS = [5,4,3,3,2,2];

let playerOne = new Player(false);
let playerTwo = new Player(false);
let currentPlayer = playerOne;
let opponent = playerTwo;
let isTwoPlayerMode = true;
let gameStarted = false;

/* Placement Phase */
let placingShipsFor = null; // "playerOne" or "playerTwo"
let shipIndex = 0;
let rotated = false;
let p1PlacementDone = false; // we mask P1's board after they've placed

/* DOM */
const modeOverlay = document.getElementById('modeOverlay');
const vsFriendBtn = document.getElementById('vsFriendBtn');
const vsAiBtn = document.getElementById('vsAiBtn');

const shipPlacementUI = document.getElementById('shipPlacementUI');
const placementTitle = document.getElementById('placementTitle');
const placementInstructions = document.getElementById('placementInstructions');
const toggleRotationBtn = document.getElementById('toggleRotationBtn');
const donePlacingBtn = document.getElementById('donePlacingBtn');

const passOverlay = document.getElementById('passOverlay');

// Boards
const containerP1 = document.getElementById('board1');
const containerP2 = document.getElementById('board2');
const p1Title = document.getElementById('p1Title');
const p2Title = document.getElementById('p2Title');

const turnText = document.createElement('h1');
turnText.classList.add('turn-text');
document.body.appendChild(turnText);

/* MODE SELECT */
vsFriendBtn.addEventListener('click',()=>{
  isTwoPlayerMode=true;
  modeOverlay.style.display='none';
  startPlacementPhase();
});
vsAiBtn.addEventListener('click',()=>{
  isTwoPlayerMode=false;
  // Player Two => AI
  playerTwo=new Player(true);
  opponent=playerTwo;
  modeOverlay.style.display='none';
  startPlacementPhase();
});

/* ============= SHIP PLACEMENT ============= */
function startPlacementPhase(){
  placingShipsFor='playerOne';
  shipIndex=0; rotated=false; gameStarted=false; p1PlacementDone=false;

  shipPlacementUI.style.display='block';
  placementTitle.textContent="Player One: Place Your Ships";
  placementInstructions.textContent=`Place ship of length ${SHIP_SPECS[0]}`;
  donePlacingBtn.disabled=true;

  renderPlacementBoard(playerOne, containerP1, true, false);
  renderPlacementBoard(playerTwo, containerP2, false, false);

  if(!isTwoPlayerMode){
    p2Title.textContent="Computer";
  }
}

toggleRotationBtn.addEventListener('click',()=>{
  rotated=!rotated;
  toggleRotationBtn.textContent = rotated 
    ? "Rotate Ship (Vertical)"
    : "Rotate Ship (Horizontal)";
});

donePlacingBtn.addEventListener('click',()=>{
  if(placingShipsFor==='playerOne'){
    if(isTwoPlayerMode){
      // p1 done => mask p1's board
      p1PlacementDone=true;
      passOverlay.innerHTML='';
      passOverlay.style.display='flex';

      const modal=document.createElement('div');
      modal.classList.add('pass-device-modal');
      passOverlay.appendChild(modal);

      const msg=document.createElement('p');
      msg.style.color='black';
      msg.textContent="Pass device to Player Two (so they can place ships).";
      modal.appendChild(msg);

      const resumeBtn=document.createElement('button');
      resumeBtn.classList.add('pass-button');
      resumeBtn.textContent="OK";
      resumeBtn.addEventListener('click',()=>{
        passOverlay.style.display='none';
        placingShipsFor='playerTwo';
        shipIndex=0;
        donePlacingBtn.disabled=true;
        placementTitle.textContent="Player Two: Place Your Ships";
        placementInstructions.textContent=`Place ship of length ${SHIP_SPECS[0]}`;
        // Now allow P2 to place => we show p2's board clickable
        // and we forcibly mask p1's board
        renderPlacementBoard(playerOne, containerP1, false, true /*forceMask*/);
        renderPlacementBoard(playerTwo, containerP2, true, false /*no mask*/);
      });
      modal.appendChild(resumeBtn);
    } else {
      // AI => auto place
      autoPlaceShips(playerTwo);
      finishPlacement();
    }
  } else {
    // p2 done => start
    finishPlacement();
  }
});

function finishPlacement(){
  shipPlacementUI.style.display='none';
  gameStarted=true;
  disableBoard('board1'); // P1 attacks P2 first
  renderBoards();
  renderTurnIndicator();
}

function autoPlaceShips(player){
  for(const length of SHIP_SPECS){
    while(true){
      const x=Math.floor(Math.random()*10);
      const y=Math.floor(Math.random()*10);
      const isRot=Math.random()<0.5;
      if(player.canPlaceShip(length,[x,y],isRot)){
        player.placeShip(length,[x,y],isRot,pickSymbol(length));
        break;
      }
    }
  }
}
function pickSymbol(len){
  if(len===5)return 'C';
  if(len===4)return 'D';
  if(len===3)return 'SM';
  if(len===2)return 'PB';
  return 'S';
}

/* RENDER BOARD (for placing ships). forceMask => if we want to hide actual ships */
function renderPlacementBoard(player, container, canPlace, forceMask){
  const board=player.getGameboard();
  container.innerHTML='';

  for(let r=0;r<10;r++){
    const rowDiv=document.createElement('div');
    rowDiv.classList.add('row');
    for(let c=0;c<10;c++){
      const cellDiv=document.createElement('div');
      cellDiv.classList.add('cell');

      let val=board[r][c];
      if(forceMask && val!=='~' && val!=='M' && val!=='H'){
        // hide actual ships => show ~
        val='~';
      }

      if(val==='H') cellDiv.classList.add('hit');
      else if(val==='M') cellDiv.classList.add('miss');
      else if(val==='~') {
        cellDiv.textContent='~';
      } else {
        // ship symbol
        cellDiv.textContent=val;
      }

      if(canPlace){
        cellDiv.addEventListener('click',()=>{
          placeShipAtCell(player,r,c);
        });
      }
      rowDiv.appendChild(cellDiv);
    }
    container.appendChild(rowDiv);
  }
}

function placeShipAtCell(player,r,c){
  const length=SHIP_SPECS[shipIndex];
  if(!player.canPlaceShip(length,[r,c],rotated)){
    alert("Invalid (clipping or adjacency). Try again!");
    return;
  }
  const sym=pickSymbol(length);
  player.placeShip(length,[r,c],rotated,sym);
  shipIndex++;
  if(shipIndex<SHIP_SPECS.length){
    placementInstructions.textContent=`Place ship of length ${SHIP_SPECS[shipIndex]}`;
    if(placingShipsFor==='playerOne'){
      renderPlacementBoard(playerOne, containerP1, true, false);
    } else {
      renderPlacementBoard(playerTwo, containerP2, true, false);
    }
  } else {
    donePlacingBtn.disabled=false;
    placementInstructions.textContent="All ships placed! Click 'Done Placing'";
    if(placingShipsFor==='playerOne'){
      renderPlacementBoard(playerOne, containerP1, false, false);
    } else {
      renderPlacementBoard(playerTwo, containerP2, false, false);
    }
  }
}

/* -----------------------------------------------------------------------
   GAME
----------------------------------------------------------------------- */
function renderBoards(){
  if(!gameStarted)return;
  if(currentPlayer===playerOne){
    renderGameBoard(playerOne,containerP1,true);
    renderGameBoard(playerTwo,containerP2,false);
  } else {
    renderGameBoard(playerTwo,containerP2,true);
    renderGameBoard(playerOne,containerP1,false);
  }
}

function renderGameBoard(player, container, seeShips){
  const board=player.getGameboard();
  container.innerHTML='';
  for(let r=0;r<10;r++){
    const rowDiv=document.createElement('div');
    rowDiv.classList.add('row');
    for(let c=0;c<10;c++){
      const cellDiv=document.createElement('div');
      cellDiv.classList.add('cell');
      const val=board[r][c];
      if(val==='H') cellDiv.classList.add('hit');
      else if(val==='M') cellDiv.classList.add('miss');
      else if(val==='~') cellDiv.textContent='~';
      else {
        // ship symbol => only visible if seeShips
        cellDiv.textContent=seeShips?val:'~';
      }

      // only clickable if it's the opponent's board
      const isOppBoard=(currentPlayer===playerOne && player===playerTwo)||(currentPlayer===playerTwo&&player===playerOne);
      if(isOppBoard && gameStarted){
        cellDiv.addEventListener('click',()=>{
          handleAttackClick(player,r,c);
        });
      }
      rowDiv.appendChild(cellDiv);
    }
    container.appendChild(rowDiv);
  }
}

function handleAttackClick(defender,x,y){
  const isHit=defender.receiveAttack([x,y]);
  if(defender.areAllShipsSunk()){
    openWinnerModal(currentPlayer.isAI?'Computer':(currentPlayer===playerOne?'Player One':'Player Two'));
    disableBoard('board1'); disableBoard('board2');
    return;
  }
  // Extra turn on hit
  if(isHit){
    if(currentPlayer.isAI){
      renderBoards();
      doAIMove();
    }
  } else {
    // Miss => switch
    if(!currentPlayer.isAI){
      if(!isTwoPlayerMode){
        currentPlayer=playerTwo; opponent=playerOne;
        doAIMove();
      } else {
        switchTurns();
        renderPassOverlay();
      }
    } else {
      currentPlayer=opponent; opponent=(currentPlayer===playerOne?playerTwo:playerOne);
    }
  }
  renderBoards();
  renderTurnIndicator();
}

function doAIMove(){
  while(true){
    const [x,y]=currentPlayer.getAIMove();
    const isHit=opponent.receiveAttack([x,y]);
    if(opponent.areAllShipsSunk()){
      openWinnerModal("Computer");
      disableBoard('board1'); disableBoard('board2');
      return;
    }
    if(!isHit){
      currentPlayer=opponent;opponent=(currentPlayer===playerOne?playerTwo:playerOne);
      break;
    }
  }
  renderBoards();
  renderTurnIndicator();
}

function switchTurns(){
  currentPlayer=(currentPlayer===playerOne?playerTwo:playerOne);
  opponent=(currentPlayer===playerOne?playerTwo:playerOne);
  if(currentPlayer===playerOne){
    disableBoard('board1'); enableBoard('board2');
  } else {
    disableBoard('board2'); enableBoard('board1');
  }
}

function disableBoard(id){ document.getElementById(id).classList.add('disabled'); }
function enableBoard(id){ document.getElementById(id).classList.remove('disabled'); }

function renderTurnIndicator(){
  if(!gameStarted){ turnText.textContent='';return; }
  if(currentPlayer.isAI) turnText.textContent="Computer's Turn";
  else if(currentPlayer===playerOne) turnText.textContent=isTwoPlayerMode?"Player One's Turn":"Your Turn";
  else turnText.textContent=isTwoPlayerMode?"Player Two's Turn":"???";
}

/* PASS SCREEN (two-player) */
function renderPassOverlay(){
  if(!isTwoPlayerMode)return;
  passOverlay.innerHTML='';
  passOverlay.style.display='flex';

  const modal=document.createElement('div');
  modal.classList.add('pass-device-modal');
  passOverlay.appendChild(modal);

  const msg=document.createElement('p');
  msg.style.color='black';
  msg.textContent=`Pass device to ${
    currentPlayer===playerOne?'Player One':'Player Two'
  }`;
  modal.appendChild(msg);

  const resumeBtn=document.createElement('button');
  resumeBtn.classList.add('pass-button');
  resumeBtn.textContent='Resume';
  resumeBtn.addEventListener('click',()=>{
    passOverlay.style.display='none';
  });
  modal.appendChild(resumeBtn);

  passOverlay.addEventListener('click',(e)=>{
    if(e.target===passOverlay) passOverlay.style.display='none';
  });
}

/* END-GAME */
function openWinnerModal(who){
  const overlay=document.createElement('div');
  overlay.classList.add('overlay');
  overlay.style.display='flex';

  const modal=document.createElement('div');
  modal.classList.add('endgame-modal');
  overlay.appendChild(modal);

  const msg=document.createElement('p');
  msg.style.color='black';
  msg.textContent=`Congrats, ${who}! All enemy ships are sunk.`;
  modal.appendChild(msg);

  const resetBtn=document.createElement('button');
  resetBtn.classList.add('endgame-button');
  resetBtn.textContent='Play Again';
  resetBtn.addEventListener('click',()=>location.reload());
  modal.appendChild(resetBtn);

  document.body.appendChild(overlay);
}
