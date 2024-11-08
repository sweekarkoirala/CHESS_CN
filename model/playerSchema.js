const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    name: String,
    place: Number,
    playerCount: {
        type:Number,
        default: 0
    },
});

const Player = mongoose.model("player", playerSchema);

module.exports = Player;
