/*
  When notebook opens, checks if we should get solutions.
*/

define([
    'jquery',
    'require',
    'base/js/namespace',
    'base/js/dialog',
    'base/js/i18n',
    'nbextensions/getsolutions'
  ], function ($,
               require,
               Jupyter,
               dialog,
               i18n,
               getSolutions) {

  function load_ipython_extension(){
    function shouldGetSolutions() {
      var jupyterCells = Jupyter.notebook.get_cells();
      var shouldGet = false;
      for (var i = 0; i < jupyterCells.length; i++) {
        var jupyterCell = jupyterCells[i];
        if ("question_id" in jupyterCell.metadata) {
          var submitStatus = jupyterCell.metadata.submit;
          if (submitStatus == "submit") {
            return true;
          } else {
            return false;
          }
        }
      }
      return false;
    }
    if (shouldGetSolutions()) {
      getSolutions.insertSolutionCells();
    }
  }

	if (IPython.notebook.metadata.umich.submit === "yes") {
        return {
            load_ipython_extension: load_ipython_extension
        };
    }

});
