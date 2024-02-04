const express = require('express');
const app = express();
const port = 1234;
const main_routes = require("./routes/main_routes");
const fruit_routes = require("./routes/fruit_routes");
const bodyParser = require('body-parser');

// const PostmanUserAgentStr = "PostmanRuntime/7.36.1"; // here use your postman user agent string to test CORS UPD: no longer needed
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "pug");

/* middleware disabled for this homework, because it should be accessed from browser and it wont work now

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
*/

app.use("/", main_routes);
app.use("/fruit/", fruit_routes);

app.listen(port, () =>
{
    console.log('app on port 1234');
});