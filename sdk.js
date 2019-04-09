
// function extend (src, dest) {
//   for( var key in src ) {
//     dest[key] = src[key];
//   }
//   return dest;
// }

var protocols = {
  'http:': require('http'),
  'https:': require('https'),
}

function makeRequest (_url, data, options) {

  var parsed_url = new URL(_url)

  return new Promise(function (resolve, reject) {

    var requestConfig = {
      host: parsed_url.hostname,
      path: parsed_url.path,
      method: options.method || 'GET',
      headers: {
        Accept: 'application/vnd.aplazame' + ( options.is_sandbox ? '.sandbox' : '' ) + '.v1+json',
        Authorization: `Bearer ${ options.access_token }`,
        Host: 'api.aplazame.com',
      },
    }

    var req = protocols[parsed_url.protocol].request(requestConfig, function (res) {
      var result_body = ''

      res.on('data', function (chunk) {
        result_body += chunk
      })

      res.on('end', function () {
        resolve({
          data: JSON.parse(result_body),
          status: res.statusCode,
          statusText: 'OK',
          headers: res.headers,
        })
      })

      res.on('error', function(_err) {
        reject({ ok: false, status: res.statusCode, statusText: res.statusMessage })
      })
    })

    req.on('error', function (e) {
      reject(e)
    })

    if( data ) req.write(data)

    req.end()

  })
}

function Aplazame (access_token, is_sandbox) {

  if( !access_token ) throw new Error('access_token missing')

  this.access_token = access_token
  this.is_sandbox = Boolean(is_sandbox)
}

['get', 'delete'].forEach(function (method) {
  Aplazame.prototype[method] = function (path, options) {
    options = options || {}
    options.method = method
    options.access_token = access_token
    options.is_sandbox = is_sandbox
    return makeRequest(path, null, options).then(function (res) {
      return res.data
    })
  }
})

['post', 'put', 'patch'].forEach(function (method) {
  Aplazame.prototype[method] = function (path, data, options) {
    options = options || {}
    options.method = method
    options.access_token = access_token
    options.is_sandbox = is_sandbox
    return makeRequest(path, data, options)
  }
})

module.exports = Aplazame
