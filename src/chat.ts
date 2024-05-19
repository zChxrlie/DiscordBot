import { client, DEBUG_MODE } from './bot';
import { TextChannel } from 'discord.js';

export const chat = {
    sendMessage(message: any, channelId: string) {
        if (DEBUG_MODE) channelId = "804357939397263385";
        const channel: TextChannel = client.channels.cache.get(channelId) as TextChannel;
        channel.send(message);
    }
}