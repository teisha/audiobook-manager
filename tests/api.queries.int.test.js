'use strict'
const path = require('path')
const importUtils = require('../utils/importUtils')
const dynamodbUtils = require('../utils/dynamodbUtils')
const AWS = require('aws-sdk')
dynamodbUtils.AWS = AWS

const secretsPath = path.join(__dirname, 'secrets.json')
AWS.config.loadFromPath(secretsPath);
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})

dynamodbUtils.ddb = ddb
importUtils.dynamodbUtils = dynamodbUtils


describe ("BOOKS", () => {

//worked
    it ("GET /total" , async (done) => {
        const results = await dynamodbUtils.getScanBySortKeyGSI1('TITLE|', true )
        expect(results.Count).toBeGreaterThan(250)

        done()
    }),

//needs additional attribute
    it ("GET /wishlist/total" , async (done) => {
        const results = await dynamodbUtils.getQueryByGSI1WithFilter('TALLIES', 'BOOK|', 'WISHLIST', "0", true)
        expect(results.Count).toBe(37)

        done()
    }),

//worked
    it ("GET '/title/:title'" , async (done) => {
        const sksort = 'TITLE|12 Strong: The Declassified True Story of the Horse Soldiers'
        const results = await dynamodbUtils.getQueryByGSI1(sksort, 'BOOK|TEST')
        expect(results.ItemsJSON[0].asin).toBe('TESTBOOK_NOT_REAL_BOOK')

        done()
    }),


    it ("GET /purchased/:asin" , async (done) => {    
        const pkhash = 'BOOK|TESTBOOK_NOT_REAL_BOOK'
        const results = await dynamodbUtils.getQueryByGSI1 ('TALLIES', pkhash)
console.log("GET /purchased/:asin", pkhash, results)
        expect(results.Items[0].PURCHASED).toBe(40)

        done()
    })
})



describe( "CREDITS ", () => {

    it ("GET '/next/:username" , async (done) => {    
        const username = 'PERSON|mtieu'
        const results = await dynamodbUtils.getQueryByStatus('NEXT', 'CREDIT|', username , false)
        expect(results.ItemsJSON.length).toBeGreaterThan(0)

        done()
    }),


    it ("GET /issued/total/:username'" , async (done) => {   
        const username = 'PERSON|mtieu' 
        const results = await dynamodbUtils.getQueryByStatus('ISSUED', 'CREDIT|', username , true)
      //  console.log ("GET /issued/total/:username'", username, results)
        expect (results.Count).toBeGreaterThan(100)

        done()
    })
})



describe ('PERSON', () => {

    it ("GET /activity/:username'" , async (done) => {   
        const username = 'PERSON|mtieu'  
        const results = await dynamodbUtils.getQueryByGSI1(username)
       // console.log("GET /activity/:username'", username, results.ItemsJSON)
        expect (results.ItemsJSON.filter(item => item.Status === 'PURCHASED').length).toBeGreaterThan(0) 
        expect (results.ItemsJSON.filter(item => item.Status === 'WISHLIST').length).toBeGreaterThan(0) 
        expect (results.ItemsJSON.filter(item => item.Status === 'LISTENED').length).toBeGreaterThan(0) 

        done()
    }),


    it ("GET /purchased/total/:username'" , async (done) => {    
        const username = 'PERSON|mtieu' 
        const purchased = await dynamodbUtils.getQueryByStatus('PURCHASED', 'BOOK|', username )
      //  console.log("GET /purchased/total/:username'", purchased)
        const results = await dynamodbUtils.getQueryByStatus('PURCHASED','BOOK|', username , true)
        expect (results.Count).toBeGreaterThan(0)
        expect(results.Count).toBe(purchased.Count)
        expect (purchased.ItemsJSON.filter(item => item.Status === 'PURCHASED').length).toBe(results.Count)

        done()
    }),


    it ("GET /wishlist/:username'" , async (done) => {    
        const username = 'PERSON|mtieu' 
        const results = await dynamodbUtils.getQueryByStatus('WISHLIST','BOOK|', username , false)
       // console.log("GET /wishlist/:username'", results)
        expect(results.ItemsJSON.length).toBeGreaterThan(0)
        expect (results.ItemsJSON.filter(item => item.Status === 'WISHLIST').length).toBe(results.ItemsJSON.length) 
        done()
    }),


    it ("GET /listening/:username'" , async (done) => {    
        const username = 'PERSON|mtieu' 
        const results = await dynamodbUtils.getQueryByStatus('LISTENED','BOOK|', username , false)
      //  console.log("GET /listening/:username" ,results)
        expect(results.ItemsJSON.length).toBeGreaterThan(0)
        expect (results.ItemsJSON.filter(item => item.Status === 'LISTENED').length).toBe(results.ItemsJSON.length)

        done()
    })
})



