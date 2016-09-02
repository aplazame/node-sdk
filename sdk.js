
function extend (src, dest) {
  for( var key in src ) {
    dest[key] = src[key];
  }
  return dest;
}

function apiRequest (privateKey, isSandbox) {

  var api = function (path, data, options) {
    var https = require('https');

    return new Promise(function (resolve, reject) {

      var requestConfig = {
        host: 'api-dev.aplazame.com',
        path: path,
        method: options.method || 'GET',
        headers: {
          Accept: 'application/vnd.aplazame' + ( isSandbox() ? '.sandbox' : '' ) + '.v1+json',
          Authorization: `Bearer ${privateKey}`,
          Host: 'api-dev.aplazame.com'
        }
      };

      console.log('requestConfig:', JSON.stringify(requestConfig, null, '\t') );

      var req = https.request(requestConfig, function (res) {
        var str = '';

        res.on('data', function (chunk) {
          str += chunk;
        });

        res.on('end', function () {
          resolve({
            data: JSON.stringify(str),
            status: res.statusCode,
            headers: res.headers
          });
        });
      });

      req.on('error', function (e) {
        reject(e);
      });

      req.end()

    });
  };

  ['get', 'delete'].forEach(function (method) {
    api[method] = function (path, options) {
      options = options || {};
      options.method = method;
      return api(path, null, options);
    };
  });

  ['post', 'put', 'patch'].forEach(function (method) {
    api[method] = function (path, data, options) {
      options = options || {};
      options.method = method;
      return api(path, data, options);
    };
  });

  return api;
}

function Aplazame (privateKey, isProduction) {
  this.privateKey = privateKey;

  this.api = apiRequest(privateKey, function () {
    return this.sandbox;
  }.bind(this));

  this.sandbox = !isProduction;
}

Aplazame.prototype.authorizeOrder = function (orderId) {
  return this.api.post(`/orders/${orderId}/authorize`, {});
};

function aplazameSDK (privateKey) {
  return new Aplazame(privateKey);
}

module.exports = aplazameSDK;
