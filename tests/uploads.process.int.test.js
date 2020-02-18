'use strict'
const path = require('path')
const processor = require('../uploads/process')
const fileUtils = require('../utils/fileUtils')
const dynamodbUtils = require ('../utils/dynamodbUtils')
const AWS = require('aws-sdk')

const BUCKET = 'lsft-audiobook-manager-dev'

const secretsPath = path.join(__dirname, 'secrets.json')
AWS.config.loadFromPath(secretsPath);
const s3 = new AWS.S3({apiVersion: '2006-03-01', region: 'us-east-1'})
fileUtils.s3 = s3
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})
dynamodbUtils.ddb = ddb



jest.setTimeout(60000);
describe ("Uploaded files go to database", () => {
    it ("takes file on s3 and loads to table", async () => {
        const testFile = 'test/books.xlsx'
        try {
            const outcome = await processor.uploadWithoutEvent (testFile)
            const bookTotals = await dynamodbUtils.getScanBySortKeyGSI1('TITLE|', true )
            const tallyTotals = await dynamodbUtils.getScanBySortKeyGSI1('TALLIES', true )
            const peopleTotals = await dynamodbUtils.getScanBySortKeyGSI1('NAME|', true)
    //595 records
            expect(peopleTotals.Count).toBe(8)
            expect(bookTotals.Count).toBeGreaterThan(595)
        } catch (error) {
            console.error ("error in upload process ", testFile)
            console.error(error)
            throw error
        }


        done()
    })

})