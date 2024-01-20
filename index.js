const express = require('express');
const app = express();
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
const port = 1234;
const {html1Handler, html2Handler, objHandler} = require('./handlers/handl.js')


const PostmanUserAgentStr = "PostmanRuntime/7.36.1"; // here use your postman user agent string to test CORS


app.use((req, res, next) =>
{
    const whitelist = [PostmanUserAgentStr];
    if (whitelist.includes(req.headers['user-agent']))
    {
        res.setHeader('Allow-User-Agent', req.headers['user-agent']);
        next();
    }
    else
    {
        res.status(403).send("denied, use postman");
    }
});

app.get('/', (req, res) =>
{
    res.send('Hello KSE');
});

app.get('/html1', html1Handler);
app.get('/html2', html2Handler);

app.get('/file/:filename', (req, res) =>
{
    // allowed files are in assets
    const name = req.params.filename;
    const fPath = path.join(__dirname, 'assets', name);

    if (fs.existsSync(fPath))
    {
        const mimeType = mime.lookup(fPath);
        res.type(mimeType);
        res.sendFile(fPath);
    }
    else
    {
        res.status(404).send(`file ${name} doesnt exist`);
    }
});

app.get('/objects', objHandler);
app.get('/objects/:type', objHandler);
app.get('/objects/:type/:id', objHandler);
app.get('/info', (req, res) =>
{
    res.send("{'info':'to get file use /file/your_file_name.format" +
        "To get objects use /objects/your_type/your_id or without parameters." +
        "To get html pages use /html1 and /html2'}")
});

app.listen(port, () =>
{
    console.log('app on port 1234');
});