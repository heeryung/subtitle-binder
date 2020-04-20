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
    'nbextensions/timersubmit',
    'nbextensions/submitfunction'
], function ($,
            require,
            Jupyter,
            dialog,
            i18n,
            getUrl,
            getSolutions,
            getUsername,
            control,
            timersubmit,
            submitsub) {
    var load_ipython_extension = function () {
        console.log("reload testing")

        // check if the page has been reloaded or a user clicked back button to come back
        // if the page is reloaded by clicking a refresh button or a back button,
        // retrieve the endtime saved on local storage not to reset timer
        var navVar = String(window.performance.getEntriesByType("navigation")[0].type)
        if (navVar === "reload" || navVar === "back_forward") {
            endtime = localStorage.getItem("endtime");
        }
        
        var timenow = new Date();
        var endtime = new Date(timenow.getTime() + 60000); //mins*60000
        localStorage.setItem("endtime", endtime);
        //timer function
        var t = Date.parse(endtime) - Date.parse(new Date());

        var timeCal = setInterval(function (){
            var timerResult = false;

            timenow = new Date();
            t = endtime - timenow;
            // saving the end timeout
            // if page is reloaded then load back up the end timeout

            var seconds = Math.floor( (t/1000) % 60 );
            var minutes = Math.floor( (t/1000/60) % 60 );
            timeStr = minutes + "m " + seconds + "s";

            if (t < 0) {
                submitsub.oldSaveNotebook();
                timerResult = timersubmit.submitNotebookInfoTimer();
                if (timerResult == true) {
                    console.log("submitting notebook");
                }
                else {
                    console.log("failed to submit notebook");
                }
                // need to clear interval so it is not submitted twice
                clearInterval(timeCal);
            }
            else {
                // change timer display on button
                $("#timerBar").find('.toolbar-btn-label').text(timeStr);
            }
        }, 1000)

        let empty = () => {}

        var umich_metadata = IPython.notebook.metadata.umich;
        var umich_metadata_submit = umich_metadata.submit;

        if (umich_metadata_submit === "yes") {

            Jupyter.toolbar.add_buttons_group([{
                label: "10m 00s",
                id: 'timerBar',
                callback: empty
            }]);
        };
    };

     var nb_content = JSON.parse(JSON.stringify(Jupyter.notebook));
     if (IPython.notebook.metadata.umich.submit === "yes") {
         if (nb_content.cells[0].metadata.submit != "submit") {
             return {
                 load_ipython_extension: load_ipython_extension
             };
         }
     }

 });
