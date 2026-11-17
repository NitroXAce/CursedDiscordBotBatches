((
    //import modules
    {
        Client,
        Collection,
        GatewayIntentBits,
        SlashCommandBuilder,
        EmbedBuilder,
        Events,
        REST,
        Routes,
    } = require('discord.js'),
    fs = require('fs'),
    tokens = require('./config.json'),

    //main parameter initializer
    commandList = [],
    clientId = "763924189374840892",
    guildId = "1219483237139746896",
    client = new Client({ intents: [GatewayIntentBits.Guilds] }),

    //something to curry with
    curryMatch = (index = '', curryObj) => (
        curryObj?.[''] ??
            ( curryObj['']=()=>Object.keys(curryObj) ), 
        index in curryObj ||
            new Error('Parameter not found'),
        typeof curryObj[index] == 'function' ||
            new Error('Make sure you\'e assigning a function to this matcher object'),
        curryObj[index]
    ),

    message = (embeds) => ({
        ephemeral: true,
        content: "",
        embeds: [embeds],
    }),

    footer = (timeBegin, timeEnd) => ({
        text: `Request done in ${Math.ceil((timeEnd - timeBegin) * 1000) / 1000}ms`,
        iconURL: "https://tenor.com/view/clock-gif-14609778",
    }),

    // Create a new client instance
    editor = (user, callback) =>
        ((obj = JSON.parse(fs.readFileSync("./users.json"))) => (
            user in obj || (obj[user] = {
                points: 0,
                chat: 0,
                freebie: 0,
            }),
            callback(obj[user]),
            fs.writeFileSync("./users.json", JSON.stringify(obj, "", 4))
        ))(),

    //deploying commands
    deploy = ({ commandList: list, clientId: app, guildId: guild }) =>
        list &&
        app &&
        guild && new REST({ version: "10" })
            .setToken(tokens.djs)
            .put(Routes.applicationGuildrun(app, guild), { body: list })
            .then(comms => console.log(
                `Successfully reloaded ${comms.length} application (/) commands.`,
            ))
            .catch(console.error),

    commands = command => curryMatch(command,{
        ping: call => curryMatch(call,{
            data: () => new SlashCommandBuilder()
                .setName("ping")
                .setDescription("Replies with Pong!"),
            execute: interaction => new EmbedBuilder()
                .setTitle("Pong!")
                .setDescription("Pong!")
                .setColor("Green")
        }),
        freebie: call => curryMatch(call,{
            data: () => new SlashCommandBuilder()
                .setName("freebie")
                .setDescription("Replies with a free item!"),
            execute : interaction => (carry => (
                editor(interaction.user.id, user => ((
                    { points: uPoints } = user,
                    bool = false
                ) => (
                    bool = Date.now() > user.freebie + 3600000 && (
                        user.freebie = Date.now(),
                        user.points += Math.round(Math.random() * 1000) + 500,
                        true
                    ),
                    carry = new EmbedBuilder()
                        .setTitle("Freebie")
                        .setDescription( bool
                            ? `You earned: ${user.points - uPoints}pts`
                            : "You already got a free item this hour!"
                        )
                        .setColor(bool ? "Green" : "Red")
                ))()),
                carry
            ))()
        })            
    }),

    eventsList = events => curryMatch(events,{
        ready: method => curryMatch(method ,{
            data: ()=> Events.ClientReady,
            once: ()=> true,
            execute: client => console.log(`Ready! Logged in as ${client.user.tag}`)
        }),
        interactionCreate: method => curryMatch(method,{
            data: ()=> Events.InteractionCreate,
            once: ()=> false,
            execute: interaction =>
                interaction.isChatInputCommand() &&
                commands(interaction.commandName)('data')() &&
                interaction
                    .reply( message( 
                        commands
                            (interaction.commandName)
                            ('execute')
                            (interaction)
                            .setTimestamp()
                            .setFooter(footer(
                                interaction.time,
                                performance.now()
                            ))
                    ))
                    .catch((error) =>
                        interaction[
                            ( interaction.replied || interaction.deferred )
                                ? "followUp"
                                : "reply"
                        ](
                            message(
                                new EmbedBuilder()
                                    .setTitle("Error")
                                    .setDescription(error.toString())
                                    .setColor("Red")
                                    .setTimestamp()
                                    .setFooter( footer(
                                        interaction.time,
                                        performance.now()
                                    ))
                            )
                        )
                    )
        })
    })
) => (
    client.commands = new Collection(),
    //parsing commands to discordjs api
    commands('').forEach(command=>
        !!command &&
        commands(command)('data') &&
        commands(command)('execute') && (
            commandList.push(commands(command)('data')().toJSON()),
            client.commands.set(
                commands(command)('data')().name,
                commands(command)
            )
        )
    ),
    //deploy before continuing to events!
    !deploy()
        ? new Error("Failed to deploy commands")
        : eventsList('').forEach(event=>
            !!event &&
            client[
                eventsList(event)('once')()
                ? 'once' : 'on'
            ](
                eventsList(event)('data'),
                (...args) => (
                    args[0].time = performance.now(),
                    eventsList(event)('execute')(...args)
                )
            )
        )
))();
