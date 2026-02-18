## Overview

This normalization rule revises information in local note 599 $a to ensure alt text for digital bookplates renders correctly in production. 

Digital bookplates were previously added to UCB item records through a separate normalizaton process. The normalization rule embeds HTML in the local note field so that an image appears in the full record details.

[Example record in UC Library Search](https://search.library.berkeley.edu/discovery/fulldisplay?docid=alma9912361719806531&context=U&vid=01UCS_BER:UCB&lang=en) 

This revision adds stop characters before quotation marks in the HTML tags (`\"`) to ensure entire alt text string is imported into UC Library Search.

## MARC 21 Normalization Rule

### Template
```
rule "$RULE_NAME"
# replaces existing 599.a contents with updated HTML containing stop characters
# will then render complete alt text string in production
 
when

(TRUE)

then

replaceContents "599.a.*" with "<span class=\"bookplate\"><b>Digital bookplate: </b> $BOOKPLATE_TEXT<br><a href=\"$SEARCH_STRING"><img src=\"$IMAGE_PATH" height=\"230\" width=\"177\" alt=\"#ALT TEXT"></a></span>" if (exists "599.a.*$BOOKPLATE_TEXT*")

end 
```

### Example

```
rule "UCB 599 bookplate alt text correction"
# replace existing 599.a with updated HTML containing stop characters
# will then render complete alt text string in production
 
when

(TRUE)

then

replaceContents "599.a.*" with "<span class=\"bookplate\"><b>Digital bookplate: </b>From the Alfred Hitchcock Literature and Arts Fund<br><a href=\"https://berkeley.primo.exlibrisgroup.com/discovery/search?query=any,contains,From%20the%20Alfred%20Hitchcock%20Literature%20and%20Arts%20Fund,AND&tab=LibraryCatalog&search_scope=MyInst_and_CI&vid=01UCS_BER:UCB&mode=advanced&offset=0 target=_blank\"><img src=\"https://digitalassets.lib.berkeley.edu/bookplates/bookplate_hitchcock_literature_fund.jpg\" height=\"230\" width=\"177\" alt=\"From the Alfred Hitchcock Literature and Arts Fund\"></a></span>" if (exists "599.a.*From the Alfred Hitchcock Literature and Arts Fund*")

end