const {SlashCommandBuilder} = require("@discordjs/builders")
const {EmbedBuilder} = require("discord.js")
const {QueryType} = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song through a word or url")
    .addSubcommand(subcommand=>
        subcommand.setName("song")
        .setDescription("plays playlist from yt")
        .addStringOption(option=>
             option.setName("searchterms")
            .setDescription("search keywords")
        )
        .addStringOption(option=>
            option.setName("url")
            .setDescription("url of the song")
        )
    )
    .addSubcommand(subcommand=>
        subcommand.setName("playlist")
        .setDescription("plays playlist from yt")
        .addStringOption(option=>
             option.setName("url")
            .setDescription("playlist url").setRequired(true)
        )
    ),
    execute: async ({client,interaction})=>{
        if(!interaction.member.voice.channel){
            await interaction.reply("You must be in a voice channel")
            return;
        }
        const queue = await client.player.createQueue(interaction.guild)

        if(!queue.connection) await queue.connect(interaction.member.voice.channel)
        let embed = new EmbedBuilder();

        if(interaction.option.getSubcommand()==="song"){
            let url = interaction.option.getString('url')
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });
            if(result.track.length===0){
                await interaction.reply("no results found")
                return;
            }
            const song = result.track[0]
            await queue.addTrack(song);

            embed.setDescription(`${song.title} ${song.url} has been added to the queue`).setThumbnail(song.thumbnail).setFooter({text: `Duration : ${song.duration}`});
        }else if (interaction.option.getSubcommand()==="playlist"){
            let url = interaction.option.getString('url')
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });
            if(result.track.length===0){
                await interaction.reply("no playlist found")
                return;
            }
            const playlist = result.playlist
            await queue.addTracks(playlist);

            embed.setDescription(`${playlist.title} ${playlist.url} has been added to the queue`).setThumbnail(playlist.thumbnail).setFooter({text: `Duration : ${playlist.duration}`});
        }else if(interaction.option.getSubcommand()==="search"){
            let url = interaction.option.getString('searchterms')
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
            });
            if(result.track.length===0){
                await interaction.reply("no results found")
                return;
            }
            const song = result.track[0]
            await queue.addTrack(song);

            embed.setDescription(`${song.title} ${song.url} has been added to the queue`).setThumbnail(song.thumbnail).setFooter({text: `Duration : ${song.duration}`});
        }
        if(!queue.playing) await queue.play();
        await interaction.reply({
            embeds: [embed]
        })
    }
}