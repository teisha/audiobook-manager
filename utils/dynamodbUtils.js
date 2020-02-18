'use-strict'
const AWSXRay = require('aws-xray-sdk');
let AWS
if (require('os').platform() === 'win32') {
    //for testing locally
    AWS = require('aws-sdk')
} else {
    AWS = AWSXRay.captureAWS(require('aws-sdk'))
}


AWS.config.update({region: 'us-east-1'})
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

const BOOK_TABLE = process.env.BOOK_TABLE ||  'audiobooks-dev'



/***************************************
 *  Get Single Record By PK/SK
 ****************************************/
module.exports.getRecord = (keyValue, sortValue) => {
    console.log("Look for : ", keyValue, sortValue)
    const params = {
        TableName:  BOOK_TABLE,
        Key: {
            'PKhash'  : {S:  keyValue},
            'SKsort'  : {S: sortValue }
        }
        // ProjectionExpression: 'KEYS_ONLY'
    }

    return ddb.getItem(params)
        .promise()
        .then( (data) => {
            // console.log("Promise Data::: ", data)
            if (data.Item) {
                return AWS.DynamoDB.Converter.unmarshall(data.Item)
            } else {
                return Promise.resolve(data)
            }
        })
        .catch(error => {
            console.log("Error getting ", keyValue, " from ", BOOK_TABLE)
            console.error(error)
            return Promise.reject(error)
        })
}

/***************************************
 *  Remove Single Record by PK/SK
 ****************************************/
module.exports.removeRecord = (pkhash, skshort ) => {
    const params = {
        TableName: BOOK_TABLE,
        Key: {
            'PKhash'  : {S: pkhash},
            'SKsort'  : {S: skshort }
        }
    }

    return ddb.deleteItem(params)
        .promise()
        .then((data) => {
            console.log("ITEM DELETED: " , pkhash, skshort)
            return Promise.resolve(data)
        })
        .catch(error => {
            console.log("Error deleting ", pkhash, "/",skshort, " from ", BOOK_TABLE)
            console.error(error)
            return Promise.reject(error)
        }) 
}


/***************************************
 *  Save Single Record by PK/SK
 ****************************************/
module.exports.saveRecord = (item) => {
    return save(item)
     
}

const save = (item) => {
    const dynamoItem = AWS.DynamoDB.Converter.marshall(item)
     // console.log("Add", dynamoItem)
    const params = {
        TableName : BOOK_TABLE,
        Item:  dynamoItem
    }

    return ddb.putItem(params)
        .promise()
        .then( (data) => {
//            console.log(data)
            return Promise.resolve(data)
        })
        .catch( (err) => {
                console.log("Error adding ", item, " to ",  BOOK_TABLE)
                console.error(err)
                return Promise.reject(err)
        })
     
}

/*************************************************
 * Insert a transactional event with statistic update
 ************************************************/
module.exports.insertTransaction = async (item) => {
    const status = item.Status
    const updateParams = {
        TableName: BOOK_TABLE,
        Key: {
            'PKhash' : {S: item.PKhash},
            'SKsort': {S: 'TALLIES'}
        },
        ReturnValues: "UPDATED_NEW",
        ReturnConsumedCapacity: 'TOTAL',
        UpdateExpression: "SET #stat = #stat + :inc",
        ExpressionAttributeNames: {
            '#stat': status
        },
        ExpressionAttributeValues: {
            ':inc': {N: '1'}
        }
    }
    try {
        const record = await save(item)
        return ddb.updateItem(updateParams)
        .promise()
        .then( (data) => {
            console.log(data)
            if (data.Attributes) {
                return AWS.DynamoDB.Converter.unmarshall(data.Attributes)
            } 
            return Promise.resolve(data)
        })
        .catch( (err) => {
                console.log("Error updating '", status, "'' on '",  item.PKhash + "'")
                console.error(err)
                return Promise.reject(err)
        })        
    } catch (error) {
        console.error("Could not save and update stats for ", item)
        return Promise.reject(error)
    }

}








/*******************************************
 *  USING SCAN:
**********************************************/
const issueScan =  (params) => {
    return ddb.scan(params)
    .promise()
    .then( (data) => {
        if (data.Count > 0 && data.Items) {
            data.ItemsJSON = data.Items.map(item => {
                return AWS.DynamoDB.Converter.unmarshall(item)
            })
            console.log(data.ItemsJSON)
        }

// If there are more items than the query returned, 
// this would set "ExclusiveStartKey" on params
// with the value of data.LastEvaluatedKey
// and issueQuery called again with new params.
// But these datasets won't be large enough to hit the limits        
        return Promise.resolve(data)
    })
    .catch( (err) => {
            console.log("Error querying ", params)
            console.error(err)
            return Promise.reject(err)
    })  
}

/*******************************************
 *  USING QUERIES:
**********************************************/
const issueQuery =  (params) => {
    return ddb.query(params)
    .promise()
    .then( (data) => {
        if (data.Count > 0 && data.Items) {
            data.ItemsJSON = data.Items.map(item => {
                return AWS.DynamoDB.Converter.unmarshall(item)
            })
            console.log(data.ItemsJSON.PKHash)
        }

// If there are more items than the query returned, 
// this would set "ExclusiveStartKey" on params
// with the value of data.LastEvaluatedKey
// and issueQuery called again with new params.
// But these datasets won't be large enough to hit the limits        
        return Promise.resolve(data)
    })
    .catch( (err) => {
            console.log("Error querying ", params)
            console.error(err)
            return Promise.reject(err)
    })  
}

/***************************************
 *  Get One Or More Records by PK/partial SK
 ****************************************/
module.exports.getQueryByPK = (pkhash, secondaryStartsWith, getTotal = false) =>  {
    console.log ("Get Query By PK: " + pkhash)
    const params = {
        TableName : BOOK_TABLE,
        KeyConditionExpression: "#PKhash = :keyValue AND begins_with(#SKsort, :sortValue)",
        ExpressionAttributeNames:{
            '#PKhash': 'PKhash',
            '#SKsort': 'SKsort',
            '#status': 'Status'
        },
        ExpressionAttributeValues: {
            ':keyValue': {S: pkhash},
            ':sortValue' : {S: secondaryStartsWith}
        }
        
    }
    if (getTotal) {
        params.Select = 'COUNT'
    } else {
        params.ProjectionExpression = "PKhash, SKsort, #status, asin, title, author"
    }
    return issueQuery(params)
      
}

/***************************************
 *  Query By GSI1, Records by SK/partial PK
 ****************************************/
module.exports.getQueryByGSI1 = (sksort, secondaryStartsWith, getTotal = false) =>  {
    console.log ("Get Query By PK: " + sksort)
    const params = {
        TableName : BOOK_TABLE,
         IndexName : 'GSI1'   //,
        // KeyConditionExpression: "#SKsort = :keyValue AND begins_with(#PKhash, :sortValue)",
        // ExpressionAttributeNames:{
        //     '#PKhash': 'PKhash',
        //     '#SKsort': 'SKsort'
        // },
        // ExpressionAttributeValues: {
        //     ':keyValue': {S: sksort},
        //     ':sortValue' : {S: secondaryStartsWith}
        }


    if (secondaryStartsWith) {
        params.KeyConditionExpression = "#SKsort = :keyValue AND begins_with(#PKhash, :sortValue)"
        params.ExpressionAttributeNames = {
            '#PKhash': 'PKhash',
            '#SKsort': 'SKsort',
            '#status': 'Status'
        }
        params.ExpressionAttributeValues = {
            ':keyValue': {S: sksort},
            ':sortValue' : {S: secondaryStartsWith}
        }
    } else {
        params.KeyConditionExpression = "#SKsort = :keyValue",
        params.ExpressionAttributeNames = {
            '#SKsort': 'SKsort',
            '#status': 'Status'
        },
        params.ExpressionAttributeValues = {
            ':keyValue': {S: sksort},
        }
    }        
        
    if (getTotal) {
        params.Select = 'COUNT'
    } else {
        params.ProjectionExpression = "PKhash, SKsort, #status, asin, title, author"
    }
    return issueQuery(params)
      
}

module.exports.getQueryByGSI1WithFilter = (sksort, secondaryStartsWith, filterField, filterValue, getTotal = false) =>  {
    console.log ("Get Query By PK: " + sksort)
    const params = {
        TableName : BOOK_TABLE,
        IndexName : 'GSI1',
        KeyConditionExpression: "#SKsort = :keyValue AND begins_with(#PKhash, :sortValue)",
        FilterExpression: "#filterField > :filterVal",
        ExpressionAttributeNames:{
            '#PKhash': 'PKhash',
            '#SKsort': 'SKsort',
            '#filterField' : filterField
        },
        ExpressionAttributeValues: {
            ':keyValue': {S: sksort},
            ':sortValue' : {S: secondaryStartsWith},
            ':filterVal': {N: filterValue}
        }
        
    }
    if (getTotal) {
        params.Select = 'COUNT'
    } else {
        params.ProjectionExpression = "PKhash, SKsort, asin, title, author"
    }
    return issueQuery(params)
      
}


module.exports.getScanBySortKeyGSI1 = (sksort,  getTotal = false) =>  {
    console.log ("Get Query By PK: " + sksort)
    const params = {
        TableName : BOOK_TABLE,
        IndexName : 'GSI1',
        FilterExpression: "begins_with(#SKsort, :keyValue)",
        ExpressionAttributeNames:{
            '#SKsort': 'SKsort'
        },
        ExpressionAttributeValues: {
            ':keyValue': {S: sksort},
        }
        
    }
    if (getTotal) {
        params.Select = 'COUNT'
    } else {
        params.ProjectionExpression = "PKhash, SKsort, asin, title, author"
    }
    return issueScan(params)
      
}

/***************************************************
 * Query by GSI2 (Status)
 ******************************************************/
module.exports.getQueryByStatus = (status, pkbeginsWith , skBeginsWith, getTotal = false) => {
    console.log ("Get Query By Status: " + status)
    const params = {
        TableName: BOOK_TABLE,
        IndexName: 'GSI2'
    }

    if (pkbeginsWith) {
        params.KeyConditionExpression = "#statusField = :statusValue AND begins_with(#PKhash, :secondParam) "
        if(skBeginsWith) {
            params.FilterExpression = "begins_with(#SKsort, :thirdParam)"
            params.ExpressionAttributeNames = {
                '#statusField': 'Status',
                '#PKhash' : 'PKhash',
                '#SKsort' : 'SKsort'
            }
            params.ExpressionAttributeValues = {
                ':statusValue' : {S: status},
                ':secondParam' : {S: pkbeginsWith},
                ':thirdParam' : {S: skBeginsWith}
            }
        } else {
            params.ExpressionAttributeNames = {
                '#statusField': 'Status',
                '#PKhash' : 'PKhash'
            }
            params.ExpressionAttributeValues = {
                ':statusValue' : {S: status},
                ':secondParam' : {S: pkbeginsWith}
            }
        }
    } else {
        params.KeyConditionExpression = "#statusField = :statusValue",
        params.ExpressionAttributeNames = {
            '#statusField': 'Status'
        },
        params.ExpressionAttributeValues = {
            ':statusValue' : {S: status}
        }
    }
    if (getTotal) {
        params.Select = 'COUNT'
    }
    return issueQuery(params)
}


