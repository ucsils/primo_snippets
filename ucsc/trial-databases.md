# Overview

Identifies trial journals and databases and adds an icon next to their title.

## Keywords
"trial database", "trial journal", journals, trial

# Solution

Our catalogers have added a local discovery field to identify trial databases. When the prmSearchResultJournalIndicationLineAfter finds a record with this field, it appends an icon to the title.

## CSS

```
/* Identify trial databases */
.trial-indicator { margin-top: 8px; }
.trial-indicator img {
  position: relative;
  width: 20px;
  height: 20px;
}
.trial-indicator span {
  position: relative;
  top: -5px;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 12px;
}
```

## Javacript

LDS13 is our local discovery field, and will need to be adjusted to match yours. Note the URL of our icon will need to be adjusted per your own view URL structure.

```
app.component('prmSearchResultJournalIndicationLineAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmSearchResultJournalIndicationLineAfter',
    template: `<div class="trial-indicator"></div>`,
});

app.controller('prmSearchResultJournalIndicationLineAfter', ['$scope', '$rootScope', function($scope, $rootScope){
  this.$onInit = function () {
    var vm = this;
    if(typeof vm.parentCtrl.item.pnx.display.lds13 !== "undefined") {
      if (vm.parentCtrl.item.pnx.display.lds13.indexOf('*TRIALS*') >= 0) {
        var briefRecordID = "SEARCH_RESULT_RECORDID_alma" + vm.parentCtrl.item.pnx.display.mms;
        var fullRecordID = briefRecordID + "_FULL_VIEW";
        if (document.getElementById(briefRecordID)) {
          var recordID = briefRecordID;
        }
        if (document.getElementById(fullRecordID)) {
          var recordID = fullRecordID;
        }
        var trialNode = document.getElementById(recordID).getElementsByClassName("trial-indicator")[0];
        trialNode.innerHTML = '<img src="/discovery/custom/01CDL_SCR_INST-USCS/img/stopwatch.png" width="20" height="20" /><span>Trial Database</span>';
      }
    }
  }
}]);
```

## Configuration

Under Configuration > Discovery > Manage Display and Local Fields. We checked none of the local field details checkboxes, and mapped ours to Marc 959. Our implementation doesn't require any specific text in the field, but if any text is in this field the trial indicator appears.
