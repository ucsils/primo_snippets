
## Overview

This rule modifies the MARC 540 display field for "Terms governing use and reproduction" so that $u is visible and formatted as a clickable link. This field is the URL back to the Creative Commons license page that outlines the details of the available license. 

## Normalization rule for Display

```
rule "Primo VE - Lds##"
	when
		MARC is "540"
	then
## Create clickable 540 $u link	
        set TEMP"1" to MARC."540" subfields "u"
		set TEMP"2" to MARC."540" subfields "u"
        add suffix  (TEMP"2","</a>")
        add suffix  (TEMP"1","\">")
        add prefix (TEMP"1","<a target=\"_blank\" href=\"")
        concatenate with delimiter (TEMP"1",TEMP"2","")
## combine subfields a and u
        set TEMP"3" to MARC."540" subfields "a"
        concatenate with delimiter (TEMP"3",TEMP"1"," ")
        create pnx."display"."lds20" with TEMP"3" 
    end

rule "Primo VE - Lds## 880-540"
	when
        MARC is "880"."a" AND
        MARC."880"."6" match "540-.*"
	then
        create pnx."display"."lds20" with MARC "880"."a"
end
```

## Related Documentation
[How to create clickable link - Ex Libris Knowledge Center](https://knowledge.exlibrisgroup.com/Primo/Knowledge_Articles/How_to_create_clickable_link_in_Primo_VE%3F_(hypertext_link))