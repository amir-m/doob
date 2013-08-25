define([], function () {
	return function(doob){
        return (function invocation(doob){   
            var events = ['new-graph'];
            var Gain = function (config) {
                var self = this, context = doob.context;
                properties = {
                    name: {
                        value: (config && config.name 
                            && !doob.assets[config.name]) ? config.name : doob.uniqueNames.Gain,
                        enumerable: true, writable: true, configurable: false 
                    },
                    asset: {
                        value: context.createGain ? context.createGain() : context.createGainNode(),
                        enumerable: true, writable: false, configurable: false
                    },
                    destination: {
                        value: (config && config.destination && config.destination.connectable) ? 
                        config.destination : doob.masterGain,
                        enumerable: true, writable: true, configurable: false
                    }, 
                    connectable: {
                        value: null,
                        enumerable: true, writable: true, configurable: false
                    }
                };
                
                properties.asset.value.gain.value = properties.value;
                properties.asset.value._node = properties.name.value;
                properties.connectable.value = properties.asset.value;

                Object.defineProperties(this, properties);
                this.constructor = 'Gain';

                // this.value(config && config.value || 1, 'dontpublish');

                this.asset.connect(this.destination);

                //doob.addAsset(this);
                doob.assets[this.name] = this;
                doob.assetsToJSON[this.name] = this.toJSON();

            };
            Gain.prototype.value = function(value, flag) {
                if (!value) return;

                if (flag)
                    flag = flag == 'dontpublish' ? false : true
                else 
                    flag = true;

                value = parseFloat(value);
                
                if (isNaN(value)) return;

                this.asset.gain.value = value;

                if (this.publish && flag) this.publish('value', value);
            };
            
            Gain.prototype.toJSON = function() {
                return {
                    type: 'Gain',
                    name: this.name,
                    destination: this.destination._node
                };
            };

            var Graph = function(config) {
                var self = this;
                // console.log(config)
                if (!config || !config.node) 
                    throw 'io.Graph : Invalid source.';

                config.source = config.source.asset || config.source;


                // config.source = config.source.asset || config.source;

                // if (!config.source.connect && config.source.asset) {
                //  var nodes = {};
                //  nodes['source'] = config.source;
                //  config.source = config.source.asset;
                // }



                
                // if (!config.source.connect && config.source.asset) {
                //  var nodes = {};
                //  nodes['source'] = config.source;
                //  config.source = config.source.asset;
                // } 


                // if (config.destination && !config.destination.connect && config.destination.asset) {
                //  var nodes = nodes || {};
                //  nodes['destination'] = config.destination;
                //  config.destination = config.destination.asset;
                // }

                var dest = config.destination || doob.masterGain, self = this;
                var properties = {
                    source: {
                        value: config.source,
                        enumerable: true, writable: true, configurable: false
                    }, destination: {
                        value: dest,
                        enumerable: true, writable: true, configurable: false
                    }, send: {
                        value : config.send,
                        enumerable: true, writable: true, configurable: false
                    }, name: {
                        value: (function(){
                            var name = config.node.name && !doob.graphs[config.node.name + '_graph'] ? 
                            config.node.name + '_graph' : doob.uniqueNames.Graph;
                            return name;
                        }()),
                        enumerable: true, writable: false, configurable: false
                    }, 
                    connectable: {
                        value: config.connectable,
                        enumerable: true, writable: false, configurable: false
                    }, 
                    node: {
                        value: config.node,
                        enumerable: true, writable: false, configurable: false
                    }
                };
                // if (nodes)
                //  properties['nodes'] = {
                //      value: nodes,
                //      enumerable: true, writable: false, configurable: false
                //  };
                // Invoked as a constructor.
                if (this instanceof Graph) {
                    Object.defineProperties(this, properties);
                    this.constructor = 'Graph'
                    this.connect();
                    if(!doob.graphs[this.name]) doob.graphs.push(this.name);
                    doob.assets[this.name] = this;
                    doob.assetsToJSON[this.name] = this.toJSON();
                    doob.graphs[this.name] = this;
                    // io.publish('new-graph', {name: 'new-graph',
                    //     dispatcher: self.toJSON()
                    // });
                }
                // Invoked as a factory function.
                else {
                    var o = Object.create(Graph.prototype, properties); 
                    o.constructor = 'Graph'
                    o.connect();
                    if(!doob.graphs[o.name]) doob.graphs.push(o.name);
                    doob.assets[o.name] = o;
                    doob.assetsToJSON[o.name] = o.toJSON();
                    // io.publish('new-graph', {name: 'new-graph',
                    //     dispatcher: o.toJSON()
                    // });
                    return o;
                }           
            };
            Graph.prototype.connect = function(node) {
                // connect to the destination
                this.source.connect(this.destination);

                // if there's any send on this graph
                if (this.send) 
                    // connect to all sends
                    this.send.forEach(function(graphName){
                        this.source.connect(doob.assets[graphName].connectable);
                    })

                return this;
                // this.destination = this.destination.asset || this.destination;
                // this.sources = this.source.asset || this.source;
                // if (!this.source || !this.source.connect) {
                //     throw 'Graph.connect : Invalid source.'; 
                // }
                // if (!this.destination) 
                //     throw 'Graph.connect : Invalid destination.';
                // // Interchangeable call...
                // if (node) return this.addSend(node);
                // // If there's no send, just connect to the destination.
                // if (!this.send) {
                //     this.source.connect(this.destination);
                //     return this;
                // }
                // // If there's only a single effect on the send, connect to it's asset.
                // if (Object.prototype.toString.call(this.send) !== '[object Array]') {
                //     this.source.connect(this.send.asset ? this.send.asset : this.send);
                //     this.source.connect(this.destination);
                //     return this;
                // }
                // if (this.send.length == 1) {
                //     this.source.connect(this.send[0].asset ? this.send[0].asset : this.send[0]);
                //     this.source.connect(this.destination);
                //     return this;                
                // }
                // for (var i = 0; i < this.send.length; ++i) {
                //     if (this.send[i] instanceof Graph) {
                //         this.source.connect(this.send[i].source);
                //     } else if (this.send[i] instanceof Chain) {
                //         for (var j = 0; j < this.send[i].nodes.length; ++j)
                //             this.source.connect(this.send[i].nodes[j]);
                //     } else {
                //         this.source.connect(this.send[i].asset ? this.send[i].asset : this.send[i]);
                //     }
                // };
                // this.source.connect(this.destination);
                // return this;
            };
            Graph.prototype.disconnect = function() {
                var j = 0;
                if (this.send && Object.prototype.toString.call(this.send) !== '[object Array]') {
                    this.source.disconnect(this.send.asset ? this.send.asset : this.send);
                } else if (this.send) {
                    for (var i = 0, l = this.send.length; i < l; ++i) {
                        this.source.disconnect(this.send[i].asset ? this.send[i].asset :
                         this.send[i]);
                    }
                }
                this.source.disconnect(this.destination);   
                return this;
            };
            Graph.prototype.addSend = function(node) {

                // bad argument, argument has no graph, argument has no connectable resource
                if (!node || !node.graph || !node.graph.connectable) return this;

                // there's no send attached 
                if (!this.send) 
                    this.send = [];
                else if (Object.prototype.toString.call(this.send) != '[object Array]') 
                    this.send = [this.send];

                // argument has already been added
                else if (this.send.indexOf(node.graph.name) != -1) return this;
                
                // connect this graph to the argument
                this.source.connect(node.graph.connectable);

                // push this argument to send list of this graph
                this.send.push(node.graph.name);

                console.log(this)
                return this;
                
            };
            Graph.prototype.unSend = function(node) {

                // bad argument, argument has no graph, agrument is not an effect or other connectable,
                // this graph has no send, this graph has send but the argument is not in its sends
                if (!node || !node.graph || !node.graph.connectable || !this.send || 
                    this.send.length == 0 || this.send.indexOf(node.graph.name) == -1) return this;

                // remove the argument from the list of this graph's sends
                this.send.splice(this.send.indexOf(node.graph.name), 1);

                // disconnect the source of this graph.
                this.source.disconnect();

                // connect the source to all other destinations
                this.connect();

                return this;

            }
            Graph.prototype.insert = function(node) {
                var self = this;
                // Nothing to insert.
                if (!node) return this;
                // First Insert: Graph object.
                if (!self.insertNode && node instanceof Graph) {
                    self.insertNode = {
                        destination: self.destination,
                        node: new Chain({nodes: node, name: self.name+'_insertNode'}),
                        connect: connect,
                        disconnect: disconnect
                    };
                    return self.insertNode.connect(4);
                // First Insert: Chain object.
                }  else if (!self.insertNode && node instanceof Chain){
                    self.insertNode = {
                        destination: self.destination,
                        node: node,
                        connect: connect,
                        disconnect: disconnect 
                    };
                    return self.insertNode.connect(2);
                // First insert: single effect.
                } else if (!self.insertNode && node.asset) {
                    self.insertNode = {
                        destination: self.destination,
                        node: new Chain({nodes: [node], name: self.name+'_insertNode'}),
                        connect: connect,
                        disconnect: disconnect 
                    };
                    return self.insertNode.connect(1);
                // First insert: invalid node.
                } else if (!self.insertNode && !node.asset) return this;
                // Not the first insert.    
                else if (self.insertNode.node) {
                    self.insertNode.node.connect(node);
                    return self.insertNode.connect(2);
                // Not the first insert. The first insert is a 
                } else if (self.insertNode.node && self.insertNode.node.indexOf(node) == -1) {
                    self.insertNode.node.push(node);
                    return self.insertNode.connect(3);
                } else return self;
                function connect(type){
                    // Single insert node.

                    if (type == 1) {
                        var dest = self.insertNode.node.nodes[0].asset;
                        dest.connect(self.destination);
                        self.destination = dest;
                        self.disconnect();
                        self.connect();
                        return self;
                    };
                    // Graph Object
                    if (type == 4) {
                        var src = self.insertNode.node.source, 
                        dest = self.insertNode.node.destination;
                        dest.connect(self.destination);
                        self.destination = src;
                        self.disconnect();
                        self.connect();
                        return self;
                    }
                    // Chain object.
                    if (type == 2) {
                        var src = self.insertNode.node.nodes[0], 
                        dest = self.insertNode.node.nodes[self.insertNode.node.nodes.length - 1];
                        dest = dest.asset || dest;
                        dest.connect(self.destination);
                        self.destination = src;
                        self.disconnect();
                        self.connect();
                        return self;
                    };
                    if (type == 3) {
                        var node = self.insertNode.node, dest = node[node.length - 1];
                        dest instanceof Graph ? dest.source.disconnect() : dest.asset.disconnect();
                        dest instanceof Graph ? dest.source.connect(node instanceof Graph 
                            ? node.source : node.asset) : dest.asset.connect(node instanceof Graph 
                            ? node.source : node.asset);
                            return self;
                        }
                        if (self.insertNode.node.length == 1) {
                            self.insertNode.node[0] instanceof Graph ? 
                            self.insertNode.node[0].destination.connect(self.destination) :
                            self.insertNode.node[0].asset.connect(self.destination);
                            self.destination = self.insertNode.node[0] instanceof Graph ? 
                            self.insertNode.node[0].source : self.insertNode.node[0].asset;
                            self.disconnect();
                            self.connect();
                            return self;
                        };
                        var source = self.insertNode.node[0] instanceof Graph ? 
                        self.insertNode.node[0].source :
                        self.insertNode.node[0].asset; 
                        for (var i = 1; i < self.insertNode.node.length; ++i){
                            source.disconnect();
                            source.connect(self.insertNode.node[i] instanceof Graph ? 
                                self.insertNode.node[i].source : 
                                self.insertNode.node[i].asset);
                            source = self.insertNode.node[i] instanceof Graph ? 
                            self.insertNode.node[i].source : 
                            self.insertNode.node[i].asset;
                        };
                        --i;
                        self.insertNode.node[i] instanceof Graph ? 
                        self.insertNode.node[i].source.connect(self.destination) :
                        self.insertNode.node[i].asset.connect(self.destination);
                        self.destination = self.insertNode.node[i] instanceof Graph ? 
                        self.insertNode.node[i].source : self.insertNode.node[i].asset;
                        self.disconnect();
                        self.connect();
                        return self;
                    };
                    function disconnect(){
                        self.disconnect();
                        self.destination = this.destination;                    
                        self.connect();
                        delete self.insertNode;
                    };
            };
            Graph.prototype.remove = function(node){
                if (!this.insertNode) return this;
                if (!node || !this.insertNode.node instanceof Chain ||
                    this.insertNode.node == node) {
                    this.insertNode.disconnect();
                    return this;
                };
                if (this.insertNode.node instanceof Chain && node) {
                    var insertChain = this.insertNode.node;
                    insertChain.remove(node);
                    // this.insertNode.disconnect();
                    this.insert(insertChain);
                    return this;
                }
            };
            Graph.prototype.toString = function() {
                return 'io.Graph object ' + this.name + '.';
            };
            Graph.prototype.isEqualTo = function(graph) {
                if (!graph || !graph instanceof Graph || !graph.name) return false;
                if (this === graph) return true;
                if (this.name == graph.name) return true;
                return false;
            };
            Graph.prototype.toJSON = function(){
                var dest = this.destination._node || 
                    (this.destination.connectable ? this.destination.connectable._node : 
                        doob.masterGain._node);
                return {
                    type: 'Graph',
                    name: this.name,
                    connectable: this.connectable ? this.connectable._node : null,
                    source: this.source._node,
                    destination: dest
                };
            };
            var Chain = function(config) {
                var config = config || {};
                if (config.name) {
                    if (doob.chains[config.name]) config.name = doob.uniqueNames.Chain;
                } else config.name = doob.uniqueNames.Chain;
                if (config.nodes) {
                    var g = [];
                    if (Object.prototype.toString.call(config.nodes) === '[object Array]')
                        for (var i = 0; i < config.nodes.length; ++i)
                            g.push(_findConnectable(config.nodes[i]));
                    else g.push(_findConnectable(config.nodes));
                }
                var properties = {
                    nodes: {
                        value: g,
                        enumerable: true, writable: true, configurable: false
                    }, name : {
                        value: config.name,
                        enumerable: true, writable: true, configurable: false
                    }
                }
                // Invoke as a constructor.
                if (this instanceof Chain) {
                    Object.defineProperties(this, properties);
                    this.constructor = 'Chain';
                    if (this.nodes) this.connect();
                    if (!doob.chains[this.name]) doob.chains.push(this.name);
                    doob.assets[this.name] = this;
                    doob.assetsToJSON[this.name] = this.toJSON();
                // Invoke as object.
                } else {
                    var o = Object.defineProperties(Chain.prototype, properties);
                    o.constructor = 'Chain';
                    if (o.nodes) o.connect();
                    if (!doob.chains[o.name]) doob.chains.push(o.name);
                    doob.assets[this.name] = o;
                    doob.assetsToJSON[o.name] = o.toJSON();
                    return o;               
                }
            };
            Chain.prototype.connect = function() {

                console.log(this)

                // connect to the destination
                this.source.connect(this.destination);

                // if there's any send on this graph
                if (this.send) 
                    // connect to all sends
                    this.send.forEach(function(graphName){
                        this.source.connect(doob.assets[graphName].connectable);
                    })

                return this;

            };
            Chain.prototype.disconnect = function(){
                var source = this.nodes[0].asset;
                for (var i = 0; i < this.nodes.length; ++i) {
                    source.disconnect(this.nodes[i].asset);
                    source = this.nodes[i].asset;
                };
                return this;
            };
            Chain.prototype.remove = function(node){
                if (!node) return this;
                if (!node.asset) node = _findConnectable(node);
                var index = this.nodes.indexOf(node);
                if (!node.asset || index == -1) return this;
                if (index == 0) {
                    this.nodes[0].asset.disconnect(node.asset);
                    this.nodes = [];
                    return this;
                };
                var length = this.nodes.length - 1;
                this.nodes.splice(this.nodes.indexOf(node), 1);
                if (index == length) {
                    this.nodes[index - 1].asset.disconnect(node.asset);
                    return this;
                } 
                node.asset.disconnect(this.nodes[index].asset);
                if (index != 0) {
                    this.nodes[index - 1].asset.disconnect(node.asset);
                    this.nodes[index - 1].asset.connect(this.nodes[index].asset);
                }
                return this;
            };
            Chain.prototype.toString = function() {
                return 'io.Chain object ' + this.name + '.';
            };
            Chain.prototype.isEqualTo = function(chain) {
                if (!chain || !chain instanceof Chain || !chain.name) return false;
                if (this === chain) return true;
                if (this.name == chain.name) return true;
                return false;
            };
            var _connect = function(self, node, nodeType){
                var nodeType = nodeType || node instanceof Graph ? 1: (node instanceof Chain?
                    2: (Object.prototype.toString.call(node) != '[object Array]'? 3 : 4));

                console.log(nodeType)
                switch(nodeType) {
                        // Graph
                        case 1: 
                        self.source.connect(node.source);
                        if (node.nodes) self.send.push(node.nodes['source']);
                        else self.send.push(node.source);
                        return;
                        // Chain
                        case 2:
                        self.source.connect(node.nodes[0]);
                        self.send.push(node.nodes[0]);
                        return;
                        // Single Effect
                        case 3:
                        self.source.connect(node.asset);
                        self.send.push(node);
                        return;
                        // Array
                        case 4:
                        for (var i = 0; i < node.length; ++i) {
                            _connect(self, node[i]);
                        }
                        return;
                        default:
                        return;
                    };
                };
            var _findConnectable = (function(){
                var connections = {};
                for (var i in connections)
                    if (!doob.graphs[connections[i]] && !doob.chains[connections[i]] && 
                        !effects['Reverb'][connections[i]] && !effects['Delay'][connections[i]] &&
                            !effects['Biquad'][connections[i]])
                        delete connections[i];
                return function(node) {
                    if (!node.name) throw 'Graph : Invalid graph node.';
                    if (connections[node.name]) return connections[node.name];
                    if (node instanceof Graph) {
                        
                        if (node.source.connect) {
                            connections[node.name] = node.source;
                            return connections[node.name];
                        } 
                        else if (node.source.asset) {
                            connections[node.name] = node.source.asset;
                            return connections[node.name];
                        }

                        else {
                            connections[node.name] = (function(){
                            throw 'Graph : Invalid Graph ('+node.name+
                                '). The source of '+node.name+' does not accept input connections.';
                            }());
                            throw 'Graph : Invalid Graph ('+node.name+
                                '). The source of '+node.name+' does not accept input connections.';
                        } 
                    } else if (node instanceof Chain) {
                        if (node.graph) {
                            connections[node.name] = node.graph[0];
                            return node.graph[0];
                        } else {
                            connections[node.name] = (function(){
                                throw 'Chain : Invalid Chain ('+node.name+
                                '). '+node.name+' does not accept input connections.';
                            }());
                            throw 'Chain : Invalid Chain ('+node.name+
                                '). '+node.name+' does not accept input connections.';
                        };                      
                    } else if (node.name) {
                        connections[node.name] = node;
                        return node;
                    };
                }
            }());
            var find = (function(){
                var connections = [];
                return {
                    connectable: function(name) {
                        if (!name) return null;
                        
                        if (typeof name != 'string') 
                            throw 'ERROR io.findConnectable: bad argument! String required.';

                        if (connections[name]) return connections[name];

                        var node = doob.assets[name], 
                            type = node.constructor;

                        if (node.graph) {
                            connections[name] = node.graph.source;
                            return connections[name];
                        };

                        switch (type) {
                            case 'Gain': 
                                connections[name] = node.asset;
                            break;
                            case 'Graph': 
                                connections[name] = node.source;
                            break;
                            case 'Chain':
                                connections[name] = node.list[0]; 
                            break;
                            case 'Reverb':
                                connections[name] = node.gain.asset; 
                            break;
                            case 'Delay':
                                connections[name] = node.gain.asset; 
                            break;
                            case 'Biquad':
                                connections[name] = node.gain.asset; 
                            break;
                            default: 
                                return null;
                        };
                    },
                    deleteConnectable: function(args) {
                        console.log('io.deleteConnectable has been called!');
                        console.log(args);
                        if (connections[args[1]]) delete connections[args[1]];
                        return;
                    }
                }
            }());
            // doob.subscribe('delete-asset', find.deleteConnectable);
            return {
                Graph: Graph,
                Chain: Chain,
                Gain: Gain,
                find: find,
                events: events
            };
        }(doob));
    };
});