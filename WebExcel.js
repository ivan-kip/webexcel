/*
 * 
 * t = new WebExcel('table');
 * t.addCol();
 * t.addRow();
 * t.merge();
 * t.unmerge();
 * t.copy();
 * t.paste();
 * t.addLeft();
 * t.addRight();
 * t.addUp();
 * t.addDown();
 * t.copyRow();
 * t.delRow();
 * t.colCopy();
 * 
 * классы
 * .td-heading
 * .td-selected
 * 
 */


function WebExcel(option){
    var id_table;
    var obj_table;
    var arr_table;
    var th = false;
    var sel_on = false;
    var sel_row = false;
    var sel_col = false;
    var sel_beg;
    var sel_end;
    var sel_rows;
    var sel_cols;
    var copy_data;
    var editcell;
    var editcell =  option["editcell"];
    
    //var change_data;

    //this.th_on = th_on;
    //this.th_off = th_off;

    this.addRow = addRow;
    this.addCol = addCol;
    this.delRow = delRow;
    this.delCol = delCol;

    this.addLeft = addLeft;
    this.addRight = addRight;
    this.addUp = addUp;
    this.addDown = addDown;

    this.merge = merge;
    this.unmerge = unmerge;

    this.copy = copy;
    this.paste = paste;

    // ----------------
    this.headings = headings;
    this.getCell = getCell;
    this.getTh = getTh;
    this.cell_number = cell_number;
    //this.selRow = selRow;
    this.lastRowSel = lastRowSel;
    this.tdContent = tdContent;
    this.rowCopy = rowCopy;
    this.colCopy = colCopy;
    this.colCopy = colCopy;
    this.getSel = getSel;
    this.setSel = setSel;
    this.unselect = fill_clear;

    this.rowcount = rowcount;
    // --------------------
    var obj = option["table"];

    if( typeof obj === 'object' ){
        if(obj.tagName == "TABLE"){
            id_table = obj.id;
            obj_table = obj;
        }
        else{
            obj_table = obj.appendChild(document.createElement("TABLE"));
        }
    }
    else if( typeof obj === 'string' ){
        id_table = obj;
        obj_table = document.getElementById(obj);
        if(obj_table.tagName != "TABLE") obj_table = obj_table.appendChild(document.createElement("TABLE"));
    }
    else{
        obj_table = document.body.appendChild(document.body.createElement("TABLE"));
        var tr = obj_table.appendChild(document.body.createElement("TR"));
        tr.appendChild(document.body.createElement("TD"));
        if(option["id"] != undefined){
            obj_table.id = option["id"];
            id_table = option["id"];
        }
    }

    document.body.onmouseup = selection_off;
    
    if(option["header"] == true)
        this.headings();

    if(option["simply"] != true)
        disableSelection(obj_table);

    table_recalc();

    // --------------------

    function getSel(){
    	return (sel_on || sel_row || sel_col);
    }

    function setSel(row, col){
    	sel_beg = arr_table[row][col];
        sel_end = arr_table[row][col];
    }

    function colCopy(){
    	var cc = colcount(obj_table);
    	if(typeof sel_cols == "object"){
	    	for(var i = 0; i < rowcount(obj_table); i++){
	    		if(sel_cols[1] + 1 < cc)
	    			var idx = findNextCell(i, sel_cols[1] + 1);
	    		else{
	    			var idx = cc - 1;
	    			while(rowIndexForTd(arr_table[i][idx]) != i)idx--;
	    			idx = arr_table[i][idx].cellIndex + 1;
	    		}

	    		var tr = obj_table.rows[i];
	    		for(var j = sel_cols[1]; j >= sel_cols[0]; j--){
	    			if(th && i == 0){
	    	            var td = tr.insertCell(idx);
	    	            td.className = "td-heading";
	    	            bind_col(td);
	    			}
	    			else{
	    				var td_copy = arr_table[i][j];
	    				if(j > 0) var td_prev = arr_table[i][j - 1];
	    				if((j == 0 || td_copy != td_prev) && rowIndexForTd(td_copy) == i){
	    					var td = tr.insertCell(idx);
	    		            //td.className = td_class;
	    		            td.addClass(td_class);
                                    td.rowSpan = td_copy.rowSpan;
	    		            td.colSpan = td_copy.colSpan;
	    		            td.innerHTML = td_copy.innerHTML;
	    		            bind(td);
	    				}
	    			}
	    		}
	    	}
	    	if(th)col_recalc();
	    	table_recalc();
    	}
    }

    function rowCopy(){
    	if(typeof sel_rows == "object"){
    		for(i = sel_rows[1]; i >= sel_rows[0]; i--){
	    		var tr = obj_table.insertRow(sel_rows[1] + 1);
	    		tr.innerHTML = obj_table.rows[i].innerHTML.replace(new RegExp("td-selected",'g'), "");
    		}
    		if(th)row_recalc(true);
	    	table_recalc();
    	}
    }

    function tdContent(txt){
    	if(txt == undefined)
    		return td_content;
    	else
    		td_content = txt;
    }

    function lastRowSel(){
    	return sel_rows[1];
    }

    function getTh(){
    	return th;
    }

    function getCell(r, c){
    	return arr_table[r][c];
    }

    function headings(){
    	if(th)
            th_off();
    	else
            th_on();

    	table_recalc();
    }

    function th_on(){
        var td;
        var trs = obj_table.rows;
        var tds = colcount(obj_table);

        var tr = obj_table.insertRow(0);
        for(i = 0; i <= tds; i++){
            td = document.createElement('TD');
            td.innerHTML = i;
            td.className = "td-heading";
            if(i != 0)bind_col(td);
            tr.appendChild(td);
        }

        for(i = 1; i < trs.length; i++){
            td = trs[i].insertCell(0);
            td.innerHTML = i;
            td.className = "td-heading";
            bind_row(td);
        }

        th = true;
    }

    function th_off(){
        var tr = obj_table.rows[0];
        tr.remove();
        for(i = 0; i < obj_table.rows.length; i++){
            var td = obj_table.rows[i].cells[0];
            td.remove();
        }
        th = false;
    }

    function addRow(){
        var cc = colcount(obj_table);
        var rc = obj_table.rows.length; // для arr_table
        //var tr = document.createElement('TR');
        var tr = obj_table.insertRow(rc);
        var ii = 0;

        arr_table[rc] = new Array();

        if(th){
            var td = document.createElement('TD');
            td.innerHTML = obj_table.rows.length - 1;
            td.className = "td-heading";
            bind_row(td);
            tr.appendChild(td);
            arr_table[rc][ii] = td;
            ii++;
        }

        for(i = ii; i < cc; i++){
            var td = document.createElement('TD');
            bind(td);
            tr.appendChild(td);
            arr_table[rc][i] = td;
        }
        //obj_table.appendChild(tr);
    }

    function addCol(type){
        var cc = colcount(obj_table);
        var tr = obj_table.rows;
        var ii = 0;

        if(th){
            var tri = tr[0];
            var td = document.createElement('TD');
            td.innerHTML = cc;
            td.className = "td-heading";
            bind_col(td);
            arr_table[0][cc] = td;
            tri.appendChild(td);
            ii++;
        }

        for(i = ii; i < tr.length; i++){
                var tri = tr[i];
                var td = document.createElement('TD');
                bind(td);
                tri.appendChild(td);

                arr_table[i][cc] = td;
        }
    }

    function addLeft(){
        InsCol(sel_cols[0]);

        sel_cols[0] += 1;
        sel_cols[1] += 1;
    }

    function addRight(){
        if(sel_cols[1] + 1 == colcount(obj_table))
            addCol();
        else
            InsCol(sel_cols[1] + 1);
    }

    function InsCol(idx){
        var tr = obj_table.rows;
        var ii = 0;

        if(th){
            var td = tr[0].insertCell(idx);
            td.className = "td-heading";
            bind_col(td);
            ii++;
        }

        for(i = ii; i < tr.length; i++){
            var idx_c = findNextCell(i, idx);
            var td = tr[i].insertCell(idx_c);
            bind(td);
        }

        if(th)col_recalc();
        table_recalc();
    }

    function addUp(){
        InsRow(sel_rows[0]);

        sel_rows[0] += 1;
        sel_rows[1] += 1;
    }

    function addDown(){
        if(sel_rows[1] + 1 == colcount(obj_table))
            addRow();
        else
            InsRow(sel_rows[1] + 1);
    }

    function InsRow(idx){
        var cc = colcount(obj_table);

        var tr = obj_table.insertRow(idx);
        var ii = 0;

        if(th){
            var td = document.createElement('TD');
            td.innerHTML = obj_table.rows.length;
            td.className = "td-heading";
            bind_row(td);
            tr.appendChild(td);
            ii++;
        }

        for(i = ii; i < cc; i++){
            var td = document.createElement('TD');
            bind(td);
            tr.appendChild(td);
        }

        if(th)row_recalc();
        table_recalc();
    }

    function col_recalc(){
        for(i = 1; i < colcount(obj_table); i++){
            obj_table.rows[0].cells[i].innerHTML = i;
        }
    }

    function row_recalc(){
        for(i = 1; i < rowcount(obj_table); i++){
            obj_table.rows[i].cells[0].innerHTML = i;
        }
    }

    function merge(){
        if(typeof sel_rows == "object"){
            for(var i = sel_rows[0]; i <= sel_rows[1]; i++){
                for(var j = sel_cols[0]; j <= sel_cols[1]; j++){
                    var td = arr_table[i][j];

                    if(i == sel_rows[0] && j == sel_cols[0]){
                        var td0 = td;
                    }
                    else{
                        if(td != td0){
                            span_recalc(i, j, td.rowSpan, td.colSpan, td0);
                            td.remove();
                        }
                    }
                }
            }
            td0.colSpan = sel_cols[1] - sel_cols[0] + 1;
            td0.rowSpan = sel_rows[1] - sel_rows[0] + 1;
        }
    }

    function unmerge(){
        if(typeof sel_rows == "object"){
            for(var i = sel_rows[0]; i <= sel_rows[1]; i++){
                for(var j = sel_cols[0]; j <= sel_cols[1]; j++){
                    var td = arr_table[i][j];
                    var rs = td.rowSpan;
                    var cs = td.colSpan;
                    if(cs > 1 || rs > 1){
                        var idx = td.cellIndex + 1;
                        var td_class = td.className;

                        if(i == 8)
                            var a = 0;

                        for(c = j + 1; c < j + cs; c++){
                            var newtd = obj_table.rows[i].insertCell(idx);
                            //newtd.className = td_class;
                            newtd.addClass(td_class);
                            bind(newtd);
                            idx++;
                            arr_table[i][c] = newtd;
                        }

                        for(r = i + 1; r < i + rs; r++){
                            var idx = findNextCell(r, j);
                            for(c = j; c < j + cs; c++){
                                var newtd = obj_table.rows[r].insertCell(idx);
                                //newtd.className = td_class;
                                newtd.addClass(td_class);
                                bind(newtd);
                                idx++;
                                arr_table[r][c] = newtd;
                            }
                        }
                        td.rowSpan = 1;
                        td.colSpan = 1;
                    }
                }
            }
            fill_clear();
        }
    }

    function copy(){
        var td = arr_table[sel_rows[0]][sel_cols[0]];
        copy_data = td.innerHTML;
    }

    function paste(){
        var td = arr_table[sel_rows[0]][sel_cols[0]];
        if(typeof copy_data == "string") td.innerHTML = copy_data;
    }

    function delRow(){
        if(typeof sel_rows == "object"){
            for(var i = sel_rows[1]; i >= sel_rows[0]; i--){
                var tr = obj_table.rows[i];
                tr.remove();
            }
            if(th)row_recalc();
            table_recalc();
        }
    }

    function delCol(){
        if(typeof sel_cols == "object"){
            for(var i = 0; i < rowcount(obj_table); i++){
                for(var j = sel_cols[0]; j <= sel_cols[1]; j++){
                    if(arr_table[i][j] != undefined){
                        var td = arr_table[i][j];

                        if(td.rowSpan > 1 || td.colSpan > 1)
                            span_recalc(i, j, td.rowSpan, td.colSpan, undefined);

                        td.remove();
                    }
                }
            }
            col_recalc();
            table_recalc();// arr_table cols del
        }
    }


    // функции
    function findNextCell(r, c){
        var col = c;
        var cc = colcount(obj_table);
        var td = arr_table[r][col];
        var tr = td.getParent("TR");
        while(tr.rowIndex != r && col < cc - 1){
            col++;
            td = arr_table[r][col];
            tr = td.getParent("TR");
        }
        if(col >= cc - 1 && tr.rowIndex != r)
            return obj_table.rows[r].cells.length;
        else
            return td.cellIndex;
    }

    function rowcount(table){
        if(table == undefined) table = obj_table;
        return table.rows.length;
    }

    function colcount(table){
        if(table == undefined) table = obj_table;
        var tr = table.rows[0];
        var td = tr.cells;

        if(th)
            return td.length;
        else{
            var count = 0;
            for(i = 0; i < td.length; i++){
                var tdi = td[i];
                var cs = tdi.colSpan;
                count += cs;
            }
            return count;
        }
    }

    function table_recalc(){
        arr_table = new Array();
        var r = rowcount(obj_table);
        var c = colcount(obj_table);

        for(var i = 0; i < r; i++){
            var delta = 0;
            if(typeof arr_table[i] != 'object'){
                arr_table[i] = new Array();
            }
            for(var j = 0; j < c; j++){
                if(arr_table[i][j] == undefined){
                    var td = obj_table.rows[i].cells[j - delta];
                    var cs = td.colSpan;
                    var rs = td.rowSpan;

                    //if(td.className != "td-heading")bind(td);
                    if(!td.hasClass("td-heading"))bind(td);
                    
                    span_recalc(i, j, rs, cs, td);
                }
                else{
                    delta += 1;
                }
            }
        }
    }

    function span_recalc(r, c, rs, cs, td){
        for(i = r; i < r + rs; i++){
            if(typeof arr_table[i] != 'object'){
                arr_table[i] = new Array();
            }
            for(j = c; j < c + cs; j++){
                arr_table[i][j] = td;
            }
        }
    }

    function bind(el){
            el.onmousedown = selection_on;
            el.onmouseover = hover_on;
            if(editcell != false) el.ondblclick = changeData;
    }

    function bind_row(el){
            el.onmousedown = selection_row;
            el.onmouseover = hover_row;
    }

    function bind_col(el){
            el.onmousedown = selection_col;
            el.onmouseover = hover_col;
    }

    function selection_row(event){
            sel_row = true;

            event = event || window.event; // для ебучего IE
            var td = (event.target||event.srcElement).getParent(["TD", "TH"]);
            var tr = td.getParent("TR");
            sel_beg = arr_table[tr.rowIndex][1];
            sel_end = arr_table[tr.rowIndex][colcount(obj_table) - 1];
            area();
    }

    function selection_col(event){
            sel_col = true;

            event = event || window.event; // для ебучего IE
            var td = (event.target||event.srcElement).getParent(["TD", "TH"]);
            sel_beg = arr_table[1][td.cellIndex];
            sel_end = arr_table[rowcount(obj_table) - 1][td.cellIndex];
            area();
    }

    function selection_on(event){
            sel_on = true;

            event = event || window.event; // для ебучего IE
            sel_beg = (event.target||event.srcElement).getParent(["TD", "TH"]);
            sel_beg.addClass("td-selected");
            sel_end = sel_beg;
            area();
    }

    function hover_on(event){
            if(sel_on){
                    event = event || window.event; // для ебучего IE
                    sel_end = (event.target||event.srcElement).getParent(["TD", "TH"]);
                    area();
            }
    }

    function hover_row(event){
            if(sel_row){
                    event = event || window.event; // для ебучего IE
                    var td = (event.target||event.srcElement).getParent(["TD", "TH"]);
                    var tr = td.getParent("TR");
                    sel_end = arr_table[tr.rowIndex][colcount(obj_table) - 1];
                    area();
            }
    }

    function hover_col(event){
            if(sel_col){
                    event = event || window.event; // для ебучего IE
                    var td = (event.target||event.srcElement).getParent(["TD", "TH"]);
                    sel_end = arr_table[rowcount(obj_table) - 1][td.cellIndex];
                    area();
            }
    }

    function selection_off(){
            sel_on = false;
            sel_row = false;
            sel_col = false;
    }

    function cell_number(td){
        var tr = td.getParent("TR");
        var r = tr.rowIndex;
        var row = arr_table[r];
        var flag = true;
        var i = 0;
        while(flag)
            if(row[i]===td)
                flag = false;
            else
                i++;

        return i;
    }

    function area(){
            var row_beg = sel_beg.getParent("TR");
            var row_end = sel_end.getParent("TR");
            var cell_beg = cell_number(sel_beg);
            var cell_end = cell_number(sel_end);

            var r_b = Math.min(row_beg.rowIndex, row_end.rowIndex);
            var c_b = Math.min(cell_beg, cell_end);
            var r_e = Math.max(row_beg.rowIndex + sel_beg.rowSpan - 1, row_end.rowIndex + sel_end.rowSpan - 1);
            var c_e = Math.max(cell_beg + sel_beg.colSpan - 1, cell_end + sel_end.colSpan - 1);

            if(typeof sel_rows == "object") fill_clear();

            sel_rows = new Array(r_b, r_e);
            sel_cols = new Array(c_b, c_e);

            analysis();
    }

    function analysis(){
            var flag = true;

            while(flag){
                    flag = fill();
            }
    }

    function fill(){
            var out = false;

            var r_b = sel_rows[0];
            var c_b = sel_cols[0];
            var r_e = sel_rows[1];
            var c_e = sel_cols[1];

            for(i = r_b; i <= r_e; i++){
                    for(j = c_b; j <= c_e; j++){
                            var td = arr_table[i][j];
                            //if(td.className.indexOf("td-selected") == -1){
                            if(!td.hasClass("td-selected")){
                                    td.addClass("td-selected");
                                    //td.className = td.className + " td-selected";

                                    var tr = td.getParent("TR");
                                    var row_beg = tr.rowIndex;
                                    var row_end = row_beg + td.rowSpan - 1;
                                    var col_beg = cell_number(td);
                                    var col_end = col_beg + td.colSpan - 1;

                                    if(row_beg < sel_rows[0]){
                                            sel_rows[0] = row_beg;
                                            out = true;
                                    }

                                    if(sel_rows[1] < row_end){
                                            sel_rows[1] = row_end;
                                            out = true;
                                    }

                                    if(col_beg < sel_cols[0]){
                                            sel_cols[0] = col_beg;
                                            out = true;
                                    }

                                    if(sel_cols[1] < col_end){
                                            sel_cols[1] = col_end;
                                            out = true;
                                    }
                            }
                    }
            }

            return out;
    }

    function fill_clear(){
            var r_b = sel_rows[0];
            var c_b = sel_cols[0];
            var r_e = sel_rows[1];
            var c_e = sel_cols[1];

            for(i = r_b; i <= r_e; i++){
                    for(j = c_b; j <= c_e; j++){
                            var td = arr_table[i][j];
                            td.removeClass("td-selected");
                            //td.className = td.className.replace(new RegExp("td-selected",'g'), "");
                    }
            }
    }

    function disableSelection(target){
        if (typeof target.onselectstart!="undefined")               //IE route
            target.onselectstart=function(){return false;};
   	else if (typeof target.style.MozUserSelect!="undefined")    //Firefox route
            target.style.MozUserSelect="none";
   	else                                                        //All other route (ie: Opera)
            target.onmousedown=function(){return false;};
   	
        target.style.cursor = "default";
   }
   
   function changeData(event){
        event = event || window.event; // для ебучего IE
        var elem = (event.target||event.srcElement).getParent(["TD", "TH"]);

        inp = document.createElement("input");
        inp.style.width = elem.offsetWidth + 'px';
        inp.style.height = elem.offsetHeight + 'px';
        inp.style.border = "none";
        inp.value = elem.innerHTML; //(elem.innerHTML.replace(' ','') == ''? "": elem.innerHTML);
        inp.onblur = function(){
            var txt = inp.value;
            inp.remove();
            elem.innerHTML = txt; //(txt.replace(" ", "") == ""? "&nbsp;": txt);
        }
        elem.innerHTML = "";
        elem.appendChild(inp);
        inp.select();
    }
}