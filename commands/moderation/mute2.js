const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "mute2",
    category: "moderation",
    description: "Mutes someone",
    run: async (client, message, args) => {

        const user = message.mentions.members.first();
 
        if (!user) {
            return message.channel.send(
                "Please mention the member to who you want to mute"
            );
        }

        if (user.id === message.author.id) {
            return message.channel.send("I won't mute you -_-");
        }
        if (!message.member.hasPermission("MANAGE_ROLES")) {
            return message.channel.send(
                "You do not have permission to mute anyone"
            );
        }

        if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
            return message.channel.send("I do not have permission to manage roles.");
        }

        let reason = args.slice(1).join(" ")


        if (!reason) {
            return message.channel.send("Please Give the reason to mute the member")
        }

        let muterole = message.guild.roles.cache.find(x => x.name === "Muted")


        if (!muterole) {
            return message.channel.send("This server do not have role called `Muted`")
        }

        if (user.roles.cache.has(muterole)) {
            return message.channel.send("That User is already muted")
        }

        user.roles.add(muterole)

        await message.channel.send(`You muted **${message.mentions.users.first().username}** for \`${reason}\``)

        user.send(`You are muted in **${message.guild.name}** for \`${reason}\``)
    }
}