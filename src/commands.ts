import { EmbedBuilder } from 'discord.js';
import { strikeChannelId, strikes, reasons } from './bot';
import { chat } from './chat'
import { utils } from './utils'

export const commands = {
    help() {
        const displayString = "This is a work in progress bot, its current purpose is to track user strikes.\n\nCommands:\n!strike <user> - <reason>\n!strikes\n!help";

        const displayStrikes = new EmbedBuilder()
            .setColor(0x55FF33)
            .setTitle('Help')
            .setDescription(displayString)
            .setTimestamp();

        chat.sendMessage({ embeds: [displayStrikes] }, strikeChannelId);
    },

    issueStrike(person: string, reason: string) {
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
        
        const strikeMessage = person + " has received a strike for " + reason + "!";
        console.log(strikeMessage);
        chat.sendMessage(strikeMessage, strikeChannelId);
    },

    issueReason(person: string, reason: string) {
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

        for (const i of Array(Math.ceil(displayString.length/4096)).keys()) {
            const displaySubString = displayString.substring((i*4096), (i*4096)+4096);
            if(i === 0) {
                const displayStrikes = new EmbedBuilder()
                    .setColor(0xFF3333)
                    .setTitle('Strikes')
                    .setDescription(displaySubString)
                    .setThumbnail('https://i.imgur.com/t7DeG7P.png');
                chat.sendMessage({ embeds: [displayStrikes] }, strikeChannelId);
            } 
            else {
                const displayStrikes = new EmbedBuilder()
                    .setColor(0xFF3333)
                    .setDescription(displaySubString)
                    .setTimestamp();
                chat.sendMessage({ embeds: [displayStrikes] }, strikeChannelId);
            }
        }
    }
}