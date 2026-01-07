# Problem

The Full Item Display was utilizing a hard-coded split-point logic (chopping the property list after the 6th visible item). This created a "fragile" layout that failed in two specific scenarios:

Vertical Imbalance: If one item (like a Public Note) contained many lines of text, the left column became excessively long while the right column remained underutilized.

Unused Real Estate: If only 6 or fewer items were populated, the layout stayed in a single-column format, leaving the right 50% of the screen empty and forcing unnecessary vertical scrolling.

## Investigation

Inspecting the DOM revealed two separate `<nde-location-items-properties>` containers. The layout was "blind" to the visual height of the content, only caring about the count of elements. This prevented the content from "reflowing" to fill available space effectively.

## Solution

Instead of modifying the underlying component logic to calculate a new split point, a CSS-level "unpacking" was used. By using display: contents, the browser ignores the hard-coded "bucket" containers and treats all property rows as direct children of the main wrapper.

### Key CSS implemented

**`display: contents:`** Applied to the internal containers to allow items to flow freely across the parent wrapper.

**`column-count: 2:`** Applied to .properties-wrapper to enable the browser’s native balancing engine.

**`column-fill: balance:`** Forces the browser to equalize the height of both columns.

**`break-inside: avoid-column:`** Ensures individual property rows do not split across the column break.

## Implementation

Pasted into the custom.css file in the NDE customization package.

```css
/* 1. Target the main wrapper and turn it into a 2-column grid or column layout */
.properties-wrapper {
    display: block !important;
    column-count: 2 !important;
    column-gap: 24px !important;
}

/* 2. Tell the two internal 'buckets' to stop acting like containers */
/* This effectively "unpacks" the items into the main wrapper */
.getit-items-full-properties,
.getit-item-full-properties-container {
    display: contents !important;
}

/* 3. Hide the hard-coded vertical divider since columns create their own gap */
.getit-location-items-vertical-divider {
    display: none !important;
}

/* 4. Ensure the individual rows don't split across columns */
.flex-row.gap-05 {
    display: flex !important;
    break-inside: avoid-column !important;
    padding-bottom: 8px;
    /* Adds back some breathing room */
}
```

## Result

The display is now "content-aware." The browser now automatically shifts items to the second column to ensure the left and right sides are of equal height, significantly reducing vertical scrolling and eliminating wasted white space.
