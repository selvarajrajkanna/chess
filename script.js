
window.onload = function() {
	setChessBox();
	formChessBoard();
};

window.onresize = function(){
	setChessBox();
};

var chess_dom;

var chess_sides = {'black': 'black', 'white': 'white'};

var chess_sides_toggle_helper = {true: chess_sides.white, false: chess_sides.black};

var active_side = chess_sides.white;
var opposive_side = chess_sides.black;
var movement_side = -1;

var current_playing_side = {
	coin: active_side,
	get current() {
		return this.coin;
	},
	toggle: function() {
		this.coin = chess_sides_toggle_helper[!(this.coin == chess_sides.white)];
		active_side = this.coin;
		opposive_side = chess_sides_toggle_helper[!(this.coin == chess_sides.white)];
		
		movement_side = active_side == chess_sides.black ? 1 : -1;
	}
}

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
	        if(x == board_size - 1) {
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

	        if(x == board_size - 2) {
	        	chess_matrix[x][y] = 'pawn_w';
	        	coin_type = 'white';
	        }

	        if(x == 1) {
	        	chess_matrix[x][y] = 'pawn_b';
	        	coin_type = 'black';
	        }

	        if(x == 0) {
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

	current_playing_side.toggle();

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
	return [parseInt(x_place), parseInt(y_place)];
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

	let current_axis = convertIdToAxis(current_box_ele.id);
	let current_x_place = current_axis[0];
	let current_y_place = current_axis[1];

	let target_axis = convertIdToAxis(target_box_ele.id);
	let target_x_place = target_axis[0];
	let target_y_place = target_axis[1];

	let target_box_color = target_box_ele.getAttribute('data-type');

	is_legal = false;
	if(current_x_place + movement_side*target_x_place > 0  ) {  // check if movement is forward only
		notInfront = checkIfCoinNotInfront(current_box_ele);
		if(notInfront.status) {  // to check if any coin infront by one place
			let board_side_start_place = movement_side == -1 ? board_size : -1;
			if( (Math.abs(current_x_place - target_x_place) == 1 && current_y_place == target_y_place) || (Math.abs(current_x_place - target_x_place) == 2 && current_x_place == board_side_start_place + (movement_side * 2) ) ) {
				if(target_box_color != opposive_side || ( (Math.abs(current_x_place - target_x_place) == 1) && target_box_color == opposive_side) ) {
					is_legal = true;
				}
			}
		} else {
			if(Math.abs(current_y_place - target_y_place) == 1 && (opposive_side == notInfront.coin_color || target_box_color == opposive_side) )  {
				if((Math.abs(current_x_place - target_x_place) == 1) && target_box_color == opposive_side) {
					is_legal = true;
				};
			}
		}
	};


	return is_legal;
};

function checkIfCoinNotInfront(current_ele) {
	let current = convertIdToAxis(current_ele.id);

	let coin_color = '';

	let infront_ele = document.getElementById('x'+ (current[0] + movement_side*1) + ' ' + 'y'+ current[1] );
	if(infront_ele) {
		coin_color = infront_ele.getAttribute('data-type');
	}

	if(chess_matrix[current[0] + movement_side*1][current[1]] == '' ) {
		return { 'status': true, 'coin_color':coin_color };
	};
	return { 'status': false, 'coin_color':coin_color };
};

function checkIfCoinInDiagonal1Place(current_ele) {
	let current = convertIdToAxis(current_ele.id);
	console.log('x' + ( current[0] + (movement_side*1) ) + ' y' + ( current[1] + (movement_side*1) ));
	let oneDiag = document.getElementById('x' + ( current[0] + (movement_side*1) ) + ' y' + ( current[1] + (movement_side*1) ) );
	let diagColor = oneDiag.getAttribute('data-type');
	if(diagColor == opposive_side) {
		return { 'status': true, coin_color: diagColor };
	}
	return {'status': false, coin_color: diagColor};
}
