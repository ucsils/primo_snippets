// =========================================================
// Name: Autofill BlankILL Form
// Version: 3.1
// =========================================================

(function () {
    'use strict';
    
    // --- INTEGRATION MODE: We just 'get' the existing module ---
    // Do NOT include ['angularLoad'] here, or you will wipe out the other scripts.
    var app = angular.module('viewCustom');
    
    const SESSION_STORAGE_PARAMS_KEY = 'primoIllFormQueryParams';
    
    // ----------------------------------------------------------------------
    // --- CONFIGURATION ---
    // ----------------------------------------------------------------------
    const fieldMapping = {
        'atitle': 'articleTitle',
        'title': 'journalTitle',
        'jtitle': 'journalTitle',
        // 'aulast', 'aufirst', and 'au' REMOVED from here so we can handle them manually below
        'issn': 'issn',
        'eissn': 'issn',
        'doi': 'doi',
        'date': 'publicationDate',
        'volume': 'journalVolume',
        'issue': 'issue',
        'spage': 'startPage',
        'startPage': 'startPage',
        'epage': 'endPage',
        'endPage': 'endPage'
    };
    
    // ----------------------------------------------------------------------
    // --- PARSER ---
    // ----------------------------------------------------------------------
    function parseOpenURL(urlString) {
        try {
            const url = new URL(urlString, window.location.origin);
            const searchParams = new URLSearchParams(url.search);
            const result = { version: '0.1', metadata: {}, raw: {} };
            
            let isVersion1 = false;
            if (searchParams.get('url_ver')?.includes('Z39.88-2004')) {
                isVersion1 = true;
            } else {
                for (const key of searchParams.keys()) {
                    if (key.startsWith('rft.')) {
                        isVersion1 = true;
                        break;
                    }
                }
            }
            result.version = isVersion1 ? '1.0' : '0.1';
            
            for (const [key, value] of searchParams.entries()) {
                result.raw[key] = value;
                if (isVersion1) {
                    if (key.startsWith('rft.')) {
                        result.metadata[key.substring(4)] = value;
                    } else if (key === 'rft_id') {
                        result.metadata['rft_id'] = value;
                    } else {
                        if (!result.metadata[key]) result.metadata[key] = value;
                    }
                } else {
                    result.metadata[key] = value;
                }
            }
            return result;
        } catch (error) {
            console.error("Error parsing OpenURL:", error);
            return null;
        }
    }
    
    function mapToFormFields(parsedData) {
        if (!parsedData || !parsedData.metadata) return {};
        const metadata = parsedData.metadata;
        const formValues = {};
        
        // 1. Standard Mapping Loop (skips authors now)
        for (const [openUrlKey, formFieldId] of Object.entries(fieldMapping)) {
            if (metadata.hasOwnProperty(openUrlKey)) {
                const value = metadata[openUrlKey];
                if (value) formValues[formFieldId] = value;
            }
        }
        
        // 2. Custom Author Logic (Combines First + Last)
        let authorVal = metadata['au']; // Fallback to generic 'au'
        
        if (metadata['aulast'] || metadata['aufirst']) {
            const first = metadata['aufirst'] || '';
            const last = metadata['aulast'] || '';
            
            // If both exist, combine with a space. Otherwise, use whichever exists.
            if (first && last) {
                authorVal = first + ' ' + last;
            } else {
                authorVal = first || last;
            }
        }
        
        // If we found any author data, assign it to the field
        if (authorVal) {
            formValues['articleAuthor'] = authorVal;
        }
        
        // 3. Page Range Logic
        if (metadata.pages) {
            const range = parsePageRange(metadata.pages);
            if (range.startPage) formValues['startPage'] = range.startPage;
            if (range.endPage) formValues['endPage'] = range.endPage;
        }
        
        // 4. Pass system params
        if (parsedData.raw['vid']) formValues['vid'] = parsedData.raw['vid'];
        if (parsedData.raw['sso']) formValues['sso'] = parsedData.raw['sso'];
        
        return formValues;
    }
    
    function parsePageRange(pagesValue) {
        const result = { startPage: '', endPage: '' };
        if (!pagesValue) return result;
        const cleanedValue = pagesValue.trim().replace(/[pP\.\s]/g, '');
        const parts = cleanedValue.match(/(\d+)\s*[-,\/]\s*(\d+)/);
        if (parts && parts.length >= 3) {
            result.startPage = parts[1];
            result.endPage = parts[2];
        } else {
            const soloMatch = cleanedValue.match(/(\d+)/);
            result.startPage = soloMatch ? soloMatch[1] : cleanedValue;
        }
        return result;
    }
    
    // ----------------------------------------------------------------------
    // STEP 1: CAPTURE
    // ----------------------------------------------------------------------
    (function checkAndSaveInitialParams() {
        // Only bother parsing if there are actual query parameters in the URL
        if (window.location.search) {
            const parsedData = parseOpenURL(window.location.href);
            if (parsedData && Object.keys(parsedData.metadata).length > 0) {
                const formReadyData = mapToFormFields(parsedData);
                const hasData = ['articleTitle', 'journalTitle', 'issn', 'doi', 'articleAuthor', 'startPage'].some(k => formReadyData[k]);
                
                if (hasData) {
                    try {
                        sessionStorage.setItem(SESSION_STORAGE_PARAMS_KEY, JSON.stringify(formReadyData));
                    } catch (e) { console.error('Storage failed:', e); }
                }
            }
        }
    })();
    
    // ----------------------------------------------------------------------
    // STEP 2: FILL
    // ----------------------------------------------------------------------
    app.run(['$interval', '$timeout', '$document', '$window', function ($interval, $timeout, $document, $window) {
        function restoreMappedParams() {
            try {
                const savedParams = sessionStorage.getItem(SESSION_STORAGE_PARAMS_KEY);
                if (savedParams) return JSON.parse(savedParams);
            } catch (e) {
                sessionStorage.removeItem(SESSION_STORAGE_PARAMS_KEY);
            }
            return {};
        }
        
        function updateAngularFormField(inputElement, valueToFill) {
            const angularEl = angular.element(inputElement);
            let ngModelController = angularEl.controller('ngModel');
            let scope = angularEl.scope();
            
            if (ngModelController && scope) {
                scope.$apply(function () {
                    ngModelController.$setViewValue(valueToFill);
                    ngModelController.$render();
                    ngModelController.$setDirty();
                    ngModelController.$setTouched();
                    ngModelController.$validate();
                });
            } else {
                inputElement.value = valueToFill;
            }
            
            const mdInputContainer = inputElement.closest('.md-input-container');
            inputElement.classList.add('ng-not-empty', 'ng-dirty', 'ng-valid', 'ng-touched');
            inputElement.classList.remove('ng-empty', 'ng-pristine');
            if (mdInputContainer) mdInputContainer.classList.add('md-input-has-value');
            
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
        
        function attemptToClickRadioButton() {
            const radioButton = $document[0].querySelector('md-radio-button[value="CR"]');
            if (radioButton) {
                if (radioButton.classList.contains('md-checked') || radioButton.getAttribute('aria-checked') === 'true') {
                    return true;
                }
                $timeout(function () { radioButton.click(); }, 0);
                return true;
            }
            return false;
        }
        
        const paramsToUse = restoreMappedParams();
        if (Object.keys(paramsToUse).length === 0) return;
        
        let radioClickSuccess = false;
        let attemptCount = 0;
        const MAX_ATTEMPTS = 20;
        
        const checkAndFillForm = $interval(function () {
            attemptCount++;
            
            if (!radioClickSuccess) {
                radioClickSuccess = attemptToClickRadioButton();
                if (radioClickSuccess) attemptCount = 0;
                return;
            }
            
            let anyFieldFilled = false;
            for (const [fieldName, valueToFill] of Object.entries(paramsToUse)) {
                if (fieldName === 'vid' || fieldName === 'sso') continue;
                const inputElement = $document[0].querySelector(`[name="${fieldName}"]`);
                if (inputElement && valueToFill) {
                    updateAngularFormField(inputElement, valueToFill);
                    anyFieldFilled = true;
                }
            }
            
            if (anyFieldFilled) {
                $interval.cancel(checkAndFillForm);
                sessionStorage.removeItem(SESSION_STORAGE_PARAMS_KEY);
            } else if (attemptCount >= MAX_ATTEMPTS) {
                $interval.cancel(checkAndFillForm);
                sessionStorage.removeItem(SESSION_STORAGE_PARAMS_KEY);
            }
        }, 500);
        
        $window.addEventListener('beforeunload', function () {
            $interval.cancel(checkAndFillForm);
        });
    }]);
})();
// End Autofill
