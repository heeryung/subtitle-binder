define([
    'jquery',
    'require',
    'base/js/namespace'
], function ($,
             require,
             Jupyter) {
	function load_ipython_extension() {
		$(window).on("load",function(){
		nb_content = JSON.parse(JSON.stringify(Jupyter.notebook));
		//For submitted question, hide all submit buttons
		if(nb_content.cells[0].metadata.submit == "submit"){
			$($('#save-notbook').children()[0]).prop('disabled', true);
			$('#submit-solution').attr('disabled', 'disabled');
			$('#submit-solution').hide();
			$('#rating').attr('disabled', 'disabled');
			$("#rating").hide();
		}
		else{
			$('.part-answer-button').hide();
		}
        
		});
	}
    if (IPython.notebook.metadata.umich.submit === "yes") {
        return {
            load_ipython_extension: load_ipython_extension
        };
    }
});
