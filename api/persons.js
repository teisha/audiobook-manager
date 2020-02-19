const dynamodbUtils = require('../utils/dynamodbUtils')
/*******************************************************************
 *  Person-focused queries
 *******************************************************************/

// Activity on User Account    - GSI1
// '/activity/:username', 
exports.getAllActivityByUser = async (req, res) => {
    const username = req.params.username
    const pkuser =  'PERSON|' + username
    try {
        const results = await dynamodbUtils.getQueryByGSI1 (pkuser, '')
        if (results.ItemsJSON) {
            return res.status(200).json(results.ItemsJSON)
        } else {
            return res.status(400).json({error: 'Cannot determine transaction history for ' + username})
        } 
    } catch (error) {
        console.log('Error getting transaction history for: ' + username )
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}

//What books do we own?:   GSI2 - purchased
// '/purchased/total/:username',
exports.getTotalPurchasedByUser =  async (req, res) => {
    const username = req.params.username
    const pkuser =  'PERSON|' + username
    try {
        const results = await dynamodbUtils.getQueryByStatus('PURCHASED','BOOK|', username , true)
        if (results.Count) {
            return res.status(200).json({message: `User ${username} has purchased ${results.Count} audiobooks.`})
        } else {
            return res.status(400).json({error: 'Cannot determine book count for ' + username})
        } 
    } catch (error) {
        console.log("Error getting purchased totals for ", username)
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}

// What book does ?person? want to buy?  GSI2 - PERSON_WISHLIST
// '/wishlist/:username',
exports.getUserWishlist =  async (req, res) => {
    const username = req.params.username
    const pkuser =  'PERSON|' + username
    try {
        const results = await dynamodbUtils.getQueryByStatus('WISHLIST','BOOK|', username , false)
        if (results.ItemsJSON) {
            return res.status(200).json(results.ItemsJSON)
        } else {
            return res.status(400).json({error: 'Cannot determine wishlist for ' + username})
        } 
    } catch (error) {
        console.log('Error getting wishlist for: ' + username )
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}


//What books are ?person? reading? - GSI2 - PERSON_READING
// '/listening/:username', 
exports.getUserListened = async (req, res) => {
    const username = req.params.username
    const pkuser =  'PERSON|' + username
    try {
        const results = await dynamodbUtils.getQueryByStatus('LISTENED','BOOK|', username , false)
        if (results.ItemsJSON) {
            return res.status(200).json(results.ItemsJSON)
        } else {
            return res.status(400).json({error: 'Cannot determine the books ' + username + ' has listened to'})
        } 
    } catch (error) {
        console.log('Error getting list of books ' + username + ' has listened to.')
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}


