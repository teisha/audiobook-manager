const serverless = require('serverless-http');
const bodyParser = require('body-parser')
const express = require('express')
const dynamodbUtils = require('../utils/dynamodbUtils')

const app = express()
app.use(bodyParser.json({strict: false}))


/*******************************************************************
 *  Credit-focused queries
 *******************************************************************/
// When is ?person? next credit coming? GS2- PERSON_NEXT
app.get('/next/:username', (req, res) => {
    const username = req.params.username
    const pkuser =  'PERSON|' + username
    try {
        const results = await dynamodbUtils.getQueryByStatus('NEXT', 'CREDIT|', username , false)
        if (results.ItemsJSON) {
            return res.status(200).json(results.ItemsJSON)
        } else {
            return res.status(400).json({error: 'Cannot determine the upoming credits for ' + username})
        } 
    } catch (error) {
        console.log('Error getting credits for ' + username)
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
})


// How many unused credits for person?
app.get('/issued/total/:username', (req, res) => {
    const username = req.params.username
    const pkuser =  'PERSON|' + username
    try {
        const results = await dynamodbUtils.getQueryByStatus('ISSUED', 'CREDIT|', username , true)
        if (results.Count) {
            return res.status(200).json({message: `${username} has ${results.Count} credits available`})
        } else {
            return res.status(400).json({error: 'Cannot determine the usused credit total for ' + username})
        } 
    } catch (error) {
        console.log('Error getting credits for ' + username)
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
})













module.exports.handler = serverless(app);