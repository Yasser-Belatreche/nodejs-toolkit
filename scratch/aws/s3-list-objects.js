import AWS from 'aws-sdk';

AWS.config.update({ region: 'eu-west-3' });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Call S3 to list the buckets
const res = await s3.listObjects({ Bucket: process.argv[2] }).promise();

console.log('Objects:');
res.Contents.forEach(obj => {
    console.log(obj);
});
