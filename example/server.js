
require('dotenv').config()

var fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Aplazame = require('../sdk')

var app = express(),
    ejs = require('ejs'),
    index_html = fs.readFileSync('example/index.html', 'utf8')

console.log('PUBLIC_KEY', process.env.PUBLIC_KEY)
console.log('PRIVATE_KEY', process.env.PRIVATE_KEY)

var apz = new Aplazame(process.env.PRIVATE_KEY, true)

app.use(bodyParser.json())

app.use('/static', express.static('example/static'))

app.get('/', function (req, res) {
  res.send( ejs.render(index_html, {
    public_key: process.env.PUBLIC_KEY
  }) )
})

app.get('/checkout/order', function (req, res) {
  var checkout_data = JSON.parse( fs.readFileSync('example/checkout.json', 'utf8') )
  checkout_data.order.id = 'order-' + Date.now()

  apz.post('/checkout', checkout_data ).then(function (order) {
    console.log('order created', order);
    res.json( order.id );
  }, console.error)
})

app.post('/checkout/confirm', function (req, res) {
  var checkout_token = req.body.checkout_token,
      order = CheckoutOrder.get(checkout_token);

  if( !order ) {
    res.status(404).end();
  }

  aplazame.authorizeOrder(checkout_token)
    .then(function (response) {
      order.confirm().then(function () {
        res.status(204).end()
      })
    }, function (reason) {
      console.log('authorize error', reason)
      // [502 Bad Gateway] The server was acting as a gateway or proxy
      //   and received an invalid response from the upstream server.
      res.status(502).end()
    }).catch(function (err) {
      console.log('authorize error (2)', err)
    })
})


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
