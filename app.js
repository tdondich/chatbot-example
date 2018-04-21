var restify = require('restify');
var builder = require('botbuilder');
const wiki = require('wikijs').default;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
    function (session) {
        builder.Prompts.text(session, 'Hi! What would you like me to search for?');
    },
    function (session, results) {
        wiki().search(results.response)
            .then((searchResults) => {
                builder.Prompts.choice(session, "Which of these matching topics would you like a summary of?", searchResults.results, {listStype: 3})
            })
    },
    function (session, results) {
        console.log("Calling wiki page");
        wiki().page(results.response.entity)
        .then((page) => {
            console.log("Fetching summary for page");
            return page.summary();
        })
        .then((summary) => {
            console.log("Sending end dialog.");
            session.endDialog(summary);
        })
    }
]);