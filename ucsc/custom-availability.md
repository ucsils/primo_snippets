# Overview

This snippet allows you to customize the availability line in Primo brief and full results, based on item metadata.

## Examples
https://ucsc.primo.exlibrisgroup.com/permalink/01CDL_SCR_INST/1jiojor/alma991010132179704876

## Keywords
availability

# Solution

Uses the prmSearchResultAvailabilityLineAfter and prmLocationItemsAfter angular components to customize the availability line of items in both brief and full results respectively. In the example shown, the items location is used to identify items that will be marked as physically not available. 

## Javacript

Note that the prmSearchResultAvailabilityLineAfter component is used in some other customizations, including the HathiTrust and Browzine integrations. Only one controller is allowed per angular component, and so you may need to combine this code into an existing controller.

```
app.component('prmSearchResultAvailabilityLineAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmSearchResultAvailabilityLineAfterController',
  });

  app.controller('prmSearchResultAvailabilityLineAfterController', function($scope) {
    this.$onInit = function () {
      // This works for the brief results. Full result page on prmLocationItemsAfter.js
      var vm = this.parentCtrl;
      angular.element(document).ready(function() {
        // Brief result
        if (vm.result) {
          if (vm.result.delivery.bestlocation) {
            // Location codes for S&E ETAS, and two Aerial photos locations
            const locations = ['setas', 'meddg'];
            let locationCode = vm.result.delivery.bestlocation.subLocationCode;
            if (locationCode && locations.includes(locationCode)) {
              var span = document.getElementById(vm.result.pnx.control.recordid[0] + 'availabilityLine0');
              if (span) {
                //span.textContent = "No physical access";
                span.textContent = span.textContent.replace("Available", "No physical access");
              }
            }
          }
        }
      });
    }
  });

app.component('prmLocationItemsAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'LocationItemsAfterController',
});

app.controller('LocationItemsAfterController', ['$scope', function($scope){

    this.$onInit = ()=> {
      // If its an S&E HT or Aerial Photos item, when the page loads change the availability statement.
      // This also happens for brief results in hathiTrustAvailability.js
      $scope.$watch(s => this.parentCtrl.item, ()=> {
        var vm = this.parentCtrl;
        if (vm.item.delivery.bestlocation) {
          // Location codes for S&E ETAS, and two Aerial photos locations
          const locations = ['setas', 'meddg'];
          let locationCode = vm.item.delivery.bestlocation.subLocationCode;
          if (locationCode && locations.includes(locationCode)) {
            // With the full result in modal, Primo returns multiple copies of this ID: change em all.
            var span = document.querySelectorAll("[id='" + vm.item.pnx.control.recordid[0] + "availabilityLine0']");
            if (span) {
              for(var i = 0; i < span.length; i++) {
                //span[i].textContent = "No physical access";
                span[i].textContent = span[i].textContent.replace("Available", "No physical access");
              }
            }
            // Find and hide the "available" message in the holding info, do it on an interval because this bit
            // loads after document.ready.
            var holdingStatement = null;
            var holdingInterval = window.setInterval(function(){
              if (holdingStatement == null) {
                holdingStatement = document.evaluate("//p[@ng-if='$ctrl.currLoc.location.availabilityStatus']", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null ).snapshotItem(0);
              } else {
                clearInterval(holdingInterval);
                //holdingStatement.innerHTML = "No Physical Access " + vm.loc.location.callNumber;
                holdingStatement.innerHTML = holdingStatement.innerHTML.replace("Available", "No physical access");
              }
            }, 500);
          }
        }
      });
    };
}]);

```
