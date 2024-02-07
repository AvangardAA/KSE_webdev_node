function setHeader(req, res) 
{
    const { n, val } = req.query;
    res.setHeader(n, val);
    res.json({ msg: 'set success' });
}

function getHeader(req, res)
{
    const { n } = req.params;
    res.json({ [n]: req.headers[n.toLowerCase()] });
}

module.exports = {setHeader, getHeader};

