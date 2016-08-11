(function () {

    /**
     * Configuration
     */
    var localStorageGuidKey = "midbound-guid";
    var pixelUrl = "http://midbound.dev/_mb.gif";

    /**
     * Look for previous Midbound ID
     */
    var midboundGuid = localStorage.getItem(localStorageGuidKey);

    /**
     * Fetch object name, timestamp and queue
     */
    var objectName = window['MidboundObject'] = window['MidboundObject'] || 'mb';
    var queue = window[objectName].q;

    /**
     * Form binding options
     */
    var midboundAttributeName = 'data-midbound-type';
    var targetTypes = ['email', 'text'];
    var nameLabels = [
        'firstname', 'fname', 'first name', 'first-name',
        'lastname', 'last name', 'lname', 'last-name',
        'fullname', 'full name', 'name'
    ];
    var emailLabels = ['email', 'e-mail', 'e_mail', 'e mail'];
    var companyLabels = ['company'];
    var phoneLabels = ['phone'];

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
     * It will never be RFC4122 compliant but it is robust
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
     * Create pixel
     */
    var createPixel = function (trackerId, guid, action, resource, type) {
        var img = new Image(1, 1) || document.createElement('img');
        var src = pixelUrl +
            '?midid=' + encodeURIComponent(trackerId) +
            '&midguid=' + encodeURIComponent(guid) +
            '&midac=' + encodeURIComponent(action) +
            '&midts=' + encodeURIComponent(Date.now()) +
            '&midrc=' + encodeURIComponent(resource || window.location);

        // If capturing, set the type
        if(type !== null) {
            src += '&midtype=' + encodeURIComponent(type);
        }

        img.src = src;
    }

    /**
     * Extract arguments
     * @param arguments
     * @returns {Array}
     */
    var extractArguments = function (arguments, splice) {

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
     * @param inputValue
     * @TODO Add some validation for emails
     */
    var saveInformationOnBlur = function (event) {
        var type = event.target.getAttribute(midboundAttributeName);
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
        field.setAttribute(midboundAttributeName, type);
    }

    /**
     * Validate a field and bind event on it if valid
     * @param field
     * @returns {boolean}
     */
    var validateAndBindField = function (field) {
        var fieldType = field.getAttribute('type');
        var fieldName = field.getAttribute('name');
        var fieldClasses = field.getAttribute('class') || '';

        if (targetTypes.indexOf(fieldType) < 0) {
            return false;
        }

        var type = null;
        var inputInformation = [];
        var foundValidInformation = false;

        inputInformation.push(fieldType);
        inputInformation.push(fieldName);
        inputInformation = inputInformation.concat(fieldClasses.split(' '));

        inputInformation = inputInformation.filter(function(item) {
            return item.length > 0;
        });

        for (var i = 0; i < inputInformation.length; i++) {
            if (nameLabels.indexOf(inputInformation[i]) > -1) {
                type = 'name';
                foundValidInformation = true;
            }
            if (emailLabels.indexOf(inputInformation[i]) > -1) {
                type = 'email';
                foundValidInformation = true;
            }
            if (companyLabels.indexOf(inputInformation[i]) > -1) {
                type = 'company';
                foundValidInformation = true;
            }
            if (phoneLabels.indexOf(inputInformation[i]) > -1) {
                type = 'phone';
                foundValidInformation = true;
            }

            if(type !== null) {
                bindMidboundAttributes(field, type);
            }
        }

        return foundValidInformation;
    };

    /**
     * Bind every valid field with Midbound listener
     */
    var bindingEventsOnFields = function () {
        // Bind listener on every input with specific criteria
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            if (validateAndBindField(inputs[i])) {
                inputs[i].addEventListener("blur", saveInformationOnBlur);
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
                localStorage.setItem(localStorageGuidKey, guid());
            }

            if (this.mode === 'auto') {
                addMidboundGuidToForms(localStorage.getItem(localStorageGuidKey));
                bindingEventsOnFields();
            }
        },

        /**
         * Create pixel with parameters
         * @param actionType
         * @param resource
         */
        send: function (actionType, resource, type) {
            createPixel(
                this.midboundId,
                localStorage.getItem(localStorageGuidKey),
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
                this[queue[i][0]].apply(null, extractArguments(queue[i]));
            }
            this.queue = [];
        }
    };

    // Run initialization
    Midbound.init();

    // Replace queue with active tracker
    this[objectName] = function (name) {
        if (typeof Midbound[name] === "function") {
            Midbound[name].apply(null, extractArguments(arguments));
        }
    }

})();