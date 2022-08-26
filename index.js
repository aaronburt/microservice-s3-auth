if(!process.env.PRODUCTION) require('dotenv').config();

const AWS = require('aws-sdk');
const express = require('express');
const app = express();

if(![process.env.accessKeyId, process.env.secretAccessKey, process.env.endpoint, process.env.region].every((currentValue) => typeof(currentValue) === 'string')) throw new Error('Missing a required enviroment variable from the input');

const s3 = new AWS.S3({ 
    credentials: { 
        accessKeyId: process.env.accessKeyId, 
        secretAccessKey: process.env.secretAccessKey
    },
    endpoint: process.env.endpoint,
    region: process.env.region,
    bucket: process.env.bucket
});

async function getObject(bucket, key){
    try {
        return await s3.getSignedUrlPromise('getObject', { Bucket: bucket, Key: key, Expires: 86400 });
    } catch(err){
        console.log(err.errors)
        return err;
    }
}

app.get('/:bucket/:id', async(req, res) => { 
    try {
        if(!req.query.redirect) return res.status(200).json({ "status": 200, "url": await getObject(req.params.bucket, req.params.id, req.query.expires || 84600) });
        return res.redirect(await getObject(req.params.bucket, req.params.id, req.query.expires || 84600));
    } catch(err){
        return res.status(400);
    }
})

const server = app.listen(8080, () => { console.log(`[Express] started on port ${server.address().port}`) })