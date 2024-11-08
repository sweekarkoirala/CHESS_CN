const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessBoard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;   //initially when you enter the game. Your roll is not decided either it is white or black

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square",
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if(square) //square is either object datatype or null
            {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");

                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e)=> {
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = { row : rowIndex, col : squareIndex};
                        e.dataTransfer.setData("text/plain", "");   //for smooth running on cross browsers so that there won't be any problem dragging the element
                        // The line e.dataTransfer.setData("text/plain", ""); is used to ensure that a drag-and-drop operation is properly recognized by the browser by setting some drag data, even if it is an empty string. This can be necessary for ensuring compatibility and functionality of drag-and-drop features across different browsers.
                    }
                });

                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row : parseInt(squareElement.dataset.row),
                        col : parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSource);
                }
            })
            // console.log(square, squareIndex);
            boardElement.appendChild(squareElement);   
        })
    }); 
    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    const move = {
        from : `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to : `${String.fromCharCode(97 + target.col)}${8 - target.row}` ,
        promotion : 'q'
    };

    socket.emit("move", move);
};


const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p : "♙",
        r : "♜",
        n : "♞",
        b : "♝",
        q : "♛",
        k : "♚",
        P : "♟",
        R : "♖",
        N : "♘",
        B : "♗",
        Q : "♕",
        K : "♔",
    };
    
    return unicodePieces[piece.type] || ""; 
};


socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", (role) => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
})

socket.on("Invalid move", (move) => {
    console.log("invalid move: ", move);
    alert("Invalid move");
})

renderBoard();
























































// socket.emit("check");
// socket.on("micTesting", (data)=>{
//     document.write(data)
//     console.log("hello thik xiyau bhai");
// })