/*
  Sets the editable tag in each cell's metadata. E.g., datasets should not be
  editable.
  Greys out uneditable cells.
*/

define([
    'jquery',
    'require',
    'base/js/namespace',
    'base/js/dialog',
    'base/js/i18n',
  ], function ($,
               require,
               Jupyter,
               dialog,
               i18n) {

function load_ipython_extension(){

  // cell should be grey if "editable" == false in metadata
  function cellShouldBeGrey(cellIndex) {
    if (cellIndex >= Jupyter.notebook.get_cells().length) {
      return false;
    }
    var cell = Jupyter.notebook.get_cell(cellIndex);
    if (cell == null) {
      return false;
    }
    if (cell.metadata["editable"] == false) {
      return true;
    } else {
      return false;
    }
  }

  // grey out uneditable cells
  function setCellColors() {

    const GREY = "rgb(220,220,220)";

    var $cells = $("#notebook-container").children();
    Object.keys($cells).forEach(function(cellIndex) {
      if (cellShouldBeGrey(cellIndex)) {
        $($cells[cellIndex]).css("background-color", GREY);
      }
    });
  }

  // given a cell's index, find it, and determine if it should be editable by student
  function cellShouldBeUneditable(cellIndex) {
    if (cellIndex >= Jupyter.notebook.get_cells().length) {
      return false;
    }

    var cell = Jupyter.notebook.get_cell(cellIndex);
    if (cell == null) {
      return false;
    }
    // Some cells already have this editable tag set. Simply use this status as is.
    if ("editable" in cell.metadata) {
      return !cell.metadata["editable"];
    } else {
      // questions, datasets, part prologues -> NOT editable
      if ("question_id" in cell.metadata ||
          "dataset_id" in cell.metadata ||
          "part_id" in cell.metadata && "prologue" == cell.metadata["type"]) {
        return true;
      } else {
        return false;
      }
    }
  }

  // Sets each cell's editable status in metadata.
  function setEditableStatus() {
    var $cells = $("#notebook-container").children();
    for (var cellIndex = 0; cellIndex < Jupyter.notebook.get_cells().length; cellIndex++) {
      if (cellShouldBeUneditable(cellIndex)) {
        Jupyter.notebook.get_cell(cellIndex).metadata["editable"] = false;
      } else {
        Jupyter.notebook.get_cell(cellIndex).metadata["editable"] = true;
      }
    }
  }

  setEditableStatus();
  setCellColors();

}

	if (IPython.notebook.metadata.umich.submit === "yes") {
        return {
            load_ipython_extension: load_ipython_extension
        };
    }

});
