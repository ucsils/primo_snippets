# Overview

This enables the display of digital bookplates in the brief and full record display based on strings in the local fields (lds04 in the pnx record)

## Examples
- Search for [honor with books](https://uci.primo.exlibrisgroup.com/discovery/search?query=any,contains,%22honor%20with%20books%22&tab=Everything&search_scope=DN_Filtered&vid=01CDL_IRV_INST:UCI&offset=0) 

# Solution

This Javascript retrieves the local field text from the pnx record and checks for the presence of a specific string. If the string is present, html is added to the "prmSearchResultAvailabilityLineAfter" directive that displays text and a link to more information.

## Installation instructions

There are two parts to installing this code. The css below should be placed in the customization package inside the css/custom1.css file in the view folder. The Javascript below should be placed in the customization package inside the js/custom.js file in the view folder.

## CSS

```
/*bookplate*/
.bookplate{
  background-color: #293990;
  text-align: center;
  color: #ffff;
  width: 200px;
  height: 300px;
  font-family: Didot, serif;
  border: 3px double white;
}
button.bookplateBtn {
  border: 1px solid #293990;
}
.bookplateLink {
  display:table;
  padding:5px;
  border: 2px solid #FFD200;
}
.bookplateLinkText {
  display:table-cell;
  vertical-align: middle;
  font-weight: bold;
}
```

## Javacript

Add the following Javascript to whatever custom Javascript file is used.

```
 /* Digital bookplates display*/
  app.controller('digitalBookTitleButtonController', ['$scope', '$location', '$mdDialog', '$anchorScroll', function($scope, $location, $mdDialog, $anchorScroll){
    let vm = this;
    this.$onInit = function() {
    $scope.display = vm.parentCtrl.result.pnx.display;
    let bookplateText = $scope.display.lds04;

    //Check whether the bookplate text is present in the local field 4. Change the target field in the pnx based on where your bookplate info is located.
    $scope.hasBookplate = function() {
      return ($scope.display.lds04 != null && $scope.display.lds04 != '' && (JSON.stringify($scope.display.lds04).includes("Purchased by") || JSON.stringify($scope.display.lds04).includes("purchased by") || JSON.stringify($scope.display.lds04).includes("Honor with Books")));
    }

    //Get wording for specific bookplate display text
    $scope.getBookplateText = function() {
      let text = JSON.stringify($scope.display.lds04);
      if(text.includes("Verle and Elizabeth")){
        return "purchased by the Verle and Elizabeth Annis Library Endowed Fund";
      } else if(text.includes("Carole Creek Bailey")){
        return "purchased by the Carole Creek Bailey Library Endowed Fund";
      } else if(text.includes("Forest J. and Dolores")){
        return "purchased by the Forest J. and Dolores S. Grunigen Library Endowed Fund";
      } else if(text.includes("Nors S. Josephson")){
        return "purchased by the Nors S. Josephson and Waltraut Abstein-Josephson Library Endowed Fund";
      } else if(text.includes("Sylvia Holden Robb")){
        return "purchased by the Sylvia Holden Robb Library Endowed Fund";
      } else if(text.includes("Salinger Family")){
        return "purchased by the Salinger Family Library Endowed Fund";
      } else if(text.includes("John and Elizabeth Stahr")){
        return "purchased by the John and Elizabeth Stahr Library Fund";
      } else if(text.includes("Honor with Books")) {
        let bookplateTextArray = JSON.stringify(bookplateText).split("(");
        let bookplateButton = bookplateTextArray[0];
        if(bookplateTextArray.length == 1){
          bookplateButton = bookplateTextArray[0].split(":")[1];
          let fundTextArray = bookplateTextArray[0].split("purchased by the");
          bookplateTextArray[0] = fundTextArray[1];
          bookplateTextArray.push("");
        }
        return bookplateButton.replace("\"]","").replace("[\"","");
      } else {
        return "View Bookplate";
      }
    }

    //Set URL for the bookplate link based on the bookplate text
    $scope.getBookplateLink = function() {
      let text = JSON.stringify($scope.display.lds04);
      if(text.includes("purchased by the Verle and Elizabeth")){
        return "https://give.lib.uci.edu/bookplate-annis";
      } else if(text.includes("purchased by the Carole Creek Bailey")){
        return "https://give.lib.uci.edu/bookplate-bailey";
      } else if(text.includes("purchased by the Forest J. and Dolores")){
        return "https://partners.lib.uci.edu/bookplate-grunigen";
      } else if(text.includes("purchased by the Nors S. Josephson")){
        return "https://partners.lib.uci.edu/bookplate-josephson";
      } else if(text.includes("purchased by the Sylvia Holden Robb")){
        return "https://partners.lib.uci.edu/bookplate-robb";
      } else if(text.includes("purchased by the Salinger Family")){
        return "https://partners.lib.uci.edu/bookplate-salinger";
      } else if(text.includes("John and Elizabeth Stahr")){
        return "https://partners.lib.uci.edu/bookplate-stahr";
      } else if(text.includes("Honor with Books")) {
        return "https://give.lib.uci.edu/honor-with-books";
      } else {
        return '';
      }
    }
  };

  }]);



  app.component('prmSearchResultAvailabilityLineAfter', {
    bindings: { parentCtrl: '<'},
    controller: 'digitalBookTitleButtonController',
    template: '<div ng-if="hasBookplate()"><a href="{{getBookplateLink()}}"  class="bookplateLink" ><span><img src="https://www.lib.uci.edu/sites/all/images/primo/seal-white.png" width="50px" height="50px" style="background-color: #293990; margin: 2px"></span><div class="bookplateLinkText">{{getBookplateText()}}</div></a></div>'
  });
```

## Configuration

In order for our code to have access to the specific text placed in the 590 field the 590 was mapped to local field 4 and indexed for search. Depending on which local field is used you may have to modify the Javascript above with the appropriate target field in the pnx record. You may also need to customize the template in the Javascript above to display your bookplates as desired.

## Testing

Search for the relevant bookplate text and the bookplate should display in the brief results as well as the full record display

