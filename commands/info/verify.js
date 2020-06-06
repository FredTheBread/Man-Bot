const Discord = require('discord.js');

module.exports = {
    name: "verify",
    category: "info",
    description: "Verify yourself",
    run: async (client, message, args) => {
        if (message.author.bot) return;
        if (message.channel.id === '717090777741656125')
            await message.delete();
            const role2 = message.guild.roles.cache.get('717087975850115202');
            message.member.roles.add(role2)
        if (message.content.toLowerCase() === '!verify' && message.channel.id === '717090777741656125') {
            await message.delete().catch(err => console.log(err));
            const role = message.guild.roles.cache.get('717087975850115202');
            if (role) {
                try {
                    await message.member.roles.add(role);
                    console.log("Role added!");
                } catch (err) {
                    console.log(err);
                }
            }
        }
        /*
        const user = message.mentions.users.first() || message.author;
        if (message.channel.id !== "715630211768778863") {
            // If the channel it wasn't verification channel, ignore it.
            return;
        }
        await message.member.roles.add("690462455905648640"); // Unverified role.
        let embed = new Discord.MessageEmbed()
        .setTitle(`${user.username}, thank you for verifying!`)
        .setDescription(`You have been given the Member role`)
        await message.channel.send(embed)
        // Use this if you want to remove the role from the user.
        await message.member.roles.remove("715632530090623118");
        */
    }
}