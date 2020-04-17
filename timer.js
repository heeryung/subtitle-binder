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
        var endtime = new Date(timenow.getTime() + 10*60000); //mins*60000
        //timer function
        var t = Date.parse(endtime) - Date.parse(new Date());


        var timeCal = setInterval(function (){
            timenow = new Date();
            t = endtime - timenow;
            var seconds = Math.floor( (t/1000) % 60 );
            var minutes = Math.floor( (t/1000/60) % 60 );

            if (t < 0){
                clearInterval(timeCal);
                submitNotebookInfoTimer // when time is out, automatically submit the notebook.
            }
            else {
                return minutes + "m " + seconds + "s "
            }


        }, 1000)



        var umich_metadata = IPython.notebook.metadata.umich;
        var umich_metadata_submit = umich_metadata.submit;

        if (umich_metadata_submit === "yes") {

            Jupyter.toolbar.add_buttons_group([{
                label: timeCal,
                id: 'timerBar'
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
