const express = require('express');
const app = express();
var amqp = require('amqplib/callback_api');
const axios = require('axios');
var receiverUrl = "http://localhost:3002/message"
const { IncomingWebhook } = require('@slack/client');
const slackWebhookUrl = 'SLACK_WEBHOOK_URL';
const webhook = new IncomingWebhook(slackWebhookUrl);
const bodyParser = require('body-parser')
var incomingChannel = null;
var errorChannel = null;

var incomingQueue = 'lunch-and-learn';
var errorQueue = 'lunch-and-learn-error';

app.use(bodyParser.urlencoded({
    extended: true
}))

app.listen(3001, () => {
    console.log('listener listening on 3001')
})

app.post('/slack-callback', (req, res) => {
    var callback = JSON.parse(req.body.payload);
    var actionValue = callback.actions[0].value;

    console.log(actionValue);

    if (actionValue == 'retry') {
        errorChannel.consume(errorQueue, function(msg) {
            incomingChannel.sendToQueue(incomingQueue, new Buffer(msg.content.toString()));
        }, {noAck: true});
    } else {
        // can't be assed
        console.log('purge')
    }
})

amqp.connect('amqp://localhost:5672', function(err, conn) {

    conn.createChannel(function(err, ch) {
        errorChannel = ch;
    
        ch.assertQueue(errorQueue, {durable: false});
    });
    
    conn.createChannel(function(err, ch) {
        incomingChannel = ch;

        ch.assertQueue(incomingQueue, {durable: false});

        ch.consume(incomingQueue, function(msg) {
            console.log("Received '%s'", msg.content.toString());

            axios.post(receiverUrl, {
                message: msg.content.toString()
            })
            .catch((error) => {
                console.log('Failed to send message');

                errorChannel.sendToQueue(errorQueue, new Buffer(msg.content.toString()));

                var slackMessage = {
                    "text": `Failed to send message: ${msg.content.toString()}`,
                    "attachments": [
                        {
                            "text": 'What do you want to do?',
                            "fallback": "Hmmmm that didn't work",
                            "callback_id": "error_options",
                            "color": "#3AA3E3",
                            "attachment_type": "default",
                            "actions": [
                                {
                                    "name": "options",
                                    "text": "Retry",
                                    "type": "button",
                                    "value": "retry"
                                },
                                {
                                    "name": "options",
                                    "text": "Purge",
                                    "style": "danger",
                                    "type": "button",
                                    "value": "purge"
                                }
                            ]
                        }
                    ]
                };

                webhook.send(slackMessage, function(err, res) {
                    
                });
            });
        }, {noAck: true});
    });
});