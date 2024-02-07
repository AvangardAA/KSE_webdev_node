const express = require('express');
const router = express.Router();
const cookie_parse = require('cookie-parser');
const { getCookie, setCookie } = require('./helpers/cookie_set_get');
const { getHeader, setHeader } = require('./helpers/header_set_get');

// had some time to struggle with this, seems like node isnt saving cookies
// so when trying to do get on cookie later it will always fail because cookie undefined
router.use(cookie_parse());

/* localhost:1234/hc/cookie/set/?n=dummy&val=dummy_val&httpOnly=false */
router.get('/cookie/set', setCookie);

/* localhost:1234/hc/cookie/get/dummy */
router.get('/cookie/get/:n', getCookie);

/* localhost:1234/hc/header/set/?n=dummy&val=dummy_val */
router.get('/header/set', setHeader);

/* localhost:1234/hc/header/get/<header name> */
/* you should set header with postman manually */
router.get('/header/get/:n', getHeader);

module.exports = router;
