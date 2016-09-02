
var express = require('express'),
    bodyParser = require('body-parser'),
    nitro = require('nitro'),
    template = nitro.template,
    file = nitro.file,
    app = express(),
    layout = template( file.read('boilerplate/index.html') ),
    orders = {},
    aplazame = require('../sdk')( process.env.APLAZAME_PRIVATE_KEY );

app.use(bodyParser.json());

app.use('/static', express.static('boilerplate/static'));

function CheckoutOrder (data) {
  this.id = 'order-' + Date.now();
  data.order.id = this.id;
  this.data = data;

  CheckoutOrder.cache[this.id] = this;
  console.log('order created', this.id);
}

CheckoutOrder.cache = {};
CheckoutOrder.get = function (orderId) {
  return CheckoutOrder.cache[orderId];
}

CheckoutOrder.prototype.confirm = function () {
  // do something
  this.confirmed = true;
  return Promise.resolve(this);
}

// recovering keys from environment variables
var env = template.scope({
      publicKey: process.env.APLAZAME_PUBLIC_KEY
    });

app.get('/', function (req, res) {
  res.send( template( file.read('boilerplate/index.html'), env) );
});

app.get('/checkout/data', function (req, res) {
  var order = new CheckoutOrder( file.readJSON('boilerplate/checkout.json') );
  res.json( order.data );
});

app.post('/checkout/confirm', function (req, res) {
  var checkout_token = req.body.checkout_token,
      order = CheckoutOrder.get(checkout_token);

  if( !order ) {
    res.status(404).end();
  }

  aplazame.authorizeOrder(checkout_token)
    .then(function (response) {
      order.confirm().then(function () {
        res.status(204).end();
      });
    }, function (reason) {
      console.log('authorize error', reason);
      // [502 Bad Gateway] The server was acting as a gateway or proxy
      //   and received an invalid response from the upstream server.
      res.status(502).end();
    }).catch(function (err) {
      console.log('authorize error (2)', err);
    });
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
