var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
const config = require("./config.json");
const request = require('request');
var rootCas = require('ssl-root-cas').inject();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// init flint
var flint = new Flint(config);
flint.start();
console.log("Starting flint, please wait...");

flint.on("initialized", function() {
   console.log("Flint initialized successfully! [Press CTRL-C to quit]");
});

var cityName;

flint.hears('/weather', function(bot, trigger) {
   cityName = trigger.args.slice(1).join(" ");
   let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=*****************************&units=imperial`
   console.log('/weather fired');
   request(url, function(err, response, body) {
       if (err) {
           console.log('error:', error);
       } else {
           let weather = JSON.parse(body)
           var message;
           if (weather.main == undefined || err) {
               console.log('error: ', err)
               bot.say(`Hmm.... I can't find information for "${cityName}". Try again, maybe?`);
           } else if (weather.main.temp >= 70) {
               message = `😎 It's ${weather.main.temp} degrees in ${weather.name}! 😎\n`;
           } else if (weather.main.temp < 70 && weather.main.temp >= 55) {
               message = `☀️ It's ${weather.main.temp} degrees in ${weather.name}! ☀️\n`;
           } else if (weather.main.temp < 55 && weather.main.temp > 32) {
               message = `🙄 It's ${weather.main.temp} degrees in ${weather.name}! 🙄\n`;
           } else if (weather.main.temp < 32) {
               message = `🤧☃️ It's ${weather.main.temp} degrees in ${weather.name}! ☃️🤧\n`;
           } else {
               message = `Couldn't find temperature data for ${weather.name}.\n`;
           }
           //message += weather.weather[3];
           bot.say(message);
       }
   });
});

flint.hears('Hi'.toLowerCase(), function(bot, trigger) {
   console.log("hi fired");
   bot.say('Hi there! How are you doing today?');
})

flint.hears('Hello'.toLowerCase(), function(bot, trigger) {
   console.log("hello fired");
   bot.say('Hi there! How are you doing today?');
})

flint.hears('you\'re not helpful'.toLowerCase(), function(bot, trigger) {
   console.log("not helpful fired");
   bot.say('I\'m sorry.');
})

flint.hears('good how are you?'.toLowerCase(), function(bot, trigger) {
   console.log("response to hi/hello fired");
   let personDisplayName = trigger.personDisplayName;
   bot.say('I\'m glad to hear that, ' + personDisplayName + '!');
   bot.say('I am also doing very well today!');
})

flint.hears('great how are you?'.toLowerCase(), function(bot, trigger) {
   console.log("response to hi/hello fired");
   let personDisplayName = trigger.personDisplayName;
   bot.say('I\'m glad to hear that, ' + personDisplayName + '!');
   bot.say('I am also doing very well today!');
})

flint.hears('i\'m great, how are you?'.toLowerCase(), function(bot, trigger) {
   console.log("response to hi/hello fired");
   let personDisplayName = trigger.personDisplayName;
   bot.say('I\'m glad to hear that, ' + personDisplayName + '!');
   bot.say('I am also doing very well today!');
})

flint.hears('i\'m good, how are you?'.toLowerCase(), function(bot, trigger) {
   console.log("response to hi/hello fired");
   let personDisplayName = trigger.personDisplayName;
   bot.say('I\'m glad to hear that, ' + personDisplayName + '!');
   bot.say('I am also doing very well today!');
})

flint.hears('what can you do?', function(bot, trigger) {
   console.log("what can you do fired");
   let personDisplayName = trigger.personDisplayName;
   bot.say("Well, " + personDisplayName + ", I'm glad you asked!");
   bot.say("At the moment, I am only capable of asking how you are doing if you prompt me to do so, and can complete the following commands: \n/echo, /whoami")
})

/* On mention with command, using other trigger data, can use lite markdown formatting
ex "@botname /whoami"
*/
flint.hears('/whoami', function(bot, trigger) {
   console.log("/whoami fired");
   //the "trigger" parameter gives you access to data about the user who entered the command
   let roomId = "*" + trigger.roomId + "*";
   let roomTitle = "**" + trigger.roomTitle + "**";
   let personEmail = trigger.personEmail;
   let personDisplayName = trigger.personDisplayName;
   let outputString = `${personDisplayName} here is some of your information: \n\n\n **Room:** you are in "${roomTitle}" \n\n\n **Room id:** ${roomId} \n\n\n **Email:** your email on file is *${personEmail}*`;
   bot.say("markdown", outputString);
});

/* On mention with command arguments
ex User enters @botname /echo phrase, the bot will take the arguments and echo them back
*/
flint.hears('/echo', function(bot, trigger) {
   console.log("/echo fired");
   let phrase = trigger.args.slice(1).join(" ");
   let outputString = `Ok, I'll say it: "${phrase}"`;
   bot.say(outputString);
});

/****
## Server config & housekeeping
****/
app.post('/', webhook(flint));

var server = app.listen(config.port, function() {
   flint.debug('Flint listening on port %s', config.port);
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
   flint.debug('stopping...');
   server.close();
   flint.stop().then(function() {
       process.exit();
   });
});
