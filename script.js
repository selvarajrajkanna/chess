
window.onload = function() {
	setChessBox();
	formChessBoard();
};

window.onresize = function(){
	setChessBox();
};

var chess_dom;

var chess_sides = {'black': 'black', 'white': 'white'};
var active_side = chess_sides.black;
var opposive_side = chess_sides.white;

function setChessBox() {
	var chess_dom = document.getElementById("chessBoard");
	let window_height = window.innerHeight;
	chess_dom.style.height = window_height + 'px';
	chess_dom.style.width = window_height + 'px';
};

var chess_matrix ;

var coin_removed = [] ;
var board_size;

function formChessBoard() {
	var chess_dom = document.getElementById("chessBoard");

	chess_matrix = [];
	board_size = 8;

	for(var x = 0 ; x < board_size; x++){
	    chess_matrix[x] = [];
	    for(var y = 0 ; y < board_size; y++){
	    	let coin_type = '';
	        chess_matrix[x][y] = '';
	        if(x == 0) {
	        	chess_matrix[x][0] = 'rook_w';
	        	chess_matrix[x][board_size - 1] = 'rook_w';

	        	chess_matrix[x][1] = 'knight_w';
	        	chess_matrix[x][board_size - 2] = 'knight_w';

	        	chess_matrix[x][2] = 'bishop_w';
	        	chess_matrix[x][board_size - 3] = 'bishop_w';

	        	chess_matrix[x][3] = 'queen_w';
	        	chess_matrix[x][board_size - 4] = 'king_w';

	        	coin_type = 'white';
	        }

	        if(x == 1) {
	        	chess_matrix[x][y] = 'pawn_w';
	        	coin_type = 'white';
	        }

	        if(x == board_size - 2) {
	        	chess_matrix[x][y] = 'pawn_b';
	        	coin_type = 'black';
	        }

	        if(x == board_size - 1) {
	        	chess_matrix[x][0] = 'rook_b';
	        	chess_matrix[x][board_size - 1] = 'rook_b';

	        	chess_matrix[x][1] = 'knight_b';
	        	chess_matrix[x][board_size - 2] = 'knight_b';

	        	chess_matrix[x][2] = 'bishop_b';
	        	chess_matrix[x][board_size - 3] = 'bishop_b';

	        	chess_matrix[x][3] = 'queen_b';
	        	chess_matrix[x][board_size - 4] = 'king_b';

	        	coin_type = 'black';
	        }

			chess_dom.appendChild(createDiv(x, y, chess_matrix[x][y], coin_type));
	    };
	};

	document.querySelectorAll('.chess-box').forEach(function(item) {
	  item.addEventListener('click', function() {
	    box_clicked(item);
	  });
   });
};


function createDiv(x,y,coin_name, coin_type) {

	var toAdd = document.createDocumentFragment();
	
	var newDiv = document.createElement('div');
	
	newDiv.id = 'x' + x.toString() + ' y' + y.toString();

	newDiv.dataset.type = coin_type;
	
	let default_classname = 'chess-box' + ' ' + coin_name;

	if(coin_name.length < 0) {
		default_classname = default_classname;
	};
	
	newDiv.className = default_classname;
	if(x%2 == 0) {
		if(y%2 == 1) {
			newDiv.className = default_classname + ' shade';
		};
	} else {
		if(y%2 == 0) {
			newDiv.className = default_classname + ' shade';
		};
	};
	toAdd.appendChild(newDiv);

	return toAdd;
};

function box_clicked(ele) {
	if (last_selected_piece.coin == undefined) {
		first_click(ele);
	} else {
		second_click(ele);
	};	

	return ;
};

function first_click(ele) {
	let is_valid = isFirstCoinClicked(ele);
	if(is_valid.status) {
		last_selected_piece.set_coin = ele;
	};

	return ;
};

function second_click(ele) {
	is_legal = isMoveLegal(ele);

	if(is_legal) {

		let target_coin_color = ele.getAttribute("data-type");

		if (target_coin_color == opposive_side) {
			replace_coin(ele);
		};

		moveCoinToPlace(ele, last_selected_piece.coin);

	};

	last_selected_piece.set_coin = undefined;

	return ;

}

function isFirstCoinClicked(ele) {
	let class_list = ele.classList;		
	let coin_name = get_coin_name(class_list);
	if(last_selected_piece.coin == undefined && coin_name != undefined && active_side == ele.getAttribute("data-type")) {
		ele.classList.add('active');
		return { 'status': true, 'name': coin_name };
	}
	return { 'status': false, 'name': coin_name };
}

function isMoveLegal(ele) {
	let last_coin_color = last_selected_piece.coin.getAttribute("data-type");
	let target_place_color = ele.getAttribute("data-type");
	
	let is_legal = false;

	if(last_coin_color != target_place_color) {
		is_legal = true;
	};
	
	let current_coin_name = get_coin_name(last_selected_piece.coin.classList).split('_')[0];
	
	if (is_legal) {
		switch(current_coin_name) {
			case 'pawn':
				is_legal = check_legal_move_pawn(last_selected_piece.coin, ele);
				break;
			default:
				break;
		};
	};

	return is_legal;
}

function moveCoinToPlace(target_ele, last_selected_ele) {
	let last_selected_coin = last_selected_piece.get_coin;
	let last_selected_coin_class = last_selected_coin.classList;
	
	let coin_name = get_coin_name(last_selected_coin_class);
	let coin_color = last_selected_coin.getAttribute("data-type");

	target_ele.classList.add(coin_name);
	last_selected_coin.classList.remove(coin_name);

	target_ele.setAttribute("data-type", coin_color);
	last_selected_coin.setAttribute("data-type", '');

	update_matrix(target_ele, last_selected_ele);

	return ;
};

var last_selected_piece = {
	coin: undefined,
	get get_coin() {
		return this.coin;
	},
	set set_coin(p) {
		if(p == undefined) {
			this.coin.classList.remove('active');
		}
		this.coin = p;
	}
};

function get_coin_name(coin_list) {
	let common_class = ['chess-box', 'shade'];
	return Array.from(coin_list).filter(x => !common_class.includes(x))[0];
};

function update_matrix(ele, last_ele) {
	
	axis = convertIdToAxis(ele.id);
	x_place = axis[0];
	y_place = axis[1];

	old_axis = convertIdToAxis(last_ele.id);
	old_x_place = old_axis[0];
	old_y_place = old_axis[1];

	let coin_name = get_coin_name(ele.classList);

	chess_matrix[old_x_place][old_y_place] = '';
	chess_matrix[x_place][y_place] = coin_name;

	console.log(chess_matrix);

};

function convertIdToAxis(id) {
	let cur_place = id.split(' ');
	let x_place = cur_place[0].split('x')[1];
	let y_place = cur_place[1].split('y')[1];
	return [x_place, y_place];
}

function replace_coin(ele) {
	target_coin_name = get_coin_name(ele.classList);
	ele.classList.remove(target_coin_name);

	old_axis = convertIdToAxis(ele.id);
	old_x_place = old_axis[0];
	old_y_place = old_axis[1];
	chess_matrix[old_x_place][old_y_place] = '';

	coin_removed.push(target_coin_name);	
};



/*  checking chess move validity  */

function check_legal_move_pawn(current_box_ele, target_box_ele) {

	current_axis = convertIdToAxis(current_box_ele.id);
	current_x_place = current_axis[0];
	current_y_place = current_axis[1];

	target_axis = convertIdToAxis(target_box_ele.id);
	target_x_place = target_axis[0];
	target_y_place = target_axis[1];

	is_legal = false;
	
	if(current_x_place > target_x_place  ) {
		if(Math.abs(current_x_place - target_x_place) == 1 || (Math.abs(current_x_place - target_x_place) == 2 && current_x_place == board_size - 2) ) {
			let target_box_color = target_box_ele.getAttribute('data-type');
			if(target_box_color != opposive_side) {
				is_legal = true;
			}
		}
	};

	if(is_legal) {
		console.log(target_y_place);
		console.log(current_y_place);
		console.log(target_y_place == current_y_place);
		if(target_y_place == current_y_place || target_box_color == opposive_side && (true) )  {
			
		}
	}


	return is_legal;
};

function checkIfCoinNotInfront(current) {
	if(chess_matrix[(parseInt(current[0]) - 1).toString()][(parseInt(current[1]) - 1).toString()] == '' ) {
		return true;
	};
	return false;
};
