const fs = require('fs');
const path = require('path');

function objHandler(req, res)
{
    const types = ["ducks", "geese", "hens"];
    let data = {};

    //console.log(req.params.type);

    if (req.params.type)
    {
        if (types.includes(req.params.type))
        {
            const fPath = path.join(__dirname, "..", 'data', `${req.params.type}.txt`);

            if (fs.existsSync(fPath))
            {
                const fContent = fs.readFileSync(fPath, 'utf8');
                const list = JSON.parse(fContent.split('\n')[0]);

                if (req.params.id)
                {
                    const itId = parseInt(req.params.id, 10);
                    const item = list.find(item => item.id === itId);
                    if (item)
                    {
                        res.json(item);
                    }
                    else
                    {
                        res.status(404).send('item doesnt exist');
                    }
                }
                else
                {
                    res.json(list);
                }
            }
            else
            {
                res.status(404).send('type doesnt exist in data');
            }
        }
        else
        {
            res.status(400).send('wrong type');
        }
    }
    else
    {
        types.forEach(type =>
        {
            const fPath2 = path.join(__dirname, "..", 'data', `${type}.txt`);
            if (fs.existsSync(fPath2))
            {
                const fContent2 = fs.readFileSync(fPath2, 'utf8');
                data[type] = JSON.parse(fContent2.split('\n')[0]);
            }
        });
        res.json(data);
    }
}

function html1Handler(req, res)
{
    res.send('Hi, KSE, i`m html1 page');
}

function html2Handler(req, res)
{
    res.send('Hi, KSE from html2 page');
}

module.exports = {html1Handler, html2Handler, objHandler}