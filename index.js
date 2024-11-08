const express = require("express");
const http = require("http");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./model/userSchema.js");
const connectDB = require("./config/mongoose-connection.js")
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const verifyUser = require("./middleware/verifyToken.js");
const cookieParser = require('cookie-parser');
const env = require('dotenv');

const app = express();
const server = http.createServer(app);
const io = socket(server);
const port = 3000;

env.config();
connectDB();


const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.use(cookieParser());
app.use(bodyParser.json()); // Parses JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));



app.get("/", (req, res) => {
    res.render("signin");
});

app.get("/chess", verifyUser,async(req, res) => {
    res.render("index", {title: "Chess game"});
});

app.post("/login", async(req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user)
        {
            res.send("User not found. Please sign up!")
        }
        else{
            if(user.password !== password)
            {
                res.send("Wrong password!")
            }
            else{  //email password is correct
                const token = jwt.sign({user}, "asdfasdjlksdf");
                res.cookie("access_token", token).redirect("/chess");
                
            }
        }
    }
    catch(err)
    {
        res.send("Error occur. Try again." + err)
    }
});


app.get("/logout", async(req, res) => {
    res.cookie("access_token", "").redirect("/");
});

app.post("/signup", async (req, res) => {
    try{
        const {name, email, password, confirmPassword} = req.body;
        if(password !== confirmPassword)
        {
            res.send("password and confirm password should be same.")
        }
        else{

            const isUser = await User.findOne({email});
            if(isUser)
            {
                res.send("You already have an account. Please log in to continue.")
            }
            
            const user = new User({name, email, password})
            const savedUser = await user.save();
            if(savedUser)
            {
                res.send("User created. Please login to continue.")
            }
        }
    }
    catch(err)
    {
        res.send("Error Ocuur. " + err);
    }
});

//socket unique info hai about someone who has connected to our server
io.on("connection", function(socket) {
    console.log("connected",socket.id);

    if(!players.white) {
        players.white = socket.id;
        socket.emit("playerRole", "w");
    } else if(!players.black) {
        players.black = socket.id;
        socket.emit("playerRole", "b");
    } else {
        socket.emit("spectatorRole");
    }

    socket.on("move", (move)=>{
        try{
            //invalid moves
            if(chess.turn() === 'w' && socket.id !== players.white) return;
            if(chess.turn() === 'b' && socket.id !== players.black) return;

            // valid moves
            let result = chess.move(move);
            console.log("result is:  ", result);
            if(result){
                //if move is valid then value of currentPlayer will be updated to next player.
                currentPlayer = chess.turn();

                //if move is valid then the frontend move also should be updated. And this will be send to all the clients
                io.emit("move", move);
                // console.log("move is:  ", move);

                //new state of board will be send to the forntend using fen
                //Forsyth–Edwards Notation (FEN) is a standard way to describe a chess board position in a single line of text. FEN is made up of ASCII characters and has six fields
                io.emit("boardState", chess.fen());
                // console.log("fen is:  ", chess.fen());
            } else {
                console.log("Invalid move: ",move);
                socket.emit("invalidMove", move);
            }
        } catch(err) {
            //when queen moved L shape
            console.log("Not a valid move:  " + err);
            socket.emit("Invalid move", move);
        }
    });
 
    socket.on("disconnect", ()=>{
        console.log("disconnected", socket.id);
        if(socket.id === players.white){
            delete players.white;
        } else if(socket.id == players.black)
        {
            delete players.black;
        }
    });


    // socket.on("check", ()=>{
    //     console.log("checked");
    // }) 
    // setInterval(()=>{
    //     socket.emit("micTesting", "Hello kena xhihi bhai");
    // }, 2000)
});


server.listen(port, () => {
    console.log("listening on port " + port);
});
