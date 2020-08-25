'use strict';
//ENV file
require('dotenv').config()

// Import the discord.js module
const Discord = require('discord.js');
//Import MongoDB Stuff
const mongoose = require('mongoose');
const Player = require('./Models/Player.js');
const { format } = require('path');

//Import Player Classes
const {playerClassOne, playerClassTwo, playerClassThree, playerClassFour} = require ('./playerClass.js')

//Connect to MongoDB

const db = 'mongodb://localhost/ProjecTan';

mongoose
  .connect(db, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Create an instance of a Discord client
const client = new Discord.Client({
});

let prefix = "$";

client.on('ready', () => {
  console.log('I am ready!');
  console.log(playerClassTwo.name)
//  client.user.setActivity('a game', { type: 'PLAYING' })
});
//ARGS Managment


//---------------

//ADM CMD Clear Chat 99 Msgs
client.on("message", msg => {
    if (msg.content.toLowerCase().startsWith(prefix + "clearchat")) {
        async function clear() {
            msg.delete();
            const fetched = await msg.channel.messages.fetch({limit: 99});
            msg.channel.bulkDelete(fetched);
        }
        clear();
    }
});

client.on('message', msg => {
    let role = (msg.member.guild.roles.cache.find(role => role.name === 'New Player'));
    let member = msg.member;
    let m = msg.content.toLowerCase();
    if (m.startsWith(prefix + 'register')) {
            const dUID = msg.author.id;
            Player.find({ discord_id: `${dUID}`}, (err, doesExist) => {
                if(Object.keys(doesExist).length === 0){
                    const Accounts = new Player({
                        discord_id: dUID,
                        playerLevel: 1,
                        playerCurrency: 100,
                        playerExp: 0,
                        playerHealth: 100,
                        playerChi: 10,
                        location: {
                            x:0,
                            y:0,
                            z:2
                        }
                    });
                    Accounts.save()
                    .then(result => console.log(result))
                    .catch(err => console.log(err));
                    member.roles.add(role);
                    let everyone = (msg.member.guild.roles.cache.find(role => role.name === '@everyone'));
                    let name = msg.author.username + ' Play Area'
                    let welcome = `<@${msg.author.id}> You have registered. To set up your character head to the getting-started channel.`;
                    console.log(welcome)
                    msg.channel.send(welcome)
                        msg.guild.channels.create(name, {
                        permissionOverwrites: [
                            {
                            id: everyone.id,
                            deny: 'VIEW_CHANNEL'
                            }, {
                            id: msg.author.id,
                            allow: 'VIEW_CHANNEL'
                            }
                        ]
                        }).catch(err => console.error(err));

                } else if(doesExist[0].discord_id === dUID){
                    msg.reply("You already have an account!")
                }
            })
     }
  })

// Set Name

client.on('message', msg => {
    let m = msg.content.toLowerCase();
    if (m.startsWith(prefix + 'setname')) {
        let playerName = '';
        let args = msg.content.split(" ");
        for(let i = 1; 5 > i; i++){
            if(args[i]){
                playerName += `${args[i]} `
            }
        }

        let pName = playerName.trim();
        const dUID = msg.author.id;
        let canSave = 0;
        Player.find({ discord_id: `${dUID}`}, (err, doesExist) => {
            try{
                canSave = doesExist[0].location.z
                if(canSave !== 2){
                    msg.channel.send("You cannot change your character name after saving.")
                } else if(canSave === 2){
                    Player.findOneAndUpdate({ discord_id: `${dUID}`}, {$set: {"playerName": pName} }, (err, doc) => {
                        if (err) {
                            console.log("Something wrong when updating data!");
                        }
                        msg.member.setNickname(pName, 'Account setup')
                        msg.channel.send(`You have changed your character name to ${pName}`)
                    });
                }
            }
            catch(err){
                console.log(err)
            }
        })
     }
  })

// Set Class

client.on('message', msg => {
    let m = msg.content.toLowerCase();
    if (m.startsWith(prefix + 'setclass')) {
        let playerClass = '';
        let args = msg.content.split(" ");
        playerClass = args[1].toLowerCase();
        let canSave = 0;
        const dUID = msg.author.id;

        Player.find({ discord_id: `${dUID}`}, (err, doesExist) => {
            try{
                canSave = doesExist[0].location.z
                if(canSave !== 2){
                    msg.channel.send("You cannot change your character name after saving.")
                } else if(canSave === 2){
                    if(playerClass === playerClassFour.name || playerClass === playerClassThree.name || playerClass === playerClassOne.name || playerClass === playerClassTwo.name ){
                        const dUID = msg.author.id;
                        Player.findOneAndUpdate({ discord_id: `${dUID}`}, {$set: {"playerClass": playerClass} }, (err, doc) => {
                            if (err) {
                                console.log("Something wrong when updating data!");
                            }
                            console.log(doc);
                            msg.channel.send(`You have selected ${playerClass} bending.`)
                        });
                    } else {
                        msg.channel.send("You need to select one of the four elements, Air, Water, Earth, Fire. As an example '$setclass Earth'")
                    }
                }
            }
            catch(err){
                console.log(err)
            }
        })
     }
  })

//Save Player

client.on('message', msg => {
    let m = msg.content.toLowerCase();
        if(m.startsWith(prefix + 'saveplayer')) {
            const dUID = msg.author.id;
            Player.findOneAndUpdate({ discord_id: `${dUID}`}, {$set: {"location.z": 0}}, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!");
                }
                console.log(doc);
                msg.channel.send("You have saved your character.")
            });
        };
    });

//Movement
client.on('message', msg => {
    let m = msg.content.toLowerCase();
        if(m.startsWith(prefix + 'north')) {
            const dUID = msg.author.id;
            Player.findOneAndUpdate({ discord_id: `${dUID}`}, {$inc: {"location.x": 1}}, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!");
                }
                console.log(doc);
                msg.channel.send("You went north")
            });
        }
        /*msg.channel.type == "dm"*/
        if(m.startsWith(prefix + 'south')) {
            const dUID = msg.author.id;
            Player.findOneAndUpdate({ discord_id: `${dUID}`}, {$inc: {"location.x": -1}}, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!");
                }
                console.log(doc);
                msg.channel.send("You went south")
            });
        }
        if(m.startsWith(prefix + 'west')) {
            const dUID = msg.author.id;
            Player.findOneAndUpdate({ discord_id: `${dUID}`}, {$inc: {"location.y": 1}}, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!");
                }
                console.log(doc);
                msg.channel.send("You went west")
            });
        }
        if(m.startsWith(prefix + 'east')) {
            const dUID = msg.author.id;
            Player.findOneAndUpdate({ discord_id: `${dUID}`}, {$inc: {"location.y": -1}}, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!");
                }
                console.log(doc);
                msg.channel.send("You went east")
            });
        }    
 
/*
!!Mentions Example!!

      if (message.content.startsWith('L!hug')) { 
        let targetMember = message.mentions.members.first();
        if(!targetMember) return message.reply('you need to tag a user in order to hug them!!');
             message.channel.send(`<@${targetMember.user.id}> you just got a hug  https://tenor.com/view/anime-cuddle-cute-gif-12668750`);
        }
    */
});



client.login(process.env.BOT_KEY);