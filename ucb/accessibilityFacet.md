## Overview 

UC Berkeley defined a local field for search and facet that maps metadata describing accessible resource formats.

Normalization rules for search and display are available for other institutions to use if they wish to define an "Accessibility Information" facet.

## Scope

UCB's Accessibility Information facet at this time only maps braille materials, but will exapand to include audiovisual materials, audiobooks, large print, etc. Discovery is working with head of Metadata Services to confirm MARC mapping conditions are accurate.

The normalization rules only map items from the UCB IZ. NZ and digital resources are not captured by the normalization rule. 

## Normalization Rule for Display

### Braille materials
```
rule "Primo VE - Lds##"

when

	(MARC.control."LDR"(6-7) matches "a|c|d|i|j|p|t" AND
	
	MARC.control."008"(23-24) equals "f") OR
	
	(MARC.control."LDR"(6-7) matches "e|f|g|k|o|r" AND
	
	MARC.control."008"(29-30) equals "f")

then

	create pnx."display"."lds## with "Braille"

end

  

rule "Primo VE - Lds##/2"

when

(MARC is "341"."e" AND

MARC."341"."e" match "braille|Braille") OR

(MARC is "546"."a" AND

MARC."546"."a" match "braille|Braille") OR

(MARC is "655"."a" AND

MARC."655"."a" match "braille|Braille")

then

create pnx."display"."lds##" with "Braille"

end

**
```

## Related Documentation
**

- [Cataloging Materials in Braille - SILS Documentation Site](https://www.lib.berkeley.edu/Staff/staff-docs/sils/resource-management/cataloging-materials-in-braille) 
- [Mapping to the Display, Facets, and Search Sections in the Primo VE Record - Ex Libris Knowledge Center](https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/020Primo_VE/Primo_VE_\(English\)/120Other_Configurations/Mapping_to_the_Display%2C_Facets%2C_and_Search_Sections_in_the_Primo_VE_Record#Resource_Type_Mapping)     
- [Configuring Local Search and Facet Fields for Primo VE - Ex Libris Knowledge Center](https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/020Primo_VE/Primo_VE_\(English\)/120Other_Configurations/Configuring_Local_Search_and_Facet_Fields_for_Primo_VE)
- [Configuring Normalization Rules for Display and Local Fields - Ex Libris Knowledge Center](https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/020Primo_VE/Primo_VE_\(English\)/050Display_Configuration/Configuring_Normalization_Rules_for_Display_and_Local_Fields)
- 