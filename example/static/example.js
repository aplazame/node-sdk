
(window.aplazame = window.aplazame || []).push(function (aplazame) {
  var onSuccess = function () {
        console.log('confirmed!');
      },
      onError = function () {
        console.log('order canceled!');
      }

  var button_el = document.querySelector('[data-aplazame-button]')
  button_el.setAttribute('original-text', button_el.textContent)
  
  button_el.addEventListener('click', function () {
    button_el.textContent = 'iniciando checkout...'
    button_el.setAttribute('disabled', '')

    fetch('/checkout/order')
      .then(function (res) {
        return res.json()
      })
      .then(function (checkout_data) {
        console.log('checkout', checkout_data)

        aplazame.checkout(checkout_data, {
          onSuccess: onSuccess,
          onDismiss: onError,
        })

      }, console.error)
      .then(function () {
        button_el.textContent = button_el.getAttribute('original-text')
        button_el.removeAttribute('disabled')
      })
  })
})
