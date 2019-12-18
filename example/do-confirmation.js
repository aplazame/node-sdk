
function doPaymentCancel (mid) {
  return new Promise (function (resolve, reject) {
    // example with mongo
    // 
    // collection.insert({ mid, status: DELETE }, function(err, doc){
    //   if( err ) reject()
    //   else resolve()
    // })

    resolve()
  })
}
function doPaymentAccept (mid) { /* return promise as example above */
  return new Promise (function (resolve, reject) {
    setTimeout(function() {
      resolve('foo');
    }, 300);
  })
}
function doPaymentPending (mid) { /* return promise as example above */ 
  return new Promise (function (resolve, reject) {
    setTimeout(function() {
      resolve('foo');
    }, 300);
  })
}

module.exports = function doConfirmation (payload) {
  return new Promise(function (resolve, reject) {
    if( !payload ) return reject('Payload is malformed')
    if( !payload.mid ) return reject('"mid" not provided')

    if( payload.status === 'ko' ) return doPaymentCancel(payload.mid).then(resolve, reject)

    if( payload.status === 'pending' ) {
      switch (payload.status_reason) {
        case 'challenge_required':
          return doPaymentPending(payload.mid).then(resolve, reject)
        case 'confirmation_required':
          return doPaymentAccept(payload.mid).then(resolve, reject)
      }
    }

    resolve()
  })
  .catch(function(reason) {
    if( reason instanceof Error ) reason = reason.message
    throw '' + reason
  })
}
