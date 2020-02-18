'use strict'
const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx');
const AWS = require('aws-sdk')

AWS.config.update({region: 'us-east-1'})
const s3 = new AWS.S3({apiVersion: '2006-03-01'})

const BUCKET = process.env.BUCKET || 'lsft-audiobook-manager-dev'



module.exports.readExcelFromS3Uploads = (filename, keyPrefix) => {
    //grab the xls file from s3
    const bucketFile = keyPrefix ? keyPrefix + "/" + filename
                                : filename
    const params = {
        Bucket : BUCKET,
        Key: bucketFile
    }     
    const s3Stream = s3.getObject(params).createReadStream()


    return new Promise( (resolve, reject) => {
        let data
        const buffers = []
        s3Stream.on('data', (chunk) => {
            buffers.push(chunk)
        })
        s3Stream.on('end', ()  => {
            const buffer = Buffer.concat(buffers);
            const workbook = XLSX.read(buffer, {type:"buffer"});
            console.log ("Found xls file with ", workbook.SheetNames)
            return resolve(workbook);
        })
        s3Stream.on('error', error => {
            console.error( "Error reading file stream", bucketFile)
            reject(error)
        })
    })
    .then ((workbook) => {
        console.log("Found workbook: " ) //, workbook)
        return Promise.resolve(workbook)
    })
    .catch((error) => {
        console.log ("Error reading file ", bucketFile)
        console.error(error)
        return Promise.reject(error)
    })
}



module.exports.upload = (sourcePath, filename, keyPrefix) => {

    const readStream = fs.createReadStream(sourcePath)
    readStream.on('open', () => {
        console.log("reading " , filename)
    })

    const s3File = keyPrefix  + '/' + filename 
    console.log("Write file to bucket: " + s3File)  
       
    const params = {
        Bucket : BUCKET,
        Key: s3File,
        Body: readStream
    }

    return s3.upload(params).promise()        
    .then((data) => {
        console.log("File written (awsutils): " + BUCKET + "/" + s3File)
        console.log(data)  
        return Promise.resolve(data)
    })
    .catch(err => {
        return Promise.reject( err )
    })

}    

