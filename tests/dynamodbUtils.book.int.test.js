'use strict'
const path = require('path')
const dynamodbUtils = require('../utils/dynamodbUtils')
const AWS = require('aws-sdk')
const Book = require('../models/book')


const secretsPath = path.join(__dirname, 'secrets.json')
AWS.config.loadFromPath(secretsPath);
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})

dynamodbUtils.ddb = ddb

const testBook = {    
  "summary": "12 Strong is the dramatic account of a small band of Special Forces soldiers who secretly entered Afghanistan following 9/11 and rode to war on horses against the Taliban. Outnumbered 40 to one, they pursued the enemy army across the mountainous Afghanistan terrain and, after a series of intense battles, captured the city of Mazar-i-Sharif. The bone-weary American soldiers were welcomed as liberators as they rode into the city. Then the action took a wholly unexpected turn.",
  "copyright": "©2009 Doug Stanton (P)2011 Simon & Schuster",
  "author": "Doug Stanton",
  "description": "From the New York Times best-selling author of In Harm's Way comes a true-life story of American soldiers overcoming great odds to achieve a stunning military victory....",
  "title": "12 Strong: The Declassified True Story of the Horse Soldiers",
  "title_short": "12 Strong: The Declassified True Story of the Horse Soldiers",
  "info_link": "https://www.audible.com/pd/12-Strong-Audiobook/B004VFQGRQ",
  "duration": "16:40:17",
  "author_link": "https://www.audible.com/author/Doug-Stanton/B001K8EYMG",
  "download_link": "https://cds.audible.com/download/admhelper?user_id=xDtRMJfdlvjX6f6jVcQAV4katpdfbiHnJ_7puXoQ4Sh4CrMSGYmaQyaPZH0J&product_id=BK_SANS_005491&domain=www.audible.com&order_number=D01-3924216-5513863&cust_id=xDtRMJfdlvjX6f6jVcQAV4katpdfbiHnJ_7puXoQ4Sh4CrMSGYmaQyaPZH0J&DownloadType=Now&transfer_player=1&codec=LC_64_22050_Stereo&awtype=AAX&title=12 Strong",
  "filename": "12 Strong The Declassified True Story of the Horse Soldiers",
  "narrated_by": "Jack Garrett",
  "release_date": "07-DEC-2012",
  "product_id": "BK_SANS_005491",
  "publisher": "Simon & Schuster Audio",
  "asin": "TESTBOOK_NOT_REAL_BOOK",
  "purchase_date": "12-26-18"
 }
 const insertBook = new Book ( testBook.asin, testBook.title, testBook.title_short, testBook.publisher, testBook.author, testBook.narrated_by, testBook.copyright, testBook.product_id, testBook.release_date, testBook.info_link, testBook.series_link, testBook.rating_average, testBook.rating_count, testBook.description, testBook.summary)




describe.skip('Test Insert Book to dynamoDB',   () => {
    beforeEach(async (done) => {
        try {
            const deleted = await dynamodbUtils.removeRecord (insertBook.PKhash, insertBook.SKsort )
            console.log(deleted)
        } catch(error) {
            console.error(error)
        }
        done()
    })

    it('validates book record is inserted',  async (done) => {

        try {
            const doesExist = await dynamodbUtils.getRecord (insertBook.PKhash, insertBook.SKsort )
            console.log(doesExist)
            expect(doesExist.PKhash).not.toBeDefined()

            const newBook = await dynamodbUtils.saveRecord(insertBook.getInsertItem())
            // const newTallies = await dynamodbUtils.saveRecord(insertBook.getTallyItem())

            const actualBook = await dynamodbUtils.getRecord (insertBook.PKhash, insertBook.SKsort )
//            console.log( "GET ITEM: ", actualBook)
            expect(actualBook).toBeDefined()
            expect(actualBook.PKhash).toBe(insertBook.PKhash)
            expect(actualBook.SKsort).toBe(insertBook.SKsort)
            expect(actualBook.asin).toBe(testBook.asin)
            expect(actualBook.title).toBe(testBook.title)
            expect(actualBook.publisher).toBe(testBook.publisher)
            expect(actualBook.author).toBe(testBook.author)
            expect(actualBook.narrated_by).toBe(testBook.narrated_by)
            expect(actualBook.copyright).toBe(testBook.copyright)
            expect(actualBook.product_id).toBe(testBook.product_id)
            expect(actualBook.release_date).toBe(testBook.release_date)
            expect(actualBook.audible_url).toBe(testBook.info_link)
            expect(actualBook.audible_series_link).toBe(testBook.series_link)
            expect(actualBook.rating_average).not.toBeDefined()
            expect(actualBook.rating_count).not.toBeDefined()
            expect(actualBook.description).toBe(testBook.description)
            expect(actualBook.summary).toBe(testBook.summary)
        } catch(error) {
            console.error(error)
            expect(error).toBeNull()
        }

        done()
    })
})


















