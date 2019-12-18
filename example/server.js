
require('dotenv').config()

var fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    ngrok = require('ngrok'),
    ejs = require('ejs'),
    doConfirmation = require('./do-confirmation')

var app = express(),
    index_html = fs.readFileSync('example/index.html', 'utf8'),
    apz = require('../sdk')({
      access_token: process.env.PRIVATE_KEY,
      is_sandbox: true,
    })

console.log('PUBLIC_KEY', process.env.PUBLIC_KEY)
console.log('PRIVATE_KEY', process.env.PRIVATE_KEY)

app.use(bodyParser.json())

app.use('/static', express.static('example/static'))

app.get('/', function (req, res) {
  res.send( ejs.render(index_html, {
    public_key: process.env.PUBLIC_KEY
  }) )
})

var ngrok_url = null

app.get('/checkout/order', function (req, res) {
  var checkout_data = JSON.parse( fs.readFileSync('example/checkout.json', 'utf8') )
  checkout_data.order.id = 'order-' + Date.now()
  checkout_data.merchant.notification_url = ngrok_url + '/checkout/confirm'

  apz
    .post('/checkout', checkout_data )
    .then(function (order) {
      console.log('order created', order);
      res.json( order.id );
    }, console.error)
})

app.post('/checkout/confirm', function (req, res) {
  console.log('\nPOST /checkout/confirm\n', req.originalUrl, '\n', req.body)

  if( process.env.PRIVATE_KEY !== req.query.access_token ) {
    return res.status(403).end()
  }

  try{
  doConfirmation(req.body)
    .then(function () {
      res.status(200).send({ status: 'ok' }).end()
    })
    .catch(function (reason) {
      res.status(200).send({ status: 'ko', reason }).end()
    })
  } catch(err) {
    console.error(err)
  }
})

ngrok.connect(3000)
  .then(function (_ngrok_url) {
    ngrok_url = _ngrok_url
    app.listen(3000, function () {
      console.log('Example app listening on:', _ngrok_url)
    })
  })
