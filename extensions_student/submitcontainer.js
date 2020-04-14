/*
	General: users can save their docker container as a new docker image. And create a .tar.gz archive for that docker image
*/
define([
    'jquery',
    'require',
    'base/js/namespace',
    'base/js/dialog',
    'base/js/i18n',
	'nbextensions/username'
], function ($,
             require,
             Jupyter,
             dialog,
             i18n,
			 getUsername){
	function load_ipython_extension() {
		
		function httpGetAsync(url, email){
			var username = getUsername.getUsernameForConfig();
			var xhr = new XMLHttpRequest();
			var data = {"username": username, "email": email};
			xhr.open('POST', url , true);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.setRequestHeader('Access-Control-Allow-Methods', 'Post, Get, Options');
			xhr.setRequestHeader('Access-Control-Allow-Origin','*');
			xhr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type');
			xhr.send(JSON.stringify(data));
		}
		
		var createDialog = function(){
			var form = $("<form></form>").append("<h5>Please enter you email address</h5>");
			form.append("<input required style='width:100%' type='text' id='email' value=''>");
			dialog.modal({
				title: i18n.msg._('Submit your docker container'),
				body: form,
				buttons: {
					'Submit': {
						'class': 'btn-primary', 'click': function () {
							var email = $("#email").val();
							submit(email);
						} 
					},
					'Cancel': {
						'class': 'btn-default', 'click': function(){
							console.log("cancel");
						}
					}
				},
				notebook: Jupyter.notebook,
				keyboard_manager: Jupyter.keyboard_manager
			});
		
		};
		
		function submit(email){
			var url = "https://jupyter-student.mentoracademy.org:5001/handlecontainer";
			httpGetAsync(url, email);
		}

// 		Jupyter.toolbar.add_buttons_group([{
// 			label: 'Submit Container',
// 			icon: 'fa-floppy-o',
// 			id: 'submit-container',
// 			callback: createDialog
// 		}]);
	}

	if (IPython.notebook.metadata.umich.submit === "yes") {
        return {
            load_ipython_extension: load_ipython_extension
        };
    }
});
