const db = require("quick.db")
const Discord = require("discord.js");

module.exports = {
    name: "status",
    category: "owner",
    description: "Change the bot statuts",
    usage: "status <here>",
    run: async (client, message, args) => {
        message.channel.send(`Currently not available!`)
        /*
        if (!client.config.owners.includes(message.author.id)) return message.channel.send('No');


        if(!args.length) {
            return message.channel.send("Please specify a status message!")
        }
        db.set(`status`, args.join(" "))
        await client.user.setActivity(args.join(' '))
        await message.channel.send("Updated the bot status!")
        */
    }
}