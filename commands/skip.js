const {SlashCommandBuilder} = require("@discordjs/builders")
const {EmbedBuilder} = require("discord.js")

module.exports = {
    data : new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),
    execute: async ({client, interaction})=>{
        const queue = await client.player.getQueue(interaction.guild);

        if(!queue){
            await interaction.reply("The queue is empty. There is nothing to skip")
            return;
        }

        const currentSong = queue.current;

        queue.skip();

        await interaction.reply({
            embeds: [
                new EmbedBuilder().setDescription(`${currentSong.title} skipped`).setThumbnail(currentSong.thumbnail)
            ]
        })
    }
}