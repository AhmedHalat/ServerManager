# ServerManager
Discord bot for starting and stoping VM
- 2 commands are set up by default, one for a pixelmon server, and one for a vanilla server
- The dialogflow branch has one for a windows server, and a text matcher for any server with the user specified name. Try @ServerManager start <instance name>
- Create custom commands by changing the variable names at the top for pixelmon and vanilla or creating more command functions

## Installation
- Download the project onto your machine
- Run `npm i` to install to get the necessary packages
- Downlaod a gcloud service account credientials, [Google Authentication](https://cloud.google.com/docs/authentication/getting-started)

## Preparation
- Store your discord token and name to the token and name variable in Servermanager.js
- Run `export GOOGLE_APPLICATION_CREDENTIALS="/path-to-file/Servers-432f295fec07.json"` in the project

## Running 
- `node ServerManager.js`
- Be sure to leave the server running if you want the bot to stay online
