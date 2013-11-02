define(['services/services'], 
function(services){

	services.factory('WaveSurferService', 
	[
	function() {
		return function(container, assetUrl) {
			// console.log(container);
			var options = {
				container: container,
				waveColor: 'gray',
				progressColor: 'black',
				loaderColor: 'purple',
				cursorColor: 'navy',
				markerWidth: 2,
				renderer: 'Canvas' // 
			};
			var wavesurfer = Object.create(WaveSurfer);
			wavesurfer.init(options);
    		wavesurfer.load(assetUrl);
    		return wavesurfer;
		};
	}]);
	
});