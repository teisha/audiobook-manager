'use strict'
const path = require('path')
const dynamodbUtils = require('../utils/dynamodbUtils')
const Person = require('../models/person')
const AWS = require('aws-sdk')


const secretsPath = path.join(__dirname, 'secrets.json')
AWS.config.loadFromPath(secretsPath);
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})

dynamodbUtils.ddb = ddb
importUtils.dynamodbUtils = dynamodbUtils


const testHuman = {
    username: 'rhunt',
    name: 'rebecca hunt',
    email: 'rhunt@example.com',
    phone: '6609207261'
}