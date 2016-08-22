(function () {

    /**
     * Configuration
     */
    var config = {
        // Key used for local storage
        localStorageGuidKey: "midbound-guid",

        // Pixel URL for sending events
        pixelUrl: "https://midbound.com/_mb.gif",

        // Name of the midbound attribute
        midboundAttributeName: 'data-midbound-type',

        // Target field types
        targetTypes: ['text', 'email'],

        // Keywords used for matching types
        keywords: {
            names: [
                'firstname', 'fname', 'first name', 'first-name',
                'lastname', 'last name', 'lname', 'last-name',
                'fullname', 'full name', 'name'
            ],
            emails: ['email', 'e-mail', 'e_mail', 'e mail'],
            companies: ['company'],
            phones: ['phone', 'phone-number', 'phone number']
        }
    };

    /**
     * Look for previous Midbound ID
     */
    var midboundGuid = localStorage.getItem(config.localStorageGuidKey);

    /**
     * Fetch object name, timestamp and queue
     */
    var objectName = window['MidboundObject'] = window['MidboundObject'] || 'mb';
    var queue = window[objectName].q;

    /**
     * Check user DoNotTrack Setting
     */
    var doNotTrack = window.navigator.doNotTrack || 0;
    if (doNotTrack == true) {
        console.info('Midbound disabled in respect for Universal Web Tracking Opt Out regulations: http://donottrack.us');
        return false;
    }

    /**
     * GUID Generator
     * Creates GUID for user based on several different browser variables
     * @returns {Number}
     */
    var guid = function () {
        var nav = window.navigator;
        var screen = window.screen;
        var guid = nav.mimeTypes.length;

        guid += nav.userAgent.replace(/\D+/g, '');
        guid += nav.plugins.length;
        guid += screen.height || '';
        guid += screen.width || '';
        guid += screen.pixelDepth || '';

        return guid;
    };

    /**
     * Create tracking pixel on the page
     * @param trackerId
     * @param guid
     * @param action
     * @param resource
     * @param type
     */
    var createTrackingPixel = function (trackerId, guid, action, resource, type) {
        var img = new Image(1, 1) || document.createElement('img');
        var src = config.pixelUrl +
            '?midid=' + encodeURIComponent(trackerId) +
            '&midguid=' + encodeURIComponent(guid) +
            '&midac=' + encodeURIComponent(action) +
            '&midts=' + encodeURIComponent(Date.now()) +
            '&midurl=' + encodeURIComponent(window.location);

        // If resource exists, set the resource
        if(resource !== null && typeof resource !== "undefined") {
            src += '&midrc=' + encodeURIComponent(resource);
        }

        // If capturing, set the type
        if(type !== null && typeof type !== "undefined") {
            src += '&midtype=' + encodeURIComponent(type);
        }

        img.src = src;
    }

    /**
     * Extract method arguments
     * @param arguments
     * @param splice
     * @returns {Array}
     */
    var extractMethodArguments = function (arguments, splice) {
        var args = [];

        splice = splice || 1;

        if (Array.isArray(args)) {
            args = Array.prototype.slice.call(arguments);
        } else {
            args = arguments;
        }

        args.splice(0, splice);

        return args;
    }

    /**
     * Save the information on Midbound onblur
     * @param event
     */
    var saveInformationOnBlurCallback = function (event) {
        var type = event.target.getAttribute(config.midboundAttributeName);
        var value = event.target.value || '';

        if(value.trim().length > 0) {
            mb('send', 'capture', value, type);
        }
    }

    /**
     * Bind midbound specific attributes
     * @param field
     * @param type
     */
    var bindMidboundAttributes = function(field, type) {
        field.setAttribute(config.midboundAttributeName, type);
    }


    /**
     * Find the all the parents until selector is met
     * @param el
     * @returns {Array}
     */
    var findSurroundingElements = function (el) {
        var prev = [];

        while (el.parentNode) {
            el = el.parentNode;
            prev.push(extractElementInformation(el));

            if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'form') {
                return prev;
            }
        }

        return prev;
    };

    /**
     * Extract information about an element
     * @param el
     * @returns {{type: string, name: string, id: string, placeholder: string, classes: (string|string)}}
     */
    var extractElementInformation = function(el) {
        return {
            type: el.getAttribute('type'),
            name: el.getAttribute('name'),
            id: el.getAttribute('id'),
            placeholder: el.getAttribute('placeholder'),
            classes: el.getAttribute('class') || ''
        }
    }

    /**
     * Combine all element information to an array
     * @param attributes
     * @returns {Array}
     */
    var combineInputInformation = function(attributes) {
        var inputInformation = [];

        inputInformation.push(attributes.type);
        inputInformation.push(attributes.name);
        inputInformation.push(attributes.id);
        inputInformation.push(attributes.placeholder);
        inputInformation = inputInformation.concat(attributes.classes.split(' '));

        inputInformation = inputInformation.filter(function(item) {
            return item && item.length;
        });

        inputInformation = inputInformation.map(function(item) {
            return item.toLowerCase();
        });

        return inputInformation;
    }

    /**
     * Combine the information of all surrounding elements
     * @param surroundingElements
     * @returns {*}
     */
    var combineSurroundingElementsInformation = function(surroundingElements) {
        surroundingElements = surroundingElements.map(function(item) {
            return combineInputInformation(item);
        });

        surroundingElements = surroundingElements.reduce(function(a, b) {
            return a.concat(b);
        });

        return surroundingElements;
    }

    /**
     * Bind element if recognized
     * @param field
     * @param inputInformation
     * @returns {boolean}
     */
    var hasValidInformation = function(field, inputInformation) {
        var type = null;
        var foundValidInformation = false;

        for (var i = 0; i < inputInformation.length; i++) {
            if (new RegExp(config.keywords.names.join("|")).test(inputInformation[i])) {
                type = 'name';
                foundValidInformation = true;
                break;
            }
            if (new RegExp(config.keywords.emails.join("|")).test(inputInformation[i])) {
                type = 'email';
                foundValidInformation = true;
                break;
            }
            if (new RegExp(config.keywords.companies.join("|")).test(inputInformation[i])) {
                type = 'company';
                foundValidInformation = true;
                break;
            }
            if (new RegExp(config.keywords.phones.join("|")).test(inputInformation[i])) {
                type = 'phone';
                foundValidInformation = true;
                break;
            }
        }

        if(type !== null) {
            bindMidboundAttributes(field, type);
        }

        return foundValidInformation;
    }

    /**
     * Validate a field and bind event on it if valid
     * @param field
     * @returns {boolean}
     */
    var validateAndBindField = function (field, inputs) {
        // Gather information about the input
        var attributes = extractElementInformation(field);

        // Check if field type is suported
        if (config.targetTypes.indexOf(attributes.type) < 0) {
            return false;
        }

        // Start analyzing...
        var inputInformation = combineInputInformation(attributes);
        var surroundingElements = findSurroundingElements(field);

        // Merge surrounding elements info
        surroundingElements = combineSurroundingElementsInformation(surroundingElements);

        // Merge input info and surrounding element info
        inputInformation = inputInformation.concat(surroundingElements);

        // Search for a match
        return hasValidInformation(field, inputInformation);
    };

    /**
     * Bind every valid field with Midbound listener
     */
    var bindingEventsOnFields = function () {
        // Bind listener on every input with specific criteria
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            if (validateAndBindField(inputs[i], inputs)) {
                inputs[i].addEventListener("blur", saveInformationOnBlurCallback);
            }
        }
    }

    /**
     * Add midbound guid hidden field in form
     * @param guid
     */
    var addMidboundGuidToForms = function (guid) {
        var forms = document.forms;

        for (var i = 0; i < forms.length; i++) {
            var input = document.createElement("input");
            input.type = "hidden";
            input.name = "midboundGuid";
            input.value = guid;
            forms[i].appendChild(input);
        }
    }

    /**
     * Midbound object
     * @type {{queue: *, timestamp: *, create: Midbound.create, send: Midbound.send, init: Midbound.init}}
     */
    var Midbound = {

        queue: queue,

        /**
         * Create tracker
         * @param midboundId
         */
        create: function (midboundId, mode) {
            this.midboundId = midboundId;
            this.mode = mode || 'auto';

            if (midboundGuid === null) {
                localStorage.setItem(config.localStorageGuidKey, guid());
            }

            if (this.mode === 'auto') {
                addMidboundGuidToForms(localStorage.getItem(config.localStorageGuidKey));
                bindingEventsOnFields();
            }
        },

        /**
         * Create pixel with parameters
         * @param actionType
         * @param resource
         */
        send: function (actionType, resource, type) {
            createTrackingPixel(
                this.midboundId,
                localStorage.getItem(config.localStorageGuidKey),
                actionType,
                resource,
                type
            );
        },

        /**
         * Initialize event queue
         */
        init: function () {
            var i;
            for (i = 0; i < this.queue.length; i++) {
                this[queue[i][0]].apply(null, extractMethodArguments(queue[i]));
            }
            this.queue = [];
        }
    };

    // Run initialization
    Midbound.init();

    // Replace queue with active tracker
    this[objectName] = function (name) {
        if (typeof Midbound[name] === "function") {
            Midbound[name].apply(null, extractMethodArguments(arguments));
        }
    }

})();