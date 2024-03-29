import { Board , IBoard} from "./Board.js";
import { MOVE_KEY, LEVEL, Current } from "./type.js";
import { moves } from "./moves.js";
import { userProxy, time } from "./user.js";

const playBtn = document.querySelector('.play-btn')!;
const pauseBtn = document.querySelector('.pause-btn')!;

const canvas = document.getElementById('board') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const canvasNext = document.getElementById('next') as HTMLCanvasElement;
const ctxNext = canvasNext.getContext('2d')!;

  
let requestId:number|null;
const board:IBoard = new Board(ctx, ctxNext);
let CURRENT_PLAYING:Current = Current["first"];


// 키 이벤트 핸들링
function handleKeyPress(event:any) {
    if(event.keyCode == 32){
        let newTetro = moves[MOVE_KEY.DOWN](board.tetromino);;
        while(board.checkLocation(newTetro)){
            board.tetromino.move(newTetro);
            newTetro = moves[MOVE_KEY.DOWN](board.tetromino);
        }           
        return;
    }
    try{
        const key:MOVE_KEY = event.keyCode;
        const newTetro = moves[key](board.tetromino);

        // 이동할 위치가 유효한지 체크하기
        if(!board.checkLocation(newTetro)) return;
        // 테트로미노 위치 고정
        board.tetromino.move(newTetro);
        // 캔버스 지우기
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
        // 테트로미노 그리기
        board.tetromino.draw();
    }catch(err){
        console.log(event.keyCode, err)
    }
}

document.addEventListener('keydown', (event)=>{
    event.preventDefault();
    handleKeyPress(event);
});



function animate(now = 0) {
    time.elapsed = now - time.start;
    if(time.elapsed > LEVEL[time.level]) {
        time.start = now;
        if(!board.drop()){
            if(!requestId)return;
            cancelAnimationFrame(requestId);
            gameOver();
            return;
        }
    }

    if(requestId){
        cancelAnimationFrame(requestId);
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    board.draw();

    requestId = window.requestAnimationFrame(animate);
}


function resetGame() {
    userProxy.score = 0;
    userProxy.level = 0;
    userProxy.lines = 0;
    time.start = 0;
    time.elapsed = 0;
    time.start = 0
    board.init();
}


// 시작
function play() {
    if(CURRENT_PLAYING ==  Current["first"]){
        resetGame();
    }

    CURRENT_PLAYING = Current.playing;
    animate();

    pauseBtn.setAttribute('style', 'display : ""');
    playBtn.setAttribute('style', 'display : none');
} 

// 게임중단
function pause() {
    if(!requestId) return;

    CURRENT_PLAYING = Current.paused;
    cancelAnimationFrame(requestId);

    pauseBtn.setAttribute('style', 'display : none');
    playBtn.setAttribute('style', 'display : ""');
}

// 게임 오버
function gameOver(){
    console.table(board.grid);
    askName(userProxy.score);

    CURRENT_PLAYING = Current.first;
    
    pauseBtn.setAttribute('style', 'display : none');
    playBtn.setAttribute('style', 'display : ""');
}

function askName(score:number) {
    let name = prompt("이름을 입력하세요");
    if(!name){
        name = 'user'
    }
    const data = {
        name , score
    } 
    
    fetch('/score/board/record' , {
        method: 'POST', 
        headers: {
           'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(result=>{
        console.log(result)
    })
}


playBtn.addEventListener('click', play);

pauseBtn.setAttribute('style', 'display : none');
pauseBtn.addEventListener('click', pause);
  