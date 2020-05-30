const {
  Client,
  Collection
} = require("discord.js");
const dateformat = require('dateformat');
const {
  config
} = require("dotenv");
const {
  default_prefix,
  token
} = require("./config.json");
const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  disableEveryone: true
});
client.config = require("./config.json");
const db = require("quick.db");
const discord = require('discord.js');
// Collections
client.commands = new Collection();
client.aliases = new Collection();
client.queue = new Map();
client.snipes = new discord.Collection();
const {
  badwords
} = require("./data.json");
const {
  addexp
} = require("./handlers/xp.js");
const fs = require("fs");
const {
  join
} = require("path");
var userData = JSON.parse(fs.readFileSync('./userdata.json', 'utf8'));
const alexa = require('alexa-bot-api');
var chatbot = new alexa("aw2plm");
var express = require('express');
var http = require('http')
var PORT = process.env.PORT || 5000;
var app = express();
var server = http.Server(app);
process.env.token = token;


// Run the command loader
["command"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
})
/*
client.on('message', async message => {
  if(message.author.bot) return;
  let content = message.content;
  chatbot.getReply(content).then(r => message.channel.send(r))
})
*/

client.on("error", console.error);

client.on('messageDelete', async (message) => {
  require('./messageDelete.js')(message)
})

client.on("ready", () => {
  console.log(`${client.user.username} is now online!`);
  client.user.setActivity(db.get(`status`))
})

server.listen(PORT, function() {
  console.log('Bot is online')
});

function userInfo(user) {
  var finalString;
  let embed = new discord.MessageEmbed()
  finalString = embed
    .setTitle(`**Data of ${user.username}**`)
    .addField(`**Username**`, `**${user.username} with the id of ${user.id}**`)
    .addField(`**Date of creation**`, '**' + user.createdAt + '**')
    .addField(`**Messages sent in current server**`, '**' + userData[user.id].messagesSent + '**')
    .setThumbnail(user.avatarURL())
  return finalString;
}

function is_url(str) {
  let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if (regexp.test(str)) {
    return true;
  } else {
    return false;
  }
}

client.on("message", async (message, args) => {
  var msg = message.content.toLowerCase();
  if (msg.startsWith(default_prefix + 'sexy')) {
    const love = Math.random() * 100;
    const loveIndex = Math.floor(love / 10);
    const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);

    const embed = new discord.MessageEmbed()
      .setColor("#FC08BD")
      .addField(`☁ **${message.member.displayName}** is  **💟 ${Math.floor(love)}%** Sexy Today! **`, `\n\n${loveLevel}`);

    message.channel.send(embed);
  }

})

client.on("message", async message => {

  if (is_url(message.content) === true) {
    message.delete()
    let gembed = new discord.MessageEmbed()
      .setDescription(`${message.author}, you can\'t send links here :/`)
      .setColor("#0000FF")
    return message.channel.send(gembed)
  }

  if (message.author.bot) return;
  if (!message.member.hasPermission("ADMINISTRATOR")) {

    let confirm = false;

    var i;
    for (i = 0; i < badwords.length; i++) {

      if (message.content.toLowerCase().includes(badwords[i].toLowerCase()))
        confirm = true;
    }
    if (confirm) {
      message.delete()
      let bembed = new discord.MessageEmbed()
        .setDescription(`${message.author}, don't swear here :/`)
        .setColor("#0000FF")
      return message.channel.send(bembed)
    }
  }
  if (!message.guild) return;
  let prefix = db.get(`prefix_${message.guild.id}`)
  if (prefix === null) prefix = default_prefix;
  if (!message.content.startsWith(prefix)) return;
  // If message.member is uncached, cache it.
  if (!message.member) message.member = await message.guild.fetchMember(message);

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;

  // Get the command
  let command = client.commands.get(cmd);
  // If none is found, try to find it by alias
  if (!command) command = client.commands.get(client.aliases.get(cmd));

  // If a command is finally found, run the command
  if (command)
    command.run(client, message, args);

  return addexp(message)
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  return addexp(message)
})

client.on("guildMemberAdd", (member) => {
  let chx = db.get(`welchannel_${member.guild.id}`);

  if (chx === null) {
    return;
  }

  let wembed = new discord.MessageEmbed()
    .setAuthor(member.user.username, member.user.avatarURL())
    .setColor("#0032FF")
    .setTitle("Welcome", )
    .addField(":page_facing_up: Name:", member.user)
    .addField(":detective: User ID:", member.id)
    .addField(":chart_with_upwards_trend:  Member Count:", member.guild.memberCount)
    .setFooter(member.guild.name)
    .setTimestamp(member.guild.createdAt)
    .setThumbnail(member.user.avatarURL())
    .setDescription("Welcome :tada: Have Fun!");

  client.channels.cache.get(chx).send(wembed)
  member.roles.add("715632530090623118");
})

client.on("guildMemberRemove", (member) => {
  let chx = db.get(`leavechannel_${member.guild.id}`);

  if (chx === null) {
    return;
  }

  let wembed = new discord.MessageEmbed()
    .setAuthor(member.user.username, member.user.avatarURL())
    .setColor("#FF2D00")
    .setTitle("Goodbye", )
    .addField(":page_facing_up: Name:", member.user)
    .addField(":detective: User ID:", member.id)
    .addField(":chart_with_upwards_trend:  Member Count:", member.guild.memberCount)
    .setFooter(member.guild.name)
    .setTimestamp(member.guild.createdAt)
    .setThumbnail(member.user.avatarURL())
    .setDescription("Goodbye ", member.user);

  client.channels.cache.get(chx).send(wembed)
})

client.on('message', (message, args) => {
  var sender = message.author;
  var msg = message.content.toLowerCase();
  let user = message.mentions.users.first()
  if (msg.startsWith(default_prefix + 'userstats')) {
    if (msg === default_prefix + 'userstats') {
      message.channel.send(userInfo(sender));
    }
  }
  if (!userData[sender.id]) userData[sender.id] = {
    messagesSent: 0
  }

  userData[sender.id].messagesSent++;
  fs.writeFile('./userdata.json', JSON.stringify(userData), (err) => {
    if (err) console.log(err)
  });
})

client.on("message", message => {
  var msg = message.content.toLowerCase();
  if (msg.startsWith(default_prefix + "spotify")) {
    let user;
    if (message.mentions.users.first()) {
      user = message.mentions.users.first();
    } else {
      user = message.author;
    }

    let convert = require('parse-ms')

    let status = user.presence.activities[0];

    if (user.presence.activities.length === 0 || status.name !== "Spotify" && status.type !== "LISTENING") return message.channel.send("This user isn't listening to Spotify!");

    if (status !== null && status.type === "LISTENING" && status.name === "Spotify" && status.assets !== null) {
      let image = `https://i.scdn.co/image/${status.assets.largeImage.slice(8)}`,
        url = `https://open.spotify.com/track/${status.syncID}`,
        name = status.details,
        artist = status.state,
        album = status.assets.largeText,
        timeStart = status.timestamps.start,
        timeEnd = status.timestamps.end,
        timeConvert = convert(timeEnd - timeStart);

      let minutes = timeConvert.minutes < 10 ? `0${timeConvert.minutes}` : timeConvert.minutes;
      let seconds = timeConvert.seconds < 10 ? `0${timeConvert.seconds}` : timeConvert.seconds;

      let time = `${minutes}:${seconds}`;

      const embed = new discord.MessageEmbed()
        .setAuthor("Spotify Track Information", "https://cdn.discordapp.com/emojis/408668371039682560.png")
        .setColor(0x1ED768)
        .setThumbnail(image)
        .addField("Name:", name, true)
        .addField("Album:", album, true)
        .addField("Artist:", artist, true)
        .addField("Duration:", time, false)
        .addField("Listen now on Spotify!", `[\`${artist} - ${name}\`](${url})`, false)
      message.channel.send(embed)
    }
  }
});

client.on("message", message => {
  var msg = message.content.toLowerCase()
  if (msg.startsWith(default_prefix + "reaction roles")) {
    let channel = client.channels.cache.get("715621396616577035"); // We want to sent the embed, directly to this channel.
    const embed = new discord.MessageEmbed()
      .setColor(0xffffff)
      .setTitle("Pick your roles!")
      .setDescription(`1️⃣ Boss \n\n2️⃣ Hunter`) // We're gonna try an unicode emoji. Let's find it on emojipedia.com !
    channel.send(embed).then(async msg => {
      await msg.react("1️⃣");
      await msg.react("2️⃣");
      // We're gonna using an await, to make the react are right in order.
    })
  }
});

client.on("messageReactionAdd", async (reaction, user, message) => {
  // If a message gains a reaction and it is uncached, fetch and cache the message.
  // You should account for any errors while fetching, it could return API errors if the resource is missing.
  if (reaction.message.partial) await reaction.message.fetch(); // Partial messages do not contain any content so skip them.
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return; // If the user was a bot, return.
  if (!reaction.message.guild) return; // If the user was reacting something but not in the guild/server, ignore them.
  if (reaction.message.guild.id !== "689568955345797204") return; // Use this if your bot was only for one server/private server.

  if (reaction.message.channel.id === "715621396616577035") { // This is a #self-roles channel.
    if (reaction.emoji.name === "1️⃣") {
      await reaction.message.guild.members.cache.get(user.id).roles.add("709275670743613512") // Minecraft role.
      return user.send(`Boss role was given to you!`).catch(() => console.log("Failed to send DM."));
    }

    if (reaction.emoji.name === "2️⃣") {
      await reaction.message.guild.members.cache.get(user.id).roles.add("709275360696729642"); // Roblox role.
      return user.send(`Hunter role was given to you!`).catch(() => console.log("Failed to send DM."));
    }
  } else {
    return; // If the channel was not a #self-roles, ignore them.
  }
})


client.on("messageReactionRemove", async (reaction, user) => {
  // We're gonna make a trigger, if the user remove the reaction, the bot will take the role back.
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.message.guild.id !== "689568955345797204") return;

  if (reaction.message.channel.id === "715621396616577035") {
    if (reaction.emoji.name === "1️⃣") {
      await reaction.message.guild.members.cache.get(user.id).roles.remove("709275670743613512") // Minecraft role removed.
      return user.send("Boss role was taken away from you! :(").catch(() => console.log("Failed to send DM."));
    }

    if (reaction.emoji.name === "2️⃣") {
      await reaction.message.guild.members.cache.get(user.id).roles.remove("709275360696729642") // Roblox role removed.
      return user.send("Hunter role was taken away from you! :(").catch(() => console.log("Failed to send DM."));
    }
  } else {
    return;
  }
});

client.on("message", message => {
  var msg = message.content.toLowerCase();
  if (msg.startsWith(default_prefix + "meme") || msg.startsWith(default_prefix + "memes")) {
    const got = require('got'),
      {
        MessageEmbed
      } = require('discord.js');

    got('https://www.reddit.com/r/meme/random/.json').then(response => {
      let content = JSON.parse(response.body),
        image = content[0].data.children[0].data.url,
        embed = new MessageEmbed()
        .setAuthor(`Fresh Meme from Reddit`)
        .setImage(image)
        .setTimestamp()
        .setFooter('from: r/meme')
      message.channel.send(embed);
    }).catch(console.log)
  }
})

client.on("message", message => {
  var msg = message.content.toLowerCase();
  if (msg.startsWith(default_prefix + 'guild')) {
    client.guilds.create('New server', { region: 'us-east'});
    channel.createInvite({ temporary: true, reason: 'Just testing' });
    message.channel.send(invite)
  }
})



/*
client.on("message", message => {
  let moment = require('moment')
  let user = message.mentions.users.first() || message.author; // You can do it by mentioning the user, or not.

  if (user.presence.status === "dnd") user.presence.status = "Do Not Disturb";
  if (user.presence.status === "idle") user.presence.status = "Idle";
  if (user.presence.status === "offline") user.presence.status = "Offline";
  if (user.presence.status === "online") user.presence.status = "Online";

  function game() {
    let game;
    if (user.presence.activities.length >= 1) game = `${user.presence.activities[0].type} ${user.presence.activities[0].name}`;
    else if (user.presence.activities.length < 1) game = "None"; // This will check if the user doesn't playing anything.
    return game; // Return the result.
  };

  let x = Date.now() - user.createdAt; // Since the user created their account.
  let y = Date.now() - message.guild.members.cache.get(user.id).joinedAt; // Since the user joined the server.
  let created = Math.floor(x / 86400000); // 5 digits-zero.
  let joined = Math.floor(y / 86400000);

  const member = message.guild.member(user);
  let nickname = member.nickname !== undefined && member.nickname !== null ? member.nickname : "None"; // Nickname
  let createdate = moment.utc(user.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss"); // User Created Date
  let joindate = moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss"); // User Joined the Server Date
  let status = user.presence.status; // DND, IDLE, OFFLINE, ONLINE
  let avatar = user.avatarURL({
    size: 2048
  }); // Use 2048 for high quality avatar.

  const embed = new discord.MessageEmbed()
    .setAuthor(user.tag, avatar)
    .setThumbnail(avatar)
    .setTimestamp()
    .setColor(0x7289DA)
    .addField("ID", user.id, true)
    .addField("Nickname", nickname, true)
    .addField("Created Account Date", `${createdate} \nsince ${created} day(s) ago`, true)
    .addField("Joined Guild Date", `${joindate} \nsince ${joined} day(s) ago`, true)
    .addField("Status", status, true)
    .addField("Game", game(), true)

  message.channel.send(embed) // Let's see if it's working.
});


client.on("message", message => {
  let moment = require('moment')
  let icon = message.guild.iconURL({
    size: 2048
  }); // Server Avatar

  let region = {
    "brazil": "Brazil",
    "eu-central": "Central Europe",
    "singapore": "Singapore",
    "london": "London",
    "russia": "Russia",
    "japan": "Japan",
    "hongkong": "Hongkong",
    "sydney": "Sydney",
    "us-central": "U.S. Central",
    "us-east": "U.S. East",
    "us-south": "U.S. South",
    "us-west": "U.S. West",
    "eu-west": "Western Europe",
    "europe": "Europe"
  }

  // Members
  let member = message.guild.members;
  let offline = member.cache.filter(m => m.user.presence.status === "offline").size,
    online = member.cache.filter(m => m.user.presence.status === "online").size,
    idle = member.cache.filter(m => m.user.presence.status === "idle").size,
    dnd = member.cache.filter(m => m.user.presence.status === "dnd").size,
    robot = member.cache.filter(m => m.user.bot).size,
    total = message.guild.memberCount;

  // Channels
  let channels = message.guild.channels;
  let text = channels.cache.filter(r => r.type === "text").size,
    vc = channels.cache.filter(r => r.type === "voice").size,
    category = channels.cache.filter(r => r.type === "category").size,
    totalchan = channels.cache.size;

  // Region
  let location = region[message.guild.region];

  // Date
  let x = Date.now() - message.guild.createdAt;
  let h = Math.floor(x / 86400000) // 86400000, 5 digits-zero.
  let created = dateformat(message.guild.createdAt); // Install "dateformat" first.

  const embed = new discord.MessageEmbed()
    .setColor(0x7289DA)
    .setTimestamp(new Date())
    .setThumbnail(icon)
    .setAuthor(message.guild.name, icon)
    .setDescription(`**ID:** ${message.guild.id}`)
    .addField("Region", location)
    .addField("Date Created", `${created} \nsince **${h}** day(s)`)
    .addField("Owner", `**${message.guild.owner.user.tag}** \n\`${message.guild.owner.user.id}\``)
    .addField(`Members [${total}]`, `Online: ${online} \nIdle: ${idle} \nDND: ${dnd} \nOffline: ${offline} \nBots: ${robot}`)
    .addField(`Channels [${totalchan}]`, `Text: ${text} \nVoice: ${vc} \nCategory: ${category}`)
  message.channel.send(embed) // Let's see if it's working!
});
*/
client.login(process.env.token); //Paste Your Bot Token