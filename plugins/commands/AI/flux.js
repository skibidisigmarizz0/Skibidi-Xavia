import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const config = {
    name: "flux",
    aliases: ["imagerecog"],
    description: "Generate images from text",
    usage: "[text]",
    category: "Ai",
    cooldown: 5,
    permissions: [0],
    credits: "Cache",
    extra: {}
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure cache directory exists
const cacheDir = path.join(__dirname, './cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

export async function onCall({ message, args }) {
    const prompt = args.join(" ");

    if (!prompt) {
        return message.reply("Please provide a prompt to generate an image.");
    }

    const filePath = path.join(cacheDir, `generated_image.png`);

    try {
        const response = await axios({
            method: 'get',
            url: `https://kaiz-apis.gleeze.com/api/flux-1.1-pro?prompt=${encodeURIComponent(prompt)}`,
            responseType: 'stream'
        });

        // Write the image to the cache directory
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            message.reply({
                body: `Here is your generated image based on your prompt: "${prompt}"`,
                attachment: fs.createReadStream(filePath)
            });
        });

        writer.on('error', (error) => {
            console.error("Error writing image to file: ", error.message);
            message.reply("An error occurred while saving the image.");
        });
    } catch (error) {
        console.error("Error generating image: ", error.message);
        message.reply("An error occurred while processing your request. Please try again later.");
    }
}

export default {
    config,
    onCall
};