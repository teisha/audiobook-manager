const serverless = require('serverless-http');
const bodyParser = require('body-parser')
const express = require('express')
const dynamodbUtils = require('../utils/dynamodbUtils')

const app = express()
app.use(bodyParser.json({strict: false}))

const booksApi = require('./books')
const creditsApi = require('./credits')
const personsApi = require('./persons')



app.get( '/books/total', booksApi.getTotal )
app.get( '/books/wishlist/total', booksApi.getWishlistTotal )
app.get( '/books/purchased/:asin', booksApi.getPurchasedByAsin  )
app.get( '/books/title/:title',  booksApi.getBookByTitle )

app.get('/credits/next/:username', creditsApi.getNextCreditByUser )
app.get('/credits/issued/total/:username', creditsApi.getTotalIssuedCreditsByUser )

app.get('/person/activity/:username', personsApi.getAllActivityByUser)
app.get('/person/purchased/total/:username',personsApi.getTotalPurchasedByUser)
app.get('/person/wishlist/:username',personsApi.getUserWishlist)
app.get('/person/listening/:username', personsApi.getUserListened)



app.use ('/', (req, res) => {
    return res.status(404).json({error: 'Request not found.'})
})


module.exports.handler = serverless(app);