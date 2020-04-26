const dialogflow = require('dialogflow');
const eris = require('eris');
const Compute = require('@google-cloud/compute');

const sessionClient = new dialogflow.SessionsClient();
const config = require('./config.json');
const projectId = config.project_id;
const sessionId = config.id;
const languageCode = config.language;

const compute = new Compute();

const bot = new eris.CommandClient(config.token, {}, {
    description: "A test bot made with Eris",
    owner: "AhmedHalat",
    prefix: "!"
});

// When the bot is connected and ready, log to console.
bot.on('ready', () => {
  console.log('Connected and ready. V0.1');
});

async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      }
    }
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

async function executeQueries(projectId, sessionId, query, languageCode) {
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  var responses = "";
  let context;
  let intentResponse;
  try {
    console.log(`Sending Query: ${query}`);
    intentResponse = await detectIntent(projectId, sessionId, query, context,languageCode);
    console.log(`Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`);
    responses = `${intentResponse.queryResult.fulfillmentText}`;
    // Use the context from this response for next queries
    context = intentResponse.queryResult.outputContexts;
  } catch (error) {
    console.log(error);
  }

  return responses
}

bot.on('messageCreate', (msg) => {
    var botWasMentioned = msg.mentions.find(mentionedUser => mentionedUser.id === bot.user.id,);
    if (botWasMentioned){
      var author = `<@!${msg.author.id}>`;
      content = msg.content.toString().toLowerCase().replace("<@!685821709206421504>", "");
      var res = executeQueries(projectId, sessionId, content, languageCode)
      .then(() => msg.channel.createMessage(author))
      .then(() => msg.channel.createMessage("\n"+res))
      .catch((er) => console.error(er));
    }

});

bot.on('error', err => {
  console.warn(err);
});

bot.registerCommand("vanilla", "What do you want to do to Vanilla", { // Make a ping command
  // Responds with "Pong!" when someone says "!ping"

  description: "Listing!",
  fullDescription: `What do you want to do?`,
  reactionButtons: [ // Add reaction buttons to the command
    {
      emoji: "ℹ️",
      type: "edit",
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "Status mc-server", languageCode)
        } catch (e) {
          return "ERROR"
        }

        return res;
      }
    },
    {
      emoji: "▶️",
      type: "edit",
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "start mc-server", languageCode)
        } catch (e) {
          return "FAILED TO START"
        }
        return res;
      }
    },
    {
      emoji: "⏹",
      type: "edit", // Pick a new pong variation
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "stop mc-server", languageCode)
        } catch (e) {
          return "FAILED TO STOP"
        }
        return res;
      }
    }
  ],
  reactionButtonTimeout: 300000 // After 30 seconds, the buttons won't work anymore
});

bot.registerCommand("pc", "What do you want to do to PC?", { // Make a ping command
  // Responds with "Pong!" when someone says "!ping"

  description: "Listing!",
  fullDescription: `What do you want to do?`,
  reactionButtons: [ // Add reaction buttons to the command
    {
      emoji: "ℹ️",
      type: "edit",
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "Status pc", languageCode)
        } catch (e) {
          return "ERROR"
        }

        return res;
      }
    },
    {
      emoji: "▶️",
      type: "edit",
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "start pc", languageCode)
        } catch (e) {
          return "FAILED TO START"
        }
        return res;
      }
    },
    {
      emoji: "⏹",
      type: "edit", // Pick a new pong variation
      response: (msg) => { // Reverse the message content
        try {
          var res = executeQueries(projectId, sessionId, "stop pc", languageCode)
        } catch (e) {
          return "FAILED TO STOP"
        }
        return res;
      }
    }
  ],
  reactionButtonTimeout: 300000 // After 30 seconds, the buttons won't work anymore
});

bot.connect();
