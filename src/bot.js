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
 * Track by discord ID instead
 * Removal of strikes
*/

const channelName = "strike-channel";

var strikes = [];

function readStrikes(cb){
    fs.readFile('src/strikes.txt', function (err, data)  {
        if (!data.toString()) return;
        data.toString().split(",").forEach((entry) => {
            cb(entry.split(":"));
        });
    });
}

console.log("Loaded strikes");
readStrikes(function(data) { 
    // console.log(data[0] + ": " + data[1]);
    strikes.push(data);
});

client.login(process.env.TOKEN);

client.on('messageCreate', (message) => {
    if (message.toString() == "!help") {
        Commands.help();
        return;
    }

    if (message.toString().startsWith("!strike ")) {
        let person = message.toString().substring(8).toLowerCase();
        Commands.issueStrike(person);
        return;
    }

    if (message.toString() == "!strikes") {
        Commands.printStrikes();
        return;
    }
});

const Commands = {
    help() {
        const displayString = "This is a work in progress bot, its current purpose is to track user strikes.\n\nCommands:\n!strike <user>\n!strikes\n!help";

        const displayStrikes = new EmbedBuilder()
            .setColor(0x55FF33)
            .setTitle('Help')
            .setDescription(displayString)
            .setTimestamp();

        chat.sendMessage({ embeds: [displayStrikes] }, channelName);
    },

    issueStrike(person) {
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
        let saveString = "";
        strikes.forEach((personStrikes) => {
            saveString += personStrikes[0] + ":" + personStrikes[1] + ",";
        });
        fs.writeFile('src/strikes.txt', saveString.slice(0, -1), function(err) {
            if(err) return console.log("Saving file error",err);
            console.log("The file was saved!");
        });
        
        const strikeMessage = person.charAt(0).toUpperCase() + person.slice(1) + " has recieved a strike!";
        chat.sendMessage(strikeMessage, channelName);
    },

    printStrikes() {
        let displayString = "";
        strikes.forEach((personStrikes) => {
            displayString += personStrikes[0].charAt(0).toUpperCase() + personStrikes[0].slice(1) + ": " + personStrikes[1] + "\n";
        });

        const displayStrikes = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Strikes')
            .setDescription(displayString)
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