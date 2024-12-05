import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cachePath = path.resolve(__dirname, '../cache');

const config = {
    name: "tiksearch",
    version: "1.0.0",
    permissions: 0,
    credits: "",
    description: "Search for TikTok videos based on a keyword.",
    usage: "[keyword]",
    cooldown: 3,
    category: "Videos",
};

async function onCall({ message, args, data }) {
    const prefix = data?.thread?.data?.prefix || global.config.PREFIX;

    if (args.length === 0) {
        return message.reply(`Please provide a keyword to search for TikTok videos.\n\nExample: ${prefix}tiksearch apt`);
    }

    const keyword = args.join(" ");
    message.react("🕒");
    message.reply("Searching...");

    try {
        const response = await axios.get(`https://kaiz-apis.gleeze.com/api/tiksearch?search=${encodeURIComponent(keyword)}`);

        if (response.status !== 200 || !response.data || response.data.code !== 0) {
            message.react("❌");
            return message.reply("An error occurred while searching for TikTok videos.");
        }

        const videos = response.data.data.videos;

        if (videos.length === 0) {
            message.react("❔");
            return message.reply("No TikTok videos found for the given keyword.");
        }

        const video = videos[0];
        const videoUrl = video.play;
        const title = video.title;

        const videoPath = path.join(cachePath, `tiksearch_video_${Date.now()}.mp4`);
        const writer = createWriteStream(videoPath);

        const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

        videoStream.data.pipe(writer);

        writer.on('finish', async () => {
            message.react("✅");
            await message.reply({
                body: `Here is the TikTok video for the search keyword "${keyword}":\n\nTitle: ${title}`,
                attachment: fs.createReadStream(videoPath)
            });

            fs.remove(videoPath);
        });

        writer.on('error', (err) => {
            message.react("❌");
            console.error("Error downloading the video:", err);
            message.reply("An error occurred while downloading the video.");
        });

    } catch (error) {
        message.react("❌");
        console.error("Error in tiksearch command:", error);
        message.reply("An error occurred while searching for the TikTok video.");
    }
}

export default {
    config,
    onCall
};