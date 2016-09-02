Aplazame NodeJS
===============

``` sh
node install aplazame --save
```

``` js
var aplazame = require('aplazame')('privateKey');

// this example is using expressjs
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

```
