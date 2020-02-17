'use strict'

module.exports = class Transaction {
    constructor (bookAsin, creditId, personUsername, status, dateAsISOString, title, author ) {
        if (bookAsin) {
            //this will either be a bookId or CreditId
            this.PKhash = "BOOK|" + bookAsin 
            this.asin = bookAsin
            this.title =  title
            this.author = author
        } else {
           this.PKhash = "CREDIT|" + creditId 
           this.creditId = creditId
        }

        this.SKsort = "PERSON|" + personUsername   //This will be a Person username
        this.Status = status   
                //GSI2 -> statuses: PURCHASED, LISTENED, WISHLIST, UNUSED, NEXT
        this.username = personUsername
        this.dateRecorded = dateAsISOString
    }

    setPercentCompleted( percentage ) {
        this.percentComplete = percentage
    }

    getInsertItem () {
        return this
    }
}