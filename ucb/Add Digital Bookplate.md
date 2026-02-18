## Overview
This normalization rule creates a new local 599 field to display digital bookplate images in Primo VE. Additional HTML configurations allow users to click on the bookplate image in the Primo display, and launch a keyword search which will gather a list of all titles with the same text. 

## Normalization Rule
### Template
```
rule "$RULE_NAME"
# to apply the correct rule, uncomment the relevant "addField" section for the bookplate 599 you want to apply and make certain that all others are commented # out. Add new clauses as needed.
 
when

(TRUE)

then

addField "599.a.<span class=\"bookplate\"><b>Digital bookplate: </b>$BOOKPLATE_TEXT<br><a href=\"$SEARCH_STRING><img src=\"$IMAGE_PATH\" height=\"230\" width=\"177\" alt=\"$ALT_TEXT\"></a></span>" if (not exists "599.a.*$BOOKPLATE_TEXT$*")

end
```
### Example

```
rule "UCB Add 599 for bookplates"
#to apply the correct rule, uncomment the relevant "addField" section for the bookplate 599 you want to apply and make certain that all others are commented # out. Add new clauses as needed.
 
when

(TRUE)

then

addField "599.a.<span class=\"bookplate\"><b>Digital bookplate: </b>From the Alfred Hitchcock Literature and Arts Fund<br><a href=\"https://berkeley.primo.exlibrisgroup.com/discovery/search?query=any,contains,From%20the%20Alfred%20Hitchcock%20Literature%20and%20Arts%20Fund,AND&tab=LibraryCatalog&search_scope=MyInst_and_CI&vid=01UCS_BER:UCB&mode=advanced&offset=0 target=_blank\"><img src=\"https://digitalassets.lib.berkeley.edu/bookplates/bookplate_hitchcock_literature_fund.jpg\" height= \"230\" width=\"177\" alt=\"From the Alfred Hitchcock Literature and Arts Fund\"></a></span>" if (not exists "599.a.*From the Alfred Hitchcock Literature and Arts Fund*")

end
```

### Note
UCB has multiple digital bookplate collections that require separate bookplate information. Multiple, individual bookplate clauses exist in the same normalization rule. Adding a comment marker `#` before an individual bookplate clause deactivates the rule.

The comment marker `#` can be added and removed as needed when running this normalization process so that the correct digital bookplate is added to a particular set of records.




## Documentation
- [Working with Normalization Rules](https://knowledge.exlibrisgroup.com/Alma/Product_Documentation/010Alma_Online_Help_(English)/Metadata_Management/016Working_with_Rules/020Working_with_Normalization_Rules)
- [Working with Normalization Processes](https://knowledge.exlibrisgroup.com/Alma/Product_Documentation/010Alma_Online_Help_(English)/Metadata_Management/210Metadata_Management_Configuration/Configuring_Cataloging#Working_with_Normalization_Processes)
