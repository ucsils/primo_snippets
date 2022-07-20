# Overview

This enables display of HathiTrust information in Primo VE.  Since [emergency access](https://www.hathitrust.org/ETAS-Description) has ended, we display information and links only for public domain materials.

## Examples
- Search for [angeles ostrich farm](https://search.library.ucla.edu/discovery/search?query=any,contains,angeles%20ostrich%20farm&tab=LibraryCatalog&search_scope=MyInstitution&vid=01UCS_LAL:UCLA&offset=0) and see first result
- [Permalink to example record](https://search.library.ucla.edu/permalink/01UCS_LAL/trta7g/alma9922445633606533)

# Solution

This Javascript calls HathiTrust APIs to check each record in Primo VE results, searching HathiTrust by OCLC number.  If a match is found, and if other criteria are satisfied (title is out of copyright, is available full-text via HathiTrust, and possibly is not a journal), information and a link to HathiTrust display in the search results and on the full record.
- Dependencies: None, but this requires some ability to work with AngularJS.
- [Javascript in context](https://github.com/UCLALibrary/primo_ve/blob/main/01UCS_LAL-UCLA/js/custom.js#L7-L166)

## Installation instructions

See [instructions from CARLI](https://www.carli.illinois.edu/products-services/i-share/discovery-interface/custom_package_hathitrust), which is where we got this code.  I believe we implemented with no / minimal changes, and we have no local documentation different from CARLI's, and our developer is no longer at UCLA.

## CSS

No relevant CSS.  [CARLI has some](https://www.carli.illinois.edu/sites/files/i-share/documentation/HathiTrust_AddOn_CSS.txt) but we did not use it.

## Javacript

Add the following Javascript to whatever custom Javascript file is used.

```
 // HathiTrust Add-On - START
  angular.module('hathiTrustAvailability', []).constant('hathiTrustBaseUrl', 'https://catalog.hathitrust.org/api/volumes/brief/json/').config(['$sceDelegateProvider', 'hathiTrustBaseUrl', function ($sceDelegateProvider, hathiTrustBaseUrl) {
    var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
    urlWhitelist.push(hathiTrustBaseUrl + '**');
    $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
  }]).factory('hathiTrust', ['$http', '$q', 'hathiTrustBaseUrl', function ($http, $q, hathiTrustBaseUrl) {
    var svc = {};

    var lookup = function lookup(ids) {
      if (ids.length) {
        var hathiTrustLookupUrl = hathiTrustBaseUrl + ids.join('|');
        return $http.jsonp(hathiTrustLookupUrl, {
          cache: true,
          jsonpCallbackParam: 'callback'
        }).then(function (resp) {
        return resp.data;
        });
      } else {
        return $q.resolve(null);
      }
    };

    // find a HT record URL for a given list of identifiers (regardless of copyright status)
    svc.findRecord = function (ids) {
      return lookup(ids).then(function (bibData) {
        for (var i = 0; i < ids.length; i++) {
          var recordId = Object.keys(bibData[ids[i]].records)[0];
          if (recordId) {
            return $q.resolve(bibData[ids[i]].records[recordId].recordURL);
          }
        }
        return $q.resolve(null);
      }).catch(function (e) {
        console.error(e);
      });
    };

    // find a public-domain HT record URL for a given list of identifiers
    svc.findFullViewRecord = function (ids) {
      var handleResponse = function handleResponse(bibData) {
        var fullTextUrl = null;
        for (var i = 0; !fullTextUrl && i < ids.length; i++) {
          var result = bibData[ids[i]];
          for (var j = 0; j < result.items.length; j++) {
            var item = result.items[j];
            if (item.usRightsString.toLowerCase() === 'full view') {
              fullTextUrl = result.records[item.fromRecord].recordURL;
              fullTextUrl = fullTextUrl + '_PD';
              break;
            }
          }
        }
        return $q.resolve(fullTextUrl);
      };
      return lookup(ids).then(handleResponse).catch(function (e) {
        console.error(e);
      });
    };

    return svc;
  }]).controller('hathiTrustAvailabilityController', ['hathiTrust','$scope', '$location', '$mdDialog', '$anchorScroll', function (hathiTrust, $scope, $location, $mdDialog, $anchorScroll) {
    var self = this;

    self.$onInit = function () {
      if (!self.msg) self.msg = 'Full Text Available at HathiTrust';

      // prevent appearance/request iff 'hide-online'
      if (self.hideOnline && isOnline()) {
        return;
      }

      // prevent appearance/request iff 'hide-if-journal'
      if (self.hideIfJournal && isJournal()) {
        return;
      }

      // look for full text at HathiTrust
      updateHathiTrustAvailability();
    };

    var isJournal = function isJournal() {
      var format = self.prmSearchResultAvailabilityLine.result.pnx.addata.format[0];
      return !(format.toLowerCase().indexOf('journal') == -1); // format.includes("Journal")
    };

    var isOnline = function isOnline() {
      var delivery = self.prmSearchResultAvailabilityLine.result.delivery || [];
      if (!delivery.GetIt1) return delivery.deliveryCategory.indexOf('Alma-E') !== -1;
      return self.prmSearchResultAvailabilityLine.result.delivery.GetIt1.some(function (g) {
        return g.links.some(function (l) {
          return l.isLinktoOnline;
        });
      });
    };

    var formatLink = function formatLink(link) {
      if ( link.match(/_PD$/i) ){
        link = link.substring(0, link.length - 3);
        self.fullTextLinkMsg = 'Available online with HathiTrust - Public Domain Access';
      } else {
        self.fullTextLinkMsg = 'Error - ' + link;
      }
      return link;
    };

    var isOclcNum = function isOclcNum(value) {
      return value.match(/^(\(ocolc\))+\d+$/i);
    };

    var updateHathiTrustAvailability = function updateHathiTrustAvailability() {
      var hathiTrustIds = (self.prmSearchResultAvailabilityLine.result.pnx.addata.oclcid || []).filter(isOclcNum).map(function (id) {
        return 'oclc:' + id.toLowerCase().replace('(ocolc)', '');
      });
      hathiTrust[self.ignoreCopyright ? 'findRecord' : 'findFullViewRecord'](hathiTrustIds).then(function (res) {
        if (res) self.fullTextLink = formatLink(res);
      });
    };
  }]).component('hathiTrustAvailability', {
    require: {
      prmSearchResultAvailabilityLine: '^prmSearchResultAvailabilityLine'
    },
    bindings: {
      entityId: '@',
      ignoreCopyright: '<',
      hideIfJournal: '<',
      hideOnline: '<',
      msg: '@?'
    },
    controller: 'hathiTrustAvailabilityController',
    template: '<span ng-if="$ctrl.fullTextLink" class="umnHathiTrustLink">\
        <md-icon alt="HathiTrust Logo">\
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 16 16" enable-background="new 0 0 16 16" xml:space="preserve">  <image id="image0" width="16" height="16" x="0" y="0"\
                      xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJN\
                      AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACNFBMVEXuegXvegTsewTveArw\
                      eQjuegftegfweQXsegXweQbtegnsegvxeQbvegbuegbvegbveQbtegfuegbvegXveQbvegbsfAzt\
                      plfnsmfpq1/wplPuegXvqFrrq1znr2Ptok/sewvueQfuegbtegbrgRfxyJPlsXDmlTznnk/rn03q\
                      pVnomkjnlkDnsGnvwobsfhPveQXteQrutHDqpF3qnUnpjS/prmDweQXsewjvrWHsjy7pnkvqqGDv\
                      t3PregvqhB3uuXjusmzpp13qlz3pfxTskC3uegjsjyvogBfpmkHpqF/us2rttXLrgRjrgBjttXDo\
                      gx/vtGznjzPtfhHqjCfuewfrjCnwfxLpjC7wtnDogBvssmjpfhLtegjtnEjrtnTmjC/utGrsew7s\
                      o0zpghnohB/roUrrfRHtsmnlkTbrvH3tnEXtegXvegTveQfqhyHvuXjrrGTpewrsrmXqfRHogRjt\
                      q2Dqewvqql/wu3vqhyDueQnwegXuegfweQPtegntnUvnt3fvxI7tfhTrfA/vzJvmtXLunEbtegrw\
                      egTregzskjbsxI/ouoPsqFzniyrz2K3vyZnokDLpewvtnkv30J/w17XsvYXjgBbohR7nplnso1L0\
                      1Kf40Z/um0LvegXngBnsy5juyJXvsGftrGTnhB/opVHoew7qhB7rzJnnmErkkz3splbqlT3smT3t\
                      tXPqqV7pjzHvunjrfQ7vewPsfA7uoU3uqlruoEzsfQ/vegf///9WgM4fAAAAFHRSTlOLi4uLi4uL\
                      i4uLi4uLi4tRUVFRUYI6/KEAAAABYktHRLvUtndMAAAAB3RJTUUH4AkNDgYNB5/9vwAAAQpJREFU\
                      GNNjYGBkYmZhZWNn5ODk4ubh5WMQERUTl5CUEpWWkZWTV1BUYlBWUVVT19BUUtbS1tHV0zdgMDQy\
                      NjE1MzRXsrC0sraxtWOwd3B0cnZxlXZz9/D08vbxZfDzDwgMCg4JdQsLj4iMio5hiI2LT0hMSk5J\
                      TUvPyMzKzmHIzcsvKCwqLiktK6+orKquYZCuratvaGxqbmlta+8QNRBl6JQ26Oru6e3rnzBx0uQ8\
                      aVGGvJopU6dNn1E8c9bsOXPniYoySM+PXbBw0eIlS5fl1C+PFRFlEBUVXbFy1eo1a9fliQDZYIHY\
                      9fEbNm7avEUUJiC6ddv2HTt3mSuBBfhBQEBQSEgYzOIHAHtfTe/vX0uvAAAAJXRFWHRkYXRlOmNy\
                      ZWF0ZQAyMDE2LTA5LTEzVDE0OjA2OjEzLTA1OjAwNMgVqAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAx\
                      Ni0wOS0xM1QxNDowNjoxMy0wNTowMEWVrRQAAAAASUVORK5CYII=" />\
                      </svg> \
        </md-icon>\
        <a target="_blank" ng-href="{{$ctrl.fullTextLink}}">\
            {{ ::$ctrl.fullTextLinkMsg }}\
            <prm-icon external-link="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="open-in-new"></prm-icon>\
        </a>\
    </span>'
  });
```

## Configuration

No Alma configuration required.  The code has a few options, described in the CARLI documentation linked above.

## Testing

Search for monographics published in the U.S. before 1926, which I think is the current public domain cutoff.  Not all will be available from HathiTrust, so search for titles in your catalog which you know are held by HT.

## Credits

Many thanks to [CARLI](https://www.carli.illinois.edu/products-services/i-share/discovery-interface/custom_package_hathitrust) for sharing their code and documentation.
