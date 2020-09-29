[![github-banner](https://cloud.githubusercontent.com/assets/2305833/18190375/c2b97318-70c2-11e6-8749-0ad966bfc798.png)](https://www.npmjs.com/package/aplazame)

#### Aplazame SDK for NodeJS

``` sh
npm install @aplazame/node --save
```

Full example in: [Github](https://github.com/aplazame/node-sdk/tree/master/example)

``` js
var aplazame = require('@aplazame/node')({
  access_token: 'merchant_private_key',
  is_sandbox: true,
})

aplazame.post('/checkout', {
  merchant: {...},
  order: {...},
  customer: {...},
  billing: {...},
  shipping: {...},
}).then(function (order) {

})
```

#### Launching example

``` sh
  npm install
  
  PUBLIC_KEY=2399abc3f1f5ba3ab94s9s87ts987st9s87t9s8s \
	PRIVATE_KEY=dce981b80s098s098sy09s8y0s98yss9syt9s78s \
	node example/server.js
```
