'use-strict'

const AWS = require('aws-sdk')

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
    const dynamoItem = AWS.DynamoDB.Converter.marshall(item)
     // console.log("Add", dynamoItem)
    const params = {
        TableName : BOOK_TABLE,
        Item:  dynamoItem
    }

    return ddb.putItem(params)
        .promise()
        .then( (data) => {
            console.log(data)
            return Promise.resolve(data)
        })
        .catch( (err) => {
                console.log("Error adding '", pkhash, "'' to '",  BOOK_TABLE + "'")
                console.error(bookItem)
                console.error(err)
                return Promise.reject(err)
        })
     
}

/***************************************
 *  Get One Or More Records by PK/partial SK
 ****************************************/
module.exports.getQueryByPK = (pkhash, secondaryStartsWith) =>  {
    const params = {
        TableName : BOOK_TABLE,
        KeyConditionExpression: "#PKhash = :keyValue AND begins_with(#SKsort, :sortValue)",
        ExpressionAttributeNames:{
            '#PKhash': 'PKhash',
            '#SKsort': 'SKsort'
        },
        ExpressionAttributeValues: {
            ':keyValue': {S: pkhash},
            ':sortValue' : {S: secondaryStartsWith}
        },
        ProjectionExpression: "PKhash, SKsort, asin, title, author"
    }

    return ddb.query(params)
        .promise()
        .then( (data) => {
            if (data.Count > 0) {
                data.ItemsJSON = data.Items.map(item => {
                    return AWS.DynamoDB.Converter.unmarshall(item)
                })
            }
            console.log(data)
            return Promise.resolve(data)
        })
        .catch( (err) => {
                console.log("Error querying '", pkhash, "'' on '",  BOOK_TABLE + "'")
                console.error(err)
                return Promise.reject(err)
        })        

}



// insert a transaction needs to also update a total
module.exports.insertTransaction = async (item) => {
    const status = item.status
    const record = await saveRecord(item)
}


//Use conditional expression for update to be sure no updates get thrown out

    //  for query??
      // const params = {
      //   'Key': ddt.wrap({ topicArn }),
      //   'ExpressionAttributeValues': ddt.wrap({
      //     ':one': 1,
      //     ':aggregator': aggregator
      //   }),
      //   'ConditionExpression': 'size(aggregators) = :one AND contains(aggregators, :aggregator)',
      //   'TableName': SUBSCRIPTIONS_TABLE,
      //   'ReturnValues': 'ALL_OLD'
      // }




