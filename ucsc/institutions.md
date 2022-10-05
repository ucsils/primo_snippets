# Overview

By default Primo displays all institutions in a consortium on the My Account / My Library Card page, which adds to the users cognitive load and generally clutters the page. This code hides institutions by default and only shows institutions for which there is activity.

## Keywords
"My account", "My library card", institutions

# Solution

The prmAccountOverviewAfter compontent checks the institutions list. Primo will add an icon for any institution that has activity, so this code checks for the presence of an icon and shows the institution when found.

## CSS

Add the following CSS to whatever custom CSS file is used.

```
/* Hide Insitutions dropdown and list by default, js will show institutions w activity */
prm-account-overview .institutions-list div:first-child,
prm-account-overview .institutions-list md-list-item,
prm-account-overview .institutions-list prm-icon {
  display: none;
}

/* Style our custom institution list header */
prm-account-overview .institutions-list { margin-top: 0.2em; }
prm-account-overview .main-institution-list { padding-top: 0; }
prm-account-overview .institutions-list h2 {
  font-size: 18px;
  text-transform: uppercase;
  color: rgba(0,0,0,.57);
  padding: 12px 0;
  border-bottom: 1px solid #d5d5d5;
  margin-bottom: 0;
}

/* Visually connect the active institution with the content */
prm-account-overview md-tabs-content-wrapper { background-color: #fff; }
prm-account-overview .institutions-list .is-selected { position: relative; }
prm-account-overview .institutions-list md-list-item.is-selected .institution-name { z-index: 1; }
prm-account-overview .separate-list-items md-list-item { background-color: #f3f3f3; }
prm-account-overview .institutions-list .is-selected:after {
  content: "";
  background-color: #fff;
  position: absolute;
  left: 0;
  height: 100%;
  width: 1000px;
  z-index: 0;
}
```

## Javacript

Add the following Javascript to whatever custom Javascript file is used.

```
app.component('prmAccountOverviewAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmAccountOverviewAfterController',
});

app.controller('prmAccountOverviewAfterController', ['$scope', '$rootScope', function($scope, $rootScope){
    var vm = this;
    var institutionsCount = 0;
    var institutionsList = null;

    // Check every 500ms for the institutions list to load
    var institutionsInterval = window.setInterval(function(){
        institutionsList = document.querySelector(".main-institution-list");
        institutionsCount++;
        // Stop checking if we find the element or 15 seconds has passed
        if ((institutionsList) || (institutionsCount > 30)) {
            updateInstitutions(institutionsList);
            clearInterval(institutionsInterval);
        }
    }, 500);

    function updateInstitutions(institutionsList) {
        if (institutionsList != null) {
            // Only show the header when there are visible institutions
            var showHeader = false;
            institutionsList.setAttribute('id', 'main-institution-list');
            // Each institution is in its own md-list-item
            let items = document.getElementById('main-institution-list').getElementsByTagName('md-list-item');
            for (const item of items) {
                // If it has a prm-icon element, its an institution with activity that should be displayed
                if (item.querySelector("prm-icon") != null) {
                    item.style.display = 'flex';
                    showHeader = true;
                }
            }
            if (showHeader) {
                // Add a header to the institution list and give it an ID.
                institutionsList.insertAdjacentHTML( 'beforeBegin', '<h2>UC Campus</h2>' );
            }
        }
    }
}]);

```
