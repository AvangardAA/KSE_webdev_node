function setCookie(req, res) 
{
    const { n, val, httpOnly } = req.query;
    res.cookie(n, val, { httpOnly: httpOnly === 'true' });
    res.json({ msg: 'set success' });
}

function getCookie(req, res)
{
    const { n } = req.params;
    res.json({ [n]: req.cookies[n] });
}

module.exports = {getCookie, setCookie};