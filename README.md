[![github-banner](https://cloud.githubusercontent.com/assets/2305833/18190375/c2b97318-70c2-11e6-8749-0ad966bfc798.png)](https://www.npmjs.com/package/aplazame)

#### Aplazame SDK for NodeJS

``` sh
node install @aplazame/node --save
```

Full example in: [Github](https://github.com/aplazame/node-sdk/tree/master/example)

``` js
var Aplazame = require('@aplazame/node')

var aplazame = new Aplazame('merchant_private_key', false)

aplazame.post('/checkout', {
  merchant: {...},
  order: {...},
  customer: {...},
  billing: {...},
  shipping: {...},
}).then(function (order) {

})
```
