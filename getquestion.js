/*
	General:
	This extension is relevant to button "Load Question". Users can retrieve the questions they created and edit them.
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
	'nbextensions/control',
	'nbextensions/username'
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
             control,
			 Jupyter,
			 getUsername
             ) {
    'use strict';
function getUsernameForConfig() {
		if (window.location.href.split("/")[2].substring(0, 9) == "localhost") {
			return "localhost";
		}
		else {
			//return window.location.href.split("/")[4];
//			return window.location.href.split("/")[2].split(".")[0];
            return URL(window.location.href);
		}
	}

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


      // Open question NB
	function addQuestionCell(question_data){
		var kernel_name= "python3";
		//var w=window.open(undefined, IPython._target);
		var w=window.open(undefined, "_self");
		new_question(common_options.notebook_path, {type: "notebook", content: question_data}).then(
			function (data) {
				var url = utils.url_path_join(
					common_options.base_url, 'notebooks',
					utils.encode_uri_components(data.path)
				);

				url += "?kernel_name=" + kernel_name;
					w.location = url;
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

      // Open question given this id and this user
	function getQuestionHelper(question_id){
	//EFFECTS: send username to backend
		var username_all = getUsername.getUsernameForConfig();
		var data = {};
		if(username_all != "localhost"){
			username_all = username_all.split("_");
			var user_id = username_all[username_all.length - 1];
			var temp = getUsername.getUsernameForConfig();
			var username = temp.substr(0, temp.length - user_id.length - 1);
			if(username == ""){
				username = user_id;
			}
			data = {"question_id": question_id, "username": username, "user_id": user_id};
		}
		else{
			var user_id = "localhost";
			var username = "localhost";
			data = {"question_id": question_id, "username": username, "user_id": user_id};
		}
		var api_url = getUrl.getUrlForConfig("getStudentQuestion");
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

function load_ipython_extension(){
	

	function httpGetAsync(url, callback){
		var username_all = getUsername.getUsernameForConfig();
		var data = {};
		if(username_all != "localhost"){
			username_all = username_all.split("_");
			var user_id = username_all[username_all.length - 1];
			var temp = getUsername.getUsernameForConfig();
			var username = temp.substr(0, temp.length - user_id.length - 1);
			data = {"username": username, "user_id": user_id};
		}
		else{
			var user_id = "localhost";
			var username = "localhost";
			data = {"username": username, "user_id": user_id};
		}
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
		xmlr.send(JSON.stringify(data));
	}

	// Creates the HTML menu for question selection
	function createDialog(questionListJSON) {
        var form = $("<form></form>").attr("id", "question-form");
		var selector = $("<select></select>")
                   .attr("id", "question-selector")
                   .attr("class", "form-control")
                   .css("margin", "0px");
		selector.append($("<option class = 'inner'></option>").attr("value", "null").text(""));
		var $submit_optgroup = $("<optgroup label='Completed Questions'></optgroup>");
		var $in_progress_optgroup = $("<optgroup label='In Progress Questions'></optgroup>");
		var $other_optgroup = $("<optgroup label='New Questions'></optgroup>");
		
		var question_titles = new Array();
		$.each(questionListJSON, function(index, value){
			question_titles.push(value["question_title"]);
		});
		
		question_titles.sort();
		$.each(question_titles, function(index, value){
			$.each(questionListJSON, function(index2, value2){
				if(value2["question_title"] == value){
					var name = value2["question_title"];
					var $option = $("<option class = 'inner'></option>").attr("value", index2).text(name);
					var submit_status = value2["submit"];
					var progress_status = value2["progress"]
					if(submit_status == "submit"){
						$submit_optgroup.append($option);
					}
					else{
						if(progress_status == "InProgress"){
							$in_progress_optgroup.append($option);
						}
						else{
							$other_optgroup.append($option);
						}
					}
					return false;
				}
					
			});
		});
		selector.append($submit_optgroup);
		selector.append($in_progress_optgroup);
		selector.append($other_optgroup);
		form.append(selector);

    var $container = $(`
    <div class='container' style='width: 100%; padding: 2.5px;'>
      <h2>Question Information</h2>
      <div class='panel panel-default'>
        <div class='panel-body' id='question-info'>
          <h2 id='question_title'></h2>
          <h4>
            <span id='quality-stars'></span>
          </h4>
          <h4>
            <span id='difficulty-stars'></span>
          </h4>
          <h4 id='question_author'></h4>
          <small id='question_description'></small>
          <h4 id = 'submit-warning'></h4>
        </div>
      </div>
    </div>
    `);
    form.append($container)

	selector.bind("change", function(){
		var q_id = $('#question-selector').find(":selected").val();
		var question_title = questionListJSON[q_id]["question_title"];
		var question_description = questionListJSON[q_id]["question_description"];
		var question_author = questionListJSON[q_id]["author_username"];
      	var quality_rating = questionListJSON[q_id]["quality_average"];
      	var difficulty_rating = questionListJSON[q_id]["difficulty_average"];
		
      	$("#question_title").text(question_title);
      	$("#question_description").text(question_description);
      	$("#question_author").text(question_author);
		if(questionListJSON[q_id]["submit"] == "submit"){
			$("#submit-warning").text("You have submitted this question. You can not modify it, but you can check its answer.").css("color", "red");
		}
		else{
			$("#submit-warning").text("");
		}

      function updateStars($span, rating, title) {
        if (rating < 1) {
          $span.html(title + ": No Rating");
        } else {
          var filledStar = "&#9733";
          var emptyStar = "&#9734";
          var maxStars = 5;
          var starText = title + ": ";
          var i = 0;
          for (; i < rating && i < maxStars; i++) {
            starText += filledStar + " ";
          }
          for (; i < maxStars; i++) {
            starText += emptyStar + " ";
          }
          $span.html(starText);
        }
      }
      updateStars($("#quality-stars"), quality_rating, "Quality");
      updateStars($("#difficulty-stars"), difficulty_rating, "Difficulty");
		});


		dialog.modal({
			title: i18n.msg._('Please Select a Question'),
			body: form,
			buttons:{
				'OK': {
					'class': 'btn-primary', 'id': 'ok-button', 'click': function(){
						var q_id = $('#question-selector').find(":selected").val();
						getQuestionHelper(q_id);
					}
				},
				'Cancel':{
					'class': 'btn-defult',
					'click': function(){
						console.log("cancel");
					}
				}
			},
			open: function(){
				$("#question-selector").focus();
				$("#question-selector").bind("keyup", function(key){
					if(key.which == 13){
						$("#ok-button").click();
					}
				});
			}
		});

	}

	var getQuestion = function(){
		// toggle button back
		$('#get_q').toggleClass("active");
		var api_url = "";
		api_url = getUrl.getUrlForConfig("getMyQuestions");
		httpGetAsync(api_url,createDialog);
	};

	var form = $('<div/>')
	.addClass('pull-right sort_button')
	.appendTo('#notebook_list_header');

	/*
	$('<button/>')
	.attr('type', 'button')
	.attr('id', 'get_q')
	.addClass('btn btn-default btn-xs')
	.attr('data-toggle', 'button')
	.attr('title', 'Match case')
	.css('font-weight', 'bold')
	.text('Load Question')
	.on('click', getQuestion)
	.appendTo(form);*/

  // var bootstrapCssUrl = "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
  // function loadCss(url) {
  //   var link = document.createElement("link");
  //   link.type = "text/css";
  //   link.rel = "stylesheet";
  //   link.href = url;
  //   document.getElementsByTagName("head")[0].appendChild(link);
  // }
  // loadCss(bootstrapCssUrl);
	}

	var ifEnable = control.getExtensionList();
	if(ifEnable.getquestion == "true"){
		if(control.callLoadQuestion() != false){
			var question_id = control.callLoadQuestion();
			if(window.location.href.indexOf("tree") != -1){
				//if in tree
				getQuestionHelper(question_id);
			}
			return {
				load_ipython_extension: load_ipython_extension
			};
		}
		else{
			return {
				load_ipython_extension: load_ipython_extension
			};
		}
	}
});
