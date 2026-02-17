//currently working on CONVERTING Classes to old-school new Function
//this is for the most compatible reach to bleach older developers eyeballs! \o/

"use strict";

const fs = require("fs");
const webSocket = require('ws');
const tokens = require('./config.json');
const {
    Client, Collection, GatewayIntentBits, SlashCommandBuilder,
    EmbedBuilder, Events, REST, Routes
} = require('discord.js');
const clientId = "763924189374840892";
const guildId = "1219483237139746896";
let commandList = [];

const keepOnly =(obj,keys)=>{
    let result = {};
    for(const i in obj)
        for(const j in keys)
            if(i === keys[j])
                result[i] = obj[i]
    return result;
};

const mergeObj=(parent,modify)=>{
    let keepMethods = {};
    for(const i in parent){
        keepMethods.push(i);
        for(const j in modify)
            if(i == j)
                parent[i] = modify[i]
    }
    return keepMethods;
};

const editor = (user, callback) => {
    const fs = require("fs");
    let obj = JSON.parse(fs.readFileSync('./users,json'));
    let bool = false;

    if (typeof obj[user] === "undefined")
        obj[user] = {
            points: 0,
            chat: 0,
            freebie: 0
        };

    let userObj = callback(obj[user]);
    for(const i in obj[user])
        for(const j in userObj)
            if(i === j)
                obj[user[i]] = userObj[j];
            else if(j === 'bool')
                bool = userObj[j];
            else continue;

    const stringy = JSON.stringify(obj,'',4);
    fs.writeFileSync('./users.json',stringy);
    return {
        bool, obj
    };
};

const message = (...embeds) => ({
    ephemeral: true,
    content: '',
    embeds: [...embeds]
});

const footer = (timeBegin, timeEnd) => ({
    text: `Request done in ${
        Math.ceil((timeEnd - timeBegin) * 1000) / 1000
    }ms`,
    iconURL: "https://tenor.com/view/clock-gif-14609778"
});

const commands = () => ({
    ping(){
        return{
            data : new SlashCommandBuilder()
                .setName("ping")
                .setDescription("Replies with Pong!"),
            execute(interaction){
                return new EmbedBuilder()
                    .setTitle("Pong!")
                    .setDescription("Pong!")
                    .setColor("Green");
            }
        }
    },
    freebie(){
        return {
            data : new SlashCommandBuilder()
                .setName("freebie")
                .setDescription("Replies with a free item!"),
            execute(interaction) {
                const user = editor(
                    interaction.user.id,
                    cb = jsonUser => {
                        let points = jsonUser.points;
                        if (Date.now() <= jsonUser.freebie + 3600000) 
                            bool = false;
                        else {
                            jsonUser.freebie = Date.now();
                            jsonUser.points +=
                                Math.round(Math.random() * 1000) + 500;
                            bool = true;
                        }
                        return {
                            bool, jsonUser
                        }
                    }
                );

                return new EmbedBuilder()
                    .setTitle("Freebie")
                    .setDescription(
                        user.bool
                            ? `You earned: ${user.obj.points - user.obj.points}pts`
                            : "You already got a free item this hour!",
                    )
                    .setColor(user.bool ? "Green" : "Red");
            }
        }
    }
});

const deploy = ({list, app, guild}) => {
    if(!(list && app && guild))
        throw new Error(`Expected proper config`)

    const {REST, Routes} = require('discord.js');
    const tokens = require('./config.json');
    const rest = new REST({version :"10"})
        .setToken(tokens.djs);

    rest
        .put(
            Routes.applicationGuildCommands(app,guild),
            {body:list}
        )
        .then( comms =>{
            console.log(
                `Successfully reloaded ${comms.length} application (/) commands.`,
            );
        })
        .catch(err=>{
            console.log(err)
        });
};

const botEvents = () => ({
    ready:()=>({
        once:true,
        name:'ready',
        execute(interaction){
            console.log(`Logged in as ${interaction.user.tag}`);
        }
    }),
    interactionCreate:()=>({
        name: "interactionCreate",
        execute(interaction){
            if(!interaction.isChatInputCommand()) return;
            if(!(interaction.commandName in commands())) return;
            const embeds = commands()
                [interaction.commandName]()
                .execute(interaction);
            interaction
                .reply(message(
                    embeds
                        .setTimestamp()
                        .setFooter(footer(
                            interaction.time,
                            performance.now()
                        ))
                ))
                .catch(err=>{
                    const msg = message(
                        new EmbedBuilder()
                            .setTitle("Error")
                            .setDescription(err.toString())
                            .setColor("Red")
                            .setTimestamp()
                            .setFooter(
                                footer(
                                    interaction.time,
                                    performance.now(),
                                ),
                            ),
                    );
                    
                    if (
                        interaction.replied ||
                        interaction.deferred
                    )
                        return interaction.followUp(msg);
                    else return interaction.reply(msg);
                })
        }
    })
});

const client = new Client({
    intents:[GatewayIntentBits.Guilds]
});

client.commands = new Collection();


//command initializers to discordjs api
for (const commandUse in commands()) {
    const command = commands()[commandUse]();
    if ("data" in command)
        if ("execute" in command)
            client.commands.set(
                command.data.name,
                command,
            );
}

//deploying datas from commands to the discordjs api
const deployCreds = {commandList, guildId, clientId};
if (!deploy(deployCreds)) throw new Error("Failed to deploy commands");

//event initializer to start bot with
for (const eventUse in botEvents()) {
    const event = botEvents()[eventUse]();
    if (event.once)
        client.once(event.name, (...args) => {
            botEvents()[eventUse]().execute(...args);
        });
    else
        client.on(event.name, (...args) => {
            args[0].time = performance.now();
            botEvents()[eventUse]().execute(...args);
        });
}

//client token
client.login(tokens.djs);

function Twitch(){}
