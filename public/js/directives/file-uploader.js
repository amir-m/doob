define(['directives/directives'], function(directives){

	directives.directive('fileUploader', 
	['$http', '$timeout',
	function ($http, $timeout) {
	
		return {

			link: function(scope, element, attrs) {

				scope.progressReports = {}; 
				var queue = [], payloads;
				scope.myQuota = function () {

					if (scope.me.quota >= 1024 * 1024 * 1024)
						return (Math.round(scope.me.quota * 100 / (1024 * 1024 * 1024)) / 100).toString() + 'GB';

					else if (scope.me.quota >= 1024 * 1024)
						return (Math.round(scope.me.quota * 100 / (1024 * 1024)) / 100).toString() + 'MB';

					else
						return (Math.round(scope.me.quota * 100 / 1024) / 100).toString() + 'KB';

				};

				$("#multiplefileuploader").bind('change', fileSelected);

				$("#startupload").bind('click', function (){
					$('#multiplefileuploader').click();
				});


				function fileSelected (event) {

					event.preventDefault();

					var files = $("#multiplefileuploader")[0].files;
					// console.log($('#au').get(0).duration )
					// console.log(files[0])

					// if (files.length == 1 && files[0]) {

					// 	$http.get('/id').success(function (id) {
							
					// 		var file = files[0];
						
					// 		var fileSize = 0;
							
					// 		if (file.size > 1024 * 1024 * 1024)
					// 			fileSize = (Math.round(file.size * 100 / (1024 * 1024 * 1024)) / 100).toString() + 'GB';

					// 		else if (file.size > 1024 * 1024)
					// 			fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
							
					// 		else
					// 			fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';						
						
					// 		prepareUpload(file, id, fileSize);

					// 	}).error(function (error) {
					// 		scope.$emit("error:message", "Something went wrong! Please try again.");
					// 	});
					// }
					// else if (files.length > 1) {
						
						$http.get('/id?count='+files.length).success(function (ids) {

							payloads = [], totalSize = 0;

							for (var i = 0; i < files.length; ++i) {
								
								var file = files[i];
								
								if (file) {
									var fileSize = 0;
									
									if (file.size > 1024 * 1024 * 1024)
										fileSize = (Math.round(file.size * 100 / (1024 * 1024 * 1024)) / 100).toString() + 'GB';

									else if (file.size > 1024 * 1024)
										fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
									
									else
										fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

								};
								
								payloads.push({
									id: ids[i],
									fileName: file.name,
									fileSize: fileSize,
									actualSize: file.size,
									contentType: file.type
								});

								totalSize += file.size;
							};

							prepareUpload(payloads, totalSize, files);

						}).error(function (error) {
							scope.$emit("error:message", "Something went wrong! Please try again.");
						});
					// }
				};

				function prepareUpload (payloads, totalSize, files) {
					
					/*
					* Account type is unlimited
					*/
					if (scope.me.accType == 10) {

						upload(payloads, totalSize, files);

					} 
					/*
					* Account type is either basic or limited. Check the quota.
					*/
					else {
						if ((scope.me.quota - totalSize) < 0) {
							/*
							* Choses file is larger than user's quota. 
							** TODO: 	Save the request for later analysis.
							*/
							scope.$emit("error:message", "Unfortunately the upload is larger than your free space. You can get another 5GB for $4.");
						}
						else {

							upload(payloads, totalSize, files);

						}
					}
				};

				function upload(payloads, totalSize, files) {

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
								status: 'Processing...',
								progress: '0%', 
								id: payloads[i].id
							};
						
							var form = new FormData();

							console.log(payloads[i].id)

							form.append('key', "user/"+scope.username+'/'+payloads[i].id);
							// form.append('key', "user/"+scope.username+'/${filename}');
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
							    	uploadComplete(e, i, payloads[i]);
							    }, false);
							    xhr[i].addEventListener("error",  function (e) {
							    	$('#'+scope.progressReports[i].id).removeClass();
							    	uploadFailed(e, i);
							    }, false);
							    xhr[i].addEventListener("abort", function (e) {
							    	$('#'+scope.progressReports[i].id).removeClass();
							    	uploadCanceled(e, i);
							    }, false);

							    xhr[i].open('POST', '/test');  // credentials[i].postURL
							    // xhr[i].open('POST', credentials[i].postURL);  // 
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

				function uploadProgress (event, index) {
					$('#'+scope.progressReports[index].id).addClass('info');
					scope.progressReports[index].status = "Uploading...";
					scope.progressReports[index].progress = Math.round(event.loaded * 100 / event.total).toString() + '%';
					apply();
				};

				function uploadComplete (event, index) {
					$('#'+scope.progressReports[index].id).addClass('success');
					queue.splice(queue.indexOf(index), 1);

					$http.put('/upload', payloads[index]).success(function() {

						scope.me.quota -= payloads[index].actualSize;

						if (queue.length == 0) {
							$("#btmloaderimg").hide();
							scope.$emit("success:message", "Upload completed!", 3000);
						};
					}).error(function(){

					});
					// $timeout(function(){
					// 	$('#'+scope.progressReports[index].id + " > #columnprogress").hide('slide', {
					// 		direction: 'left'}, 1000);
					// 	// $('#'+scope.progressReports[index].id + " > #columnstatus").hide('slide', {direction: 'left'}, 1000);;
					// }, 1000);
					// $timeout(function(){
					// 	// $('#'+scope.progressReports[index].id + " > #columnprogress").hide('slide', {direction: 'left'}, 1000);;
					// 	$('#'+scope.progressReports[index].id + " > #columnstatus").hide('slide', {
					// 		direction: 'left'}, 1000);
						
					// }, 3000);
					// $timeout(function(){
						
					// }, 5000);

					$('#'+scope.progressReports[index].id + " > #columnshare").show();

					scope.progressReports[index].status = "Uploaded!";
					scope.progressReports[index].progress = '100%';
					apply();
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