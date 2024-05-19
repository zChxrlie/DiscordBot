require('dotenv').config();
import * as fs from 'fs';
import { IntentsBitField, Client, } from 'discord.js';
import { log } from 'console';

import { commands } from './commands'
import { chat } from './chat'

export const client = new Client({
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
 * Fix using punctuation
 * Removal of strikes
 * Editing reasons
 * New embed doesnt do it mid-sentence
*/

export const DEBUG_MODE = true;

export const strikeChannelId = "1168698286102822983";
const generalChannelId = "816006495816777758";
const strikeRoleID = "1173045692814602271";
const serverID = "687379271605682199"

export var strikes: any[][] = [];
export var reasons: any[][] = [];

console.log("Loaded strikes");
fs.readFile('src/strikes.txt', function (err, data)  {
    if (!data.toString()) return;
    data.toString().split(",").forEach((entry) => {
        // console.log(data[0] + ": " + data[1]);
        strikes.push(entry.split(";"));
    });
});

console.log("Loaded reasons");
fs.readFile('src/reasons.txt', function (err, data)  {
    if (!data.toString()) return;
    data.toString().split(",").forEach((entry) => {
        // console.log(data[0] + ": " + data[1]);
        reasons.push(entry.split(";"));
    });
});

client.login(process.env.TOKEN);

client.on('messageCreate', async(message) => {
    if (message.toString() == "!help") {
        commands.help();
        return;
    }

    let guild = await client.guilds.fetch(serverID);
    let member = await guild.members.fetch(message.author.id);

    if(message.toString().match(/^!hundred$/)) {
        chat.sendMessage("https://cdn.discordapp.com/attachments/816006495816777758/1238454235780354148/image.png?ex=6645ef63&is=66449de3&hm=2aa28c9ef7903a14bc94cb2125d1a9101395cc57bc82032e5145ac5c4e1f77a2&",
        generalChannelId);
         return;
    }

    if(message.toString().match(/^!hundred2$/)) {
        chat.sendMessage("https://cdn.discordapp.com/attachments/816006495816777758/1161369374385504328/IMG_1269.png?ex=66465004&is=6644fe84&hm=b786d0a3ebc6d54feae3ecd817504ce342b5a9b46986d9e26c9a05c92f39b02b&",
         generalChannelId);
         return;
    }

    if(message.toString().match(/^!playpro$/)) {
        chat.sendMessage("https://cdn.discordapp.com/attachments/816006495816777758/1240307928628723792/image.png?ex=66461645&is=6644c4c5&hm=fe56516d28f8504c6534201bea15412fadc659ec02c445c53ac57e71be53ea04&",
        generalChannelId);
         return;
    }

    if (message.toString().startsWith("!strike ")) {
        try {
            var regex = message.toString().match(/!strike (.*) *- *(.*)/);
            if (member.roles.cache.has(strikeRoleID) && member.id !== "550404784029564933") {
                if (regex != null) {
                    let person = regex[1].toLowerCase().trim();
                    let reason = (regex[2].charAt(0).toUpperCase() + regex[2].slice(1)).trim();
                    commands.issueStrike(person, reason);
                    commands.issueReason(person, reason);
                } else {
                    chat.sendMessage("Invalid strike command syntax, please follow !strike <user> - <reason>, the dash is important", strikeChannelId);
                }
            } else {
                chat.sendMessage("You don't have permission to do that :point_up: :nerd:", strikeChannelId);
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