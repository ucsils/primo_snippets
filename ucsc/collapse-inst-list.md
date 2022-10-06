# Overview

Collapses the consortial institution list by default on the GetIt tab of the full record view.

## Examples
[See 'Other UC Libraries' under Get It section](https://ucsc.primo.exlibrisgroup.com/permalink/01CDL_SCR_INST/1jiojor/alma991025570154504876)

## Keywords
institutions, "institution list", getit

# Solution

A simple function switches the isCollapsed attribute using the prmAlmaOtherMembersAfter component.

## Javacript

```
app.controller('prmAlmaOtherMembersAfterController', [function () {
  /**
   * On page load, hide libraries
   */
  this.$onInit = function () {
    this.parentCtrl.isCollapsed = true;
  };
}]);

app.component('prmAlmaOtherMembersAfter', {
  bindings: {
    parentCtrl: '<'
  },
  controller: 'prmAlmaOtherMembersAfterController',
  template: ''
});

```

## Credits

Code by David Walker of California State University libraries, https://github.com/dswalker/csu-central-package
