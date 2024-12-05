import axios from 'axios';

const config = {
    name: "ai",
    aliases: ["ai"],
    description: "Interact with the GPT-4 API or analyze images",
    usage: "[query]",
    hasPrefix: false,
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const query = args.join(" ") || "hi";
    message.react("🕒");
    message.reply("Answering...");
    const userId = message.senderID; // Get user ID from message

    const header = "";
    const footer = "";

    // Check for image attachments in the original message
    if (message.messageReply && message.messageReply.attachments && message.messageReply.attachments[0]?.type === "photo") {
        const attachment = message.messageReply.attachments[0];
        const imageURL = attachment.url;

        const geminiUrl = `https://ccprojectapis.ddns.net/api/gemini?ask=${encodeURIComponent(query)}&imgurl=${encodeURIComponent(imageURL)}`;
        try {
            const response = await axios.get(geminiUrl);
            const { vision } = response.data;

            if (vision) {
                message.react("✅");
               return await message.reply(`${header}\n${vision}\n${footer}`);
            } else {
                message.react("❌");
                return await message.reply(`${header}\nFailed to recognize the image.\n${footer}`);
            }
        } catch (error) {
            console.error("Error fetching image recognition:", error);
            message.react("❌");
            return await message.reply(`${header}\nAn error occurred while processing the image.\n${footer}`);
        }
    }

    // Handle text queries using the GPT-4 API
    try {
        const { data } = await axios.get(`https://ccprojectapis.ddns.net/api/gpt4o-v2?prompt=${encodeURIComponent(query)}`);

        if (data && data.response) {
            message.react("✅");
            await message.reply(`${header}\n${data.response}\n${footer}`);
        } else {
            message.react("❌");
            await message.reply(`${header}\nSorry, I couldn't get a response from the API.\n${footer}`);
        }
    } catch (error) {
        message.react("❌");
        console.error("Error fetching from GPT-4 API:", error);
        await message.reply(`${header}\nAn error occurred while trying to reach the API.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};