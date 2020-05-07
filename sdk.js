
const path = require('path')

const protocols = {
  'http:': require('http'),
  'https:': require('https'),
}

const {
  APLAZAME_API_ORIGIN = 'https://api.aplazame.com',
} = process.env

function makeRequest (_url, data, options) {

  var {
    protocol,
    hostname,
    pathname,
    search,
  } = new URL(_url)

  return new Promise(function (resolve, reject) {

    var config = {
      host: hostname,
      path: pathname + search,
      method: options.method || 'GET',
      headers: {
        Accept: 'application/vnd.aplazame' + ( options.is_sandbox ? '.sandbox' : '' ) + '.v1+json',
        Authorization: `Bearer ${ options.access_token }`,
        'Content-Type': 'application/json',
        Host: hostname,
      },
    }

    var req = protocols[protocol].request(config, function (res) {
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

function aplazameHandler (access_token, is_sandbox) {

  var apz = {}

  ;['get', 'delete'].forEach(function (method) {
    apz[method] = (req_path, options) => {
      options = options || {}
      options.method = method
      options.access_token = access_token
      options.is_sandbox = is_sandbox
      return makeRequest(path.join(APLAZAME_API_ORIGIN, req_path), null, options).then( (res) => res.data)
    }
  })
  
  ;['post', 'put', 'patch'].forEach(function (method) {
    apz[method] = (req_path, data, options) => {
      options = options || {}
      options.method = method
      options.access_token = access_token
      options.is_sandbox = is_sandbox
      return makeRequest(path.join(APLAZAME_API_ORIGIN, req_path), data, options).then( (res) => res.data)
    }
  })

  return apz
}

module.exports = function aplazameSDK (options = {}) {
  if( !options.access_token ) throw new Error('access_token missing')
  
  return aplazameHandler(options.access_token, options.is_sandbox)
}
