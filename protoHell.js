//currently working on CONVERTING Classes to old-school new Function
//this is for the most compatible reach to bleach older developers eyeballs! \o/

"use strict";

function OneInput(){
    this.paramA = arguments[0];
}

function TwoInput(){
    this.paramA = arguments[0];
    this.paramB = arguments[1];
}

function Message() {
    this.ephemeral = true;
    this.content = "";
    this.embeds = [arguments[0]];
}

function Commands(){
    this.data = new SlashCommandBuilder();
}

function BotEvents(){
    this.once = false;
}

OneInput.prototype.Deploy = function Deploy(){
    this.carry = this.paramA.carry;
    this.list = this.carry.commandList;
    this.app = this.carry.clientId;
    this.guild = this.carry.guildId;
    if (!(this.list && this.app && this.guild)) {
        this.success = false;
        new TwoInput(this, ['success']).KeepOnly();
        return this.success;
    }
    this.djs = require("discord.js");
    this.REST = this.djs.REST;
    this.Routes = this.djs.Routes;
    this.rest = new this.REST({
        version :"10"
    },).setToken(this.carry.tokens.djs);
    this.rest.put(
        this.Routes.applicationGuildCommands(
            this.app,
            this.guild,
        ),
        {
            body : this.list,
        },
    ).then(function(comms) {
        console.log(
            `Successfully reloaded ${comms.length} application (/) commands.`,
        );
    }).catch(function(err) {
        console.log(err);
    });
    this.success = true;
    new TwoInput(this, ['success']).KeepOnly();
    return this.success;
};

TwoInput.prototype.KeepOnly = function KeepOnly(){
    //ParamA = object to filter
    //ParamB = keys to keep
    this.result = {};
    for (this.i in this.paramA)
        for (this.j in this.paramB)
            if (this.i == this.paramB[this.j])
                this.result[this.i] = this.paramA[this.i];
    delete this.i;
    delete this.j;
    delete this.paramA;
    delete this.paramB;
    return this.result;
}

TwoInput.prototype.MergeObj = function MergeObj(){
    this.keepMethods = [];
    for (this.i in this.paramA) {
        this.keepMethods[this.keepMethods.length] = this.i;
        for (this.j in this.paramB)
            if (this.i == this.j)
                this.paramA[this.i] = this.paramB[this.i];
    }
    this.return = new TwoInput(this.paramA, this.keepMethods).KeepOnly();
    return this.return;
}

TwoInput.prototype.Editor = function Editor(){
    this.fs = require("fs");
    this.obj = JSON.parse(fs.readFileSync("./users.json"));
    if (typeof this.obj[this.paramA] == "undefined")
        this.obj[this.paramA] = {
            points : 0,
            chat : 0,
            freebie : 0
        };

    this.userObj = new this.paramB(this.obj[this.paramA]);
    for (this.i in this.obj[this.paramA])
        for (this.j in this.userObj)
            if (this.i == this.j)
                this.obj[this.paramA][this.i] = this.userObj[this.j];
            else if (this.j == 'bool')
                this.bool = this.userObj[this.j];
            else continue;
    this.stringy = JSON.stringify(this.obj, "", 4);
    this.fs.writeFileSync("./users.json", this.stringy);
    new TwoInput(this, ['bool', 'obj']).KeepOnly();
}

TwoInput.prototype.Footer = function Footer(){
    this.timeBegin = this.paramA;
    this.timeEnd = this.paramB;
    this.result = OneInput.prototype.call(this, function Eval() {
        this.text = "Request done in " +
            (Math.ceil((this.paramA.timeEnd - this.paramA.timeBegin) * 1000) / 1000) +
            "ms";
        this.iconURL = "https://tenor.com/view/clock-gif-14609778";
        delete this.paramA;
    });
    new TwoInput(this, [ "result" ]).KeepOnly();
}

Commands.prototype.Ping = function Ping(){
    this.data
        .setName("ping")
        .setDescription("Replies with Pong!");

    this.execute = function Execute(){
        this.interaction = this.paramA;
        console.log("Pong!");
        return new EmbedBuilder()
            .setTitle("Pong!")
            .setDescription("Pong!")
            .setColor("Green");
    };
};

Commands.prototype.Freebie = function Freebie(){
    this.data
        .setName("freebie")
        .setDescription("Replies with a free item!");

    this.execute = function Execute(){
        this.interaction = this.paramA;
        this.user = new TwoInput(
            this.interaction.user.id,
            function cb(){
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
        this.user.Editor();
        new TwoInput(this, ['user']).KeepOnly();

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

BotEvents.prototype.Ready = function Ready(){
    this.once = true;
    this.name = "ready";
    this.execute = function Execute(){
        this.client = arguments[0];
        console.log(`Logged in as ${this.client.user.tag}`);
        return new KeepOnly(this, []);
    };
};

///------------------------------------------------------------------------------

BotEvents.prototype.InteractionCreate = function InteractionCreate(){
    this.name = "interactionCreate";
    this.execute = function Execute(){
        this.interaction = arguments[0];
        if (!this.interaction.isChatInputCommand()) return;
        if (!(this.interaction.commandName in new Commands())) return;
        this.embeds = new 

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
                .catch(function () {
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

new function Main() {
    //importing modules
    this.fs = require("fs");
    this.webSocket = require("ws");
    this.tokens = require("./config.json");
    this.djs = {};
    for (this.key in require('discord.js'))
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
        new function Intents() {
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
            if ("execute" in this.command)
                this.client.commands.set(
                    this.command.data.name,
                    this.command,
                );
    }

    //deploying datas from commands to the discordjs api
    this.deployCreds = new KeepOnly(this, ['commandList', 'clientId', 'guildId']);
    if (!new Deploy(this.deployCreds)) throw new Error("Failed to deploy commands");

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


class Twitch {
}
