'use strict'
const dynamodbUtils = require('../utils/dynamodbUtils')
const TABLE = 'audiobooks-dev'

describe('Test Insert Book to dynamoDB',  () => {
    it('validates book record is inserted',  (done) => {
        const testBook = {asin: 'TESTBOOK_NOT_REAL_BOOK',
                        title: "Book with no name" }
        dynamodbUtils.doesItemExist ('PKhash', testBook.asin, TABLE )

        done()
    })
})