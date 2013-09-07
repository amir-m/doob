module.exports = {
	'user:broadcast:start': {
		text: '_$varBroadcaster started to broadcast!',
		vars: function(varBroadcaster){
			return {
				variable: '_$varBroadcaster',
				modelType: 'user',
				value: varBroadcaster
			}
		}, 
	},
	'user:broadcast:stop': {
		text: '_$varBroadcaster stoped broadcasting!',
		vars: function(varBroadcaster){
			return {
				variable: '_$varBroadcaster',
				modelType: 'user',
				value: varBroadcaster
			}
		}, 
	}
};