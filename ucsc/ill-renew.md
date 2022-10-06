# Overview

Most interlibrary loans were not renewable in Primo because we use an external system (VDX). Patrons had to email library staff members, who had to manually renew materials on patrons behalf. The code below adds a renew button to items on the Loans summary page for items that Alma cannot automatically renew. This button leads to an external form that streamlines the information gathering process for ILL staff members by passing the relevant loan information with no extra effort for patrons.


## Keywords
ILL, "interlibrary loan", renewals, "loan renewals"

# Solution

Uses the prmLoansAfter component on the Loans summary page. It checks each prm-loan to see if it is alma renewable, and if not it adds a button to the actions available for the loan. The button leads to an external form that is able to accept URL parameters to pre-fill the form elements with metadata from the loan. 


## CSS

```
/* ILL Loan Renewal Button fixes */
prm-loans .renewable button a {
  display: block;
}
prm-loans .renewable button a:hover,
prm-loans .renewable button a:active,
prm-loans .renewable button a:focus {
  color: #fff;
  text-decoration: none;
}
```

## Javacript

```
app.component('prmLoansAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'LoansAfterController',
});

app.controller('LoansAfterController', ['$scope', '$element', function($scope, $element){
  this.$doCheck = () => {
    var vm = this.parentCtrl
    // Only do processing if Primo has received loan data from Alma and built its own loans element.
    var loans = vm.loansService._loansList.active;
    if (loans && loans.length) {
      var prmLoans = $element[0].parentNode.getElementsByTagName('prm-loan'); // get every <prm-loan> inside <prm-loans> parent
      if (prmLoans && prmLoans.length) {
        processLoanRenewButtons(loans, prmLoans);
      }
    }
  };

  function processLoanRenewButtons($loans, $prmLoans) {
    angular.forEach($loans, function(item, key) {
      var loanActions = null;
      if ((item.mainlocationcode == "RES_SHARE") && (item.renew == "N")) {
        var myForm = "https://your-form-here";
        // Add the metadata we want to send.
        var params = '?current_due_date=' + item.duedate + '&author=' + item.author + '&title=' + item.title + '&barcode=' + item.itembarcode;

        // There is a delay in Primo loading the actions, so try to get it with an interval and lots of ugly checks
        var loanIntervalCount = 0;
        var loansInterval = window.setInterval(function(){
          loanIntervalCount++;
          // Try for 5 seconds, then exit
          if (loanIntervalCount > 50) {
            clearInterval(loansInterval);
          }
          if ($prmLoans[key]) {
            loanActions = $prmLoans[key].getElementsByClassName('list-item-actions');
          }
          if (loanActions) {
            if (loanActions.length) {
              loanActions.item(0).innerHTML = `
              <div class="renewable">
                <button class="button-with-icon zero-margin button-link md-button md-primoExplore-theme" aria-label="Renew">
                  <a href="${myForm}${params}" target="_blank">
                    <prm-icon class="h-flipped ng-scope ng-isolate-scope" icon-type="svg" svg-icon-set="primo-ui" icon-definition="restore">
                      <md-icon md-svg-icon="primo-ui:restore" role="presentation" class="ng-scope md-primoExplore-theme">
                        <svg id="restore_cache63" width="100%" height="100%" viewBox="0 0 24 24" y="1032" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
                          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path>
                        </svg>
                      </md-icon>
                    </prm-icon>
                    <span translate="nui.loans.renew" class="ng-scope">Renew</span>
                  </a>
                </button>
              </div>`;
            }
            clearInterval(loansInterval);
          }
        }, 100);
      }
    });
  }
}]);

```

## Configuration

No Alma configuration is needed, but an external form must be created to accept the renew request, and it must be able to accept URL parameters to pre-populate form fields. At UCSC we used Drupal's webform module to create the form, but Google Forms is another viable option.
