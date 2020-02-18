'use strict'
const path = require('path')
const dynamodbUtils = require('../utils/dynamodbUtils')
const Person = require('../models/person')
const AWS = require('aws-sdk')

const secretsPath = path.join(__dirname, 'secrets.json')
AWS.config.loadFromPath(secretsPath);
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})
dynamodbUtils.ddb = ddb

const testHuman = {
    username: 'rhunt',
    name: 'rebecca hunt',
    email: 'rhunt@example.com',
    phone: '6609207261'
}

const testPerson = new Person (testHuman.username, testHuman.name, testHuman.email, testHuman.phone)

describe.skip ("Inserting People", () => {
    beforeEach(async (done) => {
        try {
            const deleted = await dynamodbUtils.removeRecord (testPerson.PKhash, testPerson.SKsort )
            console.log(deleted)
        } catch(error) {
            console.error(error)
        }
        done()
    })

    it('validates person record is inserted',  async (done) => {
        try {
            const doesExist = await dynamodbUtils.getRecord (testPerson.PKhash, testPerson.SKsort ) 
                expect(doesExist.PKhash).not.toBeDefined()
            const newPerson = await dynamodbUtils.saveRecord(testPerson.getInsertItem())
            const actualPerson = await dynamodbUtils.getRecord (testPerson.PKhash, testPerson.SKsort )            

            expect(actualPerson.PKhash).toBe(testPerson.PKhash)
            expect(actualPerson.SKsort).toBe(testPerson.SKsort)   
            expect(actualPerson.username).toBe(testPerson.username)  
            expect(actualPerson.name).toBe(testPerson.name)
            expect(actualPerson.email).toBe(testPerson.email)
            expect(actualPerson.phone).toBe(testPerson.phone)


        } catch (error) {
            console.error(error)
            expect(error).toBeNull()
        }

        done()
    })


})