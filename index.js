const express = require('express');
const app = express();
const port = 1234;

app.get('/', (req, res) => {
  res.send('Hello KSE');
});

app.listen(port, () => {
  console.log('app on port 1234');
});
