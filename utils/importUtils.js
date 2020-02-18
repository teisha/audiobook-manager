'use strict'
const Transaction = require('../models/transaction')


module.exports.convertToTransaction = async ( data, dynamodbUtils ) => {
    let transaction
    const dateParts = data.date.split('-')
    const dateString = new Date("20" + dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1]).toISOString()

    if (data.asin) {
        let bookInfo = {}
        try {
            const queryResults = await dynamodbUtils.getQueryByPK ("BOOK|" + data.asin, "TITLE|")
            if (queryResults.ItemsJSON && queryResults.ItemsJSON.length > 0) {
                bookInfo = queryResults.ItemsJSON[0]
            }
        } catch (error) {
            console.error("Couldn't retrieve book ", data.asin)
            console.error(error)
        }

        transaction = new Transaction(data.asin, null, data.username, data.status, dateString, bookInfo.title, bookInfo.author )
    }
    return transaction
}