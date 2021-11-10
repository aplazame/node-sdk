
const reduceArgs = fn => {
  return function () {
    const args = [].slice.call(arguments)
    let result = args.shift()
    let nextValue = args.shift()

    while (nextValue !== undefined) {
      result = fn(result, nextValue)
      nextValue = args.shift()
    }
    return result
  }
}
const joinPaths = reduceArgs((a, b) => a.replace(/\/$/, '') + '/' + b.replace(/^\//, ''))

const protocols = {
  'http:': require('http'),
  'https:': require('https'),
}

const {
  APLAZAME_API_ORIGIN = 'https://api.aplazame.com',
} = process.env

function makeRequest ({
  url = null,
  method = 'get',
  access_token = null,
  is_sandbox = false,
  body = null,
  json = null,
}) {

  const {
    protocol,
    hostname,
    pathname,
    search,
  } = new URL(url)

  return new Promise((resolve, reject) => {

    var config = {
      host: hostname,
      path: pathname + search,
      method: method.toUpperCase(),
      headers: {
        Accept: `application/vnd.aplazame${ is_sandbox ? '.sandbox' : '' }.v1+json`,
        Authorization: `Bearer ${ access_token }`,
        'Content-Type': 'application/json',
        Host: hostname,
      },
    }

    var req = protocols[protocol].request(config, res => {
      var result_body = ''

      res.setEncoding('utf8')

      res.on('data', chunk => {
        result_body += chunk
      })

      res.on('end', () => {
        resolve({
          data: JSON.parse(result_body),
          status: res.statusCode,
          statusText: 'OK',
          headers: res.headers,
        })
      })

      res.on('error', _err => {
        reject({ ok: false, status: res.statusCode, statusText: res.statusMessage })
      })
    })

    req.on('error', e => reject(e))

    if (json !== null) req.write(JSON.stringify(json))
    else if(body !== null) req.write(body)

    req.end()

  })
}

function aplazameHandler (access_token, is_sandbox) {

  const apz = {}

  ;['get', 'delete'].forEach(method => {
    apz[method] = (path, options) => {
      options = options || {}
      options.url = joinPaths.apply(null, [APLAZAME_API_ORIGIN].concat(path)),
      options.method = method
      options.access_token = access_token
      options.is_sandbox = is_sandbox
      return makeRequest(options).then( (res) => res.data )
    }
  })
  
  ;['post', 'put', 'patch'].forEach(method => {
    apz[method] = (path, data, options) => {
      options = options || {}
      options.url = joinPaths.apply(null, [APLAZAME_API_ORIGIN].concat(path)),
      options.json = data
      options.method = method
      options.access_token = access_token
      options.is_sandbox = is_sandbox
      return makeRequest(options).then( (res) => res.data )
    }
  })

  return apz
}

module.exports = function aplazameSDK ({ access_token = null, is_sandbox = false } = {}) {
  if( !access_token ) throw new Error('access_token missing')
  
  return aplazameHandler(access_token, is_sandbox)
}
