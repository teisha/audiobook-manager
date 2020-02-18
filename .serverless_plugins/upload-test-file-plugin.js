'use strict';
const fs = require('fs')
const AWS = require('aws-sdk')

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      uploadExcelFile: {
        usage: 'This will upload a prewritten Excel file into the S3 bucket. The command expects two custom variables to exist in your serverless.yml: "bucket" and "uploadDirectory".  Those define the bucket and the key prefix for the file being uploaded.',
        lifecycleEvents: ['uploadData'],
        options: {
          "filePath": {
            usage: 'This is the local excel file that will be loaded' ,
            required: true,
            shortcut: 'xlFile',
          },
        },
      },
    };

    this.hooks = {
      'uploadExcelFile:uploadData': uploadData.bind(null, serverless, options)
    };
  }
}


const getS3 = (serverless) => {
    AWS.config.update({
      region: serverless.service.provider.region,
      apiVersions: {
        s3 : '2006-03-01'
      }
    });
    return AWS.S3()
} 
 
const uploadData = (serverless, options)  =>  {
    const bucketName = serverless.service.custom.bucket
    const keyPrefix = serverless.service.custom.uploadDirectory
    const sourcePath = options.filePath 
    const filename  = sourcePath.substring(sourcePath.lastIndexOf('/')+1)
    const extension = fileName.split('.').pop()

    if (!extension.startsWith('xls')) {
        serverless.cli.log("ERROR UPLOADING FILE: Incorrect format.")
        serverless.cli.log("Only upload Excel files into your upload directory!")
        return
    }

    const readStream = fs.createReadStream(sourcePath)
    readStream.on('open', () => {
        serverless.cli.log("reading " , filename)
    })
    readStream.on('error', (err) => {
        serverless.cli.log("ERROR reading file ", sourcePath)
        serverless.cli.log(err)
    })
    readStream.on('close', () => {
        serverless.cli.log("Finished reading " , filename)
    })    

    const s3File = keyPrefix  + '/' + filename 
    serverless.cli.log("Write file to bucket: " + s3File)  
       
    const params = {
        Bucket : bucketName,
        Key: s3File,
        Body: readStream
    }

    return getS3().upload(params).promise()        
    .then((data) => {
        serverless.cli.log("File written (awsutils): " + bucketName + "/" + s3File)
        serverless.cli.log(data)  
        return Promise.resolve(data)
    })
    .catch(err => {
        serverless.cli.log("ERROR writing file to bucket!")
        serverless.cli.log(err)
        return Promise.reject( err )
    })

}  


module.exports = ServerlessPlugin;
