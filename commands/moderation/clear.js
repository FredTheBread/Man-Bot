const { MessageEmbed } = require('discord.js')

module.exports = {
    name: "clear",
    category: "moderation",
    description: "Deletes the given amount of messages",
    run: async (client, message, args) => {

        if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) return message.channel.send("I don't have the permission to execute this command!");

        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You need the `MANAGE MESSAGES` permission to execute this command.");
        
        let messageArray = message.content.split(" ");
        const amount = parseInt(args[0]) + 1;
        
        if (isNaN(amount)) {
            return message.channel.send(`${message.author.username}, you can only clear messages 1 to 99 messages!`)
        } else if (amount <= 1 || amount > 100) { 
            return message.channel.send(`${message.author.username}, you can only clear messages from 1 to 99 messages!`)
        }
        
        message.channel.bulkDelete(amount, true)
        const embed = new MessageEmbed()
        
            .setAuthor(`Bulk Moderation`, message.author.avatarURL({ dynamic: true, format: 'png' }))
            .setColor('RANDOM')
            .addField("Cleared by:", `${message.author}`)
            .addField("Cleared in:", message.channel)
            .addField("Total Messages Deleted:", amount)
            .setTimestamp()
            .setFooter(`${client.user.username}`)
        
        message.channel.bulkDelete(amount);
        message.channel.send(embed)
    }
}