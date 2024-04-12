import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';

AWS.config.update({ region: 'eu-west-3' });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const data = await s3.deleteObject({ Bucket: process.argv[2], Key: process.argv[3] }).promise();

console.log('Delete Success', data);
