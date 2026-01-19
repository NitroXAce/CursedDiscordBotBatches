//currently working on CONVERTING Classes to old-school new Function
//this is for the most compatible reach to bleach older developers eyeballs! \o/

"use strict";

function KeepOnly() {
    this.obj = arguments[0];
    this.keys = arguments[1];
    this.result = {};
    for (this.i in this.obj)
        for (this.j in this.keys)
            if (this.i == this.keys[this.j])
                this.result[this.i] = this.obj[this.i];
    delete this.i;
    delete this.j;
    delete this.obj;
    delete this.keys;
    return this.result;
}

function MergeObj(){
    this.parent = arguments[0];
    this.modify = arguments[1];
    this.keepMethods = [];
    for (this.i in this.parent){
        this.keepMethods[this.keepMethods.length] = this.i;
        for(this.j in this.modify)
            if(this.i == this.j)
                this.parent[this.i] = this.modify[this.i];
    }
    this.return = new KeepOnly(this.parent, this.keepMethods);
    return new KeepOnly(this, ["return"]).return;
}

function Editor() {
    this.user = arguments[0];
    this.callback = arguments[1];
    this.fs = require("fs");
    this.obj = JSON.parse(fs.readFileSync("./users.json"));
    if (typeof this.obj[this.user] == "undefined") {
        this.obj[this.user] = new function() {
            this.points = 0;
            this.chat = 0;
            this.freebie = 0;
        }();
    }
    //gatther the callback "object"
    //filter uneccesary properties
    //gather edited properties from callback to the json user
    this.userObj = new this.callback(this.obj[this.user]);
    for (this.i in this.obj[this.user])
        for (this.j in this.userObj)
            if (this.i == this.j)
                this.obj[this.user][this.i] =
                    this.userObj[this.j];
            else if (this.j == 'bool')
                this.bool = this.userObj[this.j];
            else continue;

    //append to the user file after
    //cleanup useless variables with KeepOnly, as empty
    this.stringy = JSON.stringify(this.obj, "", 4);
    this.fs.writeFileSync("./users.json", this.stringy);
    new KeepOnly(this, ['bool','obj']);
}

function Message() {
    this.ephemeral = true;
    this.content = "";
    this.embeds = [arguments[0]];
}

function Footer() {
    this.timeBegin = arguments[0];
    this.timeEnd = arguments[1];
    this.result = new function() {
        this.self = arguments[0];
        this.text = `Request done in ${Math.ceil((this.self.timeEnd - this.self.timeBegin) * 1000) / 1000
            }ms`;
        this.iconURL = "https://tenor.com/view/clock-gif-14609778";
        delete this.self;
    }(this);
    new KeepOnly(this, ["result"]);
}

function Commands() {
    function Data(){
        this.builder = new SlashCommandBuilder();
        this.result = new this.callback(this.builder);
        return new KeepOnly(this, ["result"]).result;
    }
    this.ping = function Ping() {
        this.data = new Data(function() {
            this.builder = arguments[0];
            return this.builder
                .setName("ping")
                .setDescription("Replies with Pong!");
        });
        
        this.execute = function Execute() {
            this.interaction = arguments[0];
            new KeepOnly(this, []);
            return new EmbedBuilder()
                .setTitle("Pong!")
                .setDescription("Pong!")
                .setColor("Green");
        };
    };

    this.freebie = function Freebie() {
        this.data = new Data(function() {
            this.builder = arguments[0];
            return this.builder
                .setName("freebie")
                .setDescription("Replies with a free item!");
        });
        this.execute = function Execute() {
            this.interaction = arguments[0];
            this.user = new Editor(
                this.interaction.user.id,
                function cb() {
                    this.jsonUser = arguments[0];
                    this.points = this.jsonUser.points;
                    if (Date.now() > this.jsonUser.freebie + 3600000) {
                        this.jsonUser.freebie = Date.now();
                        this.jsonUser.points +=
                            Math.round(Math.random() * 1000) + 500;
                        this.bool = true;
                    }
                }
            );

            new KeepOnly(this, ['user']);

            return new EmbedBuilder()
                .setTitle("Freebie")
                .setDescription(
                    this.user.bool
                        ? `You earned: ${this.user.obj.points - this.user.obj.points}pts`
                        : "You already got a free item this hour!",
                )
                .setColor(this.user.bool ? "Green" : "Red");
        };
    };
}

function Deploy() {
    this.carry = arguments[0];
    this.list = this.carry.commandList;
    this.app = this.carry.clientId;
    this.guild = this.carry.guildId;

    if (!(this.list && this.app && this.guild)){
        this.success = false;
        new KeepOnly(this, ['success']);
        return this.success;
    }

    this.djs = require("discord.js");
    this.tokens = require("./config.json");
    this.REST = this.djs.REST;
    this.Routes = this.djs.Routes;

    this.rest = new this.REST(
        new function() {
            this.version = "10";
        }(),
    ).setToken(this.tokens.djs);

    this.rest
        .put(
            this.Routes.applicationGuildCommands(
                this.app,
                this.guild,
            ),
            new function() {
                this.commandList = arguments[0];
                this.body = this.commandList;
            }(this.list),
        )
        .then(function(comms) {
            console.log(
                `Successfully reloaded ${comms.length} application (/) commands.`,
            );
        })
        .catch(function(err) {
            console.log(err);
        });

    this.success = true;
    new KeepOnly(this, ['success']);
    return this.success;
}

function BotEvents() {
    this.ready = function Ready() {
        this.once = true;
        this.name = "ready";
        this.execute = function Execute() {
            this.client = arguments[0];
            console.log(`Logged in as ${this.client.user.tag}`);
            return new KeepOnly(this, []);
        };
    };
    this.interactionCreate = function InteractionCreate() {
        this.name = "interactionCreate";
        this.execute = function Execute() {
            this.interaction = arguments[0];
            if (!this.interaction.isChatInputCommand()) return;
            if (!(this.interaction.commandName in new Commands())) return;

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
                .catch(function() {
                    this.error = arguments[0];
                    this.err = new Message(
                        new EmbedBuilder()
                            .setTitle("Error")
                            .setDescription(this.error.toString())
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
        };
    };
}

new function Main(){
    //importing modules
    this.fs = require("fs");
    this.webSocket = require("ws");
    this.tokens = require("./config.json");
    this.djs = {};
    for(this.key in require('discord.js'))
        this.djs[this.key] = require('discord.js')[this.key];
    this.djs = new KeepOnly(this.djs, [
        "Client",
        "Collection",
        "GatewayIntentBits",
        "SlashCommandBuilder",
        "EmbedBuilder",
        "Events",
        "REST",
        "Routes",
    ]);

    
    this.commandList = [];
    this.clientId = "763924189374840892";
    this.guildId = "1219483237139746896";

    //begin unpacking the client
    this.client = new this.djs.Client(
        new function Intents(){
            this.djs = arguments[0];
            this.intents = [this.djs.GatewayIntentBits.Guilds];
            return new KeepOnly(this, ['intents']).intents;
        }(this.djs),
    );

    //init the commands collection
    this.client.commands = new this.djs.Collection();

    //command initializers to discordjs api
    for (this.commandUse in new Commands()) {
        this.command = new new Commands()[this.commandUse]();
        if ("data" in this.command)
            if ("execute" in this.command) {
                this.client.commands.set(
                    this.command.data.name,
                    this.command,
                );
            }
    }

    //event initializer to start bot with
    for (this.eventUse in new BotEvents()) {
        this.event = new new BotEvents()[this.eventUse]();
        if (this.event.once)
            this.client.once(this.event.name, (...args) => {
                new new new BotEvents()[this.eventUse]().execute(...args);
            });
        else
            this.client.on(this.event.name, (...args) => {
                args[0].time = performance.now();
                new new new BotEvents()[this.eventUse]().execute(...args);
            });
    }

    //client token
    this.client.login(this.tokens.djs);

    return new KeepOnly(this, []);

}


class Twitch { }

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