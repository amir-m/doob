define(['directives/directives'], function(directives){

	directives.directive('sortableTabel', ['doobio', function(doobio){

		return {

			link: function(scope, element, attrs) {

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
							var p = $(el).text().toLowerCase().replace(" ", "_");
							data += p+"="+$(el).index()+",";
							console.log(i);
							console.log(el);
						});
					}
				}).disableSelection();
			}
		}
	}]);
});