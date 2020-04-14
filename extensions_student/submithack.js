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
             control) {

    'use strict';

    function load_ipython_extension() {
        // needs to put an entry in the map_students_question table...
        // ... so that submit solution works

        function getQuestionHelper(question_id){
            //EFFECTS: send username to backend
            var username_all = getUsername.getUsernameForConfig();
            var data = {};
            if(username_all != "localhost"){
                var username = username_all;
                var user_id = username_all;
//                 username_all = username_all.split("_");
//                 var user_id = username_all[username_all.length - 1];
//                 var temp = getUsername.getUsernameForConfig();
//                 var username = temp.substr(0, temp.length - user_id.length - 1);
//                 if(username == ""){
//                     username = user_id;
//                 }
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
            xhr.send(JSON.stringify(data));
        }

        return IPython.notebook.config.loaded.then(function () {

            if (IPython.notebook.get_cell(0) != null) {
                let question_id = IPython.notebook.get_cell(0)._metadata.question_id;

                getQuestionHelper(question_id);
            }
        });
    }
    return {
        load_ipython_extension: load_ipython_extension
    };
});