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
    function load_ipython_extension() {


        var timeCal1 = function (){
            var timenow = new Date();
            var endtime = new Date(timenow.getTime() + 10*60000); //mins*60000
            //timer function
            var t = Date.parse(endtime) - Date.parse(new Date());

            return t
        };

        function timeCal2 (t){
            t = t;
            var seconds = Math.floor( (t/1000) % 60 );
            var minutes = Math.floor( (t/1000/60) % 60 );

            return minutes + "m " + seconds + "s "
        }


        function timeAlert (t){
            t = t;
            if (t < 0){
                submitNotebookInfoTimer
            };
        };

        var timeCalVar = timeCal2(timeCal1)

        var umich_metadata = IPython.notebook.metadata.umich;
        var umich_metadata_submit = umich_metadata.submit;

        if (umich_metadata_submit === "yes") {

            Jupyter.toolbar.add_buttons_group([{
                label: timeCalVar,
                id: 'timerBar',
                callback: timeAlert(timeCal1)
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
