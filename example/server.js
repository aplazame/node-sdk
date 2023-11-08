
const fs = require('fs'),
      { promisify } = require('util')

const _readFile = promisify(fs.readFile)

const express = require('express'),
      localtunnel = require('localtunnel'),
      ejs = require('ejs'),
      doConfirmation = require('./do-confirmation')

const app = express(),
      index_html = fs.readFileSync('example/index.ejs', 'utf8')

const {
  APLAZAME_JS_URL = 'https://cdn.aplazame.com/aplazame.js',
  APLAZAME_PUBLIC_KEY,
  APLAZAME_PRIVATE_KEY,
  LOCALTUNNEL_SUBDOMAIN = null,
} = process.env

const aplazameSDK = require('../sdk')
const APZ = aplazameSDK({
    access_token: APLAZAME_PRIVATE_KEY,
    is_sandbox: true,
  })

console.log('APLAZAME_PUBLIC_KEY', APLAZAME_PUBLIC_KEY)
console.log('APLAZAME_PRIVATE_KEY', APLAZAME_PRIVATE_KEY)

app.use(express.json())

app.use('/static', express.static('example/static'))

app.get('/', function (req, res) {
  res.send( ejs.render(index_html, {
    APLAZAME_PUBLIC_KEY,
    APLAZAME_JS_URL,
  }) )
})

var public_url = null
const headers = {
  'Bypass-Tunnel-Reminder': 'cheers from Aplazame',
}

app.get('/checkout/order', async (req, res) => {
  console.log('GET /checkout/order')
  
  var checkout_data = JSON.parse( await _readFile('example/checkout.json', 'utf8') )
  checkout_data.order.id = 'order_' + Date.now()
  checkout_data.merchant.notification_url = public_url + '/checkout/confirm'

  console.log('example/checkout.json', checkout_data)

  try{
    const order = await APZ.post('/checkout', checkout_data)

    console.log('order created', order)
    res.json(order.id)
  } catch (err) {
    console.error(err)
  }
})

app.post('/checkout/confirm', async (req, res) => {
  console.log('\nPOST /checkout/confirm\n', req.originalUrl, '\n', req.body)

  if( req.query.access_token !== APLAZAME_PRIVATE_KEY ) {
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

localtunnel({
  port: 3001,
  ...LOCALTUNNEL_SUBDOMAIN && { subdomain: LOCALTUNNEL_SUBDOMAIN },
})
  .then(({ url }) => {
    public_url = url

    app.listen(3001, () => {
      console.log(`\nExample app listening on:\n${url}\n`)

      require('child_process')
        .exec(
          process.platform
          .replace('darwin','')
          .replace(/win32|linux/,'xdg-') + 'open http://localhost:3001'
        );
    })
  })
