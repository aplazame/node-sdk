
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

const http = {
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
  headers = {},
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
        ...headers,
        Accept: `application/vnd.aplazame${ is_sandbox ? '.sandbox' : '' }.v1+json`,
        Authorization: `Bearer ${ access_token }`,
        'Content-Type': 'application/json',
        Host: hostname,
      },
      insecureHTTPParser: true,
    }

    console.log('request', config)

    var req = http[protocol].request(config, res => {
      res.setEncoding('utf8')
      
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const response_text = chunks.join('')
        let data = res.headers['content-type'] === 'application/json'
          ? JSON.parse(response_text)
          : response_text

        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject({
            ok: false,
            status: res.statusCode,
            statusText: res.statusMessage,
            body: data,
          })
          return
        }

        resolve({
          data,
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

    req.write(json !== null ? JSON.stringify(json) : (body || ''))
    req.end()
  })
}

function aplazameHandler (access_token, is_sandbox) {
  const apz = {}

  ;['get', 'delete'].forEach(method => {
    apz[method] = (path, options) => {
      return makeRequest({
        ...options,
        url: joinPaths.apply(null, [APLAZAME_API_ORIGIN].concat(path)),
        method,
        access_token,
        is_sandbox,
      })
        .then( (res) => res.data )
    }
  })
  
  ;['post', 'put', 'patch'].forEach(method => {
    apz[method] = (path, json, options) => {
      return makeRequest({
        ...options,
        url: joinPaths.apply(null, [APLAZAME_API_ORIGIN].concat(path)),
        json,
        method,
        access_token,
        is_sandbox,
      })
        .then( (res) => res.data )
    }
  })

  return apz
}

module.exports = function aplazameSDK ({ access_token = null, is_sandbox = false } = {}) {
  if( !access_token ) throw new Error('access_token missing')
  
  return aplazameHandler(access_token, is_sandbox)
}
