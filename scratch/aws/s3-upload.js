import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';

AWS.config.update({ region: 'eu-west-3' });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const file = process.argv[3];

const fileStream = fs.createReadStream(file);
fileStream.on('error', function (err) {
    console.log('File Error', err);
});

// call S3 to retrieve upload file to specified bucket
const data = await s3
    .upload({ Body: fileStream, Bucket: process.argv[2], Key: path.basename(file) })
    .promise();

console.log('Upload Success', data.Location);
