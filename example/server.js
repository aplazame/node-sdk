
const fs = require('fs'),
      { promisify } = require('util')

const _readFile = promisify(fs.readFile)

const express = require('express'),
      bodyParser = require('body-parser'),
      ngrok = require('ngrok'),
      ejs = require('ejs'),
      doConfirmation = require('./do-confirmation')

const app = express(),
      index_html = fs.readFileSync('example/index.ejs', 'utf8'),
      apz = require('../sdk')({
        access_token: process.env.PRIVATE_KEY,
        is_sandbox: true,
      })

const {
  APLAZAME_JS_URL = 'https://cdn.aplazame.com/aplazame.js',
  PUBLIC_KEY,
  PRIVATE_KEY,
} = process.env

console.log('PUBLIC_KEY', PUBLIC_KEY)
console.log('PRIVATE_KEY', PRIVATE_KEY)

app.use(bodyParser.json())

app.use('/static', express.static('example/static'))

app.get('/', function (req, res) {
  res.send( ejs.render(index_html, {
    PUBLIC_KEY,
    APLAZAME_JS_URL,
  }) )
})

var ngrok_url = null

app.get('/checkout/order', async (req, res) => {
  var checkout_data = JSON.parse( await _readFile('example/checkout.json', 'utf8') )

  checkout_data.order.id = 'order_' + Date.now()
  checkout_data.merchant.notification_url = ngrok_url + '/checkout/confirm'

  const order = await apz.post('/checkout', checkout_data )

  console.log('order created', order)
  res.json( order.id )
})

app.post('/checkout/confirm', async (req, res) => {
  console.log('\nPOST /checkout/confirm\n', req.originalUrl, '\n', req.body)

  if( PRIVATE_KEY !== req.query.access_token ) {
    return res.status(403).end()
  }

  try{
    await doConfirmation(req.body)
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

ngrok.connect(3001)
  .then(function (_ngrok_url) {
    ngrok_url = _ngrok_url
    app.listen(3001, function () {
      console.log('Example app listening on:', _ngrok_url)
    })
  })
