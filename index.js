require('dotenv').config()
const {Client,Collection,IntentsBitField}= require('discord.js');
const {Player} = require('discord-player')
const {REST}= require('@discordjs/rest')
const {Routes}= require('discord-api-types/v9')
const fs = require('node:fs')
const path = require("node:path")
const {Configuration, OpenAIApi} = require('openai')
const config = new Configuration({
    apiKey : process.env.API_KEY
})
const openAI = new OpenAIApi(config)
const token = process.env.TOKEN;
const client_id = process.env.CLIENT_ID

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates
    ]
})

client.on('messageCreate',async (message)=>{
    if(message.author.bot) return;
    if(message.content.endsWith("!") && (!message.content.startsWith("/"))){
        try {
            await message.channel.sendTyping();
            const aiResponse = await openAI.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages : [{role:'user', content: message.content}],
                max_tokens : 100
            })
            message.reply(aiResponse.data.choices[0].message)
        } catch (error) {
            console.error(error)
        }
    }
})

const commands = []
client.commands = new Collection();

const commandPath = path.join(__dirname,"commands")
const commandFiles = fs.readdirSync(commandPath).filter(file=>file.endsWith(".js"))

for (const file of commandFiles){
    const filePath = path.join(commandPath,file)
    const command = require(filePath)

    client.commands.set(command.data.name,command)
    commands.push(command.data.toJSON())
}

client.player = new Player(client, {
    ytdlOptions:{
        quality: "highestaudio",
        highWaterMark : 1<<25
    }
})

client.on('ready', ()=>{
    console.log('Bot is online')
    const guilds_id = client.guilds.cache.map(guild => guild.id)

    const rest = new REST({version:"9"}).setToken(token)
    for (const guildId of guilds_id){
        rest.put(Routes.applicationGuildCommands(client_id,guildId),{body:commands}).catch(console.error);
    }
})

client.on("interactionCreate",async(interaction)=>{
    if(!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if(!command)return;
    try {
        await command.execute({client,interaction})
    } catch (error) {
        console.error(error)
    }
})

client.login(token)


