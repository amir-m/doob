define([''], function(){

    function _handlers(self) {
        var handlers = {
            // audio Events
            audio: {
                'new:aduio:Sound': function(ev, sound, pub){

                    if (!sound) throw 'bad event!!!';

                    // var ex = sound.exportable();
                    // var path = ex.path;
                    // path = path.split(':'); //independents:sounds
            
                    if (!sound.isDummy) {
                        self.exportables.independents.sounds[sound.name] = {
                            nodetype: 'Sound',
                            name: sound.name,
                            url: sound.url,
                            graphName: sound.graph.name,
                            gainName: sound.gain.name
                        }
                        self.sounds.push(sound.name);
                    }

                    self.assets[sound.name] = sound;
                    self.assetsToJSON[sound.name] = sound.toJSON();
                    

                    if (pub) self.publish('new:aduio:Sound', 
                        self.exportables.independents.sounds[sound.name], self.name);
                }
            },
            io: {
                'new:io:Graph': function(ev, graph) {
                    
                    self.assets[graph.name] = graph;
                    self.assetsToJSON[graph.name] = graph.toJSON();
                    self.graphs[graph.name] = graph;
                    if(!self.graphs[graph.name]) self.graphs.push(graph.name);

                    self.publish('new:io:Graph', graph.toJSON(), self.name);

                }, 
                'new:io:Gain': function(ev, gain) {

                    self.assets[gain.name] = gain;
                    self.assetsToJSON[gain.name] = gain.toJSON();
                    // self.exportables.dependents.gains[gain.name] = {
                    //     name: gain.name,
                    //     belongsTo: gain.belongsTo
                    // };

                    self.publish('new:io:Gain', gain.toJSON(), self.name);
                }, 
                'update:io:Graph:addSend': function(ev, graph) {

                    self.exportables.dependents.graphs[graph.name] = {
                        nodetype: 'Graph',
                        name: graph.name,
                        send: graph.send,
                        belongsTo: graph.belongsTo,
                        sendingNodes: graph.sendingNodes
                    }
                    self.publish('update:io:Graph:addSend', graph.name, self.name);
                    
                }
            },
            effects: {
                'new:effects:impulse': function(ev, impulse) {
                    self.reverbImpulses[impulse.name] = {
                        url: impulse.url,
                        buffer: impulse.buffer
                    };
                    self.assetsToJSON[impulse.name] = {
                        nodetype: 'reverbImpulse',
                        name: impulse.name,
                        url: impulse.url
                    };
                    self.exportables.independents.effects.impulses[impulse.name] = {
                        nodetype: 'reverbImpulse',
                        name: impulse.name,
                        url: impulse.url
                    };
                self.publish(ev, self.assetsToJSON[impulse.name], self.name);
                
                },
                'new:effects:Reverb': function(ev, reverb) {
                    self.assets[reverb.name] = reverb;
                    self.assetsToJSON[reverb.name] = reverb.toJSON();
                    self.publish(ev, reverb.toJSON(), self.name);
                    
                    self.exportables.independents.effects.reverbs[reverb.name] = {
                        nodetype: 'Reverb',
                        name: reverb.name,
                        impulse: reverb.impulse,
                        graphName: reverb.graph.name
                    };
                }
            },
            sequencer: {
                'new:sequencer:SoundPattern': function(ev, pattern, pub) {

                    self.soundPatterns[pattern.name] = pattern;
                    self.assets[pattern.name] = pattern;
                    self.assetsToJSON[pattern.name] = pattern.toJSON();

                    pattern = pattern.toJSON();

                    self.exportables.independents.sequencers.soundPatterns[pattern.name] = {
                        nodetype: 'sequencer.SoundPattern',
                        name: pattern.name,
                        tracks: pattern.tracks,
                        tempo: pattern.tempo,
                        steps: pattern.steps,
                        bars: pattern.bars
                    }
                    
                    if (pub) self.publish(ev, 
                    self.exportables.independents.sequencers.soundPatterns[pattern.name], 
                    self.name);
                }, 
                'update:sequencer:SoundPattern:removeTrack' : function(ev, pattern, track, pub) {
                    
                    pattern = pattern.toJSON();

                    self.exportables.independents.sequencers.soundPatterns[pattern.name].tracks =
                        pattern.tracks;
                    
                    delete self.dummyNodes[track];

                    // console.log(self.exportables.independents.sequencers.soundPatterns[pattern.name]);
                    // console.log(self.dummyNodes)
                    if (pub) self.publish(ev, {
                        pattern: pattern.name,
                        track: track
                    }, self.name);
                },
                'update:sequencer:SoundPattern:newTrack' : function(ev, pattern, track, pub) {
                    
                    pattern = pattern.toJSON();

                    self.exportables.independents.sequencers.soundPatterns[pattern.name].tracks =
                        pattern.tracks;

                    if (pub) self.publish(ev, {
                        pattern: pattern.name,
                        track: track
                    }, self.name);
                },
                'update:sequencer:SoundPattern:toggleNote' : function(ev, pattern, track, note, pub) {
                    
                    pattern = pattern.toJSON();

                    self.exportables.independents.sequencers.soundPatterns[pattern.name].tracks =
                        pattern.tracks;

                    if (pub) self.publish(ev, {
                        pattern: pattern.name,
                        track: track,
                        note: note
                    }, self.name);
                }
            }
        };
        return handlers;
    }

    var _uniqueNames = function (self){

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
    };

    var _contains = function() {
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
    };

    return function (name) {

        this.name = name;
        this.assets = {};
        this.exportables = {
            independents: {
                sounds: {},
                effects: {
                    impulses: {},
                    reverbs: {}
                },
                sequencers: {
                    soundPatterns: {

                    }
                }
            },
            dependents: {
                gains: {},
                graphs: {}
            }
        };
        this.assetsToJSON = {};
        this.dummyNodes = {};
        this.dummySounds = {};
        this.soundPatterns = {};
        this.graphs = []; 
        this.chains = [];
        this.reverbImpulses = [];
        this.cursor; 
        this.tempo = 120;
        this.sounds = [];
        this.subscribers = {
            all: []
        };
        
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

        this.publish = function(ev, options) {

            var ev = ev || 'all', args = arguments;

            if (this.subscribers[ev]) {
                for (var i in this.subscribers[ev])
                    this.subscribers[ev][i].apply(ev, args);
            }
            // console.log(ev)
            if (ev == 'all') return;
            for (var i in this.subscribers['all'])
                    this.subscribers['all'][i].apply(ev, args);

        };

        this.insertAsset = function(asset) {
            this.assets[asset.name] = asset;

            this.publish('update:assets', asset)
        }

        this.subscribe = function(ev, subscriber) {
            if (!ev || (subscriber && typeof subscriber != 'function')) return;
            if (typeof ev == 'function') {
                var subscriber = ev;
                ev = 'all';
            };
            if (!this.subscribers[ev]) this.subscribers[ev] = [];
            this.subscribers[ev].push(subscriber);
        };

        this.unsubscribe = function(ev, subscriber) {
            var ev = ev || 'all';
            if (typeof ev != 'string' || typeof subscriber != 'function' ||
                !this.subscribers[ev]) return;
            this.subscribers[ev].splice(this.subscribers[ev].indexOf(subscriber), 1);
        };

        this.uniqueNames = _uniqueNames(this);
        // (function invocation(self){
        // }(this));
        
        this.contains = _contains();

        this.handlers = _handlers(this);
    };
});