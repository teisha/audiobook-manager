'use strict'
const path = require('path')
const importUtils = require('../utils/importUtils')
const dynamodbUtils = require('../utils/dynamodbUtils')
const AWS = require('aws-sdk')


const secretsPath = path.join(__dirname, 'secrets.json')
AWS.config.loadFromPath(secretsPath);
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})

dynamodbUtils.ddb = ddb
importUtils.dynamodbUtils = dynamodbUtils


const testData = {
    asin: 'TESTBOOK_NOT_REAL_BOOK',  
    date: '12-11-17' ,
    username: 'rhunt',
    status: 'PURCHASED'
}


describe("Test Transactions insert correctly",  () => {
    beforeEach(async (done) => {
        try {
            const deleted = await dynamodbUtils.removeRecord ("BOOK|" + testData.asin, "PERSON|" + testData.username )
            console.log("deleted", deleted)
        } catch(error) {
            console.error(error)
        }
        done()
    })


    it ("Insert a new purchase, tally purchases", async (done) => {
        try {        
            const doesExist = await dynamodbUtils.getRecord ("BOOK|" + testData.asin, "PERSON|" + testData.username ) 
            expect(doesExist.PKhash).not.toBeDefined()

            const testTransaction = await importUtils.convertToTransaction(testData)
            expect(testTransaction.title).toBe('12 Strong: The Declassified True Story of the Horse Soldiers')

            const savedTransaction = await dynamodbUtils.saveRecord(testTransaction.getInsertItem())
            const actualTransaction = await dynamodbUtils.getRecord (testTransaction.PKhash, testTransaction.SKsort )            

            expect(actualTransaction.PKhash).toBe(testTransaction.PKhash)
        } catch(error) {
            console.error(error)
            expect(error).toBeNull()
        }

        done()
    })



})


