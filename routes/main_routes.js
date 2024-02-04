const express = require('express');
const router = express.Router();
const { html1Handler, html2Handler, objHandler } = require('../handlers/handl.js');
const mime = require('mime-types');
const path = require('path');
const fs = require('fs');

router.get('/', (req, res) => 
{
    res.send('Hello KSE');
});

router.get('/html1', html1Handler);
router.get('/html2', html2Handler);

router.get('/file/:filename', (req, res) => 
{
    // allowed files are in assets
    const name = req.params.filename;
    const fPath = path.join(__dirname, '../assets', name);

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

router.get('/objects', objHandler);
router.get('/objects/:type', objHandler);
router.get('/objects/:type/:id', objHandler);

router.get('/info', (req, res) => 
{
    res.send("{'info':'to get file use /file/your_file_name.format" +
        "To get objects use /objects/your_type/your_id or without parameters." +
        "To get html pages use /html1 and /html2'}");
});

module.exports = router;