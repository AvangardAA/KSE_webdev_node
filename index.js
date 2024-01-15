const express = require('express');
const app = express();
const port = 1234;

const PostmanUserAgentStr = "PostmanRuntime/7.36.0";

// easy debug trick used to identify postman request and then set middlewares
app.get('/', (req, res) => {
  if (req.get('User-Agent') === PostmanUserAgentStr)
  {
    console.log("this is postman");
  }
  res.send('Hello KSE');
});



app.listen(port, () => {
  console.log('app on port 1234');
});
