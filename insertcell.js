
define([
    'jquery',
    'base/js/namespace',
    'base/js/utils',
    'base/js/i18n',
    'base/js/keyboard',
    './codecell',
    './textcell',
    'services/config'
], function (
            $,
             Jupyter,
             utils,
             i18n,
             keyboard,
             codecell,
             textcell,
             configmod
			 ) {
    function load_ipython_extension() {


        function Notebook(selector, options) {
            IPython.notebook.config = options.config;
            IPython.notebook.config.loaded.then(IPython.notebook.validate_config.bind(this))
            IPython.notebook.class_config = new configmod.ConfigWithDefaults(IPython.notebook.config,
                Notebook.options_default, 'Notebook');
            IPython.notebook.base_url = options.base_url;
            IPython.notebook.notebook_path = options.notebook_path;
            IPython.notebook.notebook_name = options.notebook_name;
            IPython.notebook.events = options.events;
            IPython.notebook.keyboard_manager = options.keyboard_manager;
            IPython.notebook.contents = options.contents;
            IPython.notebook.save_widget = options.save_widget;
            IPython.notebook.tooltip = new tooltip.Tooltip(IPython.notebook.events);
            IPython.notebook.ws_url = options.ws_url;
            IPython.notebook._session_starting = false;
            IPython.notebook.last_modified = null;
            // debug 484
            IPython.notebook._last_modified = 'init';
            // Firefox workaround
            IPython.notebook._ff_beforeunload_fired = false;

            //  Create default scroll manager.
            IPython.notebook.scroll_manager = new scrollmanager.ScrollManager(this);

            // TODO: This code smells (and the other `= this` line a couple lines down)
            // We need a better way to deal with circular instance references.
            IPython.notebook.keyboard_manager.notebook = this;
            IPython.notebook.save_widget.notebook = this;

            mathjaxutils.init();

            if (marked) {
                marked.setOptions({
                    gfm: true,
                    tables: true,
                    // FIXME: probably want central config for CodeMirror theme when we have js config
                    langPrefix: "cm-s-ipython language-",
                    highlight: function (code, lang, callback) {
                        if (!lang) {
                            // no language, no highlight
                            if (callback) {
                                callback(null, code);
                                return;
                            } else {
                                return code;
                            }
                        }
                        utils.requireCodeMirrorMode(lang, function (spec) {
                            var el = document.createElement("div");
                            var mode = CodeMirror.getMode({}, spec);
                            if (!mode) {
                                console.log("No CodeMirror mode: " + lang);
                                callback(null, code);
                                return;
                            }
                            try {
                                CodeMirror.runMode(code, spec, el);
                                callback(null, el.innerHTML);
                            } catch (err) {
                                console.log("Failed to highlight " + lang + " code", err);
                                callback(err, code);
                            }
                        }, function (err) {
                            console.log("No CodeMirror mode: " + lang);
                            console.log("Require CodeMirror mode error: " + err);
                            callback(null, code);
                        });
                    }
                });
            }

            IPython.notebook.element = $(selector);
            IPython.notebook.element.scroll();
            IPython.notebook.element.data("notebook", this);
            IPython.notebook.session = null;
            IPython.notebook.kernel = null;
            IPython.notebook.kernel_busy = false;
            IPython.notebook.clipboard = null;
            IPython.notebook.clipboard_attachments = null;
            IPython.notebook.undelete_backup_stack = [];
            IPython.notebook.paste_enabled = false;
            IPython.notebook.paste_attachments_enabled = false;
            IPython.notebook.writable = false;
            // It is important to start out in command mode to match the intial mode
            // of the KeyboardManager.
            IPython.notebook.mode = 'command';
            IPython.notebook.set_dirty(false);
            IPython.notebook.metadata = {};
            IPython.notebook._checkpoint_after_save = false;
            IPython.notebook.last_checkpoint = null;
            IPython.notebook.checkpoints = [];
            IPython.notebook.autosave_interval = 0;
            IPython.notebook.autosave_timer = null;
            // autosave *at most* every two minutes
            IPython.notebook.minimum_autosave_interval = 120000;
            IPython.notebook.notebook_name_blacklist_re = /[\/\\:]/;
            IPython.notebook.nbformat = 4; // Increment this when changing the nbformat
            IPython.notebook.nbformat_minor = IPython.notebook.current_nbformat_minor = 1; // Increment this when changing the nbformat
            IPython.notebook.codemirror_mode = 'text';
            IPython.notebook.create_elements();
            IPython.notebook.bind_events();
            IPython.notebook.kernel_selector = null;
            IPython.notebook.dirty = null;
            IPython.notebook.trusted = null;
            IPython.notebook._changed_on_disk_dialog = null;
            IPython.notebook._fully_loaded = false;

            // Trigger cell toolbar registration.
            default_celltoolbar.register(this);
            rawcell_celltoolbar.register(this);
            slideshow_celltoolbar.register(this);
            attachments_celltoolbar.register(this);
            tags_celltoolbar.register(this);

            var that = this;

            Object.defineProperty(this, 'line_numbers', {
                get: function () {
                    var d = that.config.data || {};
                    var cmc = (d['Cell'] || {}) ['cm_config'] || {};
                    return cmc['lineNumbers'] || false;
                },
                set: function (value) {
                    that.config.update({
                        'Cell': {
                            'cm_config': {
                                'lineNumbers': value
                            }
                        }
                    });
                }
            });

            Object.defineProperty(this, 'header', {
                get: function () {
                    return that.class_config.get_sync('Header');
                },
                set: function (value) {
                    that.class_config.set('Header', value);
                }
            });

            Object.defineProperty(this, 'toolbar', {
                get: function () {
                    return that.class_config.get_sync('Toolbar');
                },
                set: function (value) {
                    that.class_config.set('Toolbar', value);
                }
            });

            IPython.notebook.class_config.get('Header').then(function (header) {
                if (header === false) {
                    that.keyboard_manager.actions.call('jupyter-notebook:hide-header');
                }
            });

            IPython.notebook.class_config.get('Toolbar').then(function (toolbar) {
                if (toolbar === false) {
                    that.keyboard_manager.actions.call('jupyter-notebook:hide-toolbar');
                }
            });

            // prevent assign to miss-typed properties.
            Object.seal(this);
        };

        Notebook.options_default = {
            // can be any cell type, or the special values of
            // 'above', 'below', or 'selected' to get the value from another cell.
            default_cell_type: 'code',
            Header: true,
            Toolbar: true
        };

       // Notebook.prototype.validate_config = function() {
         //   var code_cell = IPython.notebook.config.data['CodeCell'] || {};
         //   console.log(code_cell);
         //   var cm_keymap = (code_cell['cm_config'] || {})['keyMap'];
         //   if (cm_keymap && CodeMirror.keyMap[cm_keymap] === undefined) {
         //       console.warn('CodeMirror keymap not found, ignoring: ' + cm_keymap);
         //       delete code_cell.cm_config.keyMap;
         //   }
        //};

        var insert_cell_original= function(type, index){

            var ncells = IPython.notebook.ncells();
            index = Math.min(index, ncells);
            index = Math.max(index, 0);
            var cell = null;
            type = type || IPython.notebook.class_config.get_sync('default_cell_type');
            if (type === 'above') {
                if (index > 0) {
                    type = IPython.notebook.get_cell(index-1).cell_type;
                } else {
                    type = 'code';
                }
            } else if (type === 'below') {
                if (index < ncells) {
                    type = IPython.notebook.get_cell(index).cell_type;
                } else {
                    type = 'code';
                }
            } else if (type === 'selected') {
                type = IPython.notebook.get_selected_cell().cell_type;
            }

            if (ncells === 0 || IPython.notebook.is_valid_cell_index(index) || index === ncells) {
                var cell_options = {
                    events: IPython.notebook.events,
                    config: IPython.notebook.config,
                    keyboard_manager: IPython.notebook.keyboard_manager,
                    notebook: this,
                    tooltip: IPython.notebook.tooltip
                };
                switch(type) {
                case 'code':
                    cell = new codecell.CodeCell(IPython.notebook.kernel, cell_options);
                    cell.set_input_prompt();
                    break;
                case 'markdown':
                    cell = new textcell.MarkdownCell(cell_options);
                    break;
                case 'raw':
                    cell = new textcell.RawCell(cell_options);
                    break;
                default:
                    console.log("Unrecognized cell type: ", type, cellmod);
                    cell = new cellmod.UnrecognizedCell(cell_options);
                }

                if(Jupyter.notebook.insert_element_at_index("code", index)) {
                    cell.render();
                    IPython.notebook.events.trigger('create.Cell', {'cell': cell, 'index': index});
                    cell.refresh();
                    // We used to select the cell after we refresh it, but there
                    // are now cases were this method is called where select is
                    // not appropriate. The selection logic should be handled by the
                    // caller of the the top level insert_cell methods.
                    IPython.notebook.set_dirty(true);
                }
            }
            return cell;

        };







        var insert_cell_extension = function (type, index) {
            console.log("use exte");
            // num cells
            var ncells = IPython.notebook.ncells();
            index = Math.min(index, ncells);

            index = Math.max(index, 0);
            var cell = null;


            type = type || IPython.notebook.class_config.get_sync('default_cell_type');

            // Determine where to place the new cell and what type it should be
            // Type of the new cell is the type of the origin cell
            if (type === 'above') {
                if (index > 0) {
                    type = IPython.notebook.get_cell(index-1).cell_type;
                } else {
                    type = 'code';
                }
            } else if (type === 'below') {
                if (index < ncells) {
                    type = IPython.notebook.get_cell(index).cell_type;
                } else {
                    type = 'code';
                }
            } else if (type === 'selected') {
                type = IPython.notebook.get_selected_cell().cell_type;
            }
            console.log("here");
            // Configure the cell's options and set its cell-type.
            if (ncells === 0 || IPython.notebook.is_valid_cell_index(index) || index === ncells) {
                var cell_options = {
                    events: IPython.notebook.events,
                    config: IPython.notebook.config,
                    keyboard_manager: IPython.notebook.keyboard_manager,
                    notebook: this,
                    tooltip: IPython.notebook.tooltip
                };

                switch(type) {
                case 'code':

                    //codecell=new codecell();

                    cell = new codecell.CodeCell(IPython.notebook.kernel, cell_options);
                    cell.set_input_prompt();
                    break;
                case 'markdown':
                    cell = new textcell.MarkdownCell(cell_options);
                    break;
                case 'raw':
                    cell = new textcell.RawCell(cell_options);
                    break;
                default:
                    console.log("Unrecognized cell type: ", type, cellmod);
                    cell = new cellmod.UnrecognizedCell(cell_options);
                }

                // re-render new cell and trigger cell-creation event
                if(Jupyter.notebook.insert_cell_at_index("code", index)) {
                    cell.render();
                    IPython.notebook.events.trigger('create.Cell', {'cell': cell, 'index': index});
                    cell.refresh();
                    // We used to select the cell after we refresh it, but there
                    // are now cases were this method is called where select is
                    // not appropriate. The selection logic should be handled by the
                    // caller of the the top level insert_cell methods.
                    IPython.notebook.set_dirty(true);
                }
            }
			var cell = IPython.notebook.get_cell(index);
            // Set the cell's appearance
            cell.code_mirror.doc.setValue("Temporary cell (will not be saved)");
            cell.metadata.cell_type = "temp";
            cell.metadata.mentor_academy_cell_type = "temporary";

            var input=cell.element[0].children.item(0);
            var inner_prompt=input.children.item(0);
            var inner_cell=input.children.item(1);
            input_area=inner_cell.children.item(1);
            input_area.style.background="#ececc2";
            function dispatchAddedTempCellEvent() {
              const EVENT_TITLE = 'Added Temp Cell';
              const NUM_CELLS_IN_PART = 1;
              const NUM_CELLS = Jupyter.notebook.get_cells().length;
              const NEW_PART_START_INDEX = NUM_CELLS - NUM_CELLS_IN_PART;
              var addedTempCellEvent = new CustomEvent(EVENT_TITLE, {
                detail: {
                  "start_index" : NEW_PART_START_INDEX,
                  "end_index" : NUM_CELLS - 1
                }
              });
              document.dispatchEvent(addedTempCellEvent);
            }
            dispatchAddedTempCellEvent();

            return cell;
        };


        IPython.Notebook.prototype.insert_cell_below = function (type, index) {
            if (index === null || index === undefined) {
                index = Math.max(IPython.notebook.get_selected_index(index), IPython.notebook.get_anchor_index());
            }
            // console.log("Insert Cell Below");
            return  insert_cell_extension(type, index+1);
        };

        IPython.Notebook.prototype.insert_cell_above = function (type, index) {
            if (index === null || index === undefined) {
                index = Math.min(IPython.notebook.get_selected_index(index), IPython.notebook.get_anchor_index());
            }
            // console.log("Insert Cell Above");
            return insert_cell_extension(type, index);
        };


    }

    if (IPython.notebook.metadata.umich.submit === "yes") {
        return {
            load_ipython_extension: load_ipython_extension
        };
    }
});
