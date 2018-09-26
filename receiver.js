const express = require('express');
const bodyParser = require('body-parser')
const app = express();

app.use( bodyParser.json() );   

app.listen(3002, () => {
    console.log('receiver listening on 3002')
})

app.post('/message', (req, res) => {
    console.log(req.body.message);
})