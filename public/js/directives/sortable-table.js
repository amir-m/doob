define(['directives/directives'], function(directives){

	directives.directive('sortableTabel', ['doobio', function(doobio){

		return {

			link: function(scope, element, attrs) {

				// console.log(element[0].childNodes)
				// for (var i in element[0].childNodes)
				// 	if(element[0].childNodes[i].nodeType)
				// 		console.log(element[0].childNodes[i].nodeType)

				var fixHelperModified = function(e, tr) {
					var $originals = tr.children();
					var $helper = tr.clone();
					$helper.children().each(function(index)
					{
						$(this).width($originals.eq(index).width())
					});
					return $helper;
				};

				$(element).sortable({
					helper: fixHelperModified,
					stop: function () {
						$(element).each(function(i, el){
							// var p = $(el).text().toLowerCase().replace(" ", "_");
							// data += p+"="+$(el).index()+",";
							console.log(i);
							console.log(el);
						});
					}
				}).disableSelection();

				element.bind('sortchange', function (event, ui) {
					// console.log(ui);
				});
			}
		}
	}]);
});