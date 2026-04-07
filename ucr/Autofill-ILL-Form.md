# Documentation: Universal OpenURL Autofill for ILL Forms

## 1. Problem Statement

**Challenge:** During pre-implementation testing of Article Galaxy Scholar (AGS), it was discovered that the standard handoff to the Primo VE Interlibrary Loan (ILL) form resulted in a **blank request form**. Left unaddressed, this would have forced users to manually transcribe bibliographic data, creating a significant barrier to service adoption and a poor user experience at launch.

**Root Cause:** The data loss was caused by the **authentication handshake**. Although AGS passed the necessary metadata via URL parameters, Primo VE requires a login to access the ILL request page. The resulting redirect to the campus authentication system stripped these parameters from the URL. By the time the user returned to the form post-login, the bibliographic data was gone.

**Solution:** To ensure the data survives the login process, we implemented a **Synchronous Capture** mechanism using browser `sessionStorage`. The script is designed to "grab" the bibliographic parameters the moment the user first hits the library domain—prior to the login redirect—and store them locally. Once the user completes authentication and reaches the ILL page, the script retrieves that data to **automatically populate the form**, ensuring the user's previous effort isn't wasted on manual data entry.

## 2. Solution Overview

The **Autofill BlankILL Form** script acts as a persistent bridge using a three-stage strategy:

1. **Global URL Trap (Immediate):** Captured at the absolute top of the global `custom.js` file to ensure metadata is saved to `sessionStorage` before login redirects occur.
2. **Capture & Translate:** Parses OpenURL (0.1 and 1.0) metadata, handles cleanup (plus signs to spaces), and processes complex page ranges.
3. **Fill & Sync:** Injects values into the Angular-controlled form fields using `$setViewValue` and `$render` to ensure the model is synchronized and validation errors are cleared.

## 3. Implementation Snippets

### A. URL Trap

The **URL Trap** must be placed at the very top of the global file, outside any closures, to function effectively.

```
// --- URL TRAP: MUST RUN AT TOP OF CUSTOM.JS ---
try {
    console.log(">>> URL TRAP CAPTURED:", window.location.href);
    sessionStorage.setItem('DEBUG_LAST_URL', window.location.href);
} catch (e) {}
```

### B. Complete Autofill BlankILL Form Module

The full logic is contained within the [Autofill-ILL-Form](ucr/Autofill-ILL-Form.js). Note, this does NOT contain the URL trap. 
This should be integrated into your existing custom.js file, which integrates the viewCustom module.

### C. Configuration & Field Mapping

The script maps OpenURL metadata to the following Alma/Primo form field names:

|**OpenURL Key (Source)**|**Form Field Name (name="")**|
|---|---|
|`atitle` / `jtitle`|`articleTitle` / `journalTitle`|
|`au` / `aufirst` + `aulast`|`articleAuthor`|
|`issn` / `eissn`|`issn`|
|`doi`|`doi`|
|`date`|`publicationDate`|
|`volume` / `issue`|`journalVolume` / `issue`|
|`spage` / `epage`|`startPage` / `endPage`|

## 4. Execution Logic

1. **Global Trapping:**  Before any Angular modules or library-specific scripts load, the code at the very top of `custom.js` executes.
	- **Action:** It immediately grabs `window.location.href`.
    - **Logic:** It saves this URL string into `sessionStorage` under the key `DEBUG_LAST_URL`.
    - **Purpose:** Since UCR's Library Search forces a redirect to the campus SSO (Single Sign-On) provider to access the ILL form, the original URL parameters are usually lost. This "trap" ensures the bibliographic data is safe in the browser's memory before that redirect happens.
    - **Maintenance Note:** This serves as a diagnostic tool. If a form is blank, a maintainer can check `DEBUG_LAST_URL` in the console. If the parameters are missing there, the issue is with the **Source link**; if they are present, the issue is with the **Injection logic**.
    
2. **Metadata Parsing:** Once the user is authenticated and the `viewCustom` module initializes, the script looks for metadata.
	- **Parameter Extraction:** The script checks both the current URL and the stored "trapped" URL for OpenURL parameters (e.g., `rft.atitle`, `rft.isbn`).
    - **Data Cleaning:** It runs a "translator" logic that:
        - Converts plus signs (`+`) back into spaces (e.g., `Digital+History` becomes `Digital History`).  
	    - Regex-parses page ranges (e.g., if it sees `145-160`, it splits it into `startPage: 145` and `endPage: 160`).
    - **Author Formatting:** It checks for separate `aufirst` and `aulast` tags and combines them into a single `articleAuthor` string.
    - **Maintenance Note:** This "translator" logic reduces manual intervention by library staff who would otherwise have to fix "dirty" data arriving from various vendor formats.
    
3. **Form Detection:** The ILL form is loaded dynamically (AJAX), meaning it doesn't exist the moment the page loads.
	- **The Polling Loop:** The script starts an `$interval` (set to run every 500ms for up to 10 seconds).
	- **Targeting:** It searches the DOM for specific Alma form attributes (like `name="articleTitle"`).  
	- **Maintenance Note:** The "CR" click is vital because Alma’s form is conditional; fields like "Journal Title" do not exist in the DOM until the "Article" type is selected. The polling loop includes a `MAX_ATTEMPTS` safety to prevent memory leaks if the form fails to load.

4. **Angular Model Synchronization:** Simply changing the text in a box isn't enough for an Angular app; the underlying "data model" must be updated.
	- **`$setViewValue`:** The script finds the internal Angular scope of the input field and sets the value there.
    - **`$render` & `$setDirty`:** It calls these functions to tell the form: "This field has been changed by a user." This is why "Required" field errors disappear immediately when the script fills the box.
    - **`$apply`:** It forces a "digest cycle," which is essentially Angular's way of refreshing the entire UI to match the new data.
    - **Maintenance Note:** Standard JavaScript `.value` assignments will not satisfy Angular's validation. By using `$setDirty()`, the script ensures that "Required Field" errors disappear immediately upon injection, allowing the user to submit the form without further clicks.

5. **Cleanup:** Clears the `sessionStorage` once the form is successfully populated to prevent data collision.
	- **Success Hook:** Once the fields are confirmed as "not empty," the `$interval` is cancelled to save system resources.  
	- **Memory Management:** The script deletes the citation data from `sessionStorage`. This ensures data privacy and prevents "ghost" data from appearing if a user navigates to a different blank form within the same session.   
