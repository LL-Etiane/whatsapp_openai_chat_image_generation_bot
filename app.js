require('dotenv').config()
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const User = require("./db/models/users");
const MessageCount = require("./db/models/messageCount");
const { completeChat, generateImage } = require("./openai/main");

const client = new Client({
  authStrategy: new LocalAuth(),
  ignoreStatusUpdate: true,
  webVersionCache: {
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2402.5-beta.html',
      type: 'remote'
  },
  puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  if ((!msg.hasMedia || !msg.isStatus, !msg.hasReaction)) {
    const contact = msg.getContact();
    let userPhone = msg.from;
    userPhone = userPhone.split("@")[0];
    let userName = (await contact).pushname || contact.name || "No name";

    if(!userPhone || !userName) return 0;

    // Check if the user account exist and if not create it
    let user = await User.findOne({ where: { phone: userPhone } });
    if (!user) {
      user = await User.create({
        phone: userPhone,
        name: userName,
        isAllowed: false,
        isAdmin: false,
        duration: 0,
      });
    }

    console.log(`Message from ${userName} (${userPhone}): ${msg.body}`);
    msgBody = msg.body.toLowerCase();

    // check if its the admin wanting to allow user access to the code
    adminPhone = process.env.ADMIN 
    if(user.isAdmin || userPhone == adminPhone && msgBody.startsWith("/allow" )){
      let phone = msgBody.split(" ")[1];
      let user = await User.findOne({ where: { phone: phone } });
      if(user){
        user.isAllowed = true;
        await user.save();
        msg.reply("User can now access the bot");
        return 1;
      }else{
        msg.reply("User not found");
        return 0;
      }
    }

    // check if its the admin wanting to disallow user access to the code
    if(user.isAdmin || userPhone == adminPhone && msgBody.startsWith("/disallow")){
      let phone = msgBody.split(" ")[1];
      let user = await User.findOne({ where: { phone: phone } });
      if(user){
        user.isAllowed = false;
        await user.save();
        msg.reply("User has been restricted from the bot");
        return 1;
      }else{
        msg.reply("User not found");
        return 0;
      }
    }
    console.log(user.isAllowed)
    if (!user.isAllowed){
      // Increment the message count for the user and check if the user has exceeded 10 counts
      if(msgBody != "hi" || msgBody != "hello" || msgBody != "help" || msgBody != "about"){
        let messageCount = await MessageCount.findOne({
          where: { phone: userPhone },
        });
        if (!messageCount) {
          messageCount = await MessageCount.create({ phone: userPhone, count: 1});
        } else {
          messageCount.count += 1;
          await messageCount.save();
          if (messageCount.count > 10) {
            msg.reply(
              "You have exceeded the number of messages you can send. Contact +237670169123 if you still want to use"
            );
            return 0;
          }
        }
      }
    }

    if (msg.body.toLowerCase() == "hi" || msg.body.toLowerCase() == "hello") {
      msg.reply(
        "Hello, I am a bot. I am here to help you with your queries. Please type 'help' to know more about me."
      );
    } else if (msg.body.toLowerCase() == "help") {
      msg.reply(
        "I am a bot. Build by etiane, I can help you process many task for you like answer questions, generate images and many more.\n" +
          "Here are some of the commands you can use:\n" +
          "1. Hi or Hello: To greet me\n" +
          "2. Help: To know more about me\n" +
          "3. About: To know about the creator of this bot\n" +
          "4. send a question and I will try to answer it for you\n" +
          "5. Send an image and i will scan and process the text in it for you\n" +
          "6. /generate text: To generate an image with the text you provided"
      );
    } else if (msg.body.toLowerCase() == "about") {
      msg.reply(
        "I am a bot. I was built by etiane. You can reach out to him at +237670169123"
      );
    } else if (msg.body.toLowerCase().startsWith("/generate")) {
      let text = msg.body.split(" ")[1];
      if (text) {
        try {
          msg.reply("request recieved, processing");
          let image_url = await generateImage(text);
          msg.reply(image_url)
          console.log(image_url);
        } catch (error) {
          console.log(error);
          msg.reply(
            "There was an error generating image please try again later"
          );
        }
      } else {
        msg.reply("Please provide a text to generate an image");
      }
    } else {
      let response = await completeChat(msg.body);
      msg.reply(response);
    }
  }
});

client.initialize();
