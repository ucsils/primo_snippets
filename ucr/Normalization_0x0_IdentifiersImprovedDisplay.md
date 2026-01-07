# Overview

Out of the box, identifiers in the Primo Full Display were confusing to users because they displayed ISBNs and ISSNs that were associated with other forms of the work but not for the item being described by the record. This was due to the default Identifier normalization rule including the identifiers from the 776 Additional Physical Form field.

UCR suppressed the rules that included the 776, and reordered the rules so that the display would generate identifiers in an order that seemed most helpful to most users. For example, the Library of Congress Control number is helpful for librarians, but not to undergraduates, so it was moved towards the bottom.

## Examples

- <https://search.library.ucr.edu/permalink/01CDL_RIV_INST/14qc2ti/alma991014143949704706>
- <https://search.library.ucr.edu/permalink/01CDL_RIV_INST/1a599u0/alma991008284129704706>
- <https://search.library.ucr.edu/permalink/01CDL_RIV_INST/14qc2ti/alma991000041849704706>

# Solution

The default rule creates displays in this order:

- 020 ISBN
- 776z Additional Physical Form ISBN
- 022 ISSN
- 776 Additional Physical Form ISSN
- 024 Other Standard Identifier
- 035 System Control Number
- 010 Library of Congress Control Number
- 028 Publisher Number
- 086 Gov Doc class number
- 084 Other Classification Number

UCR's solution creates displays in this order:

- 020 ISBN
- 022 ISSN
- 024 Other Standard Identifier
- 028 Publisher Number
- 086 Gov Doc class number
- 084 Other Classification Number
- 035 System Control Number
- 010 Library of Congress Control Number

The result ensures that the identifiers are in order and all apply to the items described by the record.

Another solution could have kept the 776 fields but altered the prefix to indicate that the number was for a different physical form. However, because Related Titles can create a hyperlink to the other record already, this was determined to be unnecessary.

## Installation instructions

In Alma Configuration, navigate to: Discovery > Display Configuration > Manage Display and Local Fields

- Add Field
- Add Display Field
- Select Field to edit
- Edit MARC21 normalization rule for display
- Delete the default code
  - (you can always get it back by selecting "restore default")
- Paste the new normalization code
- Save
- Click Back
- Select Apply Rules
  - **(THIS IS IMPORTANT. Changes will not update in Primo until the rules have been applied. Once the rules are applied, changes are immediate.)**

## Normalization Rule

The following code has the original 776 z and x code intact, but they are commented out to keep them from being displayed.

```
rule "Primo VE - Identifier 020"
 when
  MARC is "020"."a"
 then
  set TEMP"1" to MARC "020"."a"
  add prefix (TEMP"1","$$CISBN$$V")
  create pnx."display"."identifier" with TEMP"1"
end

#rule "Prima Display - ISBN 776"
#UCR: 776z is for OTHER forms, not the record described.
# when
#        MARC is "776"."z"
#    then
#  set TEMP"1" to MARC "776"."z"
#  add prefix (TEMP"1","$$CISBN$$V")
#  create pnx."display"."identifier" with TEMP"1"
#end

rule "Primo VE - Identifier 022"
 when
  MARC is "022"."a"
 then
  set TEMP"1" to MARC "022"."a"
  add prefix (TEMP"1","$$CISSN$$V")
  create pnx."display"."identifier" with TEMP"1"
end

#rule "Prima Display - ISSN 776"
#UCR: 776x is for OTHER forms, not the record described.
# when
#        MARC is "776"."x"
# then
#  set TEMP"1" to MARC "776"."x"
#  add prefix (TEMP"1","$$CISSN$$V")
#  create pnx."display"."identifier" with TEMP"1"
#end

rule "Primo VE - Identifier 024"
 when
  MARC is "024"."a" AND
  MARC."024".ind"1"  equals "2"
 then
  set TEMP"1" to MARC "024"."a"
  add prefix (TEMP"1","$$CISMN$$V")
  create pnx."display"."identifier" with TEMP"1"
end

rule "Primo VE - Identifier 028"
 when
  MARC is "028"."a"
 then
  set TEMP"1" to MARC "028"."a"
  add prefix (TEMP"1","$$CPUBNUM$$V")
  create pnx."display"."identifier" with TEMP"1"
end

rule "Primo VE - Identifier 086"
 when
  MARC is "086"."a"
 then
  set TEMP"1" to MARC."086"."a"
  add prefix (TEMP"1","$$CGOVDOC$$V")
  create pnx."display"."identifier" with TEMP"1"
end

rule "Primo VE - Identifier 084"
 when
  (MARC is "084"."a" AND
        (MARC."084"."2" match "NDC.*" OR
        MARC."084"."2" match "njb.*"))
 then
    set TEMP"1" to MARC."084"."a"
    add prefix (TEMP"1","$$CNDC$$V")
    create pnx."display"."identifier" with TEMP"1"
end


rule "Primo VE - Identifier 035"
 when
      MARC is "035"."a" AND
      MARC."035"."a" match ".*OCoLC.*"
 then
  set TEMP"1" to MARC "035"."a"
  add prefix (TEMP"1","$$COCLC$$V")
  create pnx."display"."identifier" with TEMP"1"
end

rule "Primo VE - Identifier 010"
 when
  MARC is "010"."a"
 then
  set TEMP"1" to MARC "010"."a"
  add prefix (TEMP"1","$$CLC$$V")
  create pnx."display"."identifier" with TEMP"1"
end

```

## Credits

Adapted from reviewing <https://developers.exlibrisgroup.com/blog/primo-ve-normalization-rule-examples/>
