# Overview

Customizations to improve the purchase request feature. Identifies demand-driven acquisition (DDA) items, customizes the login message and reveals the Purchase Request service. Alma configuration to display the purchase request service only on relevant resources.

## Examples
https://ucsc.primo.exlibrisgroup.com/permalink/01CDL_SCR_INST/ifm3ln/alma991024882982404876
https://ucsc.primo.exlibrisgroup.com/permalink/01CDL_SCR_INST/ifm3ln/alma991024973021404876

## Keywords
"Purchase request", DDA, "demand driven acquisition", login, "sign in", GES, "General electronic service", "Display logic rule" 

# Solution

The purchase request is hidden by default in the AlmaHowovpAfter component, using a combination of javascript and css. In our cataloging, we use a local discovery field to identify DDA items with the phrase "Discovery Print". When a full result is loaded the metadata is checked to identify DDA records. When identified, DDA records have the purchase request service revealed and the login message is customized.

In Alma, a General Electronic Service is used with Display Logic Rules to remove the purchase request service from non-book and other ineligible materials.

## CSS

```
/* class for hiding things */
.hidden {display:none;}
```

## Javacript

```
/*  
 *  Customize the sign-in button on DDA full record display 
 *  Watches the details section for the DDA identifier, then changes the sign in text and classes
 *  Removes hidden class from Purchase Request button for DDA items
 */
app.component('prmServiceDetailsAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'ServiceDetailsAfterController',
});

app.controller('ServiceDetailsAfterController', ['$scope', function($scope){
  this.$onInit = function () {
    var vm = this.parentCtrl;
    var isDdaItem = null;
    var signInLabel = null;
    var purchaseButton = null;

    // Watch for the details to load, 'Discovery print' value in the local field lds07 indicates DDA
    isDdaItem = false;
    if (vm.item.pnx.display.lds07) {
      if (vm.item.pnx.display.lds07.includes("Discovery Print") || vm.item.pnx.display.lds07.includes("Discovery print")) {
        isDdaItem = true;
      }
    }

    // Keep checking until we have signInLabel & isDdaItem values
    var checkAlertInterval = window.setInterval(function(){
      if (!signInLabel) {
        signInLabel = document.evaluate("//span[text()='Please sign in to check if there are additional request options.']", document, null, XPathResult.ANY_TYPE, null ).iterateNext();
      }
      if (!signInLabel) {
        signInLabel = document.evaluate("//span[text()='Please sign in to check if there are any request options.']", document, null, XPathResult.ANY_TYPE, null ).iterateNext();
      }
      if (!signInLabel) {
        signInLabel = document.evaluate("//span[text()='Sign In to request this item']", document, null, XPathResult.ANY_TYPE, null ).iterateNext();
      }
      if (!purchaseButton) {
        purchaseButton = document.evaluate("//span[text()='Request Library Purchase']", document, null, XPathResult.ANY_TYPE, null).iterateNext();
        if (purchaseButton) {
          purchaseButton = purchaseButton.parentNode.parentNode.parentNode.parentNode.parentNode;
        }
      }
      // If we have both a label and an answer to isDda, update the alert and exit the interval.
      if (signInLabel && isDdaItem !== null) {
        var alertNode = signInLabel.parentNode.parentNode;
        clearInterval(checkAlertInterval);
        updateLoginAlert(isDdaItem, alertNode, signInLabel);
      }
      // If we find a purchase button
      if (purchaseButton) {
        // If it's a DDA item, ensure hidden is not in the class list and flag it as processed 
        // to prevent AlmaHowovp controller from re-hiding the service.
        if (isDdaItem) {
          purchaseButton.setAttribute("class", "processed");
          purchaseButton.classList.remove("hidden");
        }
        // This also means the user is already logged in and we can exit the interval
        clearInterval(checkAlertInterval);
      }
    }, 100);
  };

    function updateLoginAlert(isDdaItem, alertNode, signInLabel) {
      if (isDdaItem) {
        signInLabel.innerHTML = "Sign in to Request Library Purchase.";
      } else {
        // If there is a how to get it, leave the banner as-is (prominent yellow). Otherwise, de-emphasize it.
        let howOvpService = document.evaluate("//h4[text()='How to Get It']", document, null, XPathResult.ANY_TYPE, null ).iterateNext();
        if (!howOvpService) {
          signInLabel.parentNode.parentNode.parentNode.parentNode.setAttribute("class", "non-dda-login-alert");
          signInLabel.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.setAttribute("class", "non-dda-login-alert");
          signInLabel.innerHTML = "Sign in for more options.";
        }
      }
    }
}]);

app.component('almaHowovpAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'almaHowovpAfterController',
});

app.controller('almaHowovpAfterController', ['$scope', '$rootScope', function($scope, $rootScope){
  this.$onInit = function () {
    let ddaIntervalCount = 0;
    var ddaServiceInterval = window.setInterval(function(){
      ddaIntervalCount++;
      // Exit if 30 seconds has passed
      if (ddaIntervalCount>300) {
        clearInterval(ddaServiceInterval);
      }
      // Otherwise keep looking for the purchase request button
      if (!purchaseButton) {
        purchaseButton = document.evaluate("//span[text()='Request Library Purchase']", document, null, XPathResult.ANY_TYPE, null).iterateNext();
        if (purchaseButton) {
          purchaseButton = purchaseButton.parentNode.parentNode.parentNode.parentNode.parentNode;
        }
      }
      // Once the button is found...
      if (purchaseButton) {
        // Check if its already processed by prmServiceDetails controller, and if not hide it
        if (!purchaseButton.classList.contains("processed")) {
          purchaseButton.setAttribute("class", "hidden");
        }
        // and exit
        clearInterval(ddaServiceInterval);
      }
    }, 100);
  }

}]);

```

## Configuration

Under Configuration > Fulfillment > General Electronic Services, we have a GES titled "Not a book: hide purchase request". It is not an ILL service, has a stand-in URL (our campus URL, that is never actually displayed), and is enabled without login and never disabled.

The GES has a service availability rule: If rft.object_type is not equal to BOOK, isDisplay equals true.

Under Configuration > Fulfillment > Display Logic Rules we have several rules for this setup:
1. Hide service Purchase Request with Ownership by the institution = true
2. Hide service Purchase Request with Availability by the institution = true
3. Hide service Purchase Request if exists service General Electronic Service with Service = Not-a-book
4. Hide service General Electronic Service with Service = Not-a-book

The result is that the "not a book" GES is applied to everything that is not a book, which is used to hide the purchase request, before being hidden itself.
