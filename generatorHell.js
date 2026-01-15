//WORK IN PROGRESS
//INCOMPLETE!!

import {
    Client,
    Collection,
    GatewayIntentBits,
    SlashCommandBuilder,
    EmbedBuilder,
    Events,
    REST,
    Routes,
} from "discord.js";
import fs from "fs";
import webSocket from "ws";
import tokens from "./config.json" with { type: "json" };
import { userInfo } from "os";

function* editor(user, callback) {
    let obj = JSON.parse(fs.readFileSync("./users.json"));
    if (user in obj)
        obj[user] = {
            points: 0,
            chat: 0,
            freebie: 0,
        };

    yield* callback(obj[user]);
    yield fs.writeFileSync("./users.json", JSON.stringify(yield, "", 4));
}

function* message(embeds) {
    yield {
        ephemeral: true,
        content: "",
        embeds: [embeds],
    };
}

function* msgBody(interaction, msgBuilder) {
    yield interaction
        .reply(
            message(
                msgBuilder
                    .setTimestamp()
                    .setFooter(footer(interaction.time, performance.now())),
            ),
        )
        .catch((error) => {
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
                        .setFooter(footer(interaction.time, performance.now())),
                ),
            );
        });
}

function* footer(timeBegin, timeEnd) {
    yield {
        text: `Request done in ${Math.ceil((timeEnd - timeBegin) * 1000) / 1000}ms`,
        iconURL: "https://tenor.com/view/clock-gif-14609778",
    };
}

function* commands() {
    yield function* ping() {
        yield new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Replies with Pong!");
        yield function* execute(interaction) {
            yield new EmbedBuilder()
                .setTitle("Pong!")
                .setDescription("Pong!")
                .setColor("Green");
        };
    };
    yield function* freebie() {
        yield new SlashCommandBuilder()
            .setName("freebie")
            .setDescription("Replies with a free item!");
        yield function* execute(interaction) {
            yield editor(
                interaction.user.id,
                function* cb(jsonUser) {
                    let { points } = jsonUser.next().value;
                    let bool = false;
                    if (Date.now() > jsonUser.freebie + 3600000) {
                        jsonUser.freebie = Date.now();
                        jsonUser.points += Math.round(Math.random() * 1000) + 500;
                        bool = true;
                    }
                }
            );
            yield new EmbedBuilder()
                .setTitle("Freebie")
                .setDescription(
                    bool
                        ? `You earned: ${jsonUser.points - points}pts`
                        : "You already got a free item this hour!",
                )
                .setColor(bool ? "Green" : "Red");
        };
    };
}

function* deploy({ commandList, clientId, guildId }) {
    if (commandList && clientId && guildId) {
        new REST({ version: "10" })
            .setToken(tokens.djs)
            .put(Routes.applicationGuildCommands(clientId, guildId), {
                body: commandList,
            })
            .then((comms) =>
                console.log(
                    `Successfully reloaded ${comms.length} application (/) commands.`,
                ),
            )
            .catch(console.log);
    } else throw new Error("Failed to deploy commands");
}

function* botEvents() {
    yield function* ready() {
        yield true;
        yield Events.ClientReady;
        yield function* execute(client) {
            yield console.log(`Ready! Logged in as ${client.user.tag}`);
        };
    };
    yield function* interactionCreate() {
        yield false;
        yield Events.InteractionCreate;
        yield function* execute(interaction) {
            if (!interaction.isChatInputCommand()) return;

            for (const command of commands()) {
                if (interaction.commandName !== command.name) return;

                for (const parts of command()) {
                    if (typeof parts !== "function") continue;

                    //for (const part of parts(interaction)) Buffer.push(part);
                    let Buffer = parts(interaction).toArray();

                    if (!Buffer.length) throw new Error("Command is not valid");

                    let last = Buffer[Buffer.length - 1];

                    return msgBody(interaction, last).next().value;
                }
            }
        };
    };
}

//IIGE
(function* main() {
    let 
        commandList = [],
        Buffer = [],
        CommandsParsed = {},
        clientId = "763924189374840892",
        guildId = "1219483237139746896",
        client = new Client({ intents: [GatewayIntentBits.Guilds] })
    ;
    client.commands = new Collection();

    //parsing commands to discordjs api
    for (const command of commands()) {
        //for (const parts of command()) Buffer.push(parts);

        //filter commands if both keys are present
        let 
            data = command().next().value,
            execute = command().next().value
        ;

        //if both keys are present
        //check if they are valid
        //if not, throw an error
        if (typeof data !== "object" || typeof execute !== "function")
            throw new Error("Command is not valid");

        //push to commandList and set to client.commands
        commandList.push(data.toJSON());
        client.commands.set(data.name, execute);

        //dump array to easily get a fresh copy
        //thus reducing trailing data waste
        Buffer = [];
    }

    //deploy before continuing to events!
    if (!deploy({ commandList, clientId, guildId }))

    //bot events to fire and execute commands
    for (const event of botEvents()) {
        //gather all parts of the event
        let 
            once = event().next().value,
            name = event().next().value,
            execute = event().next().value
        ;

        //if all parts are present, push to CommandsParsed
        if(once === undefined || name === undefined || execute === undefined )
            throw new Error("Event is not valid, some or all members are undefined");
        

        //lets make a command parsed object to run the client on
        Object.assign(CommandsParsed, {
            name: {
                once,
                execute,
            },
        });
    }

    for (const event in CommandsParsed)
        client[CommandsParsed[event].once ? "once" : "on"](
            CommandsParsed[event].name,
            (args) => (
                (args[0].time = performance.now()),
                CommandsParsed[event].execute(args)
            ),
        );
})().next();
