require('dotenv').config();
var fs = require("fs");
const { IntentsBitField, Client, Collection, Events, EmbedBuilder  } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent
    ],
});

/*
 * Start with 'nodemon'
 * TODO:
 * Removal of strikes
*/

const channelName = "strike-channel";
const strikeRoleID = "1173045692814602271";
const serverID = "687379271605682199"

var strikes = [];
var reasons = [];

function readStrikes(cb){
    fs.readFile('src/strikes.txt', function (err, data)  {
        if (!data.toString()) return;
        data.toString().split(",").forEach((entry) => {
            cb(entry.split(";"));
        });
    });
}

console.log("Loaded strikes");
readStrikes(function(data) { 
    // console.log(data[0] + ": " + data[1]);
    strikes.push(data);
});

function readReasons(cb){
    fs.readFile('src/reasons.txt', function (err, data)  {
        if (!data.toString()) return;
        data.toString().split(",").forEach((entry) => {
            cb(entry.split(";"));
        });
    });
}

console.log("Loaded reasons");
readReasons(function(data) { 
    // console.log(data[0] + ": " + data[1]);
    reasons.push(data);
});

client.login(process.env.TOKEN);

client.on('messageCreate', async(message) => {
    if (message.toString() == "!help") {
        commands.help();
        return;
    }

    let guild = await client.guilds.fetch(serverID);
    let member = await guild.members.fetch(message.author.id);
    if (message.toString().startsWith("!strike ")) {
        try {
            var regex = message.toString().match(/!strike (.*) *- *(.*)/);
            if (member.roles.cache.has(strikeRoleID)) {
                if (regex != null) {
                    let person = regex[1].toLowerCase().trim();
                    let reason = (regex[2].charAt(0).toUpperCase() + regex[2].slice(1)).trim();
                    commands.issueStrike(person, reason);
                    commands.issueReason(person, reason);
                } else {
                    chat.sendMessage("Invalid strike command syntax, please follow !strike <user> - <reason>, the dash is important", channelName);
                }
            } else {
                chat.sendMessage("You don't have permission to do that :point_up: :nerd:", channelName);
            }
        } catch(e) {
            console.log(e);
        }
        return;
    }

    if (message.toString() == "!strikes") {
        commands.printStrikes();
        return;
    }
});

const commands = {
    help() {
        const displayString = "This is a work in progress bot, its current purpose is to track user strikes.\n\nCommands:\n!strike <user> - <reason>\n!strikes\n!help";

        const displayStrikes = new EmbedBuilder()
            .setColor(0x55FF33)
            .setTitle('Help')
            .setDescription(displayString)
            .setTimestamp();

        chat.sendMessage({ embeds: [displayStrikes] }, channelName);
    },

    issueStrike(person, reason) {
        let foundExistingEntry = false;

        // Add strike if user already has one
        strikes.forEach((personStrikes) => {
            if (personStrikes[0] === person) {
                let newStrikes = parseInt(personStrikes[1]) + 1;
                personStrikes[1] = newStrikes.toString();
                foundExistingEntry = true;
                return;
            }
        });

        // Add strike to new user
        if (!foundExistingEntry) {
            strikes.push([person, "1"]);
        }


        // Save new strikes
        utils.saveStrikes();
        
        const strikeMessage = person + " has received a strike for " + reason;
        console.log(strikeMessage);
        chat.sendMessage(strikeMessage, channelName);
    },

    issueReason(person, reason) {
        let foundExistingEntry = false;

        // Add reason if user already has one
        reasons.forEach((personReasons) => {
            if (personReasons[0] === person) {
                let newReasons = personReasons[1] += "|" + reason;
                personReasons[1] = newReasons;
                foundExistingEntry = true;
                return;
            }
        });

        // Add reason to new user
        if (!foundExistingEntry) {
            reasons.push([person, reason]);
        }

        // Save new reasons
        utils.saveReasons();
    },

    printStrikes() {
        let displayString = "";
        strikes.forEach((personStrikes) => {
            displayString += personStrikes[0] + ": " + personStrikes[1] + "\n";
            let reasonsForPerson = reasons.find(reason => reason[0] === personStrikes[0]);
            if (reasonsForPerson) displayString += "•" + reasonsForPerson[1].replaceAll("|", "\n•") + "\n\n";           
        });

        const displayStrikes = new EmbedBuilder()
            .setColor(0xFF3333)
            .setTitle('Strikes')
            .setDescription(displayString)
            .setThumbnail('https://i.imgur.com/t7DeG7P.png')
            .setTimestamp();

        chat.sendMessage({ embeds: [displayStrikes] }, channelName);
    }
}

const chat = {
    sendMessage(message, channelName) {
        client.channels.cache
            .find(channel => channel.name === channelName)
            .send(message);
    }
}

const utils = {
    saveStrikes() {
        this.orderStrikes();

        let saveString = "";
        strikes.forEach((personStrikes) => {
            saveString += personStrikes[0] + ";" + personStrikes[1] + ",";
        });
        fs.writeFile('src/strikes.txt', saveString.slice(0, -1), function(err) {
            if(err) return console.log("Saving strike file error",err);
            console.log("Strike file was saved!");
        });
    },

    saveReasons() {
        let saveString = "";
        reasons.forEach((personReasons) => {
            saveString += personReasons[0] + ";" + personReasons[1] + ",";
        });
        fs.writeFile('src/reasons.txt', saveString.slice(0, -1), function(err) {
            if(err) return console.log("Saving reason file error",err);
            console.log("Reason file was saved!");
        });
    },

    orderStrikes() {
        strikes.sort(function(a, b) { return b[1] - a[1]});            
    }
}