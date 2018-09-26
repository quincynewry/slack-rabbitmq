const express = require('express');
const app = express();
var amqp = require('amqplib/callback_api');

app.listen(3000, () => {
    console.log('sender listening on 3000')
})

amqp.connect('amqp://localhost:5672', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'lunch-and-learn';

    ch.assertQueue(q, {durable: false});

    setInterval(() => {
        var message = 'Hello World!';
        ch.sendToQueue(q, new Buffer(message));
        console.log(`Sent '${message}'`);
    },5000);
  });
});