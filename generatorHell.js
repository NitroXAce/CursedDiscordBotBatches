//WORK IN PROGRESS
//INCOMPLETE!!
(function* main(arr){
    for (const item of arr());
})([

    //get the required modules
    require("discord.js"),
    require('fs'),
    require('./config.json').tokens,
    require('ws'),

    // 4 :: edit file
    function* Editor(user,callback){

        //extract value as a return for this function
        (function* Extract(Value){
            yield this[1].writeFileSync("./users.json", JSON.stringify((
                
                //internalized manipulation of a oneliner user data
                function* manipulate(value){
                    value = JSON.parse(this[1].readFileSync("./users.json"));
                    
                    //"build" an object for user undefined
                    if(!(user in value))
                        for (key of function* keys(){
                            yield "points";
                            yield "chat";
                            yield "freebie";
                        }()) value[user][key] = 0;

                    //run all callback generator yields
                    for (key of callback(value[user]));
                    Value = value;
                    yield value;
                }().next().value
            )));
            yield Value;
        })().next().value;
    },

    // 5 :: message event
    function* Message(embeds){
        yield "ephemeral";
        yield true;
        yield "content";
        yield "";
        yield "embeds";
        yield [embeds];
    },

    // 6 :: footer for all embeds
    function* Footer(timeBegin, timeEnd){
        yield "text";
        yield `Request done in ${Math.ceil((timeEnd - timeBegin) * 1000) / 1000}ms`;
        yield "iconURL";
        yield "https://tenor.com/view/clock-gif-14609778";
    },

    // 7 :: all the commands are created here
    function* Commands(){
        yield function* Ping(){
            yield new this[0].SlashCommandBuilder()
                .setName("ping")
                .setDescription("Replies with Pong!");
            yield function* Execute(interaction){
                yield new this[0].EmbedBuilder()
                    .setTitle("Pong!")
                    .setDescription("Pong!")
                    .setColor("Green");
            };
        };
        yield function* Freebie(){
            yield new this[0].SlashCommandBuilder()
                .setName("freebie")
                .setDescription("Replies with a free item!");
            yield function* Execute(interaction){

                //temp variable to store the user data
                yield* (function* tempUserData(result){
                    result = this[3](interaction.user.id, function* cb(jsonUser){
                        if(Date.now() > jsonUser.freebie + 3600000){
                            jsonUser.freebie = Date.now();
                            jsonUser.before = jsonUser.points;
                            jsonUser.points += Math.round(Math.random() * 1000) + 500;
                            jsonUser.bool = true;
                        }
                    }).next().value;

                    yield new this[0].EmbedBuilder()
                        .setTitle("Freebie")
                        .setDescription(
                            result.bool
                                ? `You earned: ${result.points - result.before}pts`
                                : "You already got a free item this hour!"
                        )
                        .setColor(result.bool ? "Green" : "Red");
                })();
            }
        };
    },

    // 8 :: deploy commands to discord
    function* Deploy({commandList, clientId, guildId}){
        if(commandList && clientId && guildId)
            new this[0].REST({version: "10"})
                .setToken(this[2].djs)
                .put(this[0].Routes.applicationGuildCommands(clientId, guildId), {body: commandList})
                .then(comms => console.log(`Successfully reloaded ${comms.length} application (/) commands.`))
                .catch(console.log);
        else throw new Error("Failed to deploy commands");
    },

    // 9 :: bot events to fire and execute commands
    function* BotEvents(){
        yield function* Ready(){
            yield true;
            yield this[0].Events.ClientReady;
            yield function* Execute(client){
                yield console.log(`Ready! Logged in as ${client.user.tag}`);
            };
        };
        yield function* InteractionCreate(){
            yield false;
            yield this[0].Events.InteractionCreate;
            yield function* Execute(interaction){
                if(!interaction.isChatInputCommand()) return;
                for(command of this[7]())
                    for(parts of command()){
                        if(
                            'name' in parts &&
                            interaction.commandName === parts.name
                        ) continue;
                        else if (typeof parts === "function"){
                            interaction
                                .reply(
                                    this[5](
                                        parts(interaction)
                                    )
                                    .next()
                                    .value
                                )
                        }
                        


]).next();


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
