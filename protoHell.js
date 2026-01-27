//currently working on CONVERTING Classes to old-school new Function
//this is for the most compatible reach to bleach older developers eyeballs! \o/

"use strict";

function OneInput(){
    this.__proto__.paramA = arguments[0];
}

function TwoInput(){
    this.__proto__.paramA = arguments[0];
    this.__proto__.paramB = arguments[1];
}

function Message() {
    Object.assign(this.__proto__,{
        ephemeral:true,
        content:"",
        embeds:[arguments[0]]
    });
}

function Commands(){
    this.__proto__.data = new SlashCommandBuilder();
}

function BotEvents(){
    this.__proto__.once = false;
}

OneInput.prototype.Deploy = function Deploy(){
    Object.assign(this.__proto__,{
        carry: this.__proto__.paramA.carry,
        list: this.carry.commandList,
        app: this.carry.app,
        guild: this.carry.guild
    });
    if (!(this.__proto__.list && this.__proto__.app && this.__proto__.guild)) {
        this.__proto__.success = false;
        new TwoInput(this, ['success']).KeepOnly();
        return this.__proto__.success;
    }
    Object.assign(this.__proto__,{
        djs: require("discord.js"),
        REST: this.djs.REST,
        Routes: this.djs.Routes,
        rest: new this.REST({version:"10"},)
    });
    this.__proto__.rest
        .setToken(this.__proto__.carry.tokens.djs)
        .put(
            this.__proto__.Routes.applicationGuildCommands(
                this.__proto__.app,
                this.__proto__.guild,
            ),
            {
                body : this.__proto__.list,
            },
        ).then(function(comms) {
            console.log(
                `Successfully reloaded ${comms.length} application (/) commands.`,
            );
        }).catch(function(err) {
            console.log(err);
        });
    this.__proto__.success = true;
    new TwoInput(this, ['success']).KeepOnly();
    return this.__proto__.success;
};

TwoInput.prototype.KeepOnly = function KeepOnly(){
    //ParamA = object to filter
    //ParamB = keys to keep
    this.__proto__.result = {};
    for (this.__proto__.i in this.__proto__.paramA)
        for (this.__proto__.j in this.__proto__.paramB)
            if (this.__proto__.i == this.__proto__.paramB[this.__proto__.j])
                this.__proto__.result[this.__proto__.i] =
                    this.__proto__.paramA[this.__proto__.i];
    delete this.__proto__.i;
    delete this.__proto__.j;
    delete this.__proto__.paramA;
    delete this.__proto__.paramB;
    return this.__proto__.result;
}

TwoInput.prototype.MergeObj = function MergeObj(){
    this.__proto__.keepMethods = [];
    for (this.__proto__.i in this.__proto__.paramA) {
        this.__proto__.keepMethods[this.__proto__.keepMethods.length] = this.__proto__.i;
        for (this.__proto__.j in this.__proto__.paramB)
            if (this.__proto__.i == this.__proto__.j)
                this.__proto__.paramA[this.__proto__.i] = this.__proto__.paramB[this.__proto__.i];
    }
    this.__proto__.return = new TwoInput(this.__proto__.paramA, this.__proto__.keepMethods).KeepOnly();
    return this.__proto__.return;
}

TwoInput.prototype.Editor = function Editor(){
    this.__proto__.fs = require("fs");
    this.__proto__.obj = JSON.parse(fs.readFileSync("./users.json"));
    if (typeof this.__proto__.obj[this.__proto__.paramA] == "undefined")
        this.__proto__.obj[this.__proto__.paramA] = {
            points : 0,
            chat : 0,
            freebie : 0
        };

    this.__proto__.userObj = new this.__proto__.paramB(this.__proto__.obj[this.__proto__.paramA]);
    for (this.__proto__.i in this.__proto__.obj[this.__proto__.paramA])
        for (this.__proto__.j in this.__proto__.userObj)
            if (this.__proto__.i == this.__proto__.j)
                this.__proto__.obj[this.__proto__.paramA][this.__proto__.i] = this.__proto__.userObj[this.__proto__.j];
            else if (this.__proto__.j == 'bool')
                this.__proto__.bool = this.__proto__.userObj[this.__proto__.j];
            else continue;
    this.__proto__.stringy = JSON.stringify(this.__proto__.obj, "", 4);
    this.__proto__.fs.writeFileSync("./users.json", this.__proto__.stringy);
    new TwoInput(this, ['bool', 'obj']).KeepOnly();
}

TwoInput.prototype.Footer = function Footer(){
    this.__proto__.timeBegin = this.__proto__.paramA;
    this.__proto__.timeEnd = this.__proto__.paramB;
    this.__proto__.result = OneInput.prototype.call(this, function Eval() {
        this.__proto__.text = "Request done in " +
            (Math.ceil((this.__proto__.paramA.timeEnd - this.__proto__.paramA.timeBegin) * 1000) / 1000) +
            "ms";
        this.__proto__.iconURL = "https://tenor.com/view/clock-gif-14609778";
        delete this.__proto__.paramA;
    });
    new TwoInput(this, [ "result" ]).KeepOnly();
}

Commands.prototype.Ping = function Ping(){
    this.__proto__.data
        .setName("ping")
        .setDescription("Replies with Pong!");

    this.__proto__.execute = function Execute(){
        this.__proto__.interaction = this.__proto__.paramA;
        console.log("Pong!");
        return new EmbedBuilder()
            .setTitle("Pong!")
            .setDescription("Pong!")
            .setColor("Green");
    };
};

Commands.prototype.Freebie = function Freebie(){
    this.__proto__.data
        .setName("freebie")
        .setDescription("Replies with a free item!");

    this.__proto__.execute = function Execute(){
        this.__proto__.interaction = this.__proto__.paramA;
        this.__proto__.user = new TwoInput(
            this.__proto__.interaction.user.id,
            function cb(){
                this.__proto__.jsonUser = arguments[0];
                this.__proto__.points = this.__proto__.jsonUser.points;
                if (Date.now() > this.__proto__.jsonUser.freebie + 3600000) {
                    this.__proto__.jsonUser.freebie = Date.now();
                    this.__proto__.jsonUser.points +=
                        Math.round(Math.random() * 1000) + 500;
                    this.__proto__.bool = true;
                }
            }
        );
        this.__proto__.user.Editor();
        new TwoInput(this, ['user']).KeepOnly();

        return new EmbedBuilder()
            .setTitle("Freebie")
            .setDescription(
                this.__proto__.user.bool
                    ? `You earned: ${this.__proto__.user.obj.points - this.__proto__.user.obj.points}pts`
                    : "You already got a free item this hour!",
            )
            .setColor(this.__proto__.user.bool ? "Green" : "Red");
    };
};

BotEvents.prototype.Ready = function Ready(){
    this.__proto__.once = true;
    this.__proto__.name = "ready";
    this.__proto__.execute = function Execute(){
        this.__proto__.client = arguments[0];
        console.log(`Logged in as ${this.__proto__.client.user.tag}`);
        return new KeepOnly(this, []);
    };
};

BotEvents.prototype.InteractionCreate = function InteractionCreate(){
    this.__proto__.name = "interactionCreate";
    this.__proto__.execute = function Execute() {
        this.__proto__.interaction = arguments[0];
        if (!this.__proto__.interaction.isChatInputCommand()) return;
        if (!(this.__proto__.interaction.commandName in new Commands())) return;

        this.__proto__.embeds = new new new Commands()
            [this.__proto__.interaction.commandName]()
            .execute(this.__proto__.interaction);

        this.__proto__.interaction
            .reply(new Message(
                this.__proto__.embeds
                    .setTimestamp()
                    .setFooter(new Footer(
                        this.__proto__.interaction.time,
                        performance.now(),
                    ))
            ))
            .catch(function () {
                this.__proto__.error = arguments[0];
                this.__proto__.err = new Message(
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(this.__proto__.error.toString())
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter(
                            new Footer(
                                this.__proto__.interaction.time,
                                performance.now(),
                            ),
                        ),
                );
                if (
                    this.__proto__.interaction.replied ||
                    this.__proto__.interaction.deferred
                )
                    return this.__proto__.interaction.followUp(this.__proto__.err);
                else return this.__proto__.interaction.reply(this.__proto__.err);
            });
    };
};



new function Main() {
    //importing modules
    this.__proto__.fs = require("fs");
    this.__proto__.webSocket = require("ws");
    this.__proto__.tokens = require("./config.json");
    this.__proto__.commandList = [];
    this.__proto__.clientId = "763924189374840892";
    this.__proto__.guildId = "1219483237139746896";
    this.__proto__.djs = {};
    for (this.__proto__.key in require('discord.js'))
        this.__proto__.djs[this.__proto__.key] = require('discord.js')[this.__proto__.key];
    this.__proto__.djs = new KeepOnly(this.__proto__.djs, [
        "Client",
        "Collection",
        "GatewayIntentBits",
        "SlashCommandBuilder",
        "EmbedBuilder",
        "Events",
        "REST",
        "Routes",
    ]);

    //begin unpacking the client
    this.__proto__.client = new this.__proto__.djs.Client(
        new function Intents() {
            this.__proto__.djs = arguments[0];
            this.__proto__.intents = [this.__proto__.djs.GatewayIntentBits.Guilds];
            return new KeepOnly(this, ['intents']).intents;
        }(this.__proto__.djs),
    );

    //init the commands collection
    this.__proto__.client.commands = new this.__proto__.djs.Collection();

    //command initializers to discordjs api
    for (this.__proto__.commandUse in new Commands()) {
        this.__proto__.command = new new Commands()[this.__proto__.commandUse]();
        if ("data" in this.__proto__.command)
            if ("execute" in this.__proto__.command)
                this.__proto__.client.commands.set(
                    this.__proto__.command.data.name,
                    this.__proto__.command,
                );
    }

    //deploying datas from commands to the discordjs api
    this.__proto__.deployCreds = new KeepOnly(this, ['commandList', 'clientId', 'guildId']);
    if (!new Deploy(this.__proto__.deployCreds)) throw new Error("Failed to deploy commands");

    //event initializer to start bot with
    for (this.__proto__.eventUse in new BotEvents()) {
        this.__proto__.event = new new BotEvents().__proto__[this.__proto__.eventUse]();
        if (this.__proto__.event.once)
            this.__proto__.client.once(this.__proto__.event.name, (...args) => {
                new new new BotEvents()
                    .__proto__
                    [this.__proto__.eventUse]()
                    .__proto__
                    .execute(...args);
            });
        else
            this.__proto__.client.on(this.__proto__.event.name, (...args) => {
                args[0].time = performance.now();
                new new new BotEvents()
                    .__proto__
                    [this.__proto__.eventUse]()
                    .__proto__
                    .execute(...args);
            });
    }

    //client token
    this.__proto__.client.login(this.__proto__.tokens.djs);

    return new KeepOnly(this, []);

}()


class Twitch {
}
