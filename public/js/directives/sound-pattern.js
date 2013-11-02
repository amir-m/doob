define(['directives/directives'], function(directives){

	directives.directive('soundPattern', 
	['doobio', 'socket', '$rootScope',
	function(doobio, socket, $rootScope){
	
		return {
	
			templateUrl: 'partials/template/doob/sound-pattern.html',
			restrict: 'E',
			replace: true,
			link: function(scope, element, attrs) {
				

				element.bind("$destroy", function() {
					scope.stop(scope.instanceName, scope.pattern);
					scope.$destroy();

				});

				scope.totalNotes = function() {
					return new Array(scope.pattern.steps);
				};
				
				scope.removeTrack = function(track) {

					var updated = new Date().getTime();
					scope.patternInfo.updated = updated
					doobio.instances[scope.instanceName].removeTrack(track, scope.pattern.id, updated ,true);
				}

				scope.toggleNote = function(i, track) {
					
					var updated = new Date().getTime();
					scope.patternInfo.updated = updated
					doobio.instances[scope.instanceName].toggleNote(i, track, scope.pattern.id, updated, true);

					scope.patternInfo.updated = new Date().getTime();
					doobio.instances[scope.instanceName].env.assets[scope.pattern.name].toggleNote(i, patternSound, true);

				};

				scope.play = function(instanceName, p, flag){

					doobio.instances[instanceName].env.assets[p.name].tempo = p.tempo
					doobio.instances[instanceName].env.assets[p.name].steps = p.steps
					doobio.instances[instanceName].env.assets[p.name].play(flag);
				};

				scope.stop = function(instanceName, p, flag){
					doobio.instances[instanceName].env.assets[p.name].stop();
				};

				scope.toggleShowComments = function() {
					$('#spcommentinput').focus();
					$('#spcomments').slideToggle(500);
				};

				scope.likeThis = function () {

					if (!scope.mappings[scope.pattern.id].iLikeIt) {

						var promise = doobio.requestID();

						promise.then(function (id) {
							scope.mappings[scope.pattern.id].iLikeIt = true;
							scope.mappings[scope.pattern.id].likesCount++;
							socket.emit('new:soundPattern:like', {
								event: 'new:soundPattern:like',
								_id: id,
								broadcaster: $rootScope.username,
								timestamp: new Date().getTime(),
								data: {
									liker: $rootScope.username,
									resource: scope.patternInfo._id,
									resourceName: scope.pattern.name
								}
							});

						}, function (error) {
							scope.$emit("error:message", "Something went wrong. Please try again. If it still doesn`t work, please reload the page.")
						});
					}	
				};

				scope.forkThis = function () {

					if (scope.patternInfo.username == $rootScope.username) return;

					var sp = {};

					for (var i in scope.patternInfo)
						if (scope.patternInfo.hasOwnProperty(i))
							sp[i] = scope.patternInfo[i];

					sp.content.name = sp.name = sp.name+'_fork';

					var promise = doobio.requestID();

					sp.forkedFrom = {
						username: sp.username,
						id: sp._id,
						name: scope.patternInfo.name
					};

					promise.then(function(id) {
						sp.content.id = id;

						for (var i in sp.content.tracks) {
							new doobio.instances[$rootScope.username].audio.Sound({
								name: sp.content.tracks[i].name,
								url: sp.content.tracks[i].url
							});
						}

						var p = doobio.instances[$rootScope.username].forkPattern(sp);

						p.then(function (pattern){
							scope.mappings[pattern._id] = pattern;
							scope.patternInfo.forksCount++;
							scope.me.forkingCount++;
							scope.$emit("success:message", 
                                'Pattern '+ scope.patternInfo.name+
                                ' was successfully forked as '+pattern.name+'.', 3000);
						});
					});

				};

				scope.createdOrForked = function() {
					
 					return scope.patternInfo.isForked ? "Forked" : "Created";
				};
			}
		}
	}]);
});