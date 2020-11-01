const { Client, MessageEmbed } = require('discord.js');
const chalk = require("chalk")
const fetch = require("node-fetch")
const config = require("./config")
const client = new Client();

/* Configuration */
var prefix = config.prefix

let interval;
client.on('ready', () => {
    /* Embed Refresh Interval */
    interval = setInterval(editor, config.interval)

    console.log(chalk.yellow(`Logged in as `) + chalk.green(client.user.tag) + chalk.red('!'));
    console.log(chalk.blue("Invite Link : ") + chalk.green(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`))

});

let editor = async () => {

let embed = new MessageEmbed()

try {

    /* Fetching The Server Information */
    const data = await fetch(`http://${config.server.ip}/players.json`, { timeout: 3000 })
.then(res => res.json());

/* Player Count */
var pc;
if(data === null || data === []) {
    pc = 0
} else {
    pc = data.length
}

/* Identifiers */
    const getIdentifiers = ids => ids.reduce((res, id) => {
      const [type, val] = id.split(':');
      res[type] = val;
      return res;
    }, {});

let list = data.map(player => `[ ID: ${player.id} ] \`${player.name}\` <@${getIdentifiers(player.identifiers).discord || "None"}>`).join('\n')

    embed.setAuthor(config.server.name, config.server.image)
    embed.setThumbnail(config.server.image)
    embed.setTitle(`Players: [${pc}/${config.server.maxplayers}] | Space: ${Math.round(pc/config.server.maxplayers*100)}%`)
    embed.setFooter(`IP: ${config.server.ip}`)
    embed.setColor(`${config.server.color}`)
    embed.setTimestamp()
    embed.setDescription(list)

    client.channels.cache.get(config.statuschannelid).setName("🟢┇online")

} catch(e) {
    console.error(e)
    embed.setColor(`${config.server.color}`)
    embed.setTitle("Server Closed")

    client.channels.cache.get(config.statuschannelid).setName("🔴┇offline")
}
    client.user.setActivity(`🐌 [${pc}/${config.server.maxplayers}]`)

    const channel = client.channels.cache.get(config.channelid);
    const msg = await channel.messages.fetch(config.messageid);
    msg.edit(embed)
}

client.on('message', async (message) => {

if(message.content === prefix + 'update') {
    message.delete()
    if(!message.member.guild.me.hasPermission('ADMINISTRATOR')) return;
    editor()
}

if(message.content === prefix + 'showhere') {
if(!message.member.guild.me.hasPermission('ADMINISTRATOR')) return;
        const embed = new MessageEmbed()
            .setTitle("SOON")
        message.channel.send(embed)
    }
});

client.login(config.token);