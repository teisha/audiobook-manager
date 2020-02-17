'use strict'

module.exports = class Book {
    constructor (asin, title, title_short, publisher, author, narrated_by, copyright, product_id, release_date, audible_url, audible_series_link, rating_average, rating_count, description, summary) {
        this.PKhash = "BOOK|" + asin
        this.SKsort = "TITLE|" + title
        this.bookData = {}
        this.bookData.asin = asin
        this.bookData.title = title
        this.bookData.title_short = title_short
        this.bookData.publisher = publisher
        this.bookData.author = author
        this.bookData.narrated_by = narrated_by
        this.bookData.copyright = copyright
        this.bookData.product_id = product_id
        this.bookData.release_date = release_date
        this.bookData.audible_url = audible_url
        this.bookData.audible_series_link = audible_series_link
        this.bookData.rating_average = rating_average
        this.bookData.rating_count = rating_count
        this.bookData.description = description
        this.bookData.summary = summary
    }

    getInsertItem() {
        const bookItem = {}
        bookItem.PKhash = this.PKhash
        bookItem.SKsort = this.SKsort
        Object.getOwnPropertyNames(this.bookData).forEach( name => {
            if (this.bookData[name]) {
                bookItem[name] = this.bookData[name]
            }
        })

        return bookItem
    }

}