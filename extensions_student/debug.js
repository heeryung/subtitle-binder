define([
    'jquery',
    'require',
    'base/js/namespace'
], function ($,
             require,
             Jupyter) {
    function load_ipython_extension() {


        var handlerSubmit = function () {
            //get cells information
            nb_content = JSON.parse(JSON.stringify(Jupyter.notebook));
            var cells=nb_content.cells;
            var l=cells.length;
            var elements=Jupyter.notebook.get_cell_elements(l);


            var state=$('#debug-button')[0];
            if( state.innerText==="Show Hints"){
                //show
                state.innerText="Hide Hints";
                //for loop to insert text
                for(i=0;i<l;i++){
                    var cell=cells[i];
                    if(cell.metadata.part_id){
                        if(cell.cell_type==="code"){
                            if(cell.metadata.solution){
                                var ele=elements[i].children.item(0).children.item(1).children.item(1);
								
								//var text = $("<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#bookmark=kix.953ef02tnikx'></a>").text("Part Solution Code");
                                //ele.prepend(text);
								var temp = ele.innerHTML;
								ele.innerHTML = "<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#bookmark=kix.953ef02tnikx' target = 'view_window'> Part Solution Code </a>" + temp;
								console.log(ele.innerHTML);
                            }
                            else{
                                var ele=elements[i].children.item(0).children.item(1).children.item(1);
								var temp = ele.innerHTML;
								ele.innerHTML = "<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#bookmark=kix.mx3g97ty4h2c' target = 'view_window'> Part Stub Code </a>" + temp;
								
                                //ele.prepend(text);
                            }
                        }else{
                            var ele=elements[i].children.item(1).children.item(1);
							var temp = ele.innerHTML;
							ele.innerHTML = "<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#bookmark=id.6d2mxwdpytu6' target = 'view_window'>Part Description</a>" + temp;
                            //ele.prepend(text);
                        }
                    }else if(cell.metadata.dataset_id){
                        if(cell.cell_type==="code"){
                            var ele=elements[i].children.item(0).children.item(1).children.item(1);
							var temp = ele.innerHTML;
							ele.innerHTML = "<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#heading=h.w3cogxezd5sp' target = 'view_window'>Dataset Description</a>" + temp;
                            //ele.prepend(text);
                            //ele.prepend("Dataset Description");
                        }else{
                            var ele=elements[i].children.item(1).children.item(1);
							var temp = ele.innerHTML;
							ele.innerHTML = "<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#heading=h.w3cogxezd5sp' target = 'view_window'>Dataset Code Stub</a>" + temp;
                         //   ele.prepend(text);
                            //ele.prepend("Dataset Code Stub");
                        }
                       
                    }else if(cell.metadata.question_id){
                        if(cell.cell_type==="code"){
                            var ele=elements[i].children.item(0).children.item(1).children.item(1);
							var temp = ele.innerHTML;
							ele.innerHTML = "<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#bookmark=id.xziza7q2o3ef' target = 'view_window'>Question Description</a>" + temp;
                            //ele.prepend(text);
                            //ele.prepend("Question Description");
                        }else{
                            var ele=elements[i].children.item(1).children.item(1);
							var temp = ele.innerHTML;
                            ele.innerHTML = "<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#bookmark=id.91740lsr878v' target = 'view_window'>Question Code Stub</a>" + temp;
                            //ele.prepend(text);
                            //ele.prepend("Question Code Stub");
                        }
    
                    }else{
                        var ele=elements[i].children.item(0).children.item(1).children.item(1);
                        var temp = ele.innerHTML; 
                       	ele.innerHTML = "<a href = 'https://docs.google.com/document/d/10EeLxHVQ1m2D_5iiDvyA-G2LtdP6hgcke9TXxSZPk-U/edit#bookmark=kix.voai535cxwfn' target = 'view_window'>Temperary Code</a>" + temp;
                        //ele.prepend(text);
                        ele.style.background="#ececc2";
                    } 
                }


            
            }else{
                //hide
                state.innerText="Show Hints";

                for(i=0;i<l;i++){
                    var cell=cells[i];
                    //dangerous remove
                    if(cell.metadata.part_id){
                        if(cell.cell_type==="code"){
                            var ele=elements[i].children.item(0).children.item(1).children.item(1);
                            //ele.removeChild(ele.childNodes[0]);
                            var temp = ele.innerHTML;
                            console.log(temp[1]);
                            if (temp[1] == 'a'){
                            	 ele.removeChild(ele.childNodes[0]);
                            }
                        }else{
                            var ele=elements[i].children.item(1).children.item(1);
                            //ele.removeChild(ele.childNodes[0]);
                            var temp = ele.innerHTML;
                            console.log(temp[1]);
                            if (temp[1] == 'a'){
                            	 ele.removeChild(ele.childNodes[0]);
                            }
                        }
                    }else if(cell.metadata.dataset_id){
                        if(cell.cell_type==="code"){
                            var ele=elements[i].children.item(0).children.item(1).children.item(1);
                            //ele.removeChild(ele.childNodes[0]);
                            var temp = ele.innerHTML;
                            if (temp[1] == 'a'){
                            	 ele.removeChild(ele.childNodes[0]);
                            }
                        }else{
                            var ele=elements[i].children.item(1).children.item(1);
                            //ele.removeChild(ele.childNodes[0]);
                            var temp = ele.innerHTML;
                            if (temp[1] == 'a'){
                            	 ele.removeChild(ele.childNodes[0]);
                            }
                        }
                       
                    }else if(cell.metadata.question_id){
                        if(cell.cell_type==="code"){
                            var ele=elements[i].children.item(0).children.item(1).children.item(1);
                            //ele.removeChild(ele.childNodes[0]);
                            var temp = ele.innerHTML;
                            if (temp[1] == 'a'){
                            	 ele.removeChild(ele.childNodes[0]);
                            }
                        }else{
                            var ele=elements[i].children.item(1).children.item(1);
                            //ele.removeChild(ele.childNodes[0]);
                            var temp = ele.innerHTML;
                            if (temp[1] == 'a'){
                            	 ele.removeChild(ele.childNodes[0]);
                            }
                        }
    
                    }else{
						var ele=elements[i].children.item(0).children.item(1).children.item(1);
						//ele.removeChild(ele.childNodes[0]);
                	    var temp = ele.innerHTML;
                    	ele.style.background="#ececc2";
                    	if (temp[1] == 'a'){
                        	ele.removeChild(ele.childNodes[0]);
                        }
                    } 
                }

            }
            
        };



//         Jupyter.toolbar.add_buttons_group([{
//             label: 'Help Document',
//             icon: 'fa-info',
//             id: 'debug-button',
//             callback: handlerSubmit
//         }]);

    }

    if (IPython.notebook.metadata.umich.submit === "yes") {
        return {
            load_ipython_extension: load_ipython_extension
        };
    }
});
