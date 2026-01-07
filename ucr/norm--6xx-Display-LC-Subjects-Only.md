@@ -0,0 +1,51 @@

# Overview

Out of the box, Primo displays all of the 6xx fields regardless of indicators or source. This can lead to a lot of duplicate subject headings as well as foreign subject headings that are not in use by an institution. The end result can be an unnecessarily cluttered Full Record Display.

| Tag | Ind | Term | Subdivision | Thesaurus |
|---|---|---|---|---|
| 650 | #0 | Biological rhythms  | $vCongresses. | 0 - Library of Congress Subject Headings |
| 650 | #0 | Marine ecology | $vCongresses. | 0 - Library of Congress Subject Headings |
| 650 | #0 | Biological rhythms. |  | 0 - Library of Congress Subject Headings |
| 650 | #0 | Ecology. |  | 0 - Library of Congress Subject Headings |
| 650 | #0 | Marine biology. |  | 0 - Library of Congress Subject Headings |
| 650 | #0 | Marine biology  | $xCongresses. | 0 - Library of Congress Subject Headings |
| 650 | #6 | Rythme (Biologie)  | $xCongrès. | 6 - Répertoire de vedettes-matière |
| 650 | #6 | Écologie marine | $vCongrès. | 6 - Répertoire de vedettes-matière |
| 650 | #6 | Biologie marine | $xCongrès. | 6 - Répertoire de vedettes-matière |
| 650 | #6 | Horloges biologiques. |  | 6 - Répertoire de vedettes-matière |
| 650 | #6 | Écologie. |  | 6 - Répertoire de vedettes-matière |
| 650 | #6 | Biologie marine. |  | 6 - Répertoire de vedettes-matière |
| 650 | #7 | ecology | $2aat | Art & architecture thesaurus |
| 650 | #7 | marine biology | $2aat | Art & architecture thesaurus |
| 650 | #7 | Marine biology | $2fast | Faceted application of subject terminology |
| 650 | #7 | Ecology | $2fast | Faceted application of subject terminology |
| 650 | #7 | Biological rhythms | $2fast | Faceted application of subject terminology |
| 650 | #7 | Marine ecology | $2fast | Faceted application of subject terminology |
| 655 | #7 | Conference papers and proceedings | $2fast | Faceted application of subject terminology |
| 655 | #7 | Conference papers and proceedings | $2lcgft | Library of Congress genre/form terms for library and archival materials |
| 655 | #7 | Actes de congrès | $2rvmgf | Thésaurus des descripteurs de genre/forme de l'Université Laval |

## Examples

- Source MARC record: <https://search.library.ucr.edu/discovery/sourceRecord?vid=01CDL_RIV_INST:UCR&docId=alma991004013069704706&recordOwner=01UCS_NETWORK>
- MMSID: 991004013069704706  
- OCLC: 01735454

## Solution
>
>*(Does not apply to MESH headings as these are in a different out-of-the-box display heading)*  

>*The solution is still in progress. Affects 650 and 655 as of 10/2022*

Produces a display for subject access fields that come from the following thesauruses:

- Library of Congress Subject Headings (0)
- LC subject headings for children's literature (1)
- National Agricultural Library subject authority file (3)
- Source not specified (4)
- FAST headings (indicator 2 = 7; $2 = fast)

> 4 and 7 may need to be revised to exclude or include desired thesauruses.

**Excludes**  

- Medical Subject Headings (2)
  - (this is handled in a different display rule)
- Canadian Subject Headings (5)
- Répertoire de vedettes-matière (6)  

> This process can theoretically be used to suppress similarly duplicated genre forms from the display.

## Installation instructions

In Alma Configuration, navigate to: Discovery > Display Configuration > Manage Display and Local Fields

- Add Field
- Add Display Field
- Select Field to edit
- Edit MARC21 normalization rule for display
- Find the code you want to replace. Delete desired default code
  - (you can always get it back by selecting "restore default")
- Paste the new normalization code
- Save
- Click Back
- Select Apply Rules
  - **(THIS IS IMPORTANT. Changes will not update in Primo until the rules have been applied. Once the rules are applied, changes are immediate.)**

## Normalization Code

> The Subject display normalization rule is comprised of *many* individual rules. It is extremely large. Only the modified rules will be added here at this time. You must find and replace the individual rules you want to modify.  

### 650  

```
rule "Primo VE Display- Subject 650"
 when
 #Display LCSH, childrens lit, national agricultural, unspecified, and fast subject headings. DO NOT display MESH, Canadian, or Répertoire... headings.
 
  MARC."650" has any "a-u,w-z,2" AND
  (MARC."650".ind"2" equals "0" OR
  MARC."650".ind"2" equals "1" OR
  MARC."650".ind"2" equals "3" OR
  MARC."650".ind"2" equals "4" OR
  (MARC."650"."2" match "fast" AND MARC."650".ind"2" equals "7")) AND NOT
  #Subject heading IS NOT MESH, Canadian, French
  (MARC."650".ind"2" equals "2" OR
  MARC."650".ind"2" equals "5" OR
  MARC."650".ind"2" equals "6")
 then
  set TEMP"1" to MARC."650" subfields "a-u,w" delimited by " -- " remove substring using regex "\\.+$"
  set TEMP"2" to MARC."650" sub without sorting "x-z" delimited by " -- "
  remove substring using regex (TEMP"2","\\.+$")
  concatenate with delimiter (TEMP"1",TEMP"2"," -- ")
  set TEMP"3" to multilingual by "650" "Subject" "display"
  concatenate with delimiter (TEMP"1",TEMP"3","")
        create pnx."display"."subject" with TEMP"1"
  end

```

### 655  

```
rule "Primo VE Display- Subject 655"
 when
 #Display LCSH, childrens lit, national agricultural, unspecified, and fast subject headings. DO NOT display MESH, Canadian, or Répertoire... headings.
  MARC."655" has any "a-u,w-z,2" AND
  (MARC."655".ind"2" equals "0" OR
  MARC."655".ind"2" equals "1" OR
  MARC."655".ind"2" equals "3" OR
  MARC."655".ind"2" equals "4" OR
  (MARC."655"."2" match "fast" AND MARC."655".ind"2" equals "7" OR
MARC."655"."2" match "lcgft" AND MARC."655".ind"2" equals "7")) AND NOT
  #Subject heading IS NOT MESH, Canadian, French
  (MARC."655".ind"2" equals "2" OR
  MARC."655".ind"2" equals "5" OR
  MARC."655".ind"2" equals "6")
  then
  set TEMP"1" to MARC."655" subfields "a-u,w" delimited by " -- " remove substring using regex "\\.+$"
  set TEMP"2" to MARC."655" sub without sorting "x-z" delimited by " -- "
  remove substring using regex (TEMP"2","\\.+$")
  concatenate with delimiter (TEMP"1",TEMP"2"," -- ")
  set TEMP"3" to multilingual by "655" "Subject" "display"
  concatenate with delimiter (TEMP"1",TEMP"3","")
        create pnx."display"."subject" with TEMP"1"
end
```

## Credits

Adapted from reviewing <https://developers.exlibrisgroup.com/blog/primo-ve-normalization-rule-examples/>
