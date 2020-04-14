/*
	General: students can get their most recent attempt back.
*/
define([
    'jquery',
    'require',
    'contents',
    'base/js/namespace',
    'base/js/utils',
    'tree/js/newnotebook',
    'base/js/i18n',
    'base/js/dialog',
    'base/js/events',
    'services/config',
    'nbextensions/url',
    'nbextensions/username',
    'nbextensions/control'
], function ($,
             require,
             contents_service,
             IPython,
             utils,
             newnotebook,
             i18n,
             dialog,
             events,
             config,
             getUrl,
             getUsername,
             control,
             Jupyter) {
    'use strict';

function load_ipython_extension(){


		var common_options = {
           	base_url: $('body').data().baseUrl,
           	notebook_path: $('body').data("notebookPath")
		};
		var cfg = new config.ConfigSection('tree', common_options);
        cfg.load();
        common_options.config = cfg;
		var common_config = new config.ConfigSection('common', common_options);
		common_config.load();
		var contents = new contents_service.Contents({
			base_url: common_options.base_url,
			common_config: common_config
		});
		var new_question = function (path, options) {
		//send a "PUT" request to notebook api
			var fileName = options.content.cells[0].metadata.name;
			var data = JSON.stringify({
				content: options.content,
				type: options.type
			});
			var settings = {
				processData: false,
				type: "PUT",
				data: data,
				contentType: 'application/json',
				dataType: "json"
			};
			return utils.promising_ajax(contents.api_url(path + '/' + fileName + '.ipynb'), settings);
		};


			function addQuestionCell(question_data){
			//put notebook content into the notebook content
                var kernel_name= "python3";
                var w=window.open(undefined, IPython._target);
                new_question(common_options.notebook_path, {type: "notebook", content: question_data}).then(
                	function (data) {

                    	var url = utils.url_path_join(
                       		common_options.base_url, 'notebooks',
                        	utils.encode_uri_components(data.path)
                    	);

                    	url += "?kernel_name=" + kernel_name;
                    	w.location = url;
						console.log(url);
						console.log(w.location);
               		},
                	function (error) {
                    	dialog.modal({
                        	title: i18n.msg._('Creating Notebook Failed'),
                        	body: i18n.msg.sprintf(i18n.msg._("The error was: %s"), error.message),
                        	buttons: {'OK': {'class': 'btn-primary'}}
                    	});
                	}
            	);
			}

			
		
			function getQuestionHelper(question_id){
			//send data to api backend
				var username_all = getUsername.getUsernameForConfig();
				var username = "";
				var user_id = "";
				if(username_all == "localhost"){
					username = "localhost";
					user_id = "localhost";
				}
				else{
                    username = username_all;
                    user_id = username;
// 					var temp = username_all.split("_");
// 					user_id = temp[temp.length - 1];
// 					username = username_all.substr(0, username_all.length - user_id.length - 1);
// 					if(username == ""){
// 						username = user_id;
// 					}
				}
				var data = {"question_id": question_id, "username": username, "user_id": user_id};
        		var api_url = getUrl.getUrlForConfig("getStudentQuestion");
				console.log(api_url);
				var xhr = new XMLHttpRequest();
				xhr.open('POST', api_url, true);
				xhr.setRequestHeader('Content-type', 'application/json');
				xhr.setRequestHeader('Access-Control-Allow-Methods', 'Post, Get, Options');
				xhr.setRequestHeader('Access-Control-Allow-Origin','*');
				xhr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type');
				xhr.onreadystatechange = function(){
					if(xhr.readyState==4 && xhr.status==200){
						addQuestionCell(JSON.parse(xhr.responseText));
					}
				}
				xhr.send(JSON.stringify(data));
			}

			function httpGetAsync(url, callback){
			//Send username to backend api
				var username_all = getUsername.getUsernameForConfig();
				var username = "";
				var user_id = "";
				if(username_all == "localhost"){
					username = "localhost";
					user_id = "localhost";
				}
				else{
					var temp = username_all.split("_");
					user_id = temp[temp.length - 1];
					username = username_all.substr(0, username_all.length - user_id.length - 1);
					if(username == ""){
						username = user_id;
					}
				}
				var data = {"username": username, "user_id": user_id};
				var xmlr = new XMLHttpRequest();
				xmlr.onreadystatechange = function(){
					if(xmlr.readyState == 4 && xmlr.status == 200){
						callback(JSON.parse(xmlr.responseText));
					}
				}
				xmlr.open('POST', url , true);
				xmlr.setRequestHeader('Content-type', 'application/json');
				xmlr.setRequestHeader('Access-Control-Allow-Methods', 'Post, Get, Options');
				xmlr.setRequestHeader('Access-Control-Allow-Origin','*');
				xmlr.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type');
				var data = {"username": username, "user_id": user_id};
				xmlr.send(JSON.stringify(data));
			}

			var createDialog = function(question_list){
			// create a dialog for students to select their attempts
				
				var form = $("<form></form>").attr("id", "question_form_id")
				var selector = $("<select></select>").attr("id", "question_selector").attr("name", "question_selected_id").attr("class","form-control");
				selector.append($("<option class = 'inner'></option>").attr("value", "null").text(""));
				var q_titles = new Array()
				$.each(question_list, function(index, value){
					q_titles.push(value["question_title"]);
				});
				q_titles.sort();
				$.each(q_titles, function(index, value){
					var input = value;
					$.each(question_list, function(index2, value2){
						if(value2["question_title"] == input){
							selector.append($("<option class='inner'></option>").attr("value", index2).text(value2["question_title"]));
							return false;
						}
					});
				});
				form.append(selector);
				form.append("<br>");
				var $container = $(`
    				<div class='container' style='width: 100%; padding: 2.5px;'>
      				<h2>Question Information</h2>
     				<div class='panel panel-default'>
        			<div class='panel-body' id='question-info'>
          			<h2 id='question_title'></h2>
          			<h4 id='question_author'></h4>
          			<small id='question_description'></small>
          
        			</div>
      				</div>
   				 	</div>
    				`);
    			form.append($container)
				selector.bind("change", function(){
					var q_id = $('#question_selector').find(":selected").val();
					var question_title = question_list[q_id]["question_title"];
					var question_description = question_list[q_id]["question_description"];
					var question_author = question_list[q_id]["author"];
			
					$('#question_title').text(question_title);	
					$('#question_des').text(question_description);
           			$('#question_author').text(question_author);
        		    
				});	
				
				dialog.modal({
					title: i18n.msg._('Please select your previous attempt'),
					body: form,
					buttons:{

						'OK': {
							'class': 'btn-primary', 'click': function(){
								var question_id = $('#question_selector').find(":selected").val();
								getQuestionHelper(question_id);
							}
						},
						'Cancel': {
							'class': 'btn-default', 'click': function(){console.log("cancel");}
						}
					}
				});
			}

			var getAttempts = function(){
 				$('#get_a').toggleClass("active");				
				var api_url = getUrl.getUrlForConfig("getStudentAllQuestions");				
				httpGetAsync(api_url,createDialog);
			};

			var form = $('<div/>')
			.addClass('pull-right sort_button')
			.appendTo('#notebook_list_header');

			$('<button/>')
			.attr('type', 'button')
 			.attr('id', 'get_a')
			.addClass('btn btn-default btn-xs')
			.attr('data-toggle', 'button')
			.attr('title', 'Match case')
			.css('font-weight', 'bold')
			.text('In Progress Questions')
			.on('click', getAttempts)
 			.appendTo(form);
	}
	var ifEnable = control.getExtensionList();
	if (IPython.notebook.metadata.umich.submit === "yes") {
        if(ifEnable.getattempts == "true"){
            return {
                load_ipython_extension: load_ipython_extension
            };
        }
    }
});
