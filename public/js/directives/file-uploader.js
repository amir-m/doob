define(['directives/directives'], function(directives){

	directives.directive('fileUploader', 
	['$http', '$timeout', '$document', '$filter', 'idService', 'auth',
	function ($http, $timeout, $document, $filter, idService, auth) {
	
		return {

			link: function(scope, element, attrs) {

				var supportedType = {
					'mp3': 'audio/mp3',
					'mp4': 'audio/mp4',
					'm4a': 'audio/x-m4a',
					'wav': 'audio/wav',
					'aac': 'audio/aac',
					'ogg': 'audio/ogg'
				};

				scope.progressReports = {}; 

				$("#multiplefileuploader").bind('change', fileSelected);

				$("#startupload").bind('click', function (){
					$('#multiplefileuploader').click();
				});

				function fileSelected (event) {

					event.preventDefault();

					var queue = [], payloads = [], noneHTML5 = [], badFiles = [], files, 
						totalDuration = 0;

					files = $("#multiplefileuploader")[0].files;

					for (var i = 0; i < files.length; ++i) {
						
						var file = files[i],
							type = file.name.split(".")[files[i].name.split(".").length - 1].toLowerCase();
						
						if (!(type in supportedType)) {

							badFiles.push({
								fileName: file.name,
								actualSize: file.size,
								contentType: file.type,
								timestamp: new Date().getTime(),
							});
						}
						else {
							queue.push(i);
						}
						
					};

					prepareUpload(queue, files, payloads);
					// reportBadFiles();

				};

				function prepareUpload (queue, files, payloads) {

					var ids = idService(queue.length);
					ids.then(function (ids) {

						for (var i = 0; i < queue.length; ++i) {
							
							var file = files[queue[i]];

							var fileSize = 0;
							
							if (file.size > 1024 * 1024 * 1024)
								fileSize = (Math.round(file.size * 100 / (1024 * 1024 * 1024)) / 100).toString() + 'GB';

							else if (file.size > 1024 * 1024)
								fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
							
							else
								fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
							
							payloads.push({
								id: ids[i],
								fileName: file.name,
								fileSize: fileSize,
								actualSize: file.size,
								contentType: supportedType[file.name.split(".")[files[i].name.split(".").length - 1].toLowerCase()],
								timestamp: new Date().getTime()
							});

						};

						prepareUpload(payloads, totalSize, files);
						/*
						* Account type is unlimited
						*/
						if (scope.me.accType == 10) {

							upload(payloads, files);

						} 
						/*
						* Account type is either basic or limited. Check the quota.
						*/
						else {

							upload(payloads, files);
						}

					}, function () {
						scope.$emit("error:message", "Something went wrong! Please try again.");
					});
					
				};

				function upload(payloads, files) {

					queue = [];

					$http.post('/upload', payloads).success(function (credentials) {
						
						if (credentials.length != payloads.length || files.length != payloads.length) 
							throw 'Response from POST /upload does not match with requests.';

						var xhr = [];

						for (var i = 0; i < payloads.length; ++i)
							xhr[i] = new XMLHttpRequest();

						for (var i = 0; i < payloads.length; ++i) {

							scope.progressReports[i] = {
								fileName: payloads[i].fileName,
								fileSize: payloads[i].fileSize,
								duration: 0,
								size: payloads[i].actualSize,
								status: 'Processing...',
								progress: '0%', 
								id: payloads[i].id
							};
						
							var form = new FormData();

							form.append('key', "user/"+scope.username+'/'+payloads[i].id);
							form.append('AWSAccessKeyId', credentials[i].s3Key);
							form.append('acl', "public-read");
							form.append('policy', credentials[i].s3PolicyBase64);
							form.append('signature', credentials[i].s3Signature);
							form.append('Content-Type', payloads[i].contentType);
							form.append('file', files[i]);
							
							(function(i){

							    xhr[i].upload.addEventListener("progress", function (e) {
							    	$('#'+scope.progressReports[i].id).removeClass();
							    	uploadProgress(e, i);
							    }, false);

							    xhr[i].addEventListener("load", function (e) {
							    	$('#'+scope.progressReports[i].id).removeClass();
							    	uploadComplete(e, i, payloads[i], credentials[i].publicUrl);
							    }, false);

							    xhr[i].addEventListener("error",  function (e) {
							    	$('#'+scope.progressReports[i].id).removeClass();
							    	uploadFailed(e, i);
							    }, false);

							    xhr[i].addEventListener("abort", function (e) {
							    	$('#'+scope.progressReports[i].id).removeClass();
							    	uploadCanceled(e, i);
							    }, false);

							    xhr[i].open('POST', credentials[i].postURL);   
							    xhr[i].setRequestHeader("Access-Control-Allow-Origin","*");

							    xhr[i].send(form);

							    queue.push(i);
							    $("#btmloaderimg").show();

							}(i));
						};

					}).error(function (error) {
						console.log(error);
					});
				};

				function uploadHtml5FileError() {
					console.log('error biacht!');
				};

				function uploadProgress (event, index) {
					var p = auth.authenticate();
					p.then();

					$('#'+scope.progressReports[index].id).addClass('info');
					scope.progressReports[index].status = "Processing";
					scope.progressReports[index].progress = Math.round(event.loaded * 50 / event.total).toString() + '%';
					scope.$emit("info:message", "Processing " + scope.progressReports[index].progress, null, true);
					apply();
				};

				function uploadComplete (event, index, payload, url) {

					queue.splice(queue.indexOf(index), 1);
					
					var uploadedSound = soundManager.createSound({
						url: 'https://s3.amazonaws.com/doob/user/'+scope.username+'/'+payload.id,
						id: payload.id,
						whileloading: function() {
							$('#'+scope.progressReports[index].id).addClass('info');
							scope.progressReports[index].status = "Processing";
							scope.progressReports[index].progress = (50 + Math.round(this.bytesLoaded * 50 / this.bytesTotal)).toString() + '%';
							scope.$emit("info:message", "Processing " + scope.progressReports[index].progress, null, true);
							var p = auth.authenticate();
							p.then();
							apply();
						}
					});


					uploadedSound.load({
						onload: function(success) {

							if (!success) {
								console.log('couldn`t load your sound ');
								return;
							}
							
							payload['duration'] = uploadedSound.duration;

							if ((scope.me.quota - uploadedSound.duration) < 0) {
								
								$('#'+scope.progressReports[index].id).addClass('danger');

								scope.$emit("error:message", "Quota reached! Please upgrade or buy quota",
								 3000);
								$('#startupload').removeAttr('disabled');
								
								apply();

								$http.delete('/audio/'+payload.id).success(function(){
									console.log('quota reached!!');
									console.log(scope.me.quota, uploadedSound.duration);
								}).error(function(error, status) {
									console.log(error, status);
								});

								return;
							}

							$http.put('/upload', payload).success(function(audio) {

								scope.me.quota -= payload.duration;
								scope.me.audioFilesCount++;
								scope.progressReports[index].duration = payload.duration;
								$('#'+scope.progressReports[index].id).addClass('danger');
								queue.splice(queue.indexOf(index), 1);

								if (queue.length == 0) {
									$("#btmloaderimg").hide();
									scope.$emit("success:message", "Upload completed!", 3000);
									$('#startupload').removeAttr('disabled');
								};

								console.log(audio)
							}).error(function(data, stat){
								/** quota reached!*/
								console.log('error!!');
								if (stat == 402)
									console.log('quota reached!!');
							});

							$('#'+scope.progressReports[index].id + " > #columnshare").show();

							scope.progressReports[index].status = "Uploaded!";
							scope.progressReports[index].progress = '100%';
							apply();
							

						}
					});
				};

				function uploadFailed (event, index) {
					$('#'+scope.progressReports[index].id).addClass('error');
					scope.progressReports[index].status = "Upload Failed!";
					scope.progressReports[index].progress = '-';
					apply();
				};

				function uploadCanceled (event, index) {
					$('#'+scope.progressReports[index].id).addClass('warning');
					scope.progressReports[index].status = "Upload Canceled!";
					scope.progressReports[index].progress = '-';
					apply();
				};

				function apply () {
					if (scope.$$phase != '$apply' && scope.$$phase != '$digest')
						scope.$apply();
				};
			}
		}
	}]);
});