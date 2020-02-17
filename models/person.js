'use strict'

module.exports = class Person {
    constructor (username, name, email, phone) {
        this.PKhash = 'PERSON|' + username
        this.SKsort = 'NAME|' + name
        this.username = username
        this.name = name
        this.email = email
        this.phone = phone
    }


    getInsertItem () {
        return this
    }

}