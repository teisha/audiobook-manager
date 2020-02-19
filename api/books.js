const dynamodbUtils = require('../utils/dynamodbUtils')
/*******************************************************************
 *  Book-focused queries
 *******************************************************************/

// How many books are available
//  /total'
exports.getTotal = async (req, res) => {
    try {
        const results = await dynamodbUtils.getScanBySortKeyGSI1('TITLE|', true )
        if (results.Count) {
            return res.status(200).json({message: `There are ${results.Count} audiobooks available.`})
        } else {
            return res.status(400).json({error: 'Cannot determine total audiobooks'})
        } 
    } catch (error) {
        console.log('Error getting total book count' )
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}

// How many books are currently on wishlists to?  GSI1 -  TALLIES, filter 
// /wishlist/total',
exports.getWishlistTotal = async (req, res) => {
    try {
        const results = await dynamodbUtils.getQueryByGSI1WithFilter('TALLIES', 'BOOK|', 'WISHLIST', "0", true)
        if (results.Count) {
            return res.status(200).json({message: `There are ${results.Count} audiobooks on wishlists.`})
        } else {
            return res.status(400).json({error: 'Cannot determine total audiobooks on wishlists'})
        } 
    } catch (error) {
        console.log('Error getting total books on wishlists' )
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}


// Get me information for a title
// /title/:title', 
exports.getBookByTitle = async (req, res) => {
    const title = req.params.title
    const sksort =  'TITLE|' + title
    try {
        const results = await dynamodbUtils.getQueryByGSI1(sksort, 'BOOK|')
        if (results.ItemsJSON && results.ItemsJSON.length > 0) {
            return res.status(200).json(results.ItemsJSON[0])
        } else {
            return res.status(400).json({error: 'Cannot get information for ' + title})
        } 
    } catch (error) {
        console.log('Error getting book details for ' + title )
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}

// How many times has Book been purchased
// /purchased/:asin', 
exports.getPurchasedByAsin = async (req, res) => {
    const asin = req.params.asin
    const pkhash =  'BOOK|' + asin
    try {
        const results = await dynamodbUtils.getQueryByGSI1('TALLIES', pkhash)
        if (results.ItemsJSON && results.ItemsJSON.length > 0) {
            const purchased = results.ItemsJSON[0].PURCHASED
            return res.status(200).json({message: `${asin} has been purchased ${purchased} times`})
        } else {
            return res.status(400).json({error: 'Cannot get information for ' + title})
        } 
    } catch (error) {
        console.log('Error getting book details for ' + title )
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}
