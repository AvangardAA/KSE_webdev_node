const express = require('express');
const app = express();
const port = 1234;

const PostmanUserAgentStr = "PostmanRuntime/7.36.0";

app.use((req, res, next) => {
  const whitelist = [PostmanUserAgentStr];
  if (whitelist.includes(req.headers['user-agent'])) {
    res.setHeader('Allow-User-Agent', req.headers['user-agent']);
    next();
  }
  else 
  {
    res.status(403).send("denied");
  }
});

// easy debug trick used to identify postman request and then set middlewares
app.get('/', (req, res) => {
  res.send('Hello KSE');
});

app.listen(port, () => {
  console.log('app on port 1234');
});
