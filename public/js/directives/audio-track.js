define(['directives/directives'], function(directives){

	directives.directive('audioTrack', 
	['$filter',
	function ($filter) {
	
		return {
			templateUrl: 'partials/template/doob/audio-track.html',
			restrict: 'E',
			replace: true,
			link: function(scope, element, attrs) {

				scope.sound = null;
				scope.playState = "play";
				scope.isPlayed = false;
				scope.time = $filter('time')(scope.audioFile.timestamp, 'compare:now');

				scope.tempyyloo = function(input, format) {
					console.log(scope.time);
				};

				$(element.children('#playerui360')).attr('href', 'https://s3.amazonaws.com/doob/user/qoi/NTI0OGNkNzcxMjNlNmRlNjFhMDAwMDA0'); 

				WaveSurfer();

				var ws = WaveSurfer($(element.children('#waveform')), scope.audioFile.bufferLink);
				var ws = WaveSurferService($(element.children('#waveform'))[0], 'https://s3.amazonaws.com/doob/user/qoi/NTI0OGNkNzcxMjNlNmRlNjFhMDAwMDA0');

				scope.playMe = function () {
					if (!scope.sound)
					scope.sound = soundManager.createSound({
						id: scope.audioFile._id,
						url: 'https://s3.amazonaws.com/doob/user/qoi/NTI0OGNkNzcxMjNlNmRlNjFhMDAwMDA0'
					});

					if (!scope.isPlayed) {
						scope.sound.play();
						scope.playState = "pause";
					}
					else {
						scope.sound.pause();
						scope.playState = "play";
					}
					scope.isPlayed = !scope.isPlayed;
				};
				
				this.config = {

					playNext: false,
					autoPlay: false,
					allowMultiple: false,
					loadRingColor: '#450745',
					playRingColor: '#8D8D8D',
					backgroundRingColor: '#E8F70F',
					circleDiameter: 147,
					circleRadius: 73.5,
					animDuration: 500,
					animTransition: Animator.tx.bouncy,
					showHMSTime: true,

					useWaveformData: true,
					waveformDataColor: '#450745',
					waveformDataDownsample: 2,
					waveformDataOutside: false,
					waveformDataConstrain: false,
					waveformDataLineRatio: 0.22,

					useEQData: true,
					eqDataColor: '#339933',
					eqDataDownsample: 1,
					eqDataOutside: true,
					eqDataLineRatio: 0.54,

					usePeakData: true,
					peakDataColor: '#ff33ff',
					peakDataOutside: true,
					peakDataLineRatio: 0.5,

					useAmplifier: true

				};

			}
		}
	}]);
});