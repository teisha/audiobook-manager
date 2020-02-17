const serverless = require('serverless-http');
const bodyParser = require('body-parser')
const AWS = require('aws-sdk')
const express = require('express')
const app = express()



const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient()


app.use(bodyParser.json({strict: false}))


//Get User By Id
app.get('/books/:bookId', function(req, res) {
    const params ={
        TableName: USERS_TABLE,
        Key: {
            userId: req.params.userId
        }
    }
    dynamoDb.get(params, (error, result) => {
        if(error) {
            console.log(error)
            res.status(400).json({error: 'Could not get user'})
        }
        if (result.Item) {
            const {userId, name} = result.Item
            res.status(200).json({userId, name})
        } else {
            res.status(404).json({error: 'User not found'})
        }
    })
})

//Create User
app.post('/users', function (req, res) {
    const {userId, name } = req.body
    if (typeof userId !== 'string') {
        res.status(400).json({error: "'userId' must be a string"})
    } else if (typeof name !== 'string') {
        res.status(400).json({error: "'name' must be a string"})
    }

    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId: userId,
            name: name
        }
    }


    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error)
            res.status(400).json({error: 'Could not create user'})
        }
        res.status(200).json({userId, name})
    })

})