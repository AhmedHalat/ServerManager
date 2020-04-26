// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
var Compute = require('@google-cloud/compute');
var compute = new Compute();



process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`You can ask me to List, Start or Stop servers`);
  }

  function toggleServer(agent){
    agent.add(`Toggle`);

  }

  async function activateServer(agent){
    console.log(agent.parameters);
    var servers = agent.parameters.servers;
    const [vms] = await compute.getVMs();
    await Promise.all(
      vms.map(async (instance) => {
        console.log(instance);
        if (servers.includes(instance.name)) {
          const [operation] = await compute
            .zone(instance.zone.id)
            .vm(instance.name)
            .start();
          return operation.promise();
        }
      })
    );
    agent.add(`Booting up ${servers}`);
  }

  async function deactivateServer(agent){
    console.log(agent.parameters);
    var servers = agent.parameters.servers;
    const [vms] = await compute.getVMs();
    await Promise.all(
      vms.map(async (instance) => {
        console.log(instance);
        if (servers.includes(instance.name)) {
          const [operation] = await compute
            .zone(instance.zone.id)
            .vm(instance.name)
            .stop();
          return operation.promise();
        }
      })
    );
    agent.add(`Shutting down ${servers}`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }


async function listVMs() {
  const vms = await compute.getVMs({
    maxResults: 1000,
  });
  var str = "";
  for(let vm of vms[0])
    str += `${vm.metadata.name}  ${vm.metadata.status}  ${ vm.metadata.networkInterfaces[0].accessConfigs[0].natIP || ' ' }\n`;
  if(str == ""){
     console.log("Had an empty string")
     listVMs()
     }
  else agent.add(str);
}

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Server-toggle', toggleServer);
  intentMap.set('Server-on', activateServer);
  intentMap.set('Server-off', deactivateServer);
  intentMap.set('Server-list', listVMs);

  agent.handleRequest(intentMap);
});
