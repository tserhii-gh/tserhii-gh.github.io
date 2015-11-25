var Search = {
	
};
var scat = ''; //поиск в текущей категории
var ime = ''; // обьект - виртуальная клав.
var rezylt = ''; // текст результат

Search.Input = function() {
	// создаём виртуальную клав. привязанную к ID - "searchText"
	ime = new IMEShell("searchText", Search.imeReady, 'ru');
};

// функции привязанные к вертуальной клав.
Search.imeReady = function(imeObject) {
	ime.setKeypadPos(330, 100); // положение 3x4 клавиатуры
	if(Main.arr_hardware_char.indexOf(Main.hardware_char)<=-1){ //проверка на версию клавиатуры
		ime.setQWERTYPos(210, 100); // положение QWERTY клавиатуры
		ime.setKeypadChangeFunc('12key', Search.change12KeyMode);// событие при переключении на 3x4 клавиатуру
		ime.setKeypadChangeFunc('qwerty', Search.changeQwertyMode);// событие при переключении на qwerty клавиатуру
		ime.setKeySetFunc(Main.defaultKeybMode); // устанавливаем режим отображения стандартной клавиатуры (12key или qwerty)
	}
	document.getElementById("searchText").focus(); // помещаем фокус на ввод текста
	ime.setEnterFunc(Search.onEnter); // событие на кнопку интер
	ime.setOnCompleteFunc(Search.SearchOk); // отлавливаем текст
	ime.setKeyFunc(tvKey.KEY_RETURN, Search.textobjKeyFunc);// событие на кнопку RETURN
	ime.setKeyFunc(tvKey.KEY_CHLIST, Search.changeKeyb);// событие на кнопку KEY_CHLIST
	//ime.setKeyFunc(tvKey.KEY_CH_UP, Search.changeKeyb);// событие на кнопку KEY_CH_UP
	//ime.setKeyFunc(tvKey.KEY_CH_DOWN, Search.changeKeyb);// событие на кнопку KEY_CH_DOWN
	ime.setKeyFunc(tvKey.KEY_INFO, Search.changeKeyb);// событие на кнопку KEY_CH_DOWN
	alert ('Keybord2');
};

Search.onEnter = function(string) {
	if(string != ''){
		$("#anchor").focus(); // перемещаем фокус на элемент "anchor"
		// перезапускаем парсинг с новой строкой поиска
		Main.search = true;
		Favorites.isVisible = false;
		Main.clearBlocks();
		
		$("#menu").html("");
		$("#menu").append('<li id="menu_1"><span>Поиск</span></li>');
		$("#menu").append('<li id="menu_2"><span>«'+string+'»</span></li>');

		URLtoXML.xmlHTTP = null;
		//Main.sURL = Main.prefixURL+"/search?" +  + "s=" + string;
		//Наши сериалы "original_id=422546&"
		//Наше "original_id=70538&"
		//""
		//""
		//""
		alert("###### >> " + EX_Category_URL[Main.mnCurrentCategory]);
		if (Main.mnCurrentCategory > 0){
			if (EX_Category_URL[Main.mnCurrentCategory] == "/ru/video/our_series"){
				scat = "original_id=422546&";
					}
				else if (EX_Category_URL[Main.mnCurrentCategory] == "/ru/video/our"){
					scat = "original_id=70538&";
				} 
				else {
					scat = '';
				}
		}
		Main.sURL = Main.prefixURL+"/search?" + scat + "s=" + string;
		alert(Main.sURL);
		URLtoXML.Proceed(Main.sURL);

		$("#title").show();
		$("#search").hide();
		$("#black").hide();
		$("#help_line_3").hide();

		if (Main.keybMode == true && Main.customKeyb) {
			Keyboard.hide();
		}
	}
};

Search.textobjKeyFunc = function(keyCode) {// возврат при нажатии кнопки RETURN
	$("#anchor").focus(); // перемещаем фокус на элемент "anchor"
	$("#title").show();
	$("#search").hide();
	$("#black").hide();
	$("#help_line_3").hide();
	
	if (Main.keybMode == true && Main.customKeyb) {
		Keyboard.hide();
	}
};

Search.SearchOk = function(arg) { // отлавливаем текст и помещаем в переменную
	rezylt = arg;
};

// смена клавиатуры при нажатии на кнопку KEY_CHLIST
Search.changeKeyb = function(keyCode) 
{
	Search.textobjKeyFunc();
	
	$("#title").hide();
	$("#search").show();
	$("#black").show();
	$("#help_line_3").show();
	
	Main.customKeyb = true;
	Keyboard.init(Search.onEnter);
	Keyboard.show();
};

Search.change12KeyMode = function() {
	alert ("=====================12KeyMode===============");
	Main.defaultKeybMode = '12Key';
	Main.save();
};

Search.changeQwertyMode = function() {
	alert ("=====================QwertyMode===============");
	Main.defaultKeybMode = 'qwerty';
	Main.save();
};
