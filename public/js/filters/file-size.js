define(['filters/filters'], function(filters){

	filters.filter('fileSize', 
	[
	function () {
	
		return function (input) {
			
			if (input >= 1024 * 1024 * 1024 * 1024)
				return (Math.round(input * 100 / (1024 * 1024 * 1024 * 1024)) / 100).toString() + 'TB';

			if (input >= 1024 * 1024 * 1024)
				return (Math.round(input * 100 / (1024 * 1024 * 1024)) / 100).toString() + 'GB';

			if (input >= 1024 * 1024)
				return (Math.round(input * 100 / (1024 * 1024)) / 100).toString() + 'MB';

			return (Math.round(input * 100 / 1024) / 100).toString() + 'KB';
		};
	}]);
});