const {SlashCommandBuilder} = require("@discordjs/builders")
const {EmbedBuilder} = require("discord.js")

module.exports = {
    data : new SlashCommandBuilder()
    .setName("stop")
    .setDescription("stop the bot"),
    execute: async ({client, interaction})=>{
        const queue = await client.player.getQueue(interaction.guild);

        if(!queue){
            await interaction.reply("The queue is empty. There is nothing to skip")
            return;
        }
        queue.destroy();

        await interaction.reply("Bye Bye")
    }
}