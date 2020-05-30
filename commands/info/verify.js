const Discord = require('discord.js');

module.exports = {
    name: "verify",
    category: "info",
    description: "Verify yourself",
    run: async (client, message, args) => {
        const user = message.mentions.users.first() || message.author;
        if (message.channel.id !== "715630211768778863") {
            // If the channel it wasn't verification channel, ignore it.
            return;
        }
        await message.member.roles.add("690462455905648640"); // Member role.
        let embed = new Discord.MessageEmbed()
        .setTitle(`${user.username}, thank you for verifying!`)
        .setDescription(`You have been given the Member role`)
        await message.channel.send(embed)
        // Use this if you want to remove the role from the user.
        await message.member.roles.remove("715632530090623118");
    }
}