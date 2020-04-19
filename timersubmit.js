define([
    'jquery',
    'require',
    'base/js/namespace',
    'base/js/dialog',
    'base/js/i18n',
    'nbextensions/url',
    'nbextensions/getsolutions',
    'nbextensions/username',
    'nbextensions/control',
    'nbextensions/submit',
], function ($,
             require,
             Jupyter,
             dialog,
             i18n,
             getUrl,
             getSolutions,
             getUsername,
             control,
             submit) {
     /////submitNotebookInfo_ver_for_timer.js
    function submitNotebookInfoTimer() {
        console.log("test");
        // create a dialog modal and let students know their answer is saved
        //         oldSaveNotebook();
        var nbName = Jupyter.notebook.get_cell(0).metadata['name'];
        var description = Jupyter.notebook.get_cell(0).metadata['description'];
        var license = Jupyter.notebook.get_cell(0).metadata['license'];
        var form = $("<form></form>").attr("id", "save-form");
        form.append("<h4>Warning: Time is up. Please proceed. </h4>");

        function encodeQueryData(data) {
            let paramResult = encodeURIComponent('user') + '=' + encodeURIComponent(data['user']);
            return paramResult;
        }

        function switchPage() {
            // get the values from the form
            const currentQueryString = window.location.search;
            let urlParams = new URLSearchParams(currentQueryString); //This doesn't work on IE
            let userid = urlParams.get('id');

            const data = {'user': userid}

            const queryString = encodeQueryData(data)

            // let url = 'http://localhost:8000/'
            let url = 'https://umich.qualtrics.com/jfe/form/SV_1KPMxz46OuSiPTT'

            // build url
            url += '?' + queryString
            window.location = url
        }



        dialog.modal({
            title: i18n.msg._('Submit Your Final Solution'),
            body: form,
            buttons: {
                'Submit': {
                    'class': 'btn-primary', 'click': function () {
                         handlerSubmit(license, nbName, description);
                         dispatchSubmitSolutionEvent();
                         Jupyter.notebook.get_cell(0).metadata.submit = "submit";
                         oldSaveNotebook();
                         $($('#save-notbook').children()[0]).prop('disabled', true);
                         $('#submit-solution').attr('disabled', 'disabled');
                         $('#submit-solution').hide();
                         $.when(getSolutions.insertSolutionCells()).then(switchPage());
                     }
                }
            },
            notebook: Jupyter.notebook,
            keyboard_manager: Jupyter.keyboard_manager
        });

        return true

    };

    return{
        submitNotebookInfoTimer: submitNotebookInfoTimer
    };
});
