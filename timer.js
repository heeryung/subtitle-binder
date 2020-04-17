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
    'nbextensions/control',
    'nbextensions/submit'
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
             control,
             submitNotebookInfoTimer) {
    var load_ipython_extension = function () {

        var timenow = new Date();
        var endtime = new Date(timenow.getTime() + 60000); //mins*60000
        //timer function
        var t = Date.parse(endtime) - Date.parse(new Date());


        var timeCal = setInterval(function (){
            timenow = new Date();
            t = endtime - timenow;
            var seconds = Math.floor( (t/1000) % 60 );
            var minutes = Math.floor( (t/1000/60) % 60 );
            timeStr = minutes + "m " + seconds + " s";

            if (t < 0) {
                // need to clear interval so it is not submitted twice
                clearInterval(timeCal);
                console.log("submitting notebook");
                // submitNotebookInfoTimer
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
