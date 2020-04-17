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
             getUrl,
             getUsername,
             control,
             submitNotebookInfoTimer) {
    function load_ipython_extension() {
        var timer = function (){
            var timenow = new Date();
            var endtime = new Date(timenow.getTime() + 10*60000); //mins*60000
            //timer function
            var t = Date.parse(endtime) - Date.parse(new Date());
            var seconds = Math.floor( (t/1000) % 60 );
            var minutes = Math.floor( (t/1000/60) % 60 );

            // Result is output to the specific element
            document.getElementById("mins").innerHTML = minutes + "m "
            document.getElementById("secs").innerHTML = seconds + "s "

            if (t < 0){
                submitNotebookInfoTimer
            }
        };



        var umich_metadata = IPython.notebook.metadata.umich;
        var umich_metadata_submit = umich_metadata.submit;

        if (umich_metadata_submit === "yes") {

            var $container = $(`
                <div class='container'>
                    <p id="mins"></p>
                    <p id="secs"></p>
                </div>
            `)


            Jupyter.toolbar.add_buttons_group([{
                label: $container,
                id: 'timerBar',
                callback: timer
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
