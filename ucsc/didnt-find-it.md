# Overview

Adds a "Didn't find it?" box to the bottom of search results pages to provide users with alternative search methods and additional help, including our libchat integration.

## Examples
https://ucsc.primo.exlibrisgroup.com/discovery/search?query=any,contains,example&tab=Everything&search_scope=MyInst_and_CI&vid=01CDL_SCR_INST:USCS&lang=en&offset=0

## Keywords
"finding aid", help, usability, ux, libchat, libapps

# Solution

The prmSearchResultListAfter component is used to populate an html template with the users search string applied to the Worldcat search scope, or the existing scope with the "expand my results" option enabled. Additional links and a chat widget are also included. The template also provides a "jump button" on the side of the window that scrolls the window down to the box.

## CSS

```
/* Styles for Haven't Found Box */
#findItBox {
  background-color: #f3f3f3;
  box-shadow: 0 1px 0 0 rgba(0,0,0,.03), 0 5px 5px -3px rgba(0,0,0,.07);
  margin: 10px 0 100px 0;
  box-sizing: border-box;
  -ms-flex-direction: column;
  flex-direction: column;
}
#findItBox .md-headline {
  text-align: center;
}
#findItBox .md-subheadline {
  display: inline-block;
  font-size: 20px;
  font-weight: 300;
  margin-bottom: 15px;
}
#findItBox md-card-content {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-start;
  color: #555;
}
#findItBox md-card-content > div {
  margin: 10px 20px;
}
#findItBox md-list-item {
  align-items: flex-start;
  margin-bottom: 15px;
  padding-left: 0;
}
#findItBox md-list-item.align-center {
  align-items: center;
}
#findItBox md-list-item > div {
  float: left;
}
#findItBox md-list-item a { font-size: 17px; }
#findItBox md-list-item p { margin: 0 0 .2em; }
#findItBox img {
  margin: 0px 8px -10px 0px;
}
#findItBox a.img:hover,
#findItBox a.img:focus,
#findItBox a.img:active {
  box-shadow: none;
}
@media all and (min-width: 600px) {
  #findItBox md-card-content {
    flex-flow: row nowrap;
  }
}
/* Didn't Find it? sidebar jump button */
#findItButton {
  position: fixed;
  top: 50vh;
  right: -51px;
  transform: rotate(90deg);
  min-height: auto;
  border-radius: 0px;
  background-color: #32579b;
  color: #fff;
  font-weight: bold;
  text-transform: none;
  line-height: 26px;
  z-index: 70;
}
#findItButton:hover {
   background-color: #ddd;
   color: #32579b;
}
/* Hide the Didn't find it box on the My Favorites page */
prm-favorites prm-search-result-list-after {
  display: none;
}
```

## Javacript

Add the following Javascript to whatever custom Javascript file is used. Note the URL to the template at the bottom of this snippet will need to be customized for your own instance, and your libchat hash (if used) will need to be added.

```
/*
 * Add Didn't Find It box
 * Links to the Worldcat Scope
 * Embeds Libchat form widget
 *
 */
app.controller('SearchResultListAfterController', ['$scope', '$rootScope', function($scope, $rootScope){
  this.$onInit = function () {
    var vm = this;

    // Make search parameters available to the template
    vm.tab = vm.parentCtrl.$stateParams.tab;
    vm.vid = vm.parentCtrl.$stateParams.vid;
    vm.search_scope = vm.parentCtrl.$stateParams.search_scope;

    // Advanced search queries are objects. Get the query in a string
    if (typeof vm.parentCtrl.$stateParams.query === 'object') {
      vm.queryString = vm.parentCtrl.$stateParams.query.join('&query=');
      // Advanced searches now need to be called out in the URL
      vm.queryString = vm.queryString + '&mode=advanced';
    } else {
      vm.queryString = vm.parentCtrl.$stateParams.query;
    }

    // To tell the template whether or not it's on Worldcat scope.
    this.notWorldCat = function() {
      return (vm.search_scope == "Worldcat") ? false : true;
    }
  }

  // Add Libchat script to the document header.
  var libchat = document.createElement("script");
  libchat.src = "https://v2.libanswers.com/load_chat.php?hash=d01223b2d5b712cc1cf9015fef8fa534";
  document.head.appendChild(libchat);
}]);

app.component('prmSearchResultListAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'SearchResultListAfterController',
    templateUrl: 'custom/01CDL_SCR_INST-USCS/html/prmSearchResultListAfter.html',
});
```

## Template

This is our template as an example, yours will obviously need to be customized per your requirements and to match your scope values and view identifier.

```
<md-button id='findItButton' class='md-raised' onclick="document.getElementById('findItBox').scrollIntoView({behavior: 'smooth'});">Didn't Find It ?</md-button>
  <a name="findItBox"></a>
  <md-card id="findItBox">
  <md-card-title>
    <md-card-title-text>
      <span class="md-headline">Didn't find it?</span>
    </md-card-title-text>
  </md-card-title>
  <md-card-content>
      <div>
        <span class="md-subheadline">Chat with us for help</span>
        <p>We can help you find resources, start your research, cite your sources, and more!</p>
        <div id="libchat_d01223b2d5b712cc1cf9015fef8fa534"></div>
      </div>

      <div role="list" class="md-primoExplore-theme">
        <div>
          <span class="md-subheadline">Try your search again</span>
          <md-list-item role="listitem" class="_md-no-proxy _md">
            <div>
              <a href="/discovery/search?query={{$ctrl.queryString}}&tab={{$ctrl.tab}}&search_scope={{$ctrl.search_scope}}&vid={{$ctrl.vid}}&offset=0&pcAvailability=true" target="_self" class="img"><img src="custom/01CDL_SCR_INST-USCS/img/icon-article.png" width="35" height="35" alt="Article icon" /></a>
            </div>
            <div>
              <p><a href="/discovery/search?query={{$ctrl.queryString}}&tab={{$ctrl.tab}}&search_scope={{$ctrl.search_scope}}&vid={{$ctrl.vid}}&offset=0&pcAvailability=true" target="_self">Articles available by request</a></p>
              <p>Add articles available by Interlibrary Loan to your results</p>
            </div>
          </md-list-item>
          <md-list-item role="listitem" class="_md-no-proxy _md" ng-if="$ctrl.notWorldCat()">
            <div>
              <a href="/discovery/search?query={{$ctrl.queryString}}&tab=Worldcat&search_scope=Worldcat&vid={{$ctrl.vid}}&offset=0" target="_self" class="img"><img src="custom/01CDL_SCR_INST-USCS/img/worldcat.png" width="35" height="35" alt="Worldcat Logo" /></a>
            </div>
            <div>
              <p><a href="/discovery/search?query={{$ctrl.queryString}}&tab=Worldcat&search_scope=Worldcat&vid={{$ctrl.vid}}&offset=0" target="_self">Worldcat Search Scope</a></p>
              <p>Find items available by request from libraries worldwide</p>
            </div>
          </md-list-item>
        </div>

        <span class="md-subheadline" style="margin-top:15px;">Tell us what you need</span>
        <md-list-item role="listitem" class="_md-no-proxy _md align-center">
          <div>
            <a href="https://library.ucsc.edu/request-a-purchase" class="img"><img src="custom/01CDL_SCR_INST-USCS/img/icon-purchase.png" width="35" height="35" /></a>
          </div>
          <div>
            <p><a href="https://library.ucsc.edu/request-a-purchase">Request a Purchase</a></p>
          </div>
        </md-list-item>
        <md-list-item role="listitem" class="_md-no-proxy _md align-center">
          <div>
            <a href="/discovery/blankIll?vid=01CDL_SCR_INST%3AUSCS" class="img"><img src="custom/01CDL_SCR_INST-USCS/img/icon-ill.png" width="35" height="35" /></a>
          </div>
          <div>
            <p><a href="/discovery/blankIll?vid=01CDL_SCR_INST%3AUSCS">Manual Interlibrary Loan Form</a></p>
          </div>
        </md-list-item>
      </div>

  </md-card-content>
</md-card>
```
