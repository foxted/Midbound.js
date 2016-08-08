(function () {

    /**
     * Configuration
     */
    var localStorageGuidKey = "midbound-guid";
    var pixelUrl = "https://app.midbound.io/_mb.gif";

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
     * Check user DoNotTrack Setting
     */
    var doNotTrack = window.navigator.doNotTrack || 0;
    if(doNotTrack == true) {
        console.info('Midbound disabled in respect for Universal Web Tracking Opt Out regulations: http://donottrack.us');
        return false;
    }

    /**
     * GUID Generator
     * Creates GUID for user based on several different browser variables
     * It will never be RFC4122 compliant but it is robust
     * @returns {Number}
     */
    var guid = function() {
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
    var createPixel = function(trackerId, guid, action, resource) {
        var img= new Image(1,1) || document.createElement('img');

        img.src= pixelUrl +
            '?midid=' + encodeURIComponent(trackerId) +
            '&midguid=' + encodeURIComponent(guid) +
            '&midac=' + encodeURIComponent(action) +
            '&midts=' + encodeURIComponent(Date.now()) +
            '&midrc=' + encodeURIComponent(resource || window.location)
    }

    /**
     * Extract arguments
     * @param arguments
     * @returns {Array}
     */
    var extractArguments = function(arguments, splice) {

        var args = [];
        splice = splice || 1;

        if(Array.isArray(args)) {
            args = Array.prototype.slice.call(arguments);
        } else {
            args = arguments;
        }

        args.splice(0, splice);

        return args;
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
        create: function(midboundId) {
            this.midboundId = midboundId;

            if(midboundGuid === null) {
                localStorage.setItem(localStorageGuidKey, guid());
            }
        },

        /**
         * Create pixel with parameters
         * @param actionType
         * @param resource
         */
        send: function(actionType, resource) {
            createPixel(
                this.midboundId,
                localStorage.getItem(localStorageGuidKey),
                actionType,
                resource
            );
        },

        /**
         * Initialize event queue
         */
        init: function() {
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
    this[objectName] = function(name) {
        if(typeof Midbound[name] === "function") {
            Midbound[name].apply(null, extractArguments(arguments));
        }
    }

})();