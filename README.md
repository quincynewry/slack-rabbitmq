
# slack-rabbitmq

  

## Setup:

  

### RabbitMQ:

  

We are goint to run RabbitMQ in a docker container. Run the following commands:

**docker pull rabbitmq**

**docker run -d --hostname slack-rabbit --name slack-rabbit -p 4369:4369 -p 5671:5671 -p 5672:5672 -p 15672:15672 rabbitmq**

**docker exec slack-rabbit rabbitmq-plugins enable rabbitmq_management**

  

You should now have a docker container running. This will listen for messages on port 5672.

There is also a management UI running on http://localhost:15672 where you can view queues and messages.

  

### Ngrok:

  

For slack to be able to send requests back to our server it will require a public url. I like to use ngrok to expose local ports as a public url.

  

You can create a free account and install ngrok following the instructions here: https://ngrok.com/

  

You will need to expose the listener (Default port: 3001) Run the following command:

  

./ngrok http 3001

  

You should have a url generated for you such as http://1e375827.ngrok.io (keep this)

  

### Slack:

  

We now need to setup a slack app which will generate a webhook for us to send messages to and also we will specify a callback url for actions (the ngrok url we setup earlier)

  

1. Create yourself a channel for testing

2. Go to https://api.slack.com/apps?new_app=1

3. Specify a name for the app and a workspace

4. Click on incoming webhooks

5. Click add new webhook

6. Specify a channel and authorize

7. Copy the generated URL and replace the slackWebhookUrl in listener.js with this

8. Back in slack click on interactive components

9. Paste in your ngrok url you generated earlier

10. Done

  

### Running the application:

**npm install**

**nodemon receiver**

**nodemon listener**

**nodemon sender**

You should now have message being sent from the sender, being picked up by the listener and sent on to the receiver.

Now to test it out introduce some bugs in your receiver and watch the messages start to drop in to an error queue on RabbitMQ. You should also (hopefully) see some slack alerts coming in to your channel.

This is a very basic implementation of rabbitmq and slack alerting but should give you an idea of the concept. If anyone would like to speak more about implementing this in production feel free to speak to me.