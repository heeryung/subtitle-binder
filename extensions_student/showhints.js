define([
    'jquery',
    'require',
    'base/js/namespace',
    'base/js/dialog',
    'base/js/i18n',
    'nbextensions/url',
    'nbextensions/username',
    'nbextensions/external/seedrandom'
], function ($,
             require,
             Jupyter,
             dialog,
             i18n,
             getUrl,
             getUsername,
             seedrandom) {
    var username = getUsername.getUsernameForConfig();
    var questionId = Jupyter.notebook.get_cell(0).metadata.question_id;
    Math.seedrandom(username + questionId);
    var type_1_questions = new Array();
    type_1_questions.push("What are you hoping to get help with?");
    type_1_questions.push("Can you explain where you get stuck?");
    type_1_questions.push("What are you confused about right now?");
    type_1_questions.push("What part of the problem or task presents the challenge?");

    var type_2_questions = new Array();
    type_2_questions.push("What is the step you need to take next?");
    type_2_questions.push("What is your plan for solving the task, if the hint helps you with what you're stuck on?");
    type_2_questions.push("What next step might the hint help you take?");
    type_2_questions.push("Is there a particular obstacle the hint might help you move past, or additional information it could provide?");

    var type_3_questions = new Array();
    type_3_questions.push("How did the hint help you? Did the hint resolve some confusions or provide you missing information?");
    type_3_questions.push("Was the hint helpful? If so, in what way: did you resolve a misconception or get additional information?");
    type_3_questions.push("Did you find the hint helpful? Did it help you understand the problem better, fill in gaps in your knowledge, or provide some other kind of support?");
    type_3_questions.push("What new thoughts or ideas do you have no");

    var type_4_questions = new Array();
    type_4_questions.push("How would you use this hint?");
    type_4_questions.push("How will you use this hint in solving the problem?");
    type_4_questions.push("How do you intend to apply the hint in solving the current task?");
    type_4_questions.push("How did the hint lead you to rethink your initial plans to solve the task?");


//    var random_before = Math.floor(Math.random() * 3);

//    var random_after = Math.floor(Math.random() * 3 + 3);

	var random_before = 0;
	var random_after = 0;

    var random_1 = Math.floor(Math.random() * 4);
    var random_2 = Math.floor(Math.random() * 2);
    var random_3 = Math.floor(Math.random() * 3);
    var random_4 = Math.floor(Math.random() * 4);

    function dispatchAssignConditionEvent() {
        let eventTitle = "AssignHintConditionEvent";
        let prompt1 = random_before === 0 ? "None" : random_before;
        let prompt2 = random_after;
        var event = new CustomEvent(eventTitle, {
            detail: {
                prompt1: prompt1,
                prompt2: prompt2
            }
        });
        let intervalId = setInterval(function () {
            if (event.result != "Received") {
                document.dispatchEvent(event);
            } else {
                clearInterval(intervalId);
            }
        }, 500);
    }

    dispatchAssignConditionEvent();

    function load_ipython_extension() {

        // type: <hint/prompt>
        // typeId: <1/2>
        function dispatchHintEvent(type, typeId = null, hint = null) {
            let mapTypeToEventName = {
                prompt: "OpenHintPromptEvent",
                hint: "OpenHintAnswerEvent",
                next: "ClickHintNextEvent"
            };
            let eventTitle = mapTypeToEventName[type];
            hint.type = type;
            hint.type_id = typeId;
            var event = new CustomEvent(eventTitle, {
                detail: {
                    hint: hint
                }
            });
            document.dispatchEvent(event);
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
                type: "notebook",
                content: Jupyter.notebook.toJSON()
            };
            // time the ajax call for autosave tuning purposes.
            var start = new Date().getTime();

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
                            console.warn("Last saving was done on `" + that.last_modified + "`(" + that._last_modified + "), " +
                                "while the current file seem to have been saved on `" + data.last_modified + "`");
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
                                            click: function () {
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

        function type_1_before(hintText, hint) {
            dispatchHintEvent("prompt", "1", hint);
            var form = $("<form></form>").attr("id", "form");
            var prompt = $("<h4>" + type_1_questions[random_1] + "</h4>").attr("id", "prompt");
            var ans = $("<div><textarea rows='5' style='max-width: 100%; width: 100%' id='ans' placeholder = 'Your Answer'/></div>");
            form.append(prompt);
            form.append(ans);
            dialog.modal({
                title: i18n.msg._(' '),
                keyboard_manager: Jupyter.notebook.keyboard_manager,
                body: form,
                open: function () {
                    console.log("close")
                    $('.close').css('display', 'none');
                },
                backdrop: "static",
                keyboard: false,
                buttons: {
                    'Next': {
                        'class': 'btn-primary', 'id': 'next',
                        'click': function () {
                            hint.user_answer = $('#ans').val();
                            hint_text(hintText, hint);
                            dispatchHintEvent("next", "1", hint);
                        }
                    }
                }
            });
        }

        function type_2_before(hintText, hint) {
            dispatchHintEvent("prompt", "2", hint);
            var form = $("<form></form>").attr("id", "form");
            var prompt = $("<h4>" + type_2_questions[random_2] + "</h4>").attr("id", "prompt");
            var ans = $("<div><textarea rows='5' style='max-width: 100%; width: 100%' id='ans' placeholder = 'Your Answer'/></div>");
            form.append(prompt);
            form.append(ans);
            dialog.modal({
                title: i18n.msg._(' '),
                body: form,
                open: function () {
                    console.log("close")
                    $('.close').css('display', 'none');
                },
                backdrop: "static",
                keyboard: false,
                keyboard_manager: Jupyter.notebook.keyboard_manager,
                buttons: {
                    'Next': {
                        'class': 'btn-primary', 'id': 'next',
                        'click': function () {
                            hint.user_answer = $('#ans').val();
                            hint_text(hintText, hint);
                            dispatchHintEvent("next", "2", hint);
                        }
                    }
                }
            });
        }

        function hint_text(hintText, hint) {
            dispatchHintEvent("hint", null, hint);
            var form = $("<form></form>").attr("id", "form");
            var hint_ar = $("<h4>" + hintText + "</h4>").attr("id", "prompt");

            form.append(hint_ar);
            dialog.modal({
                title: i18n.msg._('Hint'),
                body: form,
                open: function () {
                    console.log("close")
                    $('.close').css('display', 'none');
                },
                backdrop: "static",
                keyboard: false,
                keyboard_manager: Jupyter.notebook.keyboard_manager,
                buttons: {
                    'Next': {
                        'class': 'btn-primary', 'id': 'next',
                        'click': function () {
                            dispatchHintEvent("next", null, hint);
                            if (random_after == 3) {
                                type_3_after(hint);
                            } else if (random_after == 4) {
                                type_4_after(hint);
                            } else {
                                console.log("1");
                            }
                        }
                    }
                }
            });
        }

        function type_3_after(hint) {
            dispatchHintEvent("prompt", "3", hint);
            var form = $("<form></form>").attr("id", "form");
            var prompt = $("<h4>" + type_3_questions[random_3] + "</h4>").attr("id", "prompt");
            var ans = $("<div><textarea rows='5' style='max-width: 100%; width: 100%' id='ans' placeholder = 'Your Answer'/></div>");
            Jupyter.keyboard_manager.register_events(ans);
            form.append(prompt);
            form.append(ans);
            dialog.modal({
                title: i18n.msg._(' '),
                body: form,
                open: function () {
                    console.log("close")
                    $('.close').css('display', 'none');
                },
                backdrop: "static",
                keyboard: false,
                keyboard_manager: Jupyter.notebook.keyboard_manager,
                buttons: {
                    'Next': {
                        'class': 'btn-primary', 'id': 'next',
                        'click': function () {
                            hint.user_answer = $('#ans').val();
                            dispatchHintEvent("next", "3", hint);
                        }
                    }
                }
            });
        }

        function type_4_after(hint) {
            dispatchHintEvent("prompt", "4", hint);
            var form = $("<form></form>").attr("id", "form");
            var prompt = $("<h4>" + type_4_questions[random_4] + "</h4>").attr("id", "prompt");
            var ans = $("<div><textarea rows='5' style='max-width: 100%; width: 100%' id='ans' placeholder = 'Your Answer'/></div>");
            Jupyter.keyboard_manager.register_events(ans);
            form.append(prompt);
            form.append(ans);
            dialog.modal({
                title: i18n.msg._(' '),
                body: form,
                open: function () {
                    console.log("close")
                    $('.close').css('display', 'none');
                },
                backdrop: "static",
                keyboard: false,
                keyboard_manager: Jupyter.notebook.keyboard_manager,
                buttons: {
                    'Next': {
                        'class': 'btn-primary', 'id': 'next',
                        'click': function () {
                            hint.user_answer = $('#ans').val();
                            dispatchHintEvent("next", "4", hint);
                        }
                    }
                }
            });
        }


        function insertHint(Hints, part_id) {
            // Incert a markdown cell called "hint"
            var cells = Jupyter.notebook.get_cells();
            var index_hint = 0;
            var incerted_count = 0;
            var array_hints = new Array();
            $.each(Hints, function (index, hint) {
                var temp = {
                    "hint_id": index,
                    "part_id": hint.part_id,
                    "hint_order": hint.hint_order,
                    "hint_text": hint.hint_text
                };
                array_hints.push(temp);
            });
            var student_solution_code_index = 0;
            var part_description_index = 0;
            cells.forEach(function (cell, index) {
                if (cell.metadata.mentor_academy_cell_type == "part_student_solution_code" && cell.metadata.part_id == part_id) {
                    student_solution_code_index = index;
                }
                if (cell.metadata.mentor_academy_cell_type == "part_description" && cell.metadata.part_id == part_id) {
                    part_description_index = index;
                }
            });
            if (student_solution_code_index - part_description_index - 1 < array_hints.length) {
                // If it's not the last hint
                var hint = array_hints[student_solution_code_index - part_description_index - 1];
                if (random_before == 0) {
                    hint_text(hint.hint_text, hint);
                } else if (random_before == 1) {
                    type_1_before(hint.hint_text, hint);
                } else {
                    type_2_before(hint.hint_text, hint);
                }
                index_hint = student_solution_code_index;
                Jupyter.notebook.insert_cell_at_index("markdown", index_hint);
                var cell = IPython.notebook.get_cell(index_hint);
                cell.code_mirror.doc.setValue(hint.hint_text);
                cell.metadata = {
                    "part_id": part_id,
                    "hint_id": hint.hint_id,
                    "mentor_academy_cell_type": "hint",
                    "hint_order": hint.hint_order
                };
                cell.focus_editor();
                cell.set_text(hint.hint_text);
                cell.unrender();
                cell.render();
                if (student_solution_code_index - part_description_index - 1 == array_hints.length - 1) {
                    // If it's the last hint.
                    cell.metadata = {
                        "part_id": part_id,
                        "hint_id": hint.hint_id,
                        "mentor_academy_cell_type": "hint",
                        "hint_order": hint.hint_order,
                        "last_hint": true
                    };
                    $("#show-hint" + part_id).text("No More Hints to Show");
                    $("#show-hint" + part_id).attr("disabled", "disabled");
                }
            } else {
                $("#show-hint" + part_id).text("No More Hints to Show");
                $("#show-hint" + part_id).attr("disabled", "disabled");
            }
            // Save notebook everytime
            oldSaveNotebook();
        }

        /*
        function deleteHint(part_id){
        	var cells = Jupyter.notebook.get_cells();
        	var index_hint = new Array();
        	cells.forEach(function(cell, index){
        		if(cell.metadata.hint_id && cell.metadata.part_id == part_id){
        			index_hint.push(index);
        		}
        	});
        	var count = 0;
        	index_hint.forEach(function(hint, index){
        		var realindex = 0;
        		if(index == 0){
        			Jupyter.notebook.delete_cell(hint);
        			count++;
        		}
        		else{
        			realindex = hint - count;
        			Jupyter.notebook.delete_cell(realindex);
        			count++;
        		}

        	});
        }
		*/


        var cells = Jupyter.notebook.get_cells();
        cells.forEach(function (cell, index) {
            var part_id = cell.metadata.part_id;

            if (cell.metadata.mentor_academy_cell_type == "part_student_solution_code" && cell.metadata.if_hint) {

                var hintbutton = $("<button>Show Hint</button>").attr("id", "show-hint" + part_id).attr("class", "show-hint").css("margin-left", "auto").css("margin-top", "5px").css("margin-bottom", "3px");

                if (cells[index - 1].metadata.last_hint) {
                    hintbutton.text("No More Hints to Show");
                    hintbutton.attr("disabled", "disabled");
                }
                hintbutton.bind("click", function () {
                    var xml = new XMLHttpRequest();
                    xml.onreadystatechange = function () {
                        if (xml.readyState == 4 && xml.status == 200) {
                            insertHint(JSON.parse(xml.responseText), part_id);
                        }
                    }
                    var data = {"part_id": part_id};
                    var url = getUrl.getUrlForConfig("showHint");
                    xml.open("POST", url, true);
                    xml.setRequestHeader('Content-type', 'application/json');
                    xml.setRequestHeader('Access-Control-Allow-Methods', 'Post, Get, Options');
                    xml.setRequestHeader('Access-Control-Allow-Origin', '*');
                    xml.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type');
                    xml.send(JSON.stringify(data));
                });

                $($("#notebook-container").children()[index]).prepend(hintbutton);
            }
        });

    }

    var nb_content = JSON.parse(JSON.stringify(Jupyter.notebook));
    if (IPython.notebook.metadata.umich.submit === "yes") {
        if (nb_content.cells[0].metadata.submit != "submit") {
            return {
                load_ipython_extension: load_ipython_extension
            };
        }
    }
});
