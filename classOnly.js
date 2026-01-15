"use strict";

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

class Twitch { }

//Json editor for player files
class Editor {
    constructor(user, Callback) {
        this.user = user;
        this.obj = JSON.parse(fs.readFileSync("./users.json"));

        if (!(this.user in this.obj))
            this.obj[this.user] = new (class {
                points = 0;
                chat = 0;
                freebie = 0;
            })();

        this.cb = new Callback(this.obj[this.user]);
        this.stringy = JSON.stringify(this.obj, "", 4);

        fs.writeFileSync("./users.json", this.stringy);
    }
}

//message events starts before all other events
class Message {
    ephemeral = true;
    content = "";
    constructor(embeds) {
        this.embeds = [embeds];
    }
}

//footer for all embeds
class Footer {
    constructor(timeBegin, timeEnd) {
        return new (class {
            constructor(timeSolved) {
                this.text = `Request done in ${Math.ceil(timeSolved * 1000) / 1000}ms`;
                this.iconURL = "https://tenor.com/view/clock-gif-14609778";
            }
        })(timeEnd - timeBegin);
    }
}

//all important commands are created here
class Commands {
    ping = class Ping {
        data = new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Replies with Pong!");
        execute = class Execute {
            constructor(interaction) {
                this.interaction = interaction;
                return new EmbedBuilder()
                    .setTitle("Pong!")
                    .setDescription("Pong!")
                    .setColor("Green");
            }
        };
    };
    freebie = class Freebie {
        data = new SlashCommandBuilder()
            .setName("freebie")
            .setDescription("Replies with a free item!");
        execute = class Execute {
            constructor(interaction) {
                this.interaction = interaction;
                this.user = new Editor(
                    this.interaction.user.id,
                    class {
                        constructor(jsonUser) {
                            this.jsonUser = jsonUser;
                            this.points = this.jsonUser.points;

                            if (Date.now() > this.jsonUser.freebie + 3600000) {
                                this.jsonUser.freebie = Date.now();
                                this.jsonUser.points +=
                                    Math.round(Math.random() * 1000) + 500;
                                this.bool = true;
                            }
                        }
                    },
                );

                return new EmbedBuilder()
                    .setTitle("Freebie")
                    .setDescription(
                        this.user.cb.bool
                            ? `You earned: ${this.user.cb.jsonUser.points - this.user.cb.points}pts`
                            : "You already got a free item this hour!",
                    )
                    .setColor(this.user.cb.bool ? "Green" : "Red");
            }
        };
    };
}

class Deploy {
    constructor(carry) {
        this.list = carry.commandList;
        this.app = carry.clientId;
        this.guild = carry.guildId;

        if (this.list && this.app && this.guild) {
            this.rest = new REST(
                new (class {
                    version = "10";
                })(),
            ).setToken(tokens.djs);

            this.rest
                .put(
                    Routes.applicationGuildCommands(
                        this.app,
                        this.guild,
                    ),
                    new (class {
                        constructor(commandList) {
                            this.body = commandList;
                        }
                    })(this.list),
                )
                .then(function(comms) {
                    console.log(
                        `Successfully reloaded ${comms.length} application (/) commands.`,
                    );
                })
                .catch(console.log);

            return true;
        }
    }
}

//events the bot needs to run
class BotEvents {
    ready = class Ready {
        once = true;
        name = Events.ClientReady;
        execute = class Execute {
            constructor(client) {
                this.client = client;
            }
        };
    };
    interactionCreate = class InteractionCreate {
        name = Events.InteractionCreate;
        execute = class Execute {
            constructor(interaction) {
                this.interaction = interaction;

                if (this.interaction.isChatInputCommand())
                    if (this.interaction.commandName in new Commands()) {
                        this.embeds = new new new Commands()
                            [this.interaction.commandName]()
                            .execute(this.interaction);

                        this.interaction
                            .reply(new Message(
                                this.embeds
                                    .setTimestamp()
                                    .setFooter(new Footer(
                                        this.interaction.time,
                                        performance.now(),
                                    ))
                            ))
                            .catch(function(error) {
                                this.err = new Message(
                                    new EmbedBuilder()
                                        .setTitle("Error")
                                        .setDescription(error.toString())
                                        .setColor("Red")
                                        .setTimestamp()
                                        .setFooter(
                                            new Footer(
                                                this.interaction.time,
                                                performance.now(),
                                            ),
                                        ),
                                );

                                if (
                                    this.interaction.replied ||
                                    this.interaction.deferred
                                )
                                    return this.interaction.followUp(this.err);
                                else return this.interaction.reply(this.err);
                            });
                    }
            }
        };
    };
}

//self invoked class firing event IICE
new (class Main {
    commands = new Commands();
    commandList = [];
    clientId = "763924189374840892";
    guildId = "1219483237139746896";
    //events = new Events();
    client = new Client(
        new (class Intents {
            intents = [GatewayIntentBits.Guilds];
        })(),
    );
    constructor() {
        this.client.commands = new Collection();

        //command initializers to discordjs api
        for (const commandUse in new Commands()) {
            this.command = new new Commands()[commandUse]();
            if ("data" in this.command)
                if ("execute" in this.command) {
                    this.commandList.push(this.command.data.toJSON());
                    this.client.commands.set(
                        this.command.data.name,
                        this.command,
                    );
                }
        }

        //deploying datas from commands to the discordjs api
        if (!new Deploy(this)) throw new Error("Failed to deploy commands");

        //event initializer to start bot with
        for (const eventUse in new BotEvents()) {
            this.event = new new BotEvents()[eventUse]();
            if (this.event.once)
                this.client.once(this.event.name, (...args) => {
                    new new new BotEvents()[eventUse]().execute(...args);
                });
            else
                this.client.on(this.event.name, (...args) => {
                    args[0].time = performance.now();
                    new new new BotEvents()[eventUse]().execute(...args);
                }); 
        }

        //client token
        this.client.login(tokens.djs);
    }
})();