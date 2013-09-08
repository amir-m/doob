module.exports = {
	'user:broadcast:start': {
		text: '_$varBroadcaster started to broadcast!',
		vars: function(varBroadcaster){
			return {
				'_$varBroadcaster': {
					variable: '_$varBroadcaster',
					modelType: 'user',
					value: varBroadcaster
				}
			}
		}, 
	},
	'user:broadcast:stop': {
		text: '_$varBroadcaster stoped broadcasting!',
		vars: function(varBroadcaster){
			return {
				'_$varBroadcaster': {
					variable: '_$varBroadcaster',
					modelType: 'user',
					value: varBroadcaster
				}
			}
		}, 
	},
	'new:sequencer:SoundPattern': {
		text: '_$varBroadcaster created _$varSoundPattern, a new Sound Pattern!',
		vars: function(varBroadcaster, varSoundPattern) {
			return {
				'_$varBroadcaster': {
					variable: '_$varBroadcaster',
					modelType: 'user',
					value: varBroadcaster
				},
				'_$varSoundPattern': {
					variable: '_$varSoundPattern',
					modelType: 'soundpattern',
					value: varSoundPattern
				}
			}
		}
	}
};