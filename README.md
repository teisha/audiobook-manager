# audiobook-manager

This is a fictional application built for a job application, grabbing usernames gathered through a random name generator.
It's got no security on the API calls, because it's just a demo.

# Deploy 

This is a serverless deploy using the configuration in the serverless.yml file in the main project directory.
It will create a NodeJS version 12.x application in AWS, creating Lamdba functions, a DynamoDB table, and an S3 Bucket.

The objects this file creates are:

- a table named "audiobooks-dev" (deploying in the dev environment) 
- a one-time call to create an S3 bucket (lsft-audiobook-manager-dev).  The creation of the bucket is commented out after the first deploy. 
- routes all HTTP get calls to /books url to the books.js handler in the api directory 
- routes all HTTP get calls to /credits url to the credits.js handler in the api directory 
- routes all HTTP get calls to /person url to the persons.js handler in the api directory 
- routes all other HTTP to the api/404.js handler 
- an event tied to the S3 bucket that will call a lambda function whenever a .XSLX file is created

### Plugins
The files for custom plugins are found in .serverless_plugins directory.
The plugin for this project is called "uploadExcelFile".
The plugin will take an Excel filename and upload that into the bucket and directory specified as custom variables in the serverless.yml file.
Usage is: \

    `serverless uploadExcelFile -xlFile "./assets/data/books.xlsx"`


# Project Structure

The following directories contain project code and supporting object:

### api directory
    These are the apis made available by the HTTP functions defined in serverless.yml

### utils directory
    These are modules that contain the worker functions to access S3 and dynamoDB.
    ImportUtils contains a method to convert data read from Excel into a Transaction object.

### models directory
    This directory contains a javascript file for each class defining the entities that drive the application.
    Each class knows it's data structure and how to format the data to be inserted into DynamoDB.

### uploader directory
    This directory contains the code for processing the event called when an Excel file is put into the S3 bucket, which will save that data into the DynamoDB table

### assets directory
    This contains non-code objects needed by the application.
    The data directory contains the file that will be uploaded to S3 upon deploy

### tests directory
    These are integration tests that drove the development of the application.  They are mostly functional and do not cover all test cases.

# Data Uploads 

The event attached to the S3 bucket will call a function when an Excel file gets created in the S3 bucket.  
For project simplicity, tt will expect a properly formatted Excel file and will automatically insert the data into DynamoDB table.

The entities saved in the table, as represented by the classes in the "models" folder are: Books, People, Credits and Transactions.


### DynamoDB table structure
---------- 
To design the access patterns, I came up with a list of sample queries that API needs to satisfy:

| Access Patterns |  How will this data be accessed? |
| --------- | ---------- |
| What books do we own?: | GSI1: SK=PERSON, PK=BOOK, filter Status = PURCHASED | 
| What books are ?person? reading? | GSI1: SK=PERSON, PK=BOOK, filter Status = LISTENED | 
| What book does ?person? want to buy? | GSI1: SK=PERSON, PK=BOOK, filter Status = WISHLIST | 
| When is ?person? next credit coming? | GSI2: Status = NEXT, PK=CREDIT, filter SK=PERSON
| How many books are available | GSI1: Scan SK-TITLE, count all  | 
| How many books are currently on wishlists ? | GSI1 Status = WISHLIST, PK=BOOK, count all | 
| How many unused credits for person? | GSI2 Status = ISSUED PK=CREDIT | 
| Get me information for a title | GSI1: SK=TITLE, PK=BOOK | 
| How many times has Book been purchased | Table: PK=BOOK, SK=TALLIES, read attributes  | 
| Activity on User Account   |GSI1: SK=PERSON | 


This drove the design, using generic PKhash and SKsort key field names.  The actual data attributes implemented are in the models definitions.  The design includes ideas of transactional APIs, but for the sake of time, only GET APIs were build.
An Global Secondary Index was created to query by the SKsort field
Another Global Secondary Index was created to query on Status field


|Entity | PK   |  SK  | Query fields needed | Other attributes |
| --------- | ---------- | ------------ | ---------- | ---------- | 
| Book   |    BOOK#aisn   |    TITLE#title  |   | Attributes: Author, ASN, Description, etc |
| |  BOOK#aisn |  PERSON#username | Status (PURCHASED), date | Attributes: title, author, username,  name, status, date_recorded |
| |  BOOK#aisn |   TALLIES  |   | Attributes:  num purchased, num listened, num wishlist updated when transaction is inserted |
| Reading List (became Transaction)  |  BOOK#aisn |   PERSON#username | Status (LISTENED),  date  | Attributes:  title, author, status, percent_complete, date_recorded |
| People |  PERSON#username |   PERSON#name |  | Attributes: name, email, phoneNumber |
| Wishlist (became Transaction) | BOOK#aisn |  PERSON#username | Status (WISHLIST), date  | Attributes:  title, author, username, status, date_recorded   |
| Book Purchased with Credit (not implemented) |BOOK#PRODUCT_ID | PERSON#username  |  CREDIT#creditId | dateCreditUsed, date used |
| Credits |  CREDIT#\<randomly generated id\> |  PERSON#username | Status(ISSUED) | Attributes:   dateIssued |
| | CREDIT#id  | PERSON#username | Status( NEXT) | DateToBeIssued |  |
| | CREDIT#id  | PERSON#username | Status( REDEEMED ) | #DateRedeemed#BOOK#PRODUCT_ID (not yet added) | Attributes:  dateIssued, dateUsed, title, author, number (not yet added to table) |



