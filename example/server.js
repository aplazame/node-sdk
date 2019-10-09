
require('dotenv').config()

var fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    ejs = require('ejs')

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

app.get('/checkout/order', function (req, res) {
  var checkout_data = JSON.parse( fs.readFileSync('example/checkout.json', 'utf8') )
  checkout_data.order.id = 'order-' + Date.now()

  apz.post('/checkout', checkout_data ).then(function (order) {
    console.log('order created', order);
    res.json( order.id );
  }, console.error)
})

app.post('/checkout/confirm', function (req, res) {

  function do_payment_cancel(mid) {
    try {
      // Update 'mid' order payment as CANCELED
    } catch (e) {
      // If something was wrong, return FALSE
      return false
    }
    return true
  }

  function do_payment_pending(mid) {
    try {
      // Update 'mid' order payment as PENDING
    } catch (e) {
      // If something was wrong, return FALSE
      return false
    }
    return true
  }

  function do_payment_accept(mid) {
    try {
      // Update 'mid' order payment as ACCEPTED
    } catch (e) {
      // If something was wrong, return FALSE
      return false
    }
    return true
  }

  function response(status) {
    res.status(200).send({status: status})
  }

  function confirm(payload) {
    if (!payload) {
      response('Payload is malformed')
    }
    if (!payload.mid) {
      response('"mid" not provided')
    }
    var mid = payload.mid

    switch (payload.status) {
      case 'pending':
        switch (payload.status_reason) {
          case 'challenge_required':
            if (!do_payment_pending(mid)) {
              response('ko')
            }
            break
          case 'confirmation_required':
            if (!do_payment_accept(mid)) {
              response('ko')
            }
            break
        }
        break
      case 'ko':
        if (!do_payment_cancel(mid)) {
          response('ko')
        }
        break
    }

    response('ok')
  }

  if (process.env.PRIVATE_KEY !== req.query.access_token) {
    res.status(403).end()
  }

  confirm(req.body)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
