define(['filters/filters'], function(filters){

	filters.filter('time', 
	['$filter',
	function ($filter) {

		var formats = {
			'long:numbers': longNumbers,
			'full:strings': fullStrings,
			'compare:now': compareNow
		};

		function longNumbers (input, mili) {

			if (input == 0) return '';

			var seconds, minutues, hours, milliseconds, s, m, h, ms;

			hours = Math.floor((input/1000) / (60*60));
			minutues = Math.floor(((input/1000) - (hours*60*60)) / 60);
			seconds = (input/1000) % 60;
			milliseconds = input % 1000;

			// hours = Math.floor(input / (60*60));
			// minutues = Math.floor((input - (hours*60*60)) / 60);
			// seconds = input % 60;
			// milliseconds = (input * 1000) % 1000;

			h = hours == 0 ? 0 : hours < 10 ? 1 : 2;
			m = minutues == 0 ? 0 : minutues < 10 ? 1 : 2;
			s = seconds == 0 ? 0 : seconds < 10 ? 1 : 2;
			ms = milliseconds == 0 ? 0 : milliseconds < 10 ? 1 : milliseconds < 100 ? 2 : 3;

			hour = {
				0: '',
				1: '0' + Math.floor(hours),
				2: Math.floor(hours) 
			};

			minutue = {
				0: (h ? ':00' : ''),
				1: (h ? ':' : '') + '0' + Math.floor(minutues),
				2: (h ? ':' : '') + Math.floor(minutues) 
			};

			second = {
				0: ((m || h) ? ':00' : ''),
				1: ((m || h) ? ':' : '') + '0' + Math.floor(seconds),
				2: ((m || h) ? ':' : '') + Math.floor(seconds) 
			};

			millisecond = {
				0: ((m || s || h) ? ':000' : ''),
				1: ((m || s || h) ? ':' : '') + '00' + Math.floor(milliseconds),
				2: ((m || s || h) ? ':' : '') + '0' + Math.floor(milliseconds),
				3: ((m || s || h) ? ':' : '') + Math.floor(milliseconds)
			};

			return hour[h] + minutue[m] + second[s] + millisecond[ms];
		};

		function fullStrings (input, mili) {

			if (input == 0) return 'no time';

			var seconds, minutues, hours, milliseconds, s, m, h, ms;

			hours = Math.floor((input/1000) / (60*60));
			minutues = Math.floor(((input/1000) - (hours*60*60)) / 60);
			seconds = (input/1000) % 60;
			milliseconds = ((input/1000) * 1000) % 1000;

			// hours = Math.floor(input / (60*60));
			// minutues = Math.floor((input - (hours*60*60)) / 60);
			// seconds = input % 60;
			// milliseconds = (input * 1000) % 1000;

			h = hours == 0 ? 0 : hours == 1 ? 1 : 2;
			m = minutues == 0 ? 0 : minutues == 1 ? 1 : 2;
			s = seconds == 0 ? 0 : seconds == 1 ? 1 : 2;
			ms = milliseconds == 0 ? 0 : milliseconds == 1 ? 1 : 2;

			hour = {
				0: '',
				1: '1 hour' + expr(m, s, ms),
				2: (Math.floor(hours) + ' hours') + expr(m, s, ms)
			};

			minutue = {
				0: '',
				1: ('1 minutue') + expr(s, ms),
				2: (Math.floor(minutues) + ' minutues') + expr(s, ms)
			};

			second = {
				0: '',
				1: '1 second' + expr(ms),
				2: Math.floor(seconds) + ' seconds' + expr(ms)
			};

			millisecond = {
				0: '',
				1: '1 millisecond ',
				2: Math.floor(milliseconds) + ' milliseconds '
			};

			function expr() {

				var index = 0, exp = {
					0: ' ',
					1: ' and ',
					2: ', '
				};

				for (var i = 0; i < arguments.length; ++i) {
					if (arguments[i] != 0) ++index;
				};

				index = index > 1 ? 2 : index > 0 ? 1 : 0;
				return exp[index];
			}

			return hour[h] + minutue[m] + second[s] + millisecond[ms];
		};

		function compareNow (input) {
			
			var input = parseInt(input);
			
			if (isNaN(input)) return 'BAD INPUT!';
			
			var now = new Date(), 
				inputDate = new Date(input),
				midnight = new Date()
			
			midnight.setHours(0);
			midnight.setMinutes(0);
			midnight.setSeconds(0);
			midnight.setMilliseconds(0);
			

			var time =  ' at ' + (inputDate.getHours() == 0 ? '00' : 
				inputDate.getHours() == 12 ? '12' : inputDate.getHours() == 24 ? '00' : 
				inputDate.getHours() % 12) + ':' + (inputDate.getMinutes() < 10 ? '0' : '') 
				+ inputDate.getMinutes() + (inputDate.getHours() < 12 ? ' AM' : ' PM');

			if (inputDate.getFullYear() != now.getFullYear())
					return $filter('date')(input, 'MMM d y') + time;

			
			var nowInputDifference = now.getTime() - input, 
				nowInputDifferenceTime = new Date(nowInputDifference),
				nowMidnightDifference = now.getTime() - midnight.getTime(),
				ms = nowInputDifference % 1000,
				h = Math.floor(nowInputDifference / (1000*60*60)),
				m = nowInputDifferenceTime.getMinutes(),
				s = nowInputDifferenceTime.getSeconds(),
				d = Math.floor(h / 24);

			if (d > 0) {

				if (d == 1) {
					
					var midnightYesterday = new Date(midnight.getTime() - 86400000);
					
					if (midnightYesterday > input)
						return $filter('date')(input, 'EEEE') + time;

					return 'Yesterday' + time; 
				}

				if (d < 7) return $filter('date')(input, 'EEEE') + time;

				return $filter('date')(input, 'MMM d') + time;
			}

			if (nowInputDifference > nowMidnightDifference)
				return 'Yesterday' + time;

			if (h > 1) return h + ' hours ago';

			if (h == 1) return '1 hour ago';

			if (m > 1) return m + ' minutues ago';

			if (m == 1) return '1 minutue ago';

			if (s > 1) return s + ' seconds ago';

			if (s == 1) return '1 second ago';

			if (ms > 1) return ms + ' milliseconds ago';

			if (ms == 1) return '1 millisecond ago';

		};
	
		return function (input, format, mili) {

			return formats[format](input, mili);

		};
	}]);
});