
var protocols = {
  'http:': require('http'),
  'https:': require('https'),
}

var api_origin = process.env.APLAZAME_API_ORIGIN || 'https://api.aplazame.com'

function makeRequest (_url, data, options) {

  var parsed_url = new URL(_url)

  return new Promise(function (resolve, reject) {

    var config = {
      host: parsed_url.hostname,
      path: parsed_url.pathname + parsed_url.search,
      method: options.method || 'GET',
      headers: {
        Accept: 'application/vnd.aplazame' + ( options.is_sandbox ? '.sandbox' : '' ) + '.v1+json',
        Authorization: `Bearer ${ options.access_token }`,
        'Content-Type': 'application/json',
        Host: parsed_url.hostname,
      },
    }

    var req = protocols[parsed_url.protocol].request(config, function (res) {
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

    if( data ) req.write(JSON.stringify(data))

    req.end()

  })
}

function Aplazame (access_token, is_sandbox) {

  if( !access_token ) throw new Error('access_token missing')

  this.access_token = access_token
  this.is_sandbox = Boolean(is_sandbox)
}

;['get', 'delete'].forEach(function (method) {
  Aplazame.prototype[method] = function (path, options) {
    options = options || {}
    options.method = method
    options.access_token = this.access_token
    options.is_sandbox = this.is_sandbox
    return makeRequest(api_origin + path, null, options).then(function (res) {
      return res.data
    })
  }
})

;['post', 'put', 'patch'].forEach(function (method) {
  Aplazame.prototype[method] = function (path, data, options) {
    options = options || {}
    options.method = method
    options.access_token = this.access_token
    options.is_sandbox = this.is_sandbox
    return makeRequest(api_origin + path, data, options).then(function (res) {
      return res.data
    })
  }
})

module.exports = Aplazame
