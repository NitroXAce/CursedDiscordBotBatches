(() =>
    ((
        // Require the necessary discord.js classes
        { Client, Events, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, Collection, REST } = require("discord.js"),
        { token } = require("./config.json"),

        
        //main parameter initializer
        commandList = [],
        clientId = "763924189374840892",
        guildId = "1219483237139746896",

        //create a new client instance
        client = new Client({ intents: [GatewayIntentBits.Guilds] }),

        //editor function
        editor = (user, callback) =>
            (obj => (
                obj?.[user] ??
                    (obj[user] = {
                        points: 0,
                        chat: 0,
                        freebie: 0,
                    }),
                {
                    user: obj[user],
                    obj: obj,
                    cb: callback(obj[user]),
                    stringy: fs.writeFileSync(
                        "./users.json",
                        JSON.stringify(obj, "", 4),
                    ),
                }
            ))
            (JSON.parse(fs.readFileSync("./users.json"))),

        //message function
        message = embeds => ({
            ephemeral: true,
            content: "",
            embeds: [embeds],
        }),

        //footer function
        footer = (timeBegin, timeEnd) => ({
            text: `Request done in ${Math.ceil((timeEnd - timeBegin) * 1000) / 1000}ms`,
            iconURL: "https://tenor.com/view/clock-gif-14609778",
        }),

        //Commands object
        commands = {
            ping: {
                data: new SlashCommandBuilder()
                    .setName("ping")
                    .setDescription("Replies with Pong!"),
                execute: interaction => (
                    this.data,
                    interaction.reply("Pong!")
                ),
            },
            freebie: {
                data: new SlashCommandBuilder()
                    .setName("freebie")
                    .setDescription("Replies with a free item!"),
                execute: interaction =>
                    editor(interaction.user.id, jsonUser =>
                        ((
                            { points } = jsonUser,
                            bool = false
                        ) => (
                            bool = Date.now() > jsonUser.freebie + 3600000 && (
                                jsonUser.freebie = Date.now(),
                                jsonUser.points += Math.round(Math.random() * 1000) + 500,
                                true
                            ),
                            new EmbedBuilder()
                                .setTitle("Freebie")
                                .setDescription( bool
                                    ? `You earned: ${jsonUser.points - points}pts`
                                    : "You already got a free item this hour!",
                                )
                        ))
                        (),
                    ),
            },
        },

        //deploying commands
        deploy = ({ commandList: list, clientId: app, guildId: guild }) =>
            list &&
            app &&
            guild &&
            (rest => (
                rest
                    .put(Routes.applicationGuildCommands(app, guild), {
                        body: list,
                    })
                    .then(comms =>
                        console.log(
                            `Successfully reloaded ${comms.length} application (/) commands.`,
                        ),
                    )
                    .catch(console.log),
                true
            ))
            (new REST({ version: "10" }).setToken(token.djs)),

        //Bot Events List
        botEvents = {
            ready: {
                once: true,
                name: Events.ClientReady,
                execute: client =>
                    console.log(`Ready! Logged in as ${client.user.tag}`),
            },
            interactionCreate: {
                name: Events.InteractionCreate,
                execute: interaction =>
                    interaction.isChatInputCommand() &&
                    interaction.commandName?.[commands] &&
                    interaction
                        .reply(
                            message(
                                commands[interaction.commandName]
                                    .execute(interaction)
                                    .setTimestamp()
                                    .setFooter(
                                        footer(
                                            interaction.time,
                                            performance.now(),
                                        ),
                                    ),
                            ),
                        )
                        .catch((error) =>
                            ((err) =>
                                interaction[
                                    ( interaction.replied || interaction.deferred )
                                        ? "followUp"
                                        : "reply"
                                ](err)
                            )
                            (
                                message(
                                    new EmbedBuilder()
                                        .setTitle("Error")
                                        .setDescription(error.toString())
                                        .setColor("Red")
                                        .setTimestamp()
                                        .setFooter(
                                            footer(
                                                interaction.time,
                                                performance.now(),
                                            )
                                        )
                                )
                            )
                        ),
            },
        },

    ) => (
        client.commands = new Collection(),
        //parsing commands to discordjs api
        Object
            .keys(commands)
            .forEach(command =>
                //filter commands if both keys are present
                (thisCommand =>
                    thisCommand?.data &&
                    thisCommand?.command && (
                        commandList.push(thisCommand.data.toJSON()),
                        client.commands.set(thisCommand.data.name, thisCommand)
                    )
                )
                (commands[command]),
            ),
        //deploy before continuing to events!
        !deploy({ commandList, clientId, guildId })
            ? new Error("Failed to deploy commands")
            : Object
                .keys(botEvents)
                .forEach((event) =>
                    (thisEvent =>
                        client[thisEvent.once ? "once" : "on"](
                            thisEvent.name,
                            (...args) => (
                                (args[0].time = performance.now()),
                                thisEvent.execute(...args)
                            )
                        )
                    )
                    (botEvents[event]),
                )
    ))()
)();