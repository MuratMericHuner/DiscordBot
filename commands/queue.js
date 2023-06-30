const {SlashCommandBuilder} = require("@discordjs/builders")
const {EmbedBuilder} = require("discord.js")

module.exports ={
    data : new SlashCommandBuilder().setName("queue").setDescription("shows the first 10 songs in the queue"),
    execute: async ({client, interactiion})=>{
        const queue= client.player.getQueue(interactiion.guild)

        if(!queue|| !queue.playing){
            await interactiion.reply("Queue is currently empty")
            return;
        }

        const queueString = queue.tracks.slice(0,10).map((song,index)=> {return `${index+1} ${sont.title} ${song.duration}` }).join("\n")

        const currentSong = queue.current;

        await interactiion.reply({
            embeds : [
                new EmbedBuilder().setDescription(`Currently Playing: \n ${currentSong.title}`).setThumbnail(currentSong.thumbnail)
            ]
        })
    }
}