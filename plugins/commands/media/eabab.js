import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const config = {
    name: "eabab",
    aliases: [""],
    description: "Fetch a random girl video.",
    usage: "",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "xavballz",
};

// Ensure cache directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.join(__dirname, './cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

// Main command function
async function onCall({ message }) {
    try {
      await message.react("🕒"); // Indicate processing
        const apiUrl = 'https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu';
        const response = await axios.get(apiUrl);
        const videoData = response.data;

        if (!videoData) throw new Error(" Failed to fetch data");

        const ext = videoData.shotiurl.split('.').pop();
        const filePath = path.join(cacheDir, `shoti.${ext}`);

        const writer = fs.createWriteStream(filePath);
        const videoResponse = await axios.get(videoData.shotiurl, { responseType: 'stream' });
        videoResponse.data.pipe(writer);

        writer.on('finish', () => {
            message.react("✅");
            message.reply({
                body: `Title: ${videoData.title || 'No title'}\n\nRegion: ${videoData.region}\nDuration: ${videoData.duration} seconds\nUsername: ${videoData.nickname}`,
                attachment: fs.createReadStream(filePath)
            }).then(() => fs.unlinkSync(filePath)); // Delete the file after sending
        });

        writer.on('error', (error) => {
            message.react("❌");
            console.error("Error writing video to file: ", error.message);
            message.reply("Error.");
        });
    } catch (error) {
        console.error(error);
        await message.react("❌"); // React with ❎ on error
        await message.reply("Error occured.");
    }
}

export default {
    config,
    onCall
};