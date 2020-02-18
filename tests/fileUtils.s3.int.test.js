'use strict'
const path = require('path')
const fileUtils = require('../utils/fileUtils')
const AWS = require('aws-sdk')

const BUCKET = 'lsft-audiobook-manager-dev'

const secretsPath = path.join(__dirname, 'secrets.json')
AWS.config.loadFromPath(secretsPath);
const s3 = new AWS.S3({apiVersion: '2006-03-01', region: 'us-east-1'})
fileUtils.s3 = s3




describe ("Test file uploaded", () => {

    it("validates file upload creates file in s3 bucket", async (done) => {
        const filename = 'books.xlsx'
        const sourcePath = path.join(__dirname, '../assets/data', filename )
        const keyPrefix = 'test'
        const fileKey = keyPrefix + '/' + filename

        try {            
            const uploaded = await fileUtils.upload (sourcePath, filename, keyPrefix)
            const doesExist = await fileExists(fileKey)
            expect(doesExist).toBe(true)

        } catch (error) {
            console.error ("error uploading ", sourcePath)
            console.error(error)
            throw error
        }
        done()
    })

    it("validates excel file is read on s3",  async (done) => {
        const filename = 'books.xlsx'
        const keyPrefix = 'test'
        try {
            const workbook = await fileUtils.readExcelFromS3Uploads (filename, keyPrefix)
            expect(workbook.SheetNames).toEqual( [ 'Books', 'People', 'Credits', 'Transactions' ])
        } catch (error) {
            console.error ("error reading file ", filename)
            console.error(error)
            throw error
        }
        done()

    })


})




const fileExists = (fileKey)  => {
   const params = {
        Bucket: BUCKET,
        Key: fileKey
    }

    console.log("Look for file: " + fileKey)
    return s3.headObject(params)
        .promise()
        .then((data) => {
            return Promise.resolve(true)
        })
        .catch((error) => {
            if (error.code === "NotFound") {
                return Promise.resolve(false)
            }
            return Promise.reject(error)
        })
}

