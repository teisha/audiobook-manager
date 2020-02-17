'use strict'
const crypto = require("crypto");


module.exports = class Credit {
    constructor (username, status, dateIssued) {
        this.PKhash = "CREDIT|" + crypto.randomBytes(12).toString('hex')
        this.SKsort = 'PERSON|' + username
        this.username = username
        this.Status = status
        this.dateRecorded = new Date(dateIssued).toISOString
    }

    getInsertItem () {
        return this
    }

}