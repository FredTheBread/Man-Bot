const {
  Client,
  Collection
} = require("discord.js"), {
  post
} = require("node-superfetch");
const dateformat = require('dateformat');
const {
  config
} = require("dotenv");
const {
  prefix,
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
  addexp
} = require("./handlers/xp.js");
const fs = require('fs');
const {
  join
} = require("path");
var userData = JSON.parse(fs.readFileSync('./userdata.json', 'utf8'));
const alexa = require('alexa-bot-api');
var chatbot = new alexa("aw2plm");

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

const usersMap = new Map();
const LIMIT = 5;
const TIME = 7000;
const DIFF = 3000;

client.on('message', message => {
  if (message.author.bot) return;
  if (usersMap.has(message.author.id)) {
    const userData = usersMap.get(message.author.id);
    const {
      lastMessage,
      timer
    } = userData;
    const difference = message.createdTimestamp - lastMessage.createdTimestamp;
    let msgCount = userData.msgCount;
    console.log(difference);
    if (difference > DIFF) {
      clearTimeout(timer);
      console.log('Cleared timeout');
      userData.msgCount = 1;
      userData.lastMessage = message;
      userData.timer = setTimeout(() => {
        usersMap.delete(message.author.id);
        console.log('Removed from RESET.');
      }, TIME);
      usersMap.set(message.author.id, userData);
    } else {
      ++msgCount;
      if (parseInt(msgCount) === LIMIT) {
        const role = message.guild.roles.cache.get('700654368378191892');
        message.member.roles.add(role);
        message.channel.send('You have been muted.');
        setTimeout(() => {
          message.member.roles.remove(role);
          message.channel.send('You have been unmuted');
        }, TIME);
      } else {
        userData.msgCount = msgCount;
        usersMap.set(message.author.id, userData);
      }
    }
  } else {
    let fn = setTimeout(() => {
      usersMap.delete(message.author.id);
      console.log('Removed from map.');
    }, TIME);
    usersMap.set(message.author.id, {
      msgCount: 1,
      lastMessage: message,
      timer: fn
    });
  }
});

client.on("error", console.error);

client.on('messageDelete', async (message) => {
  require('./messageDelete.js')(message)
});


client.on("ready", () => {
  console.log(`${client.user.username} is now online!`);

  function randomStatus() {

    let status = ["Discord Bot", "YouTube", "Discord", "Minecraft", "Node.js", "Your Mom", "Fortnite", "Epic Games", "Pornhub", "Twitch", "Github", "Coding", "Warzone", "Valorant", "Hacking into the FBI", "Don't spam please", "https://discord.gg/2pzzqnP join please"] // You can change it whatever you want.
    let rstatus = Math.floor(Math.random() * status.length);

    // client.user.setActivity(status[rstatus], {type: "WATCHING"}); 
    // You can change the "WATCHING" into STREAMING, LISTENING, and PLAYING.
    // Example: streaming
    client.user.setPresence({
      activity: {
        name: `${client.users.cache.size} Users`,
        type: 'WATCHING'
      },
      status: "online"
    }, )
  };
  setInterval(randomStatus, 30000)
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


client.on("message", async (message, args) => {
  var msg = message.content.toLowerCase();
  if (msg.startsWith(prefix + 'sexy')) {
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
  let blacklist = await db.fetch(`blacklist_${message.author.id}`);
  if (blacklist === "Blacklisted") return;

  if (message.author.bot) return;
  if (!message.guild) return;

  let pref = db.get(`prefix.${message.guild.id}`);
  let prefix;
  // If message.member is uncached, cache it.
  if (!message.member) message.member = await message.guild.fetchMember(message);

  const args = message.content.slice(prefix).trim().split(/ + /g);
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


client.on('message', async message => {
  if (message.author.bot) return; // Ignore if the user is a bot.

  let pref = db.get(`prefix.${message.guild.id}`);
  let prefix;

  if (!pref) {
    prefix = "!"; // If the server doesn't have any custom prefix, return default.
  } else {
    prefix = pref;
  }
  if (!message.content.startsWith(prefix)) return; // use this. so your bot will be only executed with prefix.

  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let msg = message.content.toLowerCase();
  let cmd = args.shift().toLowerCase();


  message.flags = [];
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1)); // Message Flags: -default, -ban, -parameter
  }

  if (msg.startsWith(prefix + "prefix")) {
    if (!message.member.hasPermission("MANAGE_GUILD")) return message.channel.send("You don't have the permissions to do this!");
    let data = db.get(`prefix.${message.guild.id}`);
    if (message.flags[0] === "default") {
      await db.delete(`prefix.${message.guild.id}`);
      return message.channel.send("The server prefix has been changed back to default. `!`");
    }

    let symbol = args.join(" ");
    if (!symbol) return message.channel.send("Please input the prefix.");

    db.set(`prefix.${message.guild.id}`, symbol);
    return message.channel.send(`The server prefix has been changed to **${symbol}**`);
  }
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
  if (msg.startsWith( + 'userstats')) {
    if (msg === prefix + 'userstats') {
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
  if (msg.startsWith(prefix + "spotify")) {
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
  var msg = message.content.toLowerCase();
  if (msg.startsWith(prefix + "meme") || msg.startsWith(prefix + "memes")) {
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
});


client.login(token);