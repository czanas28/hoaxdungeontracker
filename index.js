require("dotenv").config();
const { prefix } = require('./config/config.json');
const Discord = require('discord.js');
const Sequelize = require('sequelize');

//Connects to the db
const sequelize = new Sequelize(process.env.DB_DB, process.env.DB_USER, process.env.DB_PW, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

//Sets the db schema
const Data = sequelize.define('data', {
    discordUsername: {
        type: Sequelize.STRING,
        unique: true
    },
    theNecroticWake: Sequelize.TINYINT,
    deOtherSide: Sequelize.TINYINT,
    sanguineDepths: Sequelize.TINYINT,
    mistsOfTirnaScithe: Sequelize.TINYINT,
    theaterOfPain: Sequelize.TINYINT,
    spiresOfAscension: Sequelize.TINYINT,
    plaguefall: Sequelize.TINYINT,
    hallsOfAtonement: Sequelize.TINYINT,
});

const client = new Discord.Client();

client.once("ready", async () => {
    await Data.sync();
    console.log("Discord Server Started");
});

client.on("ready", async () => {

//Checks the db to see if a user named "No Attendance" exists.. if not, create it.
//The record must be preset because discord embeds require their fields to have content in order to properly display.
    let phArr = [];
    const phFind = await Data.findAll({ where: { discordUsername: "No Attendance" }});
    for (find of phFind) { let username = find.discordUsername; phArr.push(username);}
    if (phArr[0] === undefined) {
        await Data.create({
            discordUsername: "No Attendance",
            theNecroticWake: true,
            deOtherSide: true,
            sanguineDepths: true,
            mistsOfTirnaScithe: true,
            theaterOfPain: true,
            spiresOfAscension: true,
            plaguefall: true,
            hallsOfAtonement: true
        });
        return console.log("'No Attendance' Record Added");
    } else { return console.log("Attendance record already exists"); }
});


const command = (message, cmdName) => message.content.toLowerCase() === (`${prefix}${cmdName}`);

client.on("message", async message => {

    const dm = client.users.cache;
    let userId = message.author.id;
    let msgId = message.id;

    //Checks dungeon db for a record of the author
    const findUser = await Data.findOne({ where: { discordUsername: message.author.username }});

    //Deleted the message to keep the channel clean
    const deleteMsg = async () => {
        message.delete({ timeout: 1500 })
        .then(msg => console.log(`Deleted message from ${msg.author.username} after 1.5 seconds`))
        .catch(console.error);
    }
    //The array used to populate the embed
    let dungeons = [
        { name: "The Necrotic Wake", attendees: [] },
        { name: "De Other Side", attendees: [] },
        { name: "Sanguine Depths", attendees: [] },
        { name: "Mists of Tirna Scithe", attendees: [] },
        { name: "Theater of Pain", attendees: [] },
        { name: "Spires of Ascension", attendees: [] },
        { name: "Plaguefall", attendees: [] },
        { name: "Halls of Atonement", attendees: [] }
    ];

    // Finds all user attendance for each dungeon
    const findNw = await Data.findAll({where: { theNecroticWake: true }});
    const findOs = await Data.findAll({where: { deOtherSide: true }});
    const findSd = await Data.findAll({where: { sanguineDepths: true }});
    const findTs = await Data.findAll({where: { mistsOfTirnaScithe: true }});
    const findTp = await Data.findAll({where: { theaterOfPain: true }});
    const findSa = await Data.findAll({where: { spiresOfAscension: true }});
    const findPf = await Data.findAll({where: { plaguefall: true }});
    const findHa = await Data.findAll({where: { hallsOfAtonement: true }});

    // Push's each user found above into the appropriate dungeons attendee array
    const pushDbToArr = async () => {
        for (find of findNw) { let username = find.discordUsername; dungeons[0].attendees.push(username);}
        for (find of findOs) { let username = find.discordUsername; dungeons[1].attendees.push(username);}
        for (find of findSd) { let username = find.discordUsername; dungeons[2].attendees.push(username);}
        for (find of findTs) { let username = find.discordUsername; dungeons[3].attendees.push(username);}
        for (find of findTp) { let username = find.discordUsername; dungeons[4].attendees.push(username);}
        for (find of findSa) { let username = find.discordUsername; dungeons[5].attendees.push(username);}
        for (find of findPf) { let username = find.discordUsername; dungeons[6].attendees.push(username);}
        for (find of findHa) { let username = find.discordUsername; dungeons[7].attendees.push(username);}
    }
    //Function for updating the embed -- EXPERIMENTAL
    const embedEdit = async () => {
        await pushDbToArr();
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Shadowlands Dungeons')
            .setURL('https://shadowlands.wowhead.com/zones/shadowlands/dungeons')
            .setDescription("Used to track guild member weekly attendence in Mythic 0")
            .setTimestamp()
            .addFields(dungeons.map(d => {
                return {name: d.name, value: d.attendees, inline: true};
            }))
        let list = await message.channel.messages.fetchPinned();
        pinnedMsg = list.last();
        if (!pinnedMsg) { return false; }
        pinnedMsg.edit(embed);
    }


    // Finds all user attendance for each dungeon, per user
    const findNwUser = await Data.findOne({where: { discordUsername: message.author.username, theNecroticWake: true }});
    const findOsUser = await Data.findOne({where: { discordUsername: message.author.username, deOtherSide: true }});
    const findSdUser = await Data.findOne({where: { discordUsername: message.author.username, sanguineDepths: true }});
    const findTsUser = await Data.findOne({where: { discordUsername: message.author.username, mistsOfTirnaScithe: true }});
    const findTpUser = await Data.findOne({where: { discordUsername: message.author.username, theaterOfPain: true }});
    const findSaUser = await Data.findOne({where: { discordUsername: message.author.username, spiresOfAscension: true }});
    const findPfUser = await Data.findOne({where: { discordUsername: message.author.username, plaguefall: true }});
    const findHaUser = await Data.findOne({where: { discordUsername: message.author.username, hallsOfAtonement: true }});

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // The Necrotic Wake
    if (command( message, "nw")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //If the user doesn't exist, create the user and set the dungeon to true then set No Attendance to false to remove it from the embed arrays
        if (!findUser) {
            await Data.create({ discordUsername: message.author.username, theNecroticWake: true });
            await Data.update({ theNecroticWake: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to The Necrotic Wake");
        }
        //If the user exists and has already marked their attendance, notify them.
        if (findNwUser) {

            return dm.get(userId).send("You've already indicated that you atteneded The Necrotic Wake");
        } else {
            //If the authors record exists but they have not indicated they've atteneded the dungeon, update the record.
            //then set No Attendance to false to remove it from the embed arrays
            await Data.update({ theNecroticWake: true },{ where: { discordUsername: message.author.username }});
            await Data.update({ theNecroticWake: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to The Necrotic Wake");
        }
    }

    //Remove The Necrotic Wake
    else if (command(message, "rmnw")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //Checks user to see if their record exists for this dungeon
        if (!findUser) {
            return dm.get(userId).send("You have yet to record your attendance for any dungeon, therefor you cannot remove yourself from the record.");
        }
        else {
            await Data.update({ theNecroticWake: false }, { where: { discordUsername: message.author.username, theNecroticWake: true }});

            // Builds an array of all boolean true entries for the dungeon
            let recChkArr = [];
            const recordCheck = await Data.findAll({ where: { theNecroticWake: true }});

            for (record of recordCheck) {
            recChkArr.push(recordCheck.discordUsername);
            };
            //Checks the array above to see if it is empty then sets No Attendance to true for the embed arrays
            if (!recordCheck[0]) {
                await Data.update({ theNecroticWake: true}, { where: { discordUsername: "No Attendance", theNecroticWake: false }});
            }
            return dm.get(userId).send("Record removed.")
        }
    }
    //De Other Side
    if (command( message, "os")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //If the user doesn't exist, create the user and set the dungeon to true then set No Attendance to false to remove it from the embed arrays
        if (!findUser) {
            await Data.create({ discordUsername: message.author.username, deOtherSide: true });
            await Data.update({ deOtherSide: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to De Other Side")
        }
        //If the user exists and has already marked their attendance, notify them.
        if (findOsUser) {

            return dm.get(userId).send("You've already indicated that you atteneded De Other Side");
        } else {
            //If the authors record exists but they have not indicated they've atteneded the dungeon, update the record.
            //then set No Attendance to false to remove it from the embed arrays
            await Data.update({ deOtherSide: true },{ where: { discordUsername: message.author.username }});
            await Data.update({ deOtherSide: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to De Other Side")
        }
    }

    //Remove De Other Side
    else if (command(message, "rmos")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //Checks user to see if their record exists for this dungeon
        if (!findUser) {
            return dm.get(userId).send("You have yet to record your attendance for any dungeon, therefor you cannot remove yourself from the record.");
        }
        else {
            await Data.update({ deOtherSide: false }, { where: { discordUsername: message.author.username, deOtherSide: true }});

            // Builds an array of all boolean true entries for the dungeon
            let recChkArr = [];
            const recordCheck = await Data.findAll({ where: { deOtherSide: true }});

            for (record of recordCheck) {
            recChkArr.push(recordCheck.discordUsername);
            };
            //Checks the array above to see if it is empty then sets No Attendance to true for the embed arrays
            if (!recordCheck[0]) {
                await Data.update({ deOtherSide: true}, { where: { discordUsername: "No Attendance", deOtherSide: false }});
            }
            return dm.get(userId).send("Record removed.")
        }
    }
    //Sanguine Depths
    if (command( message, "sd")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //If the user doesn't exist, create the user and set the dungeon to true then set No Attendance to false to remove it from the embed arrays
        if (!findUser) {
            await Data.create({ discordUsername: message.author.username, sanguineDepths: true });
            await Data.update({ sanguineDepths: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to the Sanguine Depths")
        }
        //If the user exists and has already marked their attendance, notify them.
        if (findSdUser) {

            return dm.get(userId).send("You've already indicated that you atteneded the Sanguine Depths");
        } else {
            //If the authors record exists but they have not indicated they've atteneded the dungeon, update the record.
            //then set No Attendance to false to remove it from the embed arrays
            await Data.update({ sanguineDepths: true },{ where: { discordUsername: message.author.username }});
            await Data.update({ sanguineDepths: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to the Sanguine Depths")
        }
    }

    //Remove the Sanguine Depths
    else if (command(message, "rmsd")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //Checks user to see if their record exists for this dungeon
        if (!findUser) {
            return dm.get(userId).send("You have yet to record your attendance for any dungeon, therefor you cannot remove yourself from the record.");
        }
        else {
            await Data.update({ sanguineDepths: false }, { where: { discordUsername: message.author.username, sanguineDepths: true }});

            // Builds an array of all boolean true entries for the dungeon
            let recChkArr = [];
            const recordCheck = await Data.findAll({ where: { sanguineDepths: true }});

            for (record of recordCheck) {
            recChkArr.push(recordCheck.discordUsername);
            };
            //Checks the array above to see if it is empty then sets No Attendance to true for the embed arrays
            if (!recordCheck[0]) {
                await Data.update({ sanguineDepths: true}, { where: { discordUsername: "No Attendance", sanguineDepths: false }});
            }
            return dm.get(userId).send("Record removed.")
        }
    }
    //Mists of Tirna Scithe
    if (command( message, "ts")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //If the user doesn't exist, create the user and set the dungeon to true then set No Attendance to false to remove it from the embed arrays
        if (!findUser) {
            await Data.create({ discordUsername: message.author.username, mistsOfTirnaScithe: true });
            await Data.update({ mistsOfTirnaScithe: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to the Mists of Tirna Scithe")
        }
        //If the user exists and has already marked their attendance, notify them.
        if (findTsUser) {

            return dm.get(userId).send("You've already indicated that you atteneded the Mists of Tirna Scithe");
        } else {
            //If the authors record exists but they have not indicated they've atteneded the dungeon, update the record.
            //then set No Attendance to false to remove it from the embed arrays
            await Data.update({ mistsOfTirnaScithe: true },{ where: { discordUsername: message.author.username }});
            await Data.update({ mistsOfTirnaScithe: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to the Mists of Tirna Scithe")
        }
    }

    //Remove the Mists of Tirna Scithe
    else if (command(message, "rmts")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //Checks user to see if their record exists for this dungeon
        if (!findUser) {
            return dm.get(userId).send("You have yet to record your attendance for any dungeon, therefor you cannot remove yourself from the record.");
        }
        else {
            await Data.update({ mistsOfTirnaScithe: false }, { where: { discordUsername: message.author.username, mistsOfTirnaScithe: true }});

            // Builds an array of all boolean true entries for the dungeon
            let recChkArr = [];
            const recordCheck = await Data.findAll({ where: { mistsOfTirnaScithe: true }});

            for (record of recordCheck) {
            recChkArr.push(recordCheck.discordUsername);
            };
            //Checks the array above to see if it is empty then sets No Attendance to true for the embed arrays
            if (!recordCheck[0]) {
                await Data.update({ mistsOfTirnaScithe: true}, { where: { discordUsername: "No Attendance", mistsOfTirnaScithe: false }});
            }
            return dm.get(userId).send("Record removed.")
        }
    }
    //Theater of Pain
    if (command( message, "tp")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //If the user doesn't exist, create the user and set the dungeon to true then set No Attendance to false to remove it from the embed arrays
        if (!findUser) {
            await Data.create({ discordUsername: message.author.username, theaterOfPain: true });
            await Data.update({ theaterOfPain: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to the Theater of Pain")
        }
        //If the user exists and has already marked their attendance, notify them.
        if (findTpUser) {

            return dm.get(userId).send("You've already indicated that you atteneded the Theater of Pain");
        } else {
            //If the authors record exists but they have not indicated they've atteneded the dungeon, update the record.
            //then set No Attendance to false to remove it from the embed arrays
            await Data.update({ theaterOfPain: true },{ where: { discordUsername: message.author.username }});
            await Data.update({ theaterOfPain: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to the Theater of Pain")
        }
    }

    //Remove the Theater of Pain
    else if (command(message, "rmtp")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //Checks user to see if their record exists for this dungeon
        if (!findUser) {
            return dm.get(userId).send("You have yet to record your attendance for any dungeon, therefor you cannot remove yourself from the record.");
        }
        else {
            await Data.update({ theaterOfPain: false }, { where: { discordUsername: message.author.username, theaterOfPain: true }});

            // Builds an array of all boolean true entries for the dungeon
            let recChkArr = [];
            const recordCheck = await Data.findAll({ where: { theaterOfPain: true }});

            for (record of recordCheck) {
            recChkArr.push(recordCheck.discordUsername);
            };
            //Checks the array above to see if it is empty then sets No Attendance to true for the embed arrays
            if (!recordCheck[0]) {
                await Data.update({ theaterOfPain: true}, { where: { discordUsername: "No Attendance", theaterOfPain: false }});
            }
            return dm.get(userId).send("Record removed.")
        }
    }
    //Spires of Ascension
    if (command( message, "sa")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //If the user doesn't exist, create the user and set the dungeon to true then set No Attendance to false to remove it from the embed arrays
        if (!findUser) {
            await Data.create({ discordUsername: message.author.username, spiresOfAscension: true });
            await Data.update({ spiresOfAscension: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to the Spires of Ascension")
        }
        //If the user exists and has already marked their attendance, notify them.
        if (findSaUser) {

            return dm.get(userId).send("You've already indicated that you atteneded the Spires of Ascension");
        } else {
            //If the authors record exists but they have not indicated they've atteneded the dungeon, update the record.
            //then set No Attendance to false to remove it from the embed arrays
            await Data.update({ spiresOfAscension: true },{ where: { discordUsername: message.author.username }});
            await Data.update({ spiresOfAscension: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to the Spires of Ascension")
        }
    }

    //Remove the Spires of Ascension
    else if (command(message, "rmsa")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //Checks user to see if their record exists for this dungeon
        if (!findUser) {
            return dm.get(userId).send("You have yet to record your attendance for any dungeon, therefor you cannot remove yourself from the record.");
        }
        else {
            await Data.update({ spiresOfAscension: false }, { where: { discordUsername: message.author.username, spiresOfAscension: true }});

            // Builds an array of all boolean true entries for the dungeon
            let recChkArr = [];
            const recordCheck = await Data.findAll({ where: { spiresOfAscension: true }});

            for (record of recordCheck) {
            recChkArr.push(recordCheck.discordUsername);
            };
            //Checks the array above to see if it is empty then sets No Attendance to true for the embed arrays
            if (!recordCheck[0]) {
                await Data.update({ spiresOfAscension: true}, { where: { discordUsername: "No Attendance", spiresOfAscension: false }});
            }
            return dm.get(userId).send("Record removed.")
        }
    }
    //Plaguefall
    if (command( message, "pf")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //If the user doesn't exist, create the user and set the dungeon to true then set No Attendance to false to remove it from the embed arrays
        if (!findUser) {
            await Data.create({ discordUsername: message.author.username, plaguefall: true });
            await Data.update({ plaguefall: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to Plaguefall")
        }
        //If the user exists and has already marked their attendance, notify them.
        if (findPfUser) {

            return dm.get(userId).send("You've already indicated that you atteneded Plaguefall");
        } else {
            //If the authors record exists but they have not indicated they've atteneded the dungeon, update the record.
            //then set No Attendance to false to remove it from the embed arrays
            await Data.update({ plaguefall: true },{ where: { discordUsername: message.author.username }});
            await Data.update({ plaguefall: false },{ where: { discordUsername: "No Attendance" }});
            return dm.get(userId).send("Added to Plaguefall")
        }
    }

    //Remove Plaguefall
    else if (command(message, "rmpf")) {
        //Deletes the message to keep the channel clean
        if (msgId) { deleteMsg(); }
        //Checks user to see if their record exists for this dungeon
        if (!findUser) {
            return dm.get(userId).send("You have yet to record your attendance for any dungeon, therefor you cannot remove yourself from the record.");
        }
        else {
            await Data.update({ plaguefall: false }, { where: { discordUsername: message.author.username, plaguefall: true }});

            // Builds an array of all boolean true entries for the dungeon
            let recChkArr = [];
            const recordCheck = await Data.findAll({ where: { plaguefall: true }});

            for (record of recordCheck) {
            recChkArr.push(recordCheck.discordUsername);
            };
            //Checks the array above to see if it is empty then sets No Attendance to true for the embed arrays
            if (!recordCheck[0]) {
                await Data.update({ plaguefall: true}, { where: { discordUsername: "No Attendance", plaguefall: false }});
            }
            return dm.get(userId).send("Record removed.")
        }
    }
    //The Halls of Atonement
if (command( message, "ha")) {
    //Deletes the message to keep the channel clean
    if (msgId) { deleteMsg(); }
    //If the user doesn't exist, create the user and set the dungeon to true then set No Attendance to false to remove it from the embed arrays
    if (!findUser) {
        await Data.create({ discordUsername: message.author.username, hallsOfAtonement: true });
        await Data.update({ hallsOfAtonement: false },{ where: { discordUsername: "No Attendance" }});
        return dm.get(userId).send("Added to the Halls of Atonement")
    }
    //If the user exists and has already marked their attendance, notify them.
    if (findHaUser) {

        return dm.get(userId).send("You've already indicated that you atteneded the Halls of Atonement");
    } else {
        //If the authors record exists but they have not indicated they've atteneded the dungeon, update the record.
        //then set No Attendance to false to remove it from the embed arrays
        await Data.update({ hallsOfAtonement: true },{ where: { discordUsername: message.author.username }});
        await Data.update({ hallsOfAtonement: false },{ where: { discordUsername: "No Attendance" }});
        return dm.get(userId).send("Added to the Halls of Atonement")
    }
}

//Remove the Halls of Atonement
else if (command(message, "rmha")) {
    //Deletes the message to keep the channel clean
    if (msgId) { deleteMsg(); }
    //Checks user to see if their record exists for this dungeon
    if (!findUser) {
        return dm.get(userId).send("You have yet to record your attendance for any dungeon, therefor you cannot remove yourself from the record.");
    }
    else {
        await Data.update({ hallsOfAtonement: false }, { where: { discordUsername: message.author.username, hallsOfAtonement: true }});

        // Builds an array of all boolean true entries for the dungeon
        let recChkArr = [];
        const recordCheck = await Data.findAll({ where: { hallsOfAtonement: true }});

        for (record of recordCheck) {
        recChkArr.push(recordCheck.discordUsername);
        };
        //Checks the array above to see if it is empty then sets No Attendance to true for the embed arrays
        if (!recordCheck[0]) {
            await Data.update({ hallsOfAtonement: true}, { where: { discordUsername: "No Attendance", hallsOfAtonement: false }});
        }
        return dm.get(userId).send("Record removed.")
    }
}
//The initial command to create the channel, post the Help message and the embed,.. then pin the embed for future editting
else if (command(message, "start")) {

    let channelCache = JSON.stringify( client.channels.cache );
    const channelParse = JSON.parse(channelCache);
    const channelMap = channelParse.map(p => {
        return { name: p.name, id: p.id }
    })
    if (message.author.id == 379434086986416131) {
        let hoaxbot = channelMap.find(el => el.name === "hoaxbot");

        if (hoaxbot) {
            console.log("Channel already exists");;
        } else {
            let parent = channelMap.find(el => el.name === "resources");
            let pID = parent.id
            message.guild.channels.create("hoaxbot", {
            type: "text",
            parent: pID
        })
        .then(async (channel) => {
            console.log("Channel created successfully");
            let channelCache = JSON.stringify( client.channels.cache );
            const channelParse = JSON.parse(channelCache);
            const channelMap = channelParse.map(p => {
                return { name: p.name, id: p.id }
            })
            let hoaxbot = await channelMap.find(el => el.name === "hoaxbot");
            const channelID = hoaxbot.id;
            await client.channels.fetch(channelID)
            .then(async(channel) => {
                channel.send("The Hoax Dungeon Tracker allows guild members to record their attendance in the mythic 0 dungeons they complete for the week.\n\nKeeping this log will allow the guild to maximize runs to efficiently gear our characters before the first raid.\nTo record your attendance for a dungeon, enter a command from the list below. (Ex: **!nw**)\n\n**!update** - Updates the list\n**!nw** - The Necrotic Wake\n**!os** - De Other Side\n**!sd** - Sanguine Depths\n**!ts** - Mists of Tirna Scithe\n**!tp** - Theater of Pain\n**!sa** - Spires of Ascension\n**!pf** - Plaguefall\n**!ha** - Halls of Atonement\n\nIf you accidentally signed up for the wrong dungeon, prefix 'rm' to the dungeon command and it will remove you. (Ex: **!rmnw**)")
                pushDbToArr();

            let dungeonEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Shadowlands Dungeons')
                .setURL('https://shadowlands.wowhead.com/zones/shadowlands/dungeons')
                .setDescription("Used to track guild member weekly attendence in Mythic 0")
                .setTimestamp()
                .addFields(dungeons.map(d => {
                    return {name: d.name, value: d.attendees, inline: true};
                }))

                channel.send(dungeonEmbed).then((message) => { message.pin(); });
            })
        });
}
    if (msgId) { deleteMsg(); }
    } else { return dm.get(userId).send("You do not have permissions to execute this command."); }
    }
    else if (command(message, "update")) {
        if (msgId) { deleteMsg(); }
            pushDbToArr();
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Shadowlands Dungeons')
                .setURL('https://shadowlands.wowhead.com/zones/shadowlands/dungeons')
                .setDescription("Used to track guild member weekly attendence in Mythic 0")
                .setTimestamp()
                .addFields(dungeons.map(d => {
                    return {name: d.name, value: d.attendees, inline: true};
                }))
            let list = await message.channel.messages.fetchPinned();
            pinnedMsg = list.last();
            if (!pinnedMsg) { return false; }
            pinnedMsg.edit(embed);
    }
    //Used for testing
    else if (command(message, "log")) {
        if (msgId) { deleteMsg(); }
        if (message.author.id == 379434086986416131) {

                pushDbToArr();

            const embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Shadowlands Dungeons')
                    .setURL('https://shadowlands.wowhead.com/zones/shadowlands/dungeons')
                    .setDescription("Used to track guild member weekly attendence in Mythic 0")
                    .setTimestamp()
                    .addFields(dungeons.map(d => {
                        return {name: d.name, value: d.attendees, inline: true};
                    }))
                    console.log(dungeons);
            let list = await message.channel.messages.fetchPinned();
            pinnedMsg = list.last();
            if (!pinnedMsg) { return false; }
            pinnedMsg.edit(embed);
            }

        else { return false; }
    }
});

client.login(process.env.BOT_TOKEN);
