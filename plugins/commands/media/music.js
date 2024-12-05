import axios from "axios";

const config = {
  name: "music",
  aliases: ["play"],
    version: "1.0",
    credits: "",
    description: "Play a song",
    usages: "<song-name> [by <artist>]",
    category: "Media",
    cooldown: 10
};

async function onCall({message, args}) {
  const query = args.join(" ");
  const {api} = global;
  if(!query) return message.reply("Usage: spotify <query>");
  try {
    const {data} = await axios.get(`https://hiroshi-api.onrender.com/tiktok/spotify?search=${query}`);

    const {data: imgSt} = await axios.get(data[0].image, {responseType: "stream"});
    const {data: mp3St} = await axios.get(data[0].download, {responseType: "stream"});

    imgSt.path = Date.now() + ".jpg";
    mp3St.path = Date.now() + ".mp3";

   const temp = await message.reply({attachment: imgSt});
   return api.sendMessage({attachment: mp3St}, message.threadID, temp.messageID)
  } catch (e) {
    console.error(e.body)
  }
}

export default {
  onCall,
  config
}