'use strict'

const XLSX = require('xlsx');
const fileUtils = require('../utils/fileUtils')
const dynamodbUtils = require('../utils/dynamodbUtils')
const importUtils = require('../utils/importUtils')
const Book = require('../models/book')
const Person = require('../models/person')
const Credit = require('../models/credit')
const Transaction = require('../models/transaction')

// This will be called when xls files are uploaded to the S3 bucket
// It should expect XLSX file with expected tab names and headers
// It will convert the fields into objects and load them to DynamoDB

module.exports.insert = (event) => {
    console.log(event)

    const uploadPromises = []
    const files = []

    if (event.Records && event.Records.length > 0) {
        event.Records.forEach(eventRec => {
            console.log("Processing: " + eventRec.eventName + " from " + eventRec.eventTime )
            console.log("Lucky Bucket: " + eventRec.s3.bucket.name)
            const filename = eventRec.s3.object.key
            files.push(filename)
            console.log("Uploaded File: " + filename)
            uploadPromises.push(readFileAndSaveToDynamodb(filename))
        })
    }

    return Promise.all(uploadPromises)
    .then((uploads) => {
        console.log(uploads)
    })
    .catch( (error) => {
        console.error("Could not process files!!! ", files )
        console.error(error)
    })
    /*
    {  
   "Records":[  
      {  
         "eventVersion":"2.1",
         "eventSource":"aws:s3",
         "awsRegion":"us-west-2",
         "eventTime":"1970-01-01T00:00:00.000Z",
         "eventName":"ObjectCreated:Put",
         "userIdentity":{  
            "principalId":"AIDAJDPLRKLG7UEXAMPLE"
         },
         "requestParameters":{  
            "sourceIPAddress":"127.0.0.1"
         },
         "responseElements":{  
            "x-amz-request-id":"C3D13FE58DE4C810",
            "x-amz-id-2":"FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD"
         },
         "s3":{  
            "s3SchemaVersion":"1.0",
            "configurationId":"testConfigRule",
            "bucket":{  
               "name":"mybucket",
               "ownerIdentity":{  
                  "principalId":"A3NL1KOZZKExample"
               },
               "arn":"arn:aws:s3:::mybucket"
            },
            "object":{  
               "key":"HappyFace.jpg",
               "size":1024,
               "eTag":"d41d8cd98f00b204e9800998ecf8427e",
               "versionId":"096fKKXTRTtl3on89fVO.nfljtsv6qko",
               "sequencer":"0055AED6DCD90281E5"
            }
         }
      }
   ]
}
    */
}

module.exports.uploadWithoutEvent = (filename) => {
    return readFileAndSaveToDynamodb(filename)
}

const readFileAndSaveToDynamodb = (filename) => {
    return fileUtils.readExcelFromS3Uploads (filename)
    .then( (workbook) => {
        const insertPromises = []
        // Books =>  array of JSON to convert to Book
console.log(workbook.SheetNames)     
        // if (workbook.Sheets['Books']) {
        //     const bookJSON = XLSX.utils.sheet_to_json(workbook.Sheets['Books'])
        //     bookJSON.map(book => {
        //         return new Book (book.asin, book.title, book.title_short, book.publisher, book.author, book.narrated_by, book.copyright, book.product_id, book.release_date, book.audible_url, book.audible_series_link, book.rating_average, book.rating_count, book.description, book.summary)
        //     })
        //     .forEach(bookObj => {
        //         insertPromises.push( 
        //             dynamodbUtils.saveRecord(bookObj.getInsertItem() )
        //             .then((recordSaved) => {
        //                 console.log("book saved", bookObj.PKhash, recordSaved)
        //                 return dynamodbUtils.saveRecord(bookObj.getTallyItem())
        //             })
        //             .then((tallySaved) => {
        //                 console.log ("Tally saved", bookObj.PKhash, tallySaved)
        //                 return Promise.resolve(bookObj.PKhash)
        //             })
        //             .catch((error) => {
        //                 console.log("Error saving tally!", bookObj.PKhash, bookObj.SKsort)
        //                 console.error(error)
        //                 return Promise.resolve("ERROR|" + error.code + "(" + error.statusCode + "), Book: " + bookObj.PKhash + " " + bookObj.SKsort + " :" + error.message)
        //             })
        //         )
        //     })            
        // }
        //People =>
        if (workbook.Sheets['People']) {
            const peopleJSON = XLSX.utils.sheet_to_json(workbook.Sheets['People'])           
            peopleJSON.map(person => {
                return new Person (person.username, person.name, person.email, person.phone)
            })
            .forEach(personObj => {
                insertPromises.push( 
                    dynamodbUtils.saveRecord(personObj.getInsertItem() )
                    .then((personSaved) => {
                        console.log ("Person saved", personObj.PKhash)
                        return Promise.resolve(personObj.PKhash)
                    })
                    .catch((error) => {
                        console.log("Error saving person!", personObj.PKhash, personObj.SKsort)
                        console.error(error)
                        return Promise.resolve("ERROR|" + error.code + "(" + error.statusCode + "), Person: " + personObj.PKhash + " :" + error.message)
                    })
                )
            })            
        }

        // Credits =>
        if (workbook.Sheets['Credits']) {
            const creditJSON = XLSX.utils.sheet_to_json(workbook.Sheets['Credits'])
            creditJSON.map(credit => {
                return new Credit (credit.person, credit.status, credit.dateIssued)
            })
            .forEach(creditObj => {
                insertPromises.push(
                    dynamodbUtils.saveRecord(creditObj.getInsertItem() )
                    .then((creditSaved) => {
                        console.log ("Credit saved", creditSaved)
                        return Promise.resolve(creditObj.PKhash)
                    })
                    .catch((error) => {
                        console.log("Error saving credit!", creditObj.PKhash, creditObj.SKsort)
                        console.error(error)
                        return Promise.resolve("ERROR|" + error.code + "(" + error.statusCode + "), Credit: " + JSON.stringify(creditObj) + " :" + error.message)
                    })
                )
            })            
        }

        // Transactions =>
        if (workbook.Sheets['Transactions']) {
            const transactionJSON = XLSX.utils.sheet_to_json(workbook.Sheets['Transactions'])
            transactionJSON.forEach(transaction => {
                insertPromises.push(
                    importUtils.convertToTransaction(transaction, dynamodbUtils)
                    .then((transactionObj) => {
                        return dynamodbUtils.insertTransaction(transactionObj.getInsertItem()) 
                    })
                    .then((transactionSaved) => {
                        console.log ("Transaction saved", transactionSaved)
                        return Promise.resolve(transaction)
                    })
                    .catch((error) => {
                        console.log("Error saving transaction!", transaction)
                        console.error(error)
                        return Promise.resolve("ERROR|" + error.code + "(" + error.statusCode + "), Transaction: " + JSON.stringify(transaction) + " :" + error.message )
                    })
                )
            })            
        }


        return Promise.all(insertPromises)

    })
    .then ((insertedStatuses) => {
        console.log(insertedStatuses.filter(result => result.startsWith('ERROR')  ))
        return Promise.resolve(insertedStatuses)
    })
    .catch((error) => {
        console.log("Error saving Excel file to dynamodb!", filename)
        console.error(error)
        return Promise.reject(error)
    })  

}