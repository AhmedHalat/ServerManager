const Compute = require('@google-cloud/compute');
const config = require('./config.json');
const eris = require("eris")

const compute = new Compute();

const bot = new eris.CommandClient(config.token, {}, {
    description: "A bot for managing VM servers",
    owner: "AhmedHalat",
    prefix: "!"
});
const vanilla = 'mc-server';
const pixelmon = 'pixel-server'

// When the bot is connected and ready, log to console.
bot.on('ready', () => {
  console.log('Connected and ready. V2');
});

bot.on('error', err => {
  console.warn(err);
});

/*
  Compute Functions
 */

async function activateServer(instanceName){
  const [vms] = await compute.getVMs();
  await Promise.all(
    vms.map(async (instance) => {
      if (instanceName == instance.name) {
        await compute
        .zone(instance.zone.id)
        .vm(instance.name)
        .start();
        return ;
      }
    })
  ).catch(function(err) {
    console.log(err.message); // some coding error in handling happened
    return err.message;
  });
  return `Booting up ${instanceName}`;
}

async function deactivateServer(instanceName){
  const [vms] = await compute.getVMs();
  await Promise.all(
    vms.map(async (instance) => {
      if (instanceName == instance.name) {
        await compute
        .zone(instance.zone.id)
        .vm(instance.name)
        .stop();
        return ;
      }
    })
  ).catch(function(err) {
    console.log(err.message); // some coding error in handling happened
    return err.message;
  });
  return `Shutting down ${instanceName}`;
}

async function getStatus(instanceName) {
  const vms = await compute.getVMs({
    maxResults: 10,
  });
  var str = "";
  for(let vm of vms[0])
    if(instanceName == vm.metadata.name)str += `${vm.metadata.name}  ${vm.metadata.status}  ${ vm.metadata.networkInterfaces[0].accessConfigs[0].natIP || ' ' }\n`;
  return str || "There are no VMs with that name"
}

/*
  Bot Commands
 */
const vanillaCommand = bot.registerCommand("vanilla", (msg, args) => { // Make an echo command
    if(args.length === 0) { // If the user just typed "!echo", say "Invalid input"
      try {
        var res = getStatus(vanilla)
      } catch (e) {
        return "ERROR"
      }
      return res;
    }
  },
  {
    description: "Make the bot say something",
    fullDescription: "The bot will echo whatever is after the command label.",
    reactionButtons: [ // Add reaction buttons to the command
    {
      emoji: "ℹ️",
      type: "edit",
      response: (msg) => { // Reverse the message content
        try {
          var res = getStatus(vanilla)
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
          var res = activateServer(vanilla)
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
          var res = deactivateServer(vanilla)
        } catch (e) {
          return "FAILED TO STOP"
        }
        return res;
      }
    }
  ]
  }
);

vanillaCommand.registerSubcommand("start", (msg, args) => { // Make a reverse subcommand under echo
    if(args.length === 0) { // If the user just typed "!echo reverse", say "Invalid input"
      try {
        var res = activateServer(vanilla)
      } catch (e) {
        return "Failed to start"
      }
      return res;
    }
  },
  {
    description: "Start the mc-server"
  }
);

vanillaCommand.registerSubcommand("stop", (msg, args) => { // Make a reverse subcommand under echo
    if(args.length === 0) { // If the user just typed "!echo reverse", say "Invalid input"
      try {
        var res = deactivateServer(vanilla)
      } catch (e) {
        return "ERROR"
      }
      return res;
    }
  },
  {
    description: "Stop the mc-server"
  }
);

const pixelmonCommand = bot.registerCommand("pixelmon", (msg, args) => { // Make an echo command
    if(args.length === 0) { // If the user just typed "!echo", say "Invalid input"
      try {
        var res = getStatus(pixelmon)
      } catch (e) {
        return "ERROR"
      }
      return res;
    }
  },
  {
    description: "Make the bot say something",
    fullDescription: "The bot will echo whatever is after the command label.",
    reactionButtons: [ // Add reaction buttons to the command
    {
      emoji: "ℹ️",
      type: "edit",
      response: (msg) => { // Reverse the message content
        try {
          var res = getStatus(pixelmon)
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
          var res = activateServer(pixelmon)
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
          var res = deactivateServer(pixelmon)
        } catch (e) {
          return "FAILED TO STOP"
        }
        return res;
      }
    }
  ]
  }
);

pixelmonCommand.registerSubcommand("start", (msg, args) => { // Make a reverse subcommand under echo
    if(args.length === 0) { // If the user just typed "!echo reverse", say "Invalid input"
      try {
        var res = activateServer(pixelmon)
      } catch (e) {
        return "Failed to start"
      }
      return res;
    }
  },
  {
    description: "Start the mc-server"
  }
);

pixelmonCommand.registerSubcommand("stop", (msg, args) => { // Make a reverse subcommand under echo
    if(args.length === 0) { // If the user just typed "!echo reverse", say "Invalid input"
      try {
        var res = deactivateServer(pixelmon)
      } catch (e) {
        return "ERROR"
      }
      return res;
    }
  },
  {
    description: "Stop the mc-server"
  }
);


bot.registerCommandAlias("mc", "vanilla");
bot.registerCommandAlias("pm", "pixelmon");

bot.connect();
