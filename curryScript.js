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
            user in obj ||
                (obj[user] = {
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
        guild &&
        ((rest) => (
            rest
                .put(Routes.applicationGuildrun(app, guild), { body: list })
                .then((comms) =>
                    console.log(
                        `Successfully reloaded ${comms.length} application (/) commands.`,
                    ),
                )
                .catch(console.log),
            true
        ))(new REST({ version: "10" }).setToken(tokens.djs)),

    commandList = command => ({
        ping: interaction =>
            interaction === "data"
                ? new SlashCommandBuilder()
                      .setName("ping")
                      .setDescription("Replies with Pong!")
                : new EmbedBuilder()
                      .setTitle("Pong!")
                      .setDescription("Pong!")
                      .setColor("Green"),
        freebie: interaction =>
            interaction === "data"
                ? new SlashCommandBuilder()
                      .setName("freebie")
                      .setDescription("Replies with a free item!")
                : ((carry) => (
                    editor(interaction.user.id, (user) =>
                        (({ points: uPoints } = user, bool = false) => (
                            bool = Date.now() > user.freebie + 3600000 && (
                                user.freebie = Date.now(),
                                user.points += Math.round(Math.random() * 1000) + 500,
                                true
                            ),
                            carry = new EmbedBuilder()
                                .setTitle("Freebie")
                                .setDescription(
                                    bool
                                        ? `You earned: ${user.points - uPoints}pts`
                                        : "You already got a free item this hour!",
                                )
                                .setColor(bool ? "Green" : "Red")
                        ))(),
                    ),
                    carry
                ))(),
    })?.[command] ?? new Error(`CommandError: ${command} is not found, or used.`),

    eventsList = {
        ready: cb => (
            // once | event name
            cb(true, Events.ClientReady),
            //return execute function
            client => console.log(`Ready! Logged in as ${client.user.tag}`)
        ),
        interactionCreate: cb => (
            // once | event name
            cb(false, Events.InteractionCreate),
            //return execute function
            interaction =>
                interaction.isChatInputCommand() &&
                run(interaction.commandName)("data") &&
                interaction
                    .reply(
                        message(
                            run(
                                interaction.commandName,
                                commandList,
                            )(interaction)
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
                        interaction[
                            interaction.replied || interaction.deferred
                                ? "followUp"
                                : "reply"
                        ](
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
                                        ),
                                    ),
                            ),
                        ),
                    )
        ),
    },

    //similar to command in obj
    //eventually itll be run(command,obj)('data' || interaction)
    run = (command, obj) => obj?.[command] ?? new Error("Command not found"),
) => (
    (client.commands = new Collection()),
    //parsing commands to discordjs api
    Object.keys(commandList).forEach(
        (command) =>
            run(command, commandList)?.("data") &&
            (commandList.push(run(command, commandList)("data").toJSON()),
            client.commands.set(
                run(command, commandList)("data").name,
                run(command, commandList),
            )),
    ),
    //deploy before continuing to events!
    !deploy({ commandList, clientId, guildId })
        ? new Error("Failed to deploy commands")
        : Object.keys(eventsList).forEach((events) =>
              run(
                  events,
                  eventsList,
              )?.((once, name) =>
                  client[once ? "once" : "on"](
                      name,
                      (...args) => (
                          (args[0].time = performance.now()),
                          run(events, eventsList)(...args)
                      ),
                  ),
              ),
          )
))();
