const db = require("quick.db")
const {
    default_prefix
} = require("../../config.json")
const discord = require('discord.js')

module.exports = {
    name: "prefix",
    category: "moderation",
    usage: "prefix <new-prefix>",
    description: "Change the guild prefix",
    run: async (client, message, args) => {
        //PERMISSION
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            return message.channel.send("You are not allowed or do not have permission to change the prefix")
        }
        let symbol = args.join(" ");
        if (!symbol) return message.channel.send("Please input the prefix.");

        if (symbol[1]) {
            return message.channel.send("You can not set prefix a double argument")
        }

        if (symbol.length > 3) {
            return message.channel.send("You can not send prefix more than 3 characters")
        }

        message.flags = [];
        while (args[0] && args[0][0] === "-") {
            message.flags.push(args.shift().slice(1)); // Message Flags: -default, -ban, -parameter
        }
        if (message.flags[0] === "default") {
            await db.delete(`prefix.${message.guild.id}`);
            return message.channel.send("The server prefix has been changed back to default. `!`");
        }

        db.set(`prefix_${message.guild.id}`, args[0])
        return message.channel.send(`The server prefix has been changed to **${symbol}**`);

    }
}