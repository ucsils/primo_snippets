# Overview
This fixes the reported issue with search text overlapping search scope suggestions on mobile.

## CSS
```
/* fix overlapping text in main search bar */
md-autocomplete-parent-scope {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```
