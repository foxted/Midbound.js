(function () {

    console.info('Midbound loading...');

    // Fetch object name, timestamp and queue
    var objectName = window['MidboundObject'] = window['MidboundObject'] || 'mb';
    var timestamp = window[objectName].l;
    var queue = window[objectName].q;

    var Midbound = {
        queue: queue,
        timestamp: timestamp,
        create: function() {
            console.log('Create tracker');
        },
        send: function() {
            console.log('Send information');
        },
        init: function() {
            var i;
            for (i = 0; i < this.queue.length; i++) {
                this[queue[i][0]](queue[i]);
            }
            this.queue = [];
        }
    };

    Midbound.init();

    this[objectName] = function(name) {
        if(typeof Midbound[name] === "function") {
            Midbound[name].apply(null, arguments);
        }
    }

    console.info('Midbound loaded!');

})();