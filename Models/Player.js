const { Schema, model} = require('mongoose');

const Player = Schema({
    discord_id: String,
    playerName: String,
    playerClass: String,
    playerLevel: Number,
    playerExp: Number,
    playerCurrency: Number,
    playerHealth: Number,
    playerChi: Number,
    location: {
        x: Number,
        y: Number,
        z: Number
    }
});

module.exports = model('Player', Player);