
window.onAplazame = function (aplazame) {
  var checkoutData,
      onSuccess = function () {
        console.log('confirmed!');
      },
      onError = function () {
        console.log('order canceled!');
      };

  document.querySelector('[data-aplazame-button]')
    .addEventListener('click', function () {

      ( checkoutData ? Promise.resolve(checkoutData) :
        fetch('/checkout/data').then(function (res) {
          return res.json();
        })
      ).then(function (checkoutData) {

        checkoutData.merchant.onSuccess = onSuccess;
        checkoutData.merchant.onError = onError;
        checkoutData.merchant.onDismiss = onError;

        console.log('checkout', checkoutData);

        aplazame.checkout(checkoutData);

      });
    });
};
