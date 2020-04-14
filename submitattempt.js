/*
	General: students can submit their solution
*/

define([
    'jquery',
    'require',
    'base/js/namespace',
    'base/js/dialog',
    'base/js/i18n',
    'nbextensions/url',
    'nbextensions/username'
], function ($,
             require,
             Jupyter,
             dialog,
             i18n,
             getUrl,
             getUsername) {
	function load_ipython_extension() {

		function getNotebookContent() {

            notebookContent = {};
            // Below it was <= earlier. Anant changed it to >=
            if (Jupyter.notebook.get_cells().length >= 1) {
                notebookContent = JSON.stringify(Jupyter.notebook);
            } else {
                notebookContent = {
                    err: 'no content was found in the notebook'
                };
            }
            return notebookContent;
        }

        var handlerSubmit = function (license, nbname, description) {
        	//EFFECTS: send students information to database
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
				// var temp = username_all.split("_");
				// user_id = temp[temp.length - 1];
				// username = username_all.substr(0, username_all.length - user_id.length - 1);
				// if(username == ""){
				// 	username = user_id;
				// }
			}


		  	var question_id = Jupyter.notebook.get_cell(0).metadata.question_id;

            var notebook_json = {
                "notebook_content": getNotebookContent(),
                "username": username,
                "user_id": user_id,
                "license":license,
                "nbname":nbname,
                "description":description
            };
            Jupyter.notebook.rename(nbname);
            oldSaveNotebook();
            saveNotebookJsonToMySQLDatabase(notebook_json);
        };

        function saveNotebookJsonToMySQLDatabase(data) {
			var api_url = "";
            api_url = getUrl.getUrlForConfig("saveStudentAns");
            var xhr = new XMLHttpRequest();
            xhr.open('POST', api_url, true);
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(JSON.stringify(data));
        }

        /*
          returns: { part_id : student solution }
        */
        function getPartIdToStudentSolution() {
          var partIdToSolution = {};
          var CELLS = Jupyter.notebook.get_cells();
          CELLS.forEach(function(CELL, i) {

            // Student solution
            if ("part_id" in CELL.metadata && CELL.metadata.editable) {
              const PART_ID = CELL.metadata.part_id;
              const CODE_MIRROR_TEXT = CELL.code_mirror.getValue();
              partIdToSolution[PART_ID] = CODE_MIRROR_TEXT;
            }
          });
          return partIdToSolution;
        }

        function dispatchSubmitSolutionEvent() {
          const EVENT_TITLE = 'Student Submitted Solution';
          const PART_ID_TO_SOLUTION = getPartIdToStudentSolution();
          var submitSolutionEvent = new CustomEvent(EVENT_TITLE, {
            detail: {
              "event_title" : "student submitted solutions",
              "time" : Date.now(),
              "student_solutions" : PART_ID_TO_SOLUTION
            }
          });
          document.dispatchEvent(submitSolutionEvent);
        }

        var oldSaveNotebook = function (check_last_modified) {
                if (check_last_modified === undefined) {
                    check_last_modified = true;
                }

                var error;
                if (!Jupyter.notebook._fully_loaded) {
                    error = new Error("Load failed, save is disabled");
                    Jupyter.notebook.events.trigger('notebook_save_failed.Notebook', error);
                    return Promise.reject(error);
                } else if (!Jupyter.notebook.writable) {
                    error = new Error("Notebook is read-only");
                    Jupyter.notebook.events.trigger('notebook_save_failed.Notebook', error);
                    return Promise.reject(error);
                }

                // Trigger an event before save, which allows listeners to modify
                // the notebook as needed.
                Jupyter.notebook.events.trigger('before_save.Notebook');

                // Create a JSON model to be sent to the server.
                var model = {
                    type : "notebook",
                    content : Jupyter.notebook.toJSON()
                };
                // time the ajax call for autosave tuning purposes.
                var start =  new Date().getTime();

                var that = Jupyter.notebook;
                var _save = function () {
                    return that.contents.save(that.notebook_path, model).then(
                        $.proxy(that.save_notebook_success, that, start),
                        function (error) {
                            that.events.trigger('notebook_save_failed.Notebook', error);
                        }
                    );
                };

                if (check_last_modified) {
                    return Jupyter.notebook.contents.get(Jupyter.notebook.notebook_path, {content: false}).then(
                        function (data) {
                            var last_modified = new Date(data.last_modified);
                            // We want to check last_modified (disk) > that.last_modified (our last save)
                            // In some cases the filesystem reports an inconsistent time,
                            // so we allow 0.5 seconds difference before complaining.
                            if ((last_modified.getTime() - that.last_modified.getTime()) > 500) {  // 500 ms
                                console.warn("Last saving was done on `"+that.last_modified+"`("+that._last_modified+"), "+
                                            "while the current file seem to have been saved on `"+data.last_modified+"`");
                                if (that._changed_on_disk_dialog !== null) {
                                    // update save callback on the confirmation button
                                    that._changed_on_disk_dialog.find('.save-confirm-btn').click(_save);
                                    // redisplay existing dialog
                                    that._changed_on_disk_dialog.modal('show');
                                } else {
                                  // create new dialog
                                  that._changed_on_disk_dialog = dialog.modal({
                                    notebook: that,
                                    keyboard_manager: that.keyboard_manager,
                                    title: i18n.msg._("Notebook changed"),
                                    body: i18n.msg._("The notebook file has changed on disk since the last time we opened or saved it. "
                                          + "Do you want to overwrite the file on disk with the version open here, or load "
                                          + "the version on disk (reload the page)?"),
                                    buttons: {
                                        Reload: {
                                            class: 'btn-warning',
                                            click: function() {
                                                window.location.reload();
                                            }
                                        },
                                        Cancel: {},
                                        Overwrite: {
                                            class: 'btn-danger save-confirm-btn',
                                            click: function () {
                                                _save();
                                            }
                                        },
                                    }
                                  });
                                }
                            } else {
                                return _save();
                            }
                        }, function (error) {
                            // maybe it has been deleted or renamed? Go ahead and save.
                            return _save();
                        }
                    );
                } else {
                    return _save();
                }
            }

        var submitNotebookInfo = function() {
			console.log("Submit Notebook Info");
        	// create a dialog modal and let students know their answer is saved
			var nbName = Jupyter.notebook.get_cell(0).metadata['name'];
			var description = Jupyter.notebook.get_cell(0).metadata['description'];
			var license = Jupyter.notebook.get_cell(0).metadata['license'];
      		handlerSubmit(license, nbName, description);
      		dispatchSubmitSolutionEvent();
		};
        
        // Hide default save notebook button.
        $('#save-notbook').click(function(){
        	submitNotebookInfo();
        });
        $('#save-notbook').attr("title", "save progress");
    }
	if (IPython.notebook.metadata.umich.submit === "yes") {
        var nb_content = JSON.parse(JSON.stringify(Jupyter.notebook));

        if(nb_content.cells[0].metadata.submit != "submit"){
            return {
                load_ipython_extension: load_ipython_extension
            };
        };
    };
});