define([
    'jquery',
    'base/js/namespace',
    'base/js/utils',
    'base/js/i18n',
    'base/js/keyboard',
    'services/config'
], function ($,
             Jupyter,
             utils,
             i18n,
             keyboard,
             configmod) {
	function load_ipython_extension() {
		// Make only temp cell moveable
		var original_move_cell_up = function (index) {
			//Move cell up
			if(index === undefined){
				Jupyter.notebook.move_selection_up();
			}
			var i = Jupyter.notebook.index_or_selected(index);
			if (Jupyter.notebook.is_valid_cell_index(i) && i > 0) {
				var pivot = Jupyter.notebook.get_cell_element(i-1);
				var tomove = Jupyter.notebook.get_cell_element(i);
				if (pivot !== null && tomove !== null) {
					tomove.detach();
					pivot.before(tomove);
					Jupyter.notebook.select(i-1);
					var cell = Jupyter.notebook.get_selected_cell();
					cell.focus_cell();
				}
				Jupyter.notebook.set_dirty(true);
			}
			return Jupyter.notebook;
		};
   		
		var original_move_cell_down = function (index) {
			// Move cell down   
			if(index === undefined){
				Jupyter.notebook.move_selection_down();
			}        
			var i = Jupyter.notebook.index_or_selected(index);
			if (Jupyter.notebook.is_valid_cell_index(i) && Jupyter.notebook.is_valid_cell_index(i+1)) {
				var pivot = Jupyter.notebook.get_cell_element(i+1);
				var tomove = Jupyter.notebook.get_cell_element(i);
				if (pivot !== null && tomove !== null) {
					tomove.detach();
					pivot.after(tomove);
					Jupyter.notebook.select(i+1);
					var cell = Jupyter.notebook.get_selected_cell();
					cell.focus_cell();
				}
			}
			Jupyter.notebook.set_dirty();
			return Jupyter.notebook;
		};
		
		
		Jupyter.Notebook.prototype.move_cell_up = function (index) {
			var selected = Jupyter.notebook.get_selected_index();
			var cell = Jupyter.notebook.get_cell(selected);
			if(cell.metadata.cell_type == "temp"){
				original_move_cell_up(index);
			}
			else{
				console.log("skrr");
			}
		}
        
		Jupyter.Notebook.prototype.move_cell_down = function(index){
			var selected = Jupyter.notebook.get_selected_index();
			var cell = Jupyter.notebook.get_cell(selected);
			if(cell.metadata.cell_type == "temp"){
				original_move_cell_down(index);
			}
			else{
				console.log("skrr");
			}
		}
    	
	}

	if (IPython.notebook.metadata.umich.submit === "yes") {
        return {
            load_ipython_extension: load_ipython_extension
        };
    }
});
