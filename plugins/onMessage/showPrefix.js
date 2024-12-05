import axios from 'axios';

const langData = {
    "en_US": {
        "prefix.get": "𝐃𝐚́𝐱𝐨̈𝐧 𝚙𝚛𝚎𝚏𝚒𝚡 𝚒𝚜: {prefix}"
    }
}

async function onCall({ message, getLang, data }) {

    if (message.body == "prefix" && message.senderID !== global.botID) {
        const attachment = await axios.get("https://imgur.com/4RigCGl.jpeg", { responseType: "stream" })
            .then(response => response.data)
            .catch(err => console.error("Error fetching image: ", err));
        message.reply({
            body: getLang("prefix.get", {
                prefix: data?.thread?.data?.prefix || global.config.PREFIX
            }),
            attachment: attachment 
        });
    }

    return;
}

export default {
    langData,
    onCall
}
