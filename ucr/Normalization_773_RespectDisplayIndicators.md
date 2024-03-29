# Overview

This Primo Display normalization rule forces Primo to respect the first indicator in the 773 field. The small change can be applied to other display fields that Ex Libris forgot to account for.

## Examples

- Source MARC record: https://search.library.ucr.edu/discovery/sourceRecord?vid=01CDL_RIV_INST:UCR&docId=alma991025587109704706&recordOwner=01UCS_NETWORK
- MMSID: 9914397860206531
- MARC Field: 773 1# $t Dark Horse Comics Collection at Portland State University.
- Primo Display: Is Part Of Dark Horse Comics Collection at Portland State University.
- MARC Bibliographic Standards: https://www.loc.gov/marc/bibliographic/bd773.html


# Solution

The solution is to define a display field and modify the normalization rule so that it will only generate a display if the record has a 773 field, AND the first indicator is 0.

Default code

"WHEN the record has 773 with any of these subfields (t,w,x, or z) AND there is nothing in subfield 9, THEN..." 

```
when
		MARC."773" has any "t,w,x,z" AND
		MARC."773"."9" not match ".*"
then ...
```

(There is also a version where it creates a different display if there is a subfield 9)

The fix adds another check.
"WHEN the record has 773 with any of these subfields (t,w,x, or z) AND there is nothing in subfield 9, AND the first indicator equals 0, THEN..." 

```
when
		MARC."773" has any "t,w,x,z" AND
		(MARC."773"."9" not match ".*" AND
		MARC."773".ind"1" equals "0")
then
```

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



## Normalization Code


```
rule "Primo VE - Ispartof 773 without 9"
	when
		MARC."773" has any "t,w,x,z" AND
		(MARC."773"."9" not match ".*" AND
		MARC."773".ind"1" equals "0")
	then
		set TEMP"1" to MARC "773" excluding subfields without sorting or default "u|w|x|y|z|9"
		set TEMP"2" to MARC."773" sub without sort or empty "t"
		remove substring using regex (TEMP"2","(/|:|;|=|,)+$")
        add prefix (TEMP"2","$$Q")
        remove substring using regex (TEMP"2","^$$Q$")
        set TEMP"3" to MARC."773" prima_w_relation "w"
		set TEMP"4" to MARC."773" prima_x_relation "x"
		set TEMP"5" to MARC."773" prima_x_relation "z"
        concatenate with delimiter (TEMP"1",TEMP"2","")
        concatenate with delimiter (TEMP"1",TEMP"3","")
		concatenate with delimiter (TEMP"1",TEMP"4","")
		concatenate with delimiter (TEMP"1",TEMP"5","")
        create pnx."display"."ispartof" with TEMP"1"
end

rule "Primo VE - Ispartof 773 with 9"
	when
		MARC."773" has any "t,w,x,z" AND
		(MARC."773"."9" match ".*" AND
		MARC."773".ind"1" equals "0")
	then
		set TEMP"1" to MARC "773" excluding subfields without sorting or default "i|u|w|x|y|z|9"
		set TEMP"2" to MARC."773" sub without sort or empty "t"
		remove substring using regex (TEMP"2","(/|:|;|=|,)+$")
        add prefix (TEMP"2","$$Q")
        remove substring using regex (TEMP"2","^$$Q$")
        set TEMP"3" to MARC."773" prima_w_relation "w"
		set TEMP"4" to MARC."773" prima_x_relation "x"
		set TEMP"5" to MARC."773" prima_x_relation "z"
        concatenate with delimiter (TEMP"1",TEMP"2","")
        concatenate with delimiter (TEMP"1",TEMP"3","")
		concatenate with delimiter (TEMP"1",TEMP"4","")
		concatenate with delimiter (TEMP"1",TEMP"5","")
		set TEMP"6" to MARC."773" subfields "9"
        add prefix (TEMP"6","$$9")
        concatenate with delimiter (TEMP"1",TEMP"6","")
        create pnx."display"."ispartof" with TEMP"1"
end


rule "Primo VE - Ispartof 880-773 without 9"
	when
        MARC."880" has any "t,w,x,z" AND
        MARC."880"."6" match "773-.*" AND
		MARC."880"."9" not match "773-.*"
	then
		set TEMP"1" to MARC "880" excluding subfields without sorting or default "u|w|x|y|z|9"
		set TEMP"2" to MARC."880" sub without sort or empty "t"
		remove substring using regex (TEMP"2","(/|:|;|=|,)+$")
        add prefix (TEMP"2","$$Q")
        remove substring using regex (TEMP"2","^$$Q$")
        concatenate with delimiter (TEMP"1",TEMP"2","")
        create pnx."display"."ispartof" with TEMP"1"
end


rule "Primo VE - Ispartof 880-773 with 9"
	when
        MARC."880" has any "t,w,x,z" AND
        MARC."880"."6" match "773-.*" AND
		MARC."880"."9" match "773-.*"
	then
		set TEMP"1" to MARC "880" excluding subfields without sorting or default "i|u|w|x|y|z|9"
		set TEMP"2" to MARC."880" sub without sort or empty "t"
		remove substring using regex (TEMP"2","(/|:|;|=|,)+$")
        add prefix (TEMP"2","$$Q")
        remove substring using regex (TEMP"2","^$$Q$")
        concatenate with delimiter (TEMP"1",TEMP"2","")
       	set TEMP"3" to MARC."880" subfields "9"
        add prefix (TEMP"3","$$9")
        concatenate with delimiter (TEMP"1",TEMP"3","")
        create pnx."display"."ispartof" with TEMP"1"
end

```


## Testing

You will know the code worked when you look at a record in Primo that has a 773 with indicator 1 and that metadata is NOT displayed.

Because the implementation is immediate, you can have an offending record open, apply the rule, and refresh the record. You should see the 773 disappear (unless it has 1st indicator 0)

## Credits

Adapted from reviewing https://developers.exlibrisgroup.com/blog/primo-ve-normalization-rule-examples/
