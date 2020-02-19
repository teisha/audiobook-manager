/*******************************************************************
 *  Credit-focused queries
 *******************************************************************/
// When is ?person? next credit coming? GS2- PERSON_NEXT
// /next/:username', 
exports.getNextCreditByUser = (req, res) => {
    const username = req.params.username
    const pkuser =  'PERSON|' + username
    try {
        const results = await dynamodbUtils.getQueryByStatus('NEXT', 'CREDIT|', username , false)
        if (results.ItemsJSON) {
            return res.status(200).json(results.ItemsJSON)
        } else {
            return res.status(400).json({error: 'Cannot determine the upoming credits for ' + username})
        } 
    } catch (error) {
        console.log('Error getting credits for ' + username)
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}


// How many unused credits for person?
// '/issued/total/:username', 
exports.getTotalIssuedCreditsByUser = (req, res) => {
    const username = req.params.username
    const pkuser =  'PERSON|' + username
    try {
        const results = await dynamodbUtils.getQueryByStatus('ISSUED', 'CREDIT|', username , true)
        if (results.Count) {
            return res.status(200).json({message: `${username} has ${results.Count} credits available`})
        } else {
            return res.status(400).json({error: 'Cannot determine the usused credit total for ' + username})
        } 
    } catch (error) {
        console.log('Error getting credits for ' + username)
        console.error(error)
        return res.status(400).json({error: 'An error occurred.  Please try again.'})
    }
}


