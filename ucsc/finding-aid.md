# Overview

Adds a finding aid to the brief results, both on the search results page and the full result. Finding aid links are pulled from the links in the metadata record, so this could be used more generally to add any links to to the brief results. Also included is an example of adding an arbitrary link to a brief result based on item metadata.

## Examples
[A finding aid in the links added to search results](https://ucsc.primo.exlibrisgroup.com/discovery/search?query=any,contains,Ruth-Marion%20Baruch&tab=Everything&search_scope=MyInst_and_CI&vid=01CDL_SCR_INST:USCS&offset=0)
[A link on a full result page based on item metadata](https://ucsc.primo.exlibrisgroup.com/permalink/01CDL_SCR_INST/1jiojor/alma991010132179704876)

## Keywords
"finding aid", "brief results", "search results", links

# Solution

Uses the prmBriefResultContainerAfter component to add links to the brief result. The code watches for item links to load, and if any link text matches a pre-determined string, that link is added to the brief results. When the page loads, locations are checked on an interval (this can probably be optimized) and when a match is found a link is added to the brief results. This can be adapted to check for any specific metadata to add links.

## CSS

Add the following CSS to whatever custom CSS file is used.
```
prm-brief-result-container.list-item:hover #briefResultAfterFindingAid {
  background-color: #f5f8fa;
}
#briefResultAfterFindingAid {
  padding-bottom: 1em;
}
#briefResultAfterFindingAid > .finding-aid-brief {
  padding-left: 102px;
}
#briefResultAfterFindingAid > .finding-aid-full {
  padding-left:142px;
}
#briefResultAfterFindingAid md-icon.folder {
  height: 15px;
  width: 15px;
  min-width: 15px;
  min-height: 15px;
  position: relative;
  top: -2px;
  color: #ccc;
}
```

## Javacript

Add the following Javascript to whatever custom Javascript file is used.

```
app.controller('prmBriefResultContainerAfterCtrl',['$location','$scope',function ($location,$scope) {
    var vm = this;
    vm.cssClass = 'finding-aid-brief';
    vm.findingAid = {'displayLabel':'','linkURL':'','newLinkURL':''};
    vm.$onInit = () => {
        // get links data from primo parent-ctrl binding data
        $scope.$watch('vm.parentCtrl.links',()=>{
            if(vm.parentCtrl.links) {
                for(var i=0; i < vm.parentCtrl.links.length; i++) {
                    var linkItem = vm.parentCtrl.links[i];
                    if(linkItem.displayLabel === 'Collection guide')  {
                        vm.linkText = 'Collection Guide';
                        updateBriefLink(linkItem);
                        i = vm.parentCtrl.links.length;
                    }
                    if(linkItem.displayLabel === 'For user guides or to request extended checkout visit')  {
                        vm.linkText = 'Equipment Information and Guides';
                        updateBriefLink(linkItem);
                        i = vm.parentCtrl.links.length;
                    }
                }
            }
        });
    };
    // Locations lag, use an interval
    angular.element(document).ready(function() {
        let locationsCount = 0;
        var locationsInterval = window.setInterval(function(){
            if (locationsCount > 20) {
                clearInterval(locationsInterval);
            }
            if (vm.parentCtrl.item && vm.parentCtrl.item.delivery && vm.parentCtrl.item.delivery.bestlocation) {
                clearInterval(locationsInterval);
                const locations = ['setas', 'meddg'];
                let locationCode = vm.parentCtrl.item.delivery.bestlocation.subLocationCode;
                if (locationCode && locations.includes(locationCode)) {
                    var linkItem = new Object();
                    vm.linkText = 'Aerial Photos Guide';
                    linkItem.linkURL = 'https://guides.library.ucsc.edu/maps';
                    updateBriefLink(linkItem);
                }
            }
            locationsCount++;
        }, 500);
    });

   function updateBriefLink(linkItem) {
        vm.findingAid = linkItem;
        vm.findingAid.newLinkURL = linkItem.linkURL ? linkItem.linkURL : '';
        // add more padding when it is full display page
        var param = $location.search();
        if(param.docid) {
            vm.cssClass = 'finding-aid-full';
        }
    }
}]);

app.component('prmBriefResultContainerAfter',{
    bindings: {parentCtrl:'<'},
    controller: 'prmBriefResultContainerAfterCtrl',
    controllerAs: 'vm',
    templateUrl: 'custom/your-view-code-here/html/prmBriefResultContainerAfter.html'
});
```

## Template

```
<div id="briefResultAfterFindingAid" ng-if="vm.findingAid.newLinkURL">
    <div class="{{vm.cssClass}}">
        <md-icon md-svg-src="custom/01CDL_SCR_INST-USCS/img/ic_folder_open_black_24px.svg" class="md-primoExplore-theme folder" aria-label="{{vm.linkText}}"></md-icon>
        <a tabindex="0" class="md-ink-ripple" aria-label="{{vm.linkText}}" title="{{vm.linkText}}" href="{{vm.findingAid.newLinkURL}}" target="_blank">
            <span>{{vm.linkText}}</span>
            <md-icon md-svg-icon="primo-ui:open-in-new" class="md-primoExplore-theme" aria-hidden="true" style="height: 15px; width: 15px; min-height: 15px; min-width: 15px; margin-top: -2px;"><svg width="100%" height="100%" viewBox="0 0 24 24" y="504" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"></path></svg></md-icon>
        </a>
    </div>
</div>

```

## Credits

Thanks to Corinna Baksik at Harvard libraries. Code adapted from https://github.com/cbaksik/HVD2
