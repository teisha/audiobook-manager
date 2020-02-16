'use-strict'

var AWS = require('aws-sdk')

AWS.config.update({region: 'us-east-1'})
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'})


module.exports.doesItemExist = (keyName, keyValue, tableName) => {
    const params = {
        TableName: tableName,
        Key: {
            keyName : {S: keyValue}
        },
        ProjectionExpression: 'PKhash'
    }

    ddb.getItem(params, function(err, data) {
        if (err) {
            console.log("Error getting ", keyName, " from ", tableName)
            console.error(err)
        } else {
            console.log("This is what happened: " )
            console.log(data)
        }
    })

}

