define([''], function(){

    return function () {

        this.assets = {};
        this.assetsToJSON = {};
        this.dummyNodes = {};
        this.soundPatterns = {};
        this.graphs = []; 
        this.chains = [];
        this.reverbImpulses = [];
        this.cursor; 
        this.tempo = 120;
        this.sounds = [];
        // this.eventHandlers = {
        //     // audio Events
        //     'new-sound': function(ev, options){
        //         console.log('doob just captured a %s event :)', options.name);
        //         console.log(options.dispatcher)
        //     },
        //     // io events.
        //     'new-graph': function(ev, options){
        //         console.log('doob just captured a %s event :)', options.name);
        //         console.log(options.dispatcher)
        //     },
        //     // effect events
        //     'new-delay': function(ev, options){
        //         console.log('doob just captured a %s event :)', options.name);
        //         console.log(options.dispatcher)
        //     },
        //     'new-reverb': function(ev, options){
        //         console.log('doob just captured a %s event :)', options.name);
        //         console.log(options.dispatcher)
        //     },
        //     'new-biquad': function(ev, options){
        //         console.log('doob just captured a %s event :)', options.name);
        //         console.log(options.dispatcher)
        //     }
        // };
        try {
            this.context = new webkitAudioContext();
            this.masterGain = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
            this.masterGain.connect(this.context.destination);
            this.masterGain._node = "doobMasterGain";
        }
        catch(e) {
            console.log(e);
            throw 'doob can\'t be running in your browser. Sorry!';
        }
        // this.uniqueNames = uniqueNames;
        this.soundProvider = function() {
            return 'remote';
        };
        // this.contains = contains;

        this.uniqueNames = (function invocation(self){

            var sound = 1, graph = 1, chain = 1, reverb = 1,  
            delay = 1, biquad = 1, gain = 1, soundPattern = 1, reverbImpulse = 1;
            var namePreFix = {
                'sound': 'sound_',
                'delay': 'delay_',
                'reverb': 'reverb_',
                'biquad': 'biquad_',
                'graph': 'graph_',
                'chain': 'chain_',
                'gain': 'gain_',
                'soundPattern': 'soundPattern_',
                'reverbImpulse': 'reverbImpulse_'
            };
            return {
                get SoundPattern(){
                    do {
                        var c = soundPattern++;
                        var name = namePreFix['soundPattern'] + c;
                    }while(self.assets[name]);
                    return name;
                }, get Gain(){
                    do {
                        var c = gain++;
                        var name = namePreFix['gain'] + c;
                    }while(self.assets[name]);
                    return name;
                }, get Sound() {
                    do {
                        var c = sound++;
                        var name = namePreFix['sound'] + c;
                    }
                    while(self.assets[name]);
                    return name;
                }, get Reverb() {
                    do {
                        var c = reverb++;
                        var name = namePreFix['reverb'] + c;
                    }
                    while(self.assets[name]);
                    return name;
                }, get Graph() {
                    do {
                        var c = graph++;
                        var name = namePreFix['graph'] + c;
                    }
                    while(self.assets[name]);
                    return name;
                }, get Delay() {
                    do {
                        var c = delay++;
                        var name = namePreFix['delay'] + c;
                    }
                    while(self.assets[name]);
                    return name;
                }, get Biquad() {
                    do {
                        var c = biquad++;
                        var name = namePreFix['biquad'] + c;
                    }
                    while(self.assets[name]);
                    return name;
                }, get Chain() {
                    do {
                        var c = chain++;
                        var name = namePreFix['chain'] + c;
                    }
                    while(self.assets[name]);
                    return name;
                }, get ReverbImpulse() {
                    do {
                        var c = reverbImpulse++;
                        var name = namePreFix['reverbImpulse'] + c;
                    }
                    while(self.assets[name]);
                    return name;
                }
            };
        }(this));
        
        this.contains = (function() {
            var results = {};
            return function(container, containee){
                if (results[container] && results[container][containee]) 
                    return results[container][containee];
                if (container == containee) {
                    results[container] = container;
                    results[container][containee] = true;
                    return true;
                }
                if (container.name && containee.name && containee.name == container.name){
                    results[container] = container;
                    results[container][containee] = true;
                    return true;
                }
                if (Object.prototype.toString.call(container) !== '[object Array]') {
                    results[container] = container;
                    results[container][containee] = false;
                    return false;
                } 
                if (Object.prototype.toString.call(containee) !== '[object Array]') {
                    if (container.indexOf(containee) != -1) {
                        results[container] = container;
                        results[container][containee] = true;
                        return true;
                    }
                    if (!containee.id) {
                        results[container] = container;
                        results[container][containee] = false;
                        return false;
                    }
                    for (var i = 0; i < container.length; ++i)
                        if (container[i].id && containee.id == container[i].id){
                            results[container] = container;
                            results[container][containee] = true;
                            return true;
                        }
                    results[container] = container; 
                    results[container][containee] = false;
                    return false;
                }
                var containeename = [], containernames = [];
                for (var i = 0; i < container.length; ++i){
                    if (container[i].name) containernames.push(container[i].name)
                };
                for (var i = 0; i < containee.length; ++i) {
                    if (containee[i].name && containernames.indexOf(containee[i].name) == -1)  {
                        results[container] = container;
                        results[container][containee] = false;
                        return false;
                    }
                    if (container.indexOf(containee[i]) == -1)  {
                        results[container] = container;
                        results[container][containee] = false;
                        return false;
                    }
                    //if (containee[i].name) containeename.push(containee[i].name);
                }
                results[container] = container;
                results[container][containee] = true;
                return true;
            };
        }());

        this.subscribers = {
         all: []
        };
    };
    
    var uniqueNames = (function invocation(){

        var sound = 1, graph = 1, chain = 1, reverb = 1,  
        delay = 1, biquad = 1, gain = 1, soundPattern = 1, reverbImpulse;
        var namePreFix = {
            'sound': 'sound_',
            'delay': 'delay_',
            'reverb': 'reverb_',
            'biquad': 'biquad_',
            'graph': 'graph_',
            'chain': 'chain_',
            'gain': 'gain_',
            'soundPattern': 'soundPattern_',
            'reverbImpulse': 'reverbImpulse_'
        };
        return {
            get SoundPattern(){
                do {
                    var c = soundPattern++;
                    var name = namePreFix['soundPattern'] + c;
                }while(this.assets[name]);
                return name;
            }, get Gain(){
                do {
                    var c = gain++;
                    var name = namePreFix['gain'] + c;
                }while(this.assets[name]);
                return name;
            }, get Sound() {
                do {
                    var c = sound++;
                    var name = namePreFix['sound'] + c;
                }
                while(this.assets[name]);
                return name;
            }, get Reverb() {
                do {
                    var c = reverb++;
                    var name = namePreFix['reverb'] + c;
                }
                while(this.assets[name]);
                return name;
            }, get Graph() {
                do {
                    var c = graph++;
                    var name = namePreFix['graph'] + c;
                }
                while(this.assets[name]);
                return name;
            }, get Delay() {
                do {
                    var c = delay++;
                    var name = namePreFix['delay'] + c;
                }
                while(this.assets[name]);
                return name;
            }, get Biquad() {
                do {
                    var c = biquad++;
                    var name = namePreFix['biquad'] + c;
                }
                while(this.assets[name]);
                return name;
            }, get Chain() {
                do {
                    var c = chain++;
                    var name = namePreFix['chain'] + c;
                }
                while(this.assets[name]);
                return name;
            }, get ReverbImpulse() {
                do {
                    var c = reverbImpulse++;
                    var name = namePreFix['reverbImpulse'] + c;
                }
                while(this.assets[name]);
                return name;
            }
        };
    }());
         
        var contains = (function() {
            var results = {};
            return function(container, containee){
                if (results[container] && results[container][containee]) 
                    return results[container][containee];
                if (container == containee) {
                    results[container] = container;
                    results[container][containee] = true;
                    return true;
                }
                if (container.name && containee.name && containee.name == container.name){
                    results[container] = container;
                    results[container][containee] = true;
                    return true;
                }
                if (Object.prototype.toString.call(container) !== '[object Array]') {
                    results[container] = container;
                    results[container][containee] = false;
                    return false;
                } 
                if (Object.prototype.toString.call(containee) !== '[object Array]') {
                    if (container.indexOf(containee) != -1) {
                        results[container] = container;
                        results[container][containee] = true;
                        return true;
                    }
                    if (!containee.id) {
                        results[container] = container;
                        results[container][containee] = false;
                        return false;
                    }
                    for (var i = 0; i < container.length; ++i)
                        if (container[i].id && containee.id == container[i].id){
                            results[container] = container;
                            results[container][containee] = true;
                            return true;
                        }
                    results[container] = container; 
                    results[container][containee] = false;
                    return false;
                }
                var containeename = [], containernames = [];
                for (var i = 0; i < container.length; ++i){
                    if (container[i].name) containernames.push(container[i].name)
                };
                for (var i = 0; i < containee.length; ++i) {
                    if (containee[i].name && containernames.indexOf(containee[i].name) == -1)  {
                        results[container] = container;
                        results[container][containee] = false;
                        return false;
                    }
                    if (container.indexOf(containee[i]) == -1)  {
                        results[container] = container;
                        results[container][containee] = false;
                        return false;
                    }
                    //if (containee[i].name) containeename.push(containee[i].name);
                }
                results[container] = container;
                results[container][containee] = true;
                return true;
            };
        }());

    // doob.prototype.publish = function(ev, options) {
    //     var ev = ev || 'all';

    //     if (this.subscribers[ev]) {
    //         for (var i in this.subscribers[ev])
    //             this.subscribers[ev][i](options);
    //     }
    //     // console.log(ev)
    //     // if (ev != 'all') return;
    //     for (var i in this.subscribers['all'])
    //             this.subscribers['all'][i](ev, options);
    // };

    // doob.prototype.subscribe = function(ev, subscriber) {
    //     if (!ev || (subscriber && typeof subscriber != 'function')) return;
    //     if (typeof ev == 'function') {
    //         var subscriber = ev;
    //         ev = 'all';
    //     };
    //     if (!this.subscribers[ev]) this.subscribers[ev] = [];
    //     this.subscribers[ev].push(subscriber);
    // };

    // doob.prototype.unsubscribe = function(ev, subscriber) {
    //     var ev = ev || 'all';
    //     if (typeof ev != 'string' || typeof subscriber != 'function' ||
    //         !this.subscribers[ev]) return;
    //     this.subscribers[ev].splice(this.subscribers[ev].indexOf(subscriber), 1);
    // };

    // doob.prototype.loadBuffer = function(config, callback) {

    //     if (!config.url) throw 'loadBuffer : Invalid arguments';
    //     if (loadedAssets[config.url]) {
    //         console.log('exists: %s', config.url);
    //         if (config.load && typeof config.load === 'function') 
    //             config.load(loadedAssets[config.url]);

    //         if (callback) return callback(loadedAssets[config.url]);
    //         return;
    //     }


    //     var request = new XMLHttpRequest();

    //     request.open('GET', config.url, true);
    //     request.responseType = 'arraybuffer';

    //     request.onload = function() {

    //         if (config.loading && typeof config.loading === 'function') config.loading();

    //         this.context.decodeAudioData(request.response, function(buffer){

    //             loadedAssets[config.url] = buffer;

    //             if (config.load && typeof config.load === 'function') config.load(buffer);

                
    //         });
    //     };
    //     request.send();
    // }

    // return doob;
});