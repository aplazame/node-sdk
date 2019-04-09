
(window.aplazame = window.aplazame || []).push(function (aplazame) {
  var checkoutData,
      onSuccess = function () {
        console.log('confirmed!');
      },
      onError = function () {
        console.log('order canceled!');
      }

  document.querySelector('[data-aplazame-button]')
    .addEventListener('click', function () {

      ( checkoutData
          ? Promise.resolve(checkoutData)
          : fetch('/checkout/order').then(function (res) {
              return res.json()
            })
      ).then(function (checkout_data) {

        console.log('checkout', checkout_data)

        aplazame.checkout(checkout_data, {
          onSuccess: onSuccess,
          onDismiss: onError,
        })

      })
    })
})
