module.exports = {
	'user:broadcast:start': function(data) {
		return data.broadcaster + ' started to broadcast!'; 
	},
	'user:broadcast:stop': function(data) {
		return data.broadcaster + ' stoped broadcasting!'; 
	}, 
	'user:follow': function(data) {
		
		return '`'+data.broadcaster + '` is following `'+ data.following +'`!'
	},
	'user:subscribe': function(data) {
		
		return '`'+data.broadcaster + '` subscribed to `'+ data.to +'`!'
	},
	'new:sequencer:SoundPattern': function(data) {
		return data.broadcaster + ' created '+ data.message.name+', a new Sound Pattern!'; 
	},
	'update:sequencer:SoundPattern:newTrack': function(data) {
		return data.broadcaster + ' added another track called `'+ data.message.track +
		 '` to the `'+data.message.pattern+'` Sound Pattern!'; 
	}, 
	'update:sequencer:SoundPattern:changeTempo': function(data) {
		return data.broadcaster + ' changed the tempo of ' + data.message.name + '!';
	},
	'update:sequencer:SoundPattern:changeSteps': function(data) {
		return data.broadcaster + ' changed the steps of ' + data.message.name + '!';
	}
};