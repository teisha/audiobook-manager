const serverless = require('serverless-http');
const bodyParser = require('body-parser')
const express = require('express')
const dynamodbUtils = require('../utils/dynamodbUtils')

const app = express()
app.use(bodyParser.json({strict: false}))

// How many times has Book been purchased
app.get('/', (req, res) => {
        return res.status(404).json({error: 'Request not found.'})
})



module.exports.handler = serverless(app);

