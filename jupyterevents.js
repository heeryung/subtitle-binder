/**
    Defines the JupyterEvent class.
*/

define([
    'jquery',
    'require',
    'base/js/namespace',
    'base/js/dialog',
    'base/js/i18n'
  ], function ($,
               require,
               Jupyter,
               dialog,
               i18n) {
    'use strict';

//CLASSES BEGIN/////////////////////////////////////////////////////////////////
    /**
        JupyterEvent
        Upon instantiation, a JupyterEvent sets up its own trigger and
        dispatcher.
        This JupyterEvent parent class is abstract. It cannot be used as an
        event.
        To create a new JupyterEvent, you need to follow this pattern:

        class ChildEvent extends JupyterEvent {
          bindJupyterEvent() {
            // … Logic for binding to some occurrence.

            // Call the dispatch method in the parent class.
            JupyterEvent.prototype.dispatchJupyterEvent("<EVENT NAME>", {<EVENT DETAILS>});
          }
        }

        JupyterEvents come with default event details:
        {event_name, event_time, notebook_contents}
    */
    class JupyterEvent {

      constructor() {
        this.bindJupyterEvent();
  	  }

      /* 'Virtual' */
      bindJupyterEvent() {
        throw new Error(this.name + " not implemented.");
      }

    	dispatchJupyterEvent(eventName, details = {}) {

        function getDispatchableJupyterEvent(eventName, details) {

          function getFullNotebookContents() {
            return JSON.parse(JSON.stringify(Jupyter.notebook));
          }

      		var defaultDetails = {
      			"event_name" : eventName,
      			"event_time" : Date.now(),
            "notebook_contents" : getFullNotebookContents()
      		}

          var combinedDetails = defaultDetails;
      		// Combine defaultDetails with details
      		for (var key in details) {
      			combinedDetails[key] = details[key];
      		}

          // Create new event with our details.
      		var customEvent = new CustomEvent(eventName, {
      			detail: combinedDetails
      		});

      		return customEvent;
      	}
    		var newJupyterEvent = getDispatchableJupyterEvent(eventName, details);
    		document.dispatchEvent(newJupyterEvent);
    	}
    }
////////////////////////////////////////////////////////////////////////////////
    /**
        BeginExecuteCellEvent
        Trigger: CodeCell is executed.
        Additional Data: {part_id}
    */
    class BeginExecuteCellEvent extends JupyterEvent {
    	bindJupyterEvent() {
        Jupyter.notebook.events.on('execute.CodeCell', function(event, data){
          var details = {};
          // Get entire cell
          details.executed_cell = data.cell;
          // Get part_id if exists
          if (data.cell.metadata && data.cell.metadata.part_id) {
            details.part_id = data.cell.metadata.part_id;
          }
          JupyterEvent.prototype.dispatchJupyterEvent("BeginExecuteCellEvent", details);
        });
    	}
    }
////////////////////////////////////////////////////////////////////////////////
    /**
        FinishExecuteCellEvent
        Trigger: CodeCell finished execution.
        Additional Data: {part_id, cell_output}
    */
    class FinishExecuteCellEvent extends JupyterEvent {
    	bindJupyterEvent() {
        Jupyter.notebook.events.on('finished_execute.CodeCell', function(event, data){
          var details = {};
          // Get entire cell
          details.executed_cell = data.cell;
          // Get part_id if exists
          if (data.cell.metadata && data.cell.metadata.part_id) {
            details.part_id = data.cell.metadata.part_id;
          }
          // Get cell execution output
          if (data.cell.output_area != null &&
              data.cell.output_area.outputs != null) {
              details.cell_output = data.cell.output_area.outputs[0];
          }
          JupyterEvent.prototype.dispatchJupyterEvent("FinishExecuteCellEvent", details);
        });
    	}
    }
////////////////////////////////////////////////////////////////////////////////
    /**
        SaveNotebookEvent
        Trigger: Notebook is saved.
        Additional Data: none
    */
    class SaveNotebookEvent extends JupyterEvent {
    	bindJupyterEvent() {
        Jupyter.notebook.events.on('notebook_saved.Notebook', function(event){
          JupyterEvent.prototype.dispatchJupyterEvent("SaveNotebookEvent");
        });
    	}
    }
////////////////////////////////////////////////////////////////////////////////
    /**
        ShowHintEvent
        Trigger: Hint button is clicked
        Additional Data: {part_id}
    */
    class ShowHintEvent extends JupyterEvent {
    	bindJupyterEvent() {
        $(".show-hint").click(function(event) {
          var details = {};
          var partId = event.target.id.substring("show-hint".length);
          details.part_id = partId;
          JupyterEvent.prototype.dispatchJupyterEvent("ShowHintEvent", details);
        });
    	}
    }

////////////////////////////////////////////////////////////////////////////////
    /**
        OpenNotebookEvent
        Trigger: Notebook opened
        Additional Data: none
    */
    class OpenNotebookEvent extends JupyterEvent {
      bindJupyterEvent() {
        Jupyter.notebook.events.on('notebook_loaded.Notebook', function(event){
          JupyterEvent.prototype.dispatchJupyterEvent("OpenNotebookEvent");
        });
        // Fire this event immediately. This event happens only once.
        Jupyter.notebook.events.trigger("notebook_loaded.Notebook");
      }
    }
////////////////////////////////////////////////////////////////////////////////
    /**
        ChangeCellsInViewEvent
        Trigger: User ceases to scroll
        Additional Data: none
    */
    class ChangeCellsInViewEvent extends JupyterEvent {
      static cellIsInView(cellIndex, checkIfPartiallyInView = false) {
        var headerAbsoluteBottomPosition = $("#header")[0].getBoundingClientRect().bottom;
        var absoluteBottomPosition = window.innerHeight;
        var $cells = $(".cell");
        var cellTop = $cells[cellIndex].getBoundingClientRect().top;
        var cellHeight = $cells[cellIndex].getBoundingClientRect().height;
        var cellBottom = cellTop + cellHeight;
        if (checkIfPartiallyInView) {
          return cellTop >= headerAbsoluteBottomPosition && cellTop < absoluteBottomPosition ||
                 cellBottom <= absoluteBottomPosition && cellBottom > headerAbsoluteBottomPosition;
        }
        return cellTop >= headerAbsoluteBottomPosition && cellBottom <= absoluteBottomPosition;
      }

      static getIndicesOfCellsInView(checkIfPartiallyInView = false) {
        var numCells = $(".cell").length;
        var indicesOfCellsInView = [];
        for (var i = 0; i < numCells; i++) {
          if (ChangeCellsInViewEvent.cellIsInView(i, checkIfPartiallyInView)) {
            indicesOfCellsInView.push(i);
          }
        }
        return indicesOfCellsInView;
      }

      static getCellInfoForLogging() {
        var checkIfPartiallyInView = true;
        var cellIndices = ChangeCellsInViewEvent.getIndicesOfCellsInView(checkIfPartiallyInView);

        var cells = Jupyter.notebook.get_cells();
        var cellsInfo = [];
        for (var i = 0; i < cellIndices.length; i++) {
          var cellIndex = cellIndices[i];
          var cell = cells[cellIndex];
          var cellInfo = {
            cell_index : cellIndex,
            cell_id : cell.cell_id,
            cell_type : cell.cell_type,
            code_mirror_content : cell.code_mirror.getValue(),
            metadata : cell.metadata
          };
          cellsInfo.push(cellInfo);
        }
        return cellsInfo;
      }
      bindJupyterEvent() {
        $("#site").scroll(function() {
            clearTimeout($.data(this, 'scrollTimer'));
            $.data(this, 'scrollTimer', setTimeout(function() {
              var details = {};
              var cellInfo = ChangeCellsInViewEvent.getCellInfoForLogging();
              details.cell_info = cellInfo;
              JupyterEvent.prototype.dispatchJupyterEvent("ChangeCellsInViewEvent", details);
            }, 50));
        });
      }
    }

////////////////////////////////////////////////////////////////////////////////
    /**
        SrlDisplayHintPromptEvent
        Trigger: Hint prompt is displayed
        Additional Data: hint_id, part_id, prompt_string, prompt_type (1/2)
    */
    class SrlDisplayHintPromptEvent extends JupyterEvent {
      bindJupyterEvent() {
        require(["nbextensions/showhints"], function() {
          document.addEventListener("OpenHintPromptEvent", function(event) {
            var details = {};
            details = event.detail;
            JupyterEvent.prototype.dispatchJupyterEvent("SrlDisplayHintPromptEvent", details);
          }, false);
        });
      }
    }

////////////////////////////////////////////////////////////////////////////////
    /**
        SrlDisplayHintAnswerEvent
        Trigger: Hint answer is displayed
        Additional Data: hint_id, part_id, hint_string
    */
    class SrlDisplayHintAnswerEvent extends JupyterEvent {
      bindJupyterEvent() {
        require(["nbextensions/showhints"], function() {
          document.addEventListener("OpenHintAnswerEvent", function(event) {
            var details = {};
            details = event.detail;
            JupyterEvent.prototype.dispatchJupyterEvent("SrlDisplayHintAnswerEvent", details);
          }, false);
        });
      }
    }

////////////////////////////////////////////////////////////////////////////////
    /**
        SrlClickNextEvent
        Trigger:
        Additional Data:
    */
    class SrlClickNextEvent extends JupyterEvent {
      bindJupyterEvent() {
        require(["nbextensions/showhints"], function() {
          document.addEventListener("ClickHintNextEvent", function(event) {
            var details = {};
            details = event.detail;
            JupyterEvent.prototype.dispatchJupyterEvent("SrlClickNextEvent", details);
          }, false);
        });
      }
    }
  
////////////////////////////////////////////////////////////////////////////////
    /**
        SrlHintUserResponse
        Trigger: User has answered a prompt and clicked Next
        Additional Data:
    */
   class SrlHintUserResponse extends JupyterEvent {
    bindJupyterEvent() {
      require(["nbextensions/showhints"], function() {
        document.addEventListener("HintUserResponse", function(event) {
          var details = {};
          details = event.detail;
          JupyterEvent.prototype.dispatchJupyterEvent("SrlHintUserResponse", details);
        }, false);
      });
    }
  }

////////////////////////////////////////////////////////////////////////////////
    /**
        SrlAssignConditionEvent
        Trigger: Notebook is opened and the hint condition is assigned
        Additional Data: Condition series: (<1,2,None>, <1,2,None>)
    */
    class SrlAssignConditionEvent extends JupyterEvent {
      bindJupyterEvent() {
        require(["nbextensions/showhints"], function() {
          document.addEventListener("AssignHintConditionEvent", function(event) {
            document.removeEventListener("AssignHintConditionEvent", () => {});
            event.result = "Received";
            var details = {};
            details = event.detail;
            JupyterEvent.prototype.dispatchJupyterEvent("SrlAssignConditionEvent", details);
          }, false);
        });
      }
    }
//END OF CLASSES////////////////////////////////////////////////////////////////

    // JupyterEvents accessible to other modules.
    var JupyterEvents = {}
    JupyterEvents.OpenNotebookEvent = OpenNotebookEvent;
    JupyterEvents.BeginExecuteCellEvent = BeginExecuteCellEvent;
    JupyterEvents.FinishExecuteCellEvent = FinishExecuteCellEvent;
    JupyterEvents.SaveNotebookEvent = SaveNotebookEvent;
    JupyterEvents.ShowHintEvent = ShowHintEvent;
    JupyterEvents.ChangeCellsInViewEvent = ChangeCellsInViewEvent;
    // JupyterEvents.SrlDisplayHintPromptEvent = SrlDisplayHintPromptEvent;
    // JupyterEvents.SrlDisplayHintAnswerEvent = SrlDisplayHintAnswerEvent;
    // JupyterEvents.SrlClickNextEvent = SrlClickNextEvent;
    JupyterEvents.SrlAssignConditionEvent = SrlAssignConditionEvent;
    JupyterEvents.SrlHintUserResponse = SrlHintUserResponse;

    return JupyterEvents;
});
