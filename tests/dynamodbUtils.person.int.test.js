'use strict'
const path = require('path')
const dynamodbUtils = require('../utils/dynamodbUtils')
const Person = require('../models/person')
const Credit = require('../models/credit')
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

describe ("Inserting People", () => {
    beforeEach(async (done) => {
        const deleted = await dynamodbUtils.removeRecord (testPerson.PKhash, testPerson.SKsort )
        console.log(deleted)
        done()
    })

    it('validates person record is inserted',  async (done) => {
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
        done()
    })
})

const testCredit = {
    person: 'rhunt',
    status: 'ISSUED',
    dateIssued: '08-MAY-2012'
} 
const testCreditObj = new Credit (testCredit.person, testCredit.status, testCredit.dateIssued)
testCreditObj.PKhash = 'CREDIT|TEST696490684506845790'

describe("Inserting Credits", () => {
    beforeEach(async (done) => {
        const deleted = await dynamodbUtils.removeRecord (testCreditObj.PKhash, testCreditObj.SKsort )
        console.log(deleted)
        done()
    })

    it('validates credit record is inserted',  async (done) => {
        expect(testCreditObj.dateRecorded).toMatch(/^2012-05-08T/)
        const doesExist = await dynamodbUtils.getRecord (testCreditObj.PKhash, testCreditObj.SKsort ) 
        expect(doesExist.PKhash).not.toBeDefined()
        const newCredit = await dynamodbUtils.saveRecord(testCreditObj.getInsertItem())
        const actualCredit = await dynamodbUtils.getRecord (testCreditObj.PKhash, testCreditObj.SKsort )            

        expect(actualCredit.PKhash).toBe(testCreditObj.PKhash)
        expect(actualCredit.SKsort).toBe(testCreditObj.SKsort)   
        expect(actualCredit.username).toBe(testCreditObj.username)  
        expect(actualCredit.Status).toBe(testCreditObj.Status)
        expect(actualCredit.dateRecorded).toBe(testCreditObj.dateRecorded)
        done()
    })
})