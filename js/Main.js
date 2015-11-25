var widgetAPI = new Common.API.Widget();
var tvKey = new Common.API.TVKeyValue();
var pluginAPI = new Common.API.Plugin();
var currentFSMode = 2; 
var maxFSMode = 3;
var currentStatusLineText = '';

var EX_Langs = {
	'RU' : 'RU - русский',
	'UA' : 'UA - українська',
	'EN' : 'EN - english',
	'DE' : 'DE - deutsch',
	'ES' : 'ES - espanol',
	'PL' : 'PL - polski',
};

var EX_MaterialType = {
	'VIDEO' : 'Видео',
	'AUDIO' : 'Аудио',
};

// Устанавливаем значение по умолчанию. Остальные будут подгружены с помощью AJAX
var EX_Category = {"OUR_SERIES" : '1'};
var EX_CategoryWords = [];
	EX_CategoryWords[1] = "Наши сериалы";
var EX_Category_URL = [];
	EX_Category_URL[1] = "/ru/video/our_series";

var EX_Sort = ["новое в начале", "новое в конце"];

var Main = {
	version : "",
	mode : 0, // состояние полноэкранного режима
	WINDOW : 0,
	FULLSCREEN : 1,
	MATERIALL : 1,  //1 - видео, 2 - аудио, 3 - радио

	sURL : "", // адрес страниы альбома
	index : 1, // номер активного элемента
	smeh : 5, // смещение при перемещении верх-низ на странице
	page : 0, // номер текущей страницы

	listRowsPerPage : 18, // количество строк в листе
	listheight : 432, // высота блока list Main.css
	playlist : 0,
	sta : 0, // 0 - пауза, 1 - играть с начала, 2 - продолжить с места остановки

	prefixURL : "http://www.ex.ua",
	janrURL : '',
	search : false, // search : false, search : true,
	perPage : 10, // элементов на странице 10 или 15
	
	TVPlugin : 0,
	Audio : 0,
	audio_output_device : 0,
	hardware : 0,
	hardware_type : 0,
	serieC : false,
	serieE : false,
	serieB : false,
	serieText : "", // текстовая версия ТВ
	arr_hardware_char : ["C", "D", "B"],  //Старые версии ТВ
	
	set : new Object(), // содержит настройки прочитанные из файла
	
	sort : 0, // сортировка 0 - новое в начале, 1 - новое в конце
	mnCurrentCategory : 1,
	mbIsCategories : false,
	mbInDevelopment : false,
	
	keybMode : false,
	defaultKeybMode : '12key', // '12key' или 'qwerty' режим для стандартной клавиатуры
	customKeyb : true, // true - новая QWERTY клавиатура, false - стандартная
	fromLastPlayed : true, // продолжать воспроизведение с последнего открытого файла: true - да, false - нет
	clockOffset : 0, // смещение часового пояса
	
	player : 'standart', // standart, sef
	video : 'original', // original, mp4
	
	// TopMenu
	topMenu : {}, // Top menu items
	menu : false, // True if cursor in menu
	menuIndex : 1, // Selected menu item
	lang : 'RU',
	materialType : 'VIDEO',
	
	debugMode: true, // включаем отображение отладочной информации
	debugSection: new Array("All"), // используется для отображения отладочной информации в определенных разделах. All или "" - для отображения во всех разделах.
};

var b = 1; // индекс активной строки
var c = 1; // индекс прошлой активной строки
var url = ""; // адрес файла
var widgetPath = "";

showHandler = function() {
	// Стандартный индикатор громкости
	document.getElementById('pluginObjectNNavi').SetBannerState(1);
	pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
	// Отключаем скринсейвер
	pluginAPI.setOffScreenSaver();
};

Main.onLoad = function() {
	window.onShow =  showHandler; // Стандартный индикатор Volume-OSD
	
	this.TVPlugin = document.getElementById("pluginTV");
	this.hardware_type = this.TVPlugin.GetProductType();
	this.hardware = this.TVPlugin.GetProductCode(1);
	this.hardware_char=this.hardware.substring(4,5);
	
	Main.load(); // загружаем сохраненные настройки
	Main.getVersion(); // получаем версию виджета
	
	if (Player.init() && Audio.init() && Display.init(this)) {
		
		widgetAPI.sendReadyEvent();// Сообщаем менеджеру приложений о готовности
		
		$("#main").show();
		$("#anchor").focus(); // Помещение фокуса на элемент "anchor"
		$("#playlist").hide();
		$("#search").hide();
		$("#black").hide();
		$(".window input").removeClass('plainText');

		if(this.perPage == '15'){
			$("#spisok2").addClass("resmore");
		}
		
		// Set Category
		Main.setCategory();
		
		Main.NewJanr(this.prefixURL + EX_Category_URL[Main.mnCurrentCategory]);
	}
	
	if (this.customKeyb) {
		Keyboard.init(Search.onEnter);
	}
	
	Main.include();
	Info.open();
};

//Вставка клавиатуры
Main.include = function() {
    var html_doc = document.getElementsByTagName('head').item(0);
    var js = document.createElement('script');
	var urljs = '$MANAGER_WIDGET/Common/IME_XT9/ime.js';
	
	if(Main.arr_hardware_char.indexOf(Main.hardware_char) > -1){
		urljs = '$MANAGER_WIDGET/Common/IME/ime2.js';
	}
	
    js.setAttribute('language', 'javascript');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', urljs);
    html_doc.appendChild(js);
	
	return false;
};

Main.onUnload = function() {
	Player.deinit();
	URLtoXML.deinit();
};

Main.keyDown = function() {
	var keyCode = event.keyCode;
	
	if(Main.mbInDevelopment && (keyCode != tvKey.KEY_RETURN))
	{
		return;
	}
	
	switch (keyCode) {
	
	case tvKey.KEY_EXIT:
		//alert("KEY_EXIT");
		widgetAPI.blockNavigation(event); //отменяем заводскую реакцию на событие.
		
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN){
			Player.stopVideo();
			Main.setWindowMode();			
		} else {
			widgetAPI.sendReturnEvent();// <- выполняем выход из виджета ВОЗВРАТОМ в смартхаб - вместо закрытия смартхаба по widgetAPI.sendExitEvent();
		}
		
		break;
		
	case tvKey.KEY_TOOLS:
	case tvKey.KEY_GUIDE: // поиск
		if (this.playlist == 0 && !this.menu){
			// если мы 0-м уровне - поиск работает.
			$("#title").hide();
			$("#search").show();
			$("#black").show();
			$("#help_line_3").show();
			if (Main.hardware_char =='D'){
				$('#chlist_search').remove();
			}
			$(".window input").removeClass('plainText');
			$("#searchText").addClass('plainText');
			
			this.page = 0;
			
			if (this.customKeyb) {
				if (!Keyboard.run) {
					Keyboard.callback = Search.onEnter;
					Keyboard.cyr = true;
					Keyboard.show();
				} else {
					Keyboard.callback(Keyboard.str);
				}
			} else {
				Search.Input();
			}
		};

		break;
		
	case tvKey.KEY_1:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(1);
		} 
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(1);
		}
		
		break;
		
	case tvKey.KEY_2:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(2);
		}
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(2);
		}
		
		break;
		
	case tvKey.KEY_3:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(3);
		}
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(3);
		}
		
		break;
		
	case tvKey.KEY_4:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(4);
		}
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(4);
		}
		
		break;
		
	case tvKey.KEY_5:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(5);
		}
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(5);
		}
		
		break;
		
	case tvKey.KEY_6:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(6);
		}
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(6);
		}
		
		break;
		
	case tvKey.KEY_7:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(7);
		}
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(7);
		}
		
		break;
		
	case tvKey.KEY_8:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(8);
		}
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(8);
		}
		
		break;
		
	case tvKey.KEY_9:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.PercentJump(9);
		}
		else if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(9);
		}
		
		break;
		
	case tvKey.KEY_0:
		if (this.keybMode && this.customKeyb) {
			break;
		}
		else {
			Main.changeCategory(0);
		}
		
		break;
		
	case tvKey.KEY_INFO:
		if (this.mode==this.FULLSCREEN){
			Display.showplayer();
			//Display.statusLine (currentStatusLineText);
		}
		else if(this.playlist == 1 || this.playlist == 2){
			if(Display.fullDescVisible){
				Display.hideFullDesc();
			} else {
				Display.showFullDesc();
			}
		}
		// Выполняем вход в настройки только из основного раздела
		else if (this.playlist == 0 && !Favorites.isVisible && !Main.search && !Main.menu && (!this.keybMode || !this.customKeyb)) {
			Display.showLoading(0);
			
			setTimeout(function(){
				window.location = "settings.html"+location.search;
			}, 500);
		}
		else if (this.keybMode && this.customKeyb) {
			Keyboard.change();
		} 
		break;
		
	case tvKey.KEY_RED:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.nextAudio();
		}
		else if (this.keybMode && this.customKeyb) {
			Keyboard.langChange();
		}
		else if (this.playlist == 0) {
			Favorites.open();
		} 
		else if(Display.fullDescVisible){
			break;
		}
		else if (this.playlist == 2 && this.mode != this.FULLSCREEN && Main.video == 'original') {
			if(URLtoXML.WpUrlSt[b] != undefined && URLtoXML.WpUrlSt[b]!='') {
				Player.playWeb = true;
				url = URLtoXML.WpUrlSt[b];
				Main.play(url);
			} else {
				Display.statusLine("Нет упрощенной версии");
			}
		};
		break;
		
	case tvKey.KEY_YELLOW:
		if (this.keybMode && this.customKeyb) {
			Keyboard.backSpace();
		}
		else if(!Display.resumeFromTimeVisible && !Display.lastPlayedVisible && !this.menu) {
			if (this.playlist == 0 && Favorites.isVisible) {
				Favorites.del();
			} else {
				Favorites.add();
			}
		}
		break;
		
	case tvKey.KEY_BLUE: // переключение типа полноэкранного режима (циклично от 1 до 5, начальное значение 2)
		if (this.keybMode && this.customKeyb) {
			Keyboard.clear();
		}
		else if (this.playlist == 0 && !this.search && !this.menu && !Favorites.isVisible){
			Main.focusMenu();
		} 
		else {
		    if (this.mode == this.WINDOW) { // не переключаем в свернутом режиме
    			break;
    		} else {
			    currentFSMode = (currentFSMode < maxFSMode) ? currentFSMode + 1 : 1;
			    Player.setScreenMode(currentFSMode);
    		}
		}
		break;
		
	case tvKey.KEY_GREEN: // Показать жанры
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN){
			Player.change3dMode();
		}
		else if (this.keybMode && this.customKeyb) {
			Keyboard.shiftChange();
		}
		break;
		
	case tvKey.KEY_ASPECT: // переключение типа полноэкранного режима (циклично от 1 до maxFSMode , начальное значение 2)
		if (this.mode == this.WINDOW) { // не переключаем в свернутом режиме
			break;
		}
		else{
			currentFSMode = (currentFSMode < maxFSMode) ? currentFSMode + 1 : 1;
			Player.setScreenMode(currentFSMode);
			break;
		}

	case tvKey.KEY_STOP:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN){
			Player.stopVideo();
			Main.setWindowMode();
		}
		break;

	case tvKey.KEY_PAUSE:
		if (Player.getState() == Player.PLAYING) {
			this.handlePauseKey();
		}
		break;

	case tvKey.KEY_PLAY:
		if (Player.getState() != Player.PLAYING && this.mode == this.FULLSCREEN) {
			Main.handlePlayKey(url);
			this.sta = 1; // играть c начала
		}
		break;
		
	case tvKey.KEY_FF:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.skipForwardVideo(10); // перемотка +10 сек
		}
		break;
		
	case tvKey.KEY_RW:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.skipBackwardVideo(10); // перемотка -10 сек
		}
		break;

	case tvKey.KEY_RETURN:
	case tvKey.KEY_PANEL_RETURN:
		widgetAPI.blockNavigation(event); // блокируем по умолчанию RETURN 
		
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN)
		//если смотрим фильм - в любом раскладе играет или пауза - выходим. экономим на нажатии кнопки СТОП
		//зачем надо проверять режим проигрывания - на понял - по идее хватает проверки полноэкранности, но сделал  по аналогии 
		{
			Player.stopVideo();
			Main.setWindowMode();
			break;
		};
		
		if (this.keybMode && this.customKeyb) {
			Keyboard.returnKey();
			break;
		}
		
		if(Display.resumeFromTimeVisible) {
			Display.hideResumeFromTime();
			break;
		}
		
		if(Display.lastPlayedVisible) {
			Display.hideLastPlayed();
			break;
		}
		
		if(Display.fullDescVisible){
			Display.hideFullDesc();
			break;
		}
		
		if(this.menu){
			Main.blurMenu();
			break;
		}
		
		if (URLtoXML.folders.length==0 && this.playlist==2) {
			this.playlist=1;
		}

		if (URLtoXML.folders.length>0){
			delete URLtoXML.folders[URLtoXML.folders.length-1];
			URLtoXML.folders.length--;
		}

		if (URLtoXML.folders.length>0 && this.playlist==1){
			delete URLtoXML.folders[URLtoXML.folders.length-1];
			URLtoXML.folders.length--;
		} else if (URLtoXML.folders.length==0 && this.playlist<2){ 
			this.playlist=0;
		} else { 
			this.playlist=1; 
		}
		
		$("#list2").html('');

		if(this.playlist==0){
			// Закрываем "Избранное" и "Поиск"
			if(document.getElementById("spisok").style.display == "block"){
				if (Favorites.isVisible || this.search){
					this.search = false;
					Favorites.isVisible = false;
					Main.setCategory();
					Main.changeCategory(Main.mnCurrentCategory);
				}
			}
			
//			widgetAPI.blockNavigation(event); // блокируем по умолчанию RETURN
			document.getElementById("spisok").style.display = "block";
			document.getElementById("playlist").style.display = "none";
		} else {
			URLtoXML.xmlHTTP = null;

			if (URLtoXML.folders.length==0){
				URLtoXML.pDes[this.index] = '';
				URLtoXML.Proceed(URLtoXML.UrlSt[this.index]);
			}else{
				var currIDX = URLtoXML.folders[URLtoXML.folders.length-1].currIdx-1;
				URLtoXML.Proceed(URLtoXML.folders[URLtoXML.folders.length-1].urls[currIDX]);
			}
		}
		
		if (Info.isVisible)
		{
			Info.close();
		}
		
		if(Main.mbInDevelopment)
		{
			Main.mbInDevelopment = false;
		}
		
		if(Main.mbIsCategories)
		{
			Main.mbIsCategories = false;	
		}
		
		break;

	case tvKey.KEY_LEFT: // лево
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.skipBackwardVideo(120); // перемотка -2 мин
		}
		else if (this.keybMode && this.customKeyb) {
			Keyboard.setLeft();
		}
		else if (this.menu) {
			var menuItem = $("#menu_"+(parseInt(Main.menuIndex) - 1));
			if(menuItem.length > 0){
				Main.menuIndex--;
				Main.selectMenu(Main.menuIndex);
			}
		}
		else if(Display.resumeFromTimeVisible) {
			Display.resumeFromTime(true);
		}
		else if(Display.lastPlayedVisible) {
			Display.lastPlayed(true);
		}
		else {
			if (this.playlist == 0 && this.index > 0) {
				if (this.index == 1) {
					this.smeh = Main.NewString(0, -1) ? (this.perPage - 1) : 0;
					this.index = 1;
					Main.ActivString(this.smeh);
				} else {
					Main.ActivString(-1);
				}
			} else if ((this.playlist == 1 || this.playlist == 2) && this.index > 0) {
				Main.selectPrevPage();
				if (this.playlist == 1){
					URLtoXML.folders[URLtoXML.folders.length-1].currIdx = b;
				}
			}
		}
		break;

	case tvKey.KEY_RIGHT: // право
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.skipForwardVideo(120); // перемотка +2 мин
		}
		else if (this.keybMode && this.customKeyb) {
			Keyboard.setRight();
		}
		else if (this.menu) {
			var menuItem = $("#menu_"+(parseInt(Main.menuIndex) + 1));
			if(menuItem.length > 0){
				Main.menuIndex++;
				Main.selectMenu(Main.menuIndex);
			}
		}
		else if(Display.resumeFromTimeVisible) {
			Display.resumeFromTime(false);
		}
		else if(Display.lastPlayedVisible) {
			Display.lastPlayed(false);
		}
		else {
			if (this.playlist == 0 && this.index < URLtoXML.ImgDickr.length) {
				if (this.index == this.perPage) {
					this.index = 1;
					Main.NewString(0, 1);
					Main.ActivString(0);
				} else if (this.index < URLtoXML.ImgDickr.length-1) {
					Main.ActivString(1);
				}
			} else if (this.playlist == 1 || this.playlist == 2) {
				Main.selectNextPage();
				if (this.playlist == 1){
					URLtoXML.folders[URLtoXML.folders.length-1].currIdx = b;
				}
			}
		}
		break;

	case tvKey.KEY_UP:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.skipForwardVideo(30); // перемотка +30 сек
		} 
		else if (this.keybMode && this.customKeyb) {
			Keyboard.setUp();
		}
		else if (this.menu) {
			Main.selectMenuItem('next');
		}
		else if(Display.fullDescVisible){
			Display.slideUpDesc();
		}
		else if (this.playlist == 0) {
			this.smeh = -5;
			if (this.index > 0 && this.index <= 5) {
				Main.NewString((parseInt(this.perPage) + parseInt(this.smeh)), -1); // переход поиска вверх
			} else {
				Main.ActivString(this.smeh); // активная строка
			}
		} else if (this.playlist == 1 || this.playlist == 2) {
			Main.selectPrevElem();
			if (this.playlist == 1){
				URLtoXML.folders[URLtoXML.folders.length-1].currIdx = b;
			}
		}
		break;

	case tvKey.KEY_DOWN:
		if ((Player.getState() == Player.PLAYING || Player.getState() == Player.PAUSED) && this.mode == this.FULLSCREEN) {
			Player.skipBackwardVideo(30); // перемотка -30 сек
		} 
		else if (this.keybMode && this.customKeyb) {
			Keyboard.setDown();
		}
		else if (this.menu) {
			Main.selectMenuItem('prev');
		}
		else if(Display.fullDescVisible){
			Display.slideDownDesc();
		}
		else if (this.playlist == 0) {
			this.smeh = 5;
			if (this.index > (parseInt(this.perPage) - parseInt(this.smeh)) && this.index <= parseInt(this.perPage)) {
				Main.NewString(-(parseInt(this.perPage) - parseInt(this.smeh)), 1); // переход поиска вниз
			}
			if ((parseInt(this.index)+parseInt(this.smeh)) < URLtoXML.ImgDickr.length && this.index + parseInt(this.smeh) > 0){
				Main.ActivString(this.smeh);// активная строка
			}
		} else if (this.playlist == 1 || this.playlist == 2) {
			if (this.playlist == 1){
				if (b>=URLtoXML.folders[URLtoXML.folders.length-1].urls.length) break;
			}else{
				if (b>=URLtoXML.pUrlSt.length-1) break;
			}
			
			Main.selectNextElem();
			this.sta = 1; // играть c начала

			if (this.playlist == 1){
				URLtoXML.folders[URLtoXML.folders.length-1].currIdx = b;
			}
		}
		break;

	case tvKey.KEY_ENTER:
	case tvKey.KEY_PANEL_ENTER:
		if (this.keybMode && this.customKeyb) {
			Keyboard.addKey();
		}
		else if(Display.fullDescVisible){
			break;
		}
		else if (this.playlist == 0 && !this.menu) {
			if(URLtoXML.UrlSt[this.index] != undefined){

				this.playlist = 1;

				$("#list2").html('');

				URLtoXML.xmlHTTP = null;
				URLtoXML.Proceed(URLtoXML.UrlSt[this.index]);
				
				$("#spisok").hide();
				$("#playlist").show();
				$("#descript").show();
				$("#description").html("<div class='poster'><img src='" + URLtoXML.ImgDickr[this.index] + "'/></div>" + URLtoXML.pDes[this.index]);
			}
		} else if (this.playlist == 1) {
			
			if(this.mbIsCategories)
			{
				
			}
			else
			{
				if(!URLtoXML.blockEnter){
					$("#list2").html('');
					URLtoXML.xmlHTTP = null;			
					var currIDX = URLtoXML.folders[URLtoXML.folders.length-1].currIdx-1;
					URLtoXML.Proceed(URLtoXML.folders[URLtoXML.folders.length-1].urls[currIDX]);
				}
			}
			
		} else if (this.playlist == 2) {
			// установка воспроизведения/паузы на кнопку ентер
			if(this.mode == this.FULLSCREEN){
				if (Player.getState() != Player.PLAYING){
					this.handlePlayKey();
				} else {
					this.handlePauseKey();
				};
			} else {
				if(!Display.resumeFromTimeVisible) {
					if (Main.video != 'original' ){
						alert('Player.playWeb');
						if(URLtoXML.WpUrlSt[b] != undefined && URLtoXML.WpUrlSt[b]!='') {
							Player.playWeb = true;
							url = URLtoXML.WpUrlSt[b];
						} else {
							Player.playWeb = false;
							url = URLtoXML.pUrlSt[b];							
						}
					}else{
						alert('Player.noplayWeb');
						Player.playWeb = false;
						url = URLtoXML.pUrlSt[b];
					}
				}
				
				if(Display.lastPlayedVisible) {
					if(this.fromLastPlayed) {
						$.each(URLtoXML.pUrlSt, function(i,val) {
							if(Player.lastPlayedUrl == val) {
								Main.selectElem(i); // делаем строку с индексом i активной
								
								$.each(Player.data['lastPlayed'], function(j,value) {
									if (Player.lastPlayedUrl == value.url) {
										Player.playWeb = value.web;
									}
								});
								
								if(Player.playWeb) {
									url = URLtoXML.WpUrlSt[b];
								} else {
									url = URLtoXML.pUrlSt[i];
								}
								
								if (Main.video != 'original' && !Player.playWeb){
									Display.statusLine("Нет упрощенной версии, воспроизводим оригинал.");
								}
								
								Main.play(url, false); // второй параметр: true - с начала, false - с места остановки
							}
						});
					}
					
					Display.hideLastPlayed();
				} else {
					if (Main.video != 'original' && !Player.playWeb){
						Display.statusLine("Нет упрощенной версии, воспроизводим оригинал.");
					}
					
					Main.play(url);
				}
			}
		};
		break;
		
	case tvKey.KEY_PRECH:

		break;
		
	case tvKey.KEY_CHLIST:
		if (this.keybMode && this.customKeyb && Main.hardware_char != 'D') {
			Keyboard.change();
		}
		break;

	case tvKey.KEY_CH_UP: 
	case tvKey.KEY_PANEL_CH_UP:
		if (Player.getState() == Player.PLAYING && this.mode == this.FULLSCREEN) {
			// переключение на следующий трек/видео файл
			if (b >= URLtoXML.pUrlSt.length-1) break;
			Main.selectNextElem(); // переключение на след. трек
			if(Player.playWeb) {
				url = URLtoXML.WpUrlSt[b];
			} else {
				url = URLtoXML.pUrlSt[b];
			}
			Main.play(url, true); // второй параметр: true - с начала, false - с места остановки
		}
		else if (this.playlist == 0 && !this.keybMode) {
			// переключение разделов сайта (Видео, Музыка, Сериалы и т.д.)
			if(EX_CategoryWords.length > 0){
				var loop = true;
				while(loop){
					Main.mnCurrentCategory = (Main.mnCurrentCategory < (EX_CategoryWords.length - 1)) ? parseInt(Main.mnCurrentCategory) + 1 : 0;
					if(EX_CategoryWords[Main.mnCurrentCategory] != undefined){
						loop = false;
						Main.changeCategory(Main.mnCurrentCategory);
					}
				}
			}
		}
		break;
		
	case tvKey.KEY_CH_DOWN: 
	case tvKey.KEY_PANEL_CH_DOWN:
		if (Player.getState() == Player.PLAYING && this.mode == this.FULLSCREEN) {
			// переключение на предыдущий трек/видео файл
			if (b<=1) break;
			Main.selectPrevElem();
			if(Player.playWeb) {
				url = URLtoXML.WpUrlSt[b];
			} else {
				url = URLtoXML.pUrlSt[b];
			}
			Main.play(url, true); // второй параметр: true - с начала, false - с места остановки
		}
		else if (this.playlist == 0 && !this.keybMode) {
			// переключение разделов сайта (в обратном порядке) (Видео, Музыка, Сериалы и т.д.)
			if(EX_CategoryWords.length > 0){
				var loop = true;
				while(loop){
					Main.mnCurrentCategory = (Main.mnCurrentCategory > 0) ? parseInt(Main.mnCurrentCategory) - 1 : EX_CategoryWords.length - 1;
					if(EX_CategoryWords[Main.mnCurrentCategory] != undefined){
						loop = false;
						Main.changeCategory(Main.mnCurrentCategory);
					}
				}
			}
		}
		break;
			
	default:
//		alert("Unhandled key");
		break;
	}
	
	if (URLtoXML.sName[this.index]) {
		if (URLtoXML.sName[this.index].length > 180) {
			widgetAPI.putInnerHTML(document.getElementById("title"), URLtoXML.sName[this.index].substr(0, 180) + "...");
		} else {
			// название в заголовок
			widgetAPI.putInnerHTML(document.getElementById("title"), URLtoXML.sName[this.index]);
		}
	}
	
	Info.load();
	
	Main.ListTop();
};

// перемещение по страницам
Main.NewString = function(per, a) {
	this.smeh = per; // соответствие столбца
	this.page = this.page + a; // смещаем адрес поиска страницы
	if (this.page < 0) {// верхний предел
		this.page = 0;
		this.smeh = 0;
		return 0;
	} else if (Favorites.isVisible) {
		return Favorites.changePage();
	} else {
		var index = Main.index;
		$("#title").html("");
		Main.clearBlocks();
		Main.index = index + this.smeh;
		
		URLtoXML.xmlHTTP = null;
		
		var url = '';
		
		if (this.search){
			url = this.sURL + '&per=' + this.perPage + '&p=' + this.page;
		}else{
			url = this.janrURL + '?per=' + this.perPage + '&p=' + this.page + '&v='+Main.getSortPar(); // жанр
		}
		
		URLtoXML.Proceed(url);
		
		return 1;
	}
};

// активная строка
Main.ActivString = function(smeh) {
	$(".block").each(function(){
		$(this).removeClass('selected');
	});
	this.smeh = smeh;
	this.index = this.index + this.smeh;
	$("#bloc" + this.index).addClass('selected');
};

Main.ListTop = function() { // смещение списка по достижению пределов
	document.getElementById("list2").style.top = (-this.listheight * Math.floor((b-1)/this.listRowsPerPage))+"px";
};

// Делаем активным первый элемент списка
Main.handleActiv = function() {
	$("#list2").css('top','0');
	
	$("#list2>div").each(function(){
		$(this).removeClass('selected');
	});

	b = 1;
	c = 1;
	$("#str" + b).addClass('selected');
};

// Делаем строку с индексом d активной
Main.selectElem = function(d) {
	c = b;
	$("#str" + c).removeClass('selected');
	b = d;
	$("#str" + b).addClass('selected');
};

// Переходим на следующий элемент списка
Main.selectNextElem = function() {
	c = b;
	$("#str" + c).removeClass('selected');
	b++;
	$("#str" + b).addClass('selected');
	this.sta = 1;// играть c начала
};

// Переходим на предыдущий элемент списка
Main.selectPrevElem = function(){
	if (b > 1) {
		c = b;
		$("#str" + c).removeClass('selected');
		b--;
		$("#str" + b).addClass('selected');
		this.sta = 1;// играть c начала
	} 	
};

// Переходим на следующую страницу списка
Main.selectNextPage = function() {
	c = b;
	$("#str" + c).removeClass('selected');
	b += this.listRowsPerPage;
	if (this.playlist == 1){
		if (b >= URLtoXML.folders[URLtoXML.folders.length-1].urls.length){
			b = URLtoXML.folders[URLtoXML.folders.length-1].urls.length;
		}
	} else {
		if (b >= URLtoXML.pUrlSt.length-1){
			b = URLtoXML.pUrlSt.length-1;
		}
	}
	$("#str" + b).addClass('selected');
	this.sta = 1;// играть c начала
};

// Переходим на предыдущую страницу списка
Main.selectPrevPage = function(){
	if (b > 1) {
		c = b;
		$("#str" + c).removeClass('selected');
		b -= this.listRowsPerPage;
		if (b < 1) b = 1;
		$("#str" + b).addClass('selected');
		this.sta = 1;// играть c начала
	}
};

Main.play = function(url, playFromBegin){
	
	Main.checkMaterialType();

	if(url !== undefined){
		if(playFromBegin === undefined) {
			Player.seekTime = Main.getResumeTime(url);
			if(Player.seekTime > 0) {
				if(!Display.resumeFromTimeVisible && !Display.lastPlayedVisible) {
					Display.showResumeFromTime();
				} else {
					Main.handlePlayKey(url);
					Display.showplayer();
				}
			} else {
				this.sta = 1;
				Main.handlePlayKey(url);
				Display.showplayer();
			}
		} else {
			if(playFromBegin === true){
				this.sta = 1;
				Main.handlePlayKey(url);
				Display.showplayer();
			} else {
				this.sta = 2;
				Player.seekTime = Main.getResumeTime(url);
				Main.handlePlayKey(url);
				Display.showplayer();
			}
		}
	}
}

Main.handlePlayKey = function(url)
{
	if (this.sta == 1 || this.sta == 2) {
		Player.stopVideo();
		url = URLtoXML.pUrlSt[b];
		Player.playVideo(url);
	}
	
	switch (Player.getState()) {
		case Player.STOPPED:
			Player.playVideo(url);
			break;
		case Player.PAUSED:
			Player.resumeVideo();
			break;
		default:
			break;
	}

	Main.ListTop(); // смещение списка по достижению пределов
	Display.hideResumeFromTime();
	Display.hideLastPlayed();
};

Main.handlePauseKey = function() {
	switch (Player.getState()) {
	case Player.PLAYING:
		Player.pauseVideo();
		this.sta = 0; // пауза
		break;
	default:
		break;
	}
};

// перемещение поиска по страницам
Main.NewJanr = function(janr) {
	this.search = false;
	Favorites.isVisible = false;
	
	Main.setMenu();
	Main.clearBlocks();
	
	this.page = 0;
	this.janrURL = janr;
	this.sURL = janr + '?per=' + this.perPage + '&p=' + this.page + '&v='+Main.getSortPar();
	
	URLtoXML.xmlHTTP = null;
	URLtoXML.Proceed(this.sURL);
};

Main.setFullScreenMode = function() {
	if (this.mode != this.FULLSCREEN) {
		$('#main').hide();
//		Player.setFullscreen();
		this.mode = this.FULLSCREEN;
	}
};

Main.setWindowMode = function() {
	if (this.mode != this.WINDOW) {
		Display.hideplayer();
		Player.setWindow();
		$('#main').show();
		$('#fon').hide();
		this.mode = this.WINDOW;
	}
};

Main.toggleMode = function() {
	switch (this.mode) {
		case this.WINDOW:
			this.setFullScreenMode();
			break;

		case this.FULLSCREEN:
			this.setWindowMode();
			break;

		default:
			break;
	}
};

Main.clearBlocks = function(){
	$("#title").empty();
	$("#spisok2").empty();
	
	Main.index = 1;
	URLtoXML.ImgDickr = [];
	URLtoXML.UrlSt = [];
	URLtoXML.sName = [];
	URLtoXML.pDes = [];
};

Main.getSortPar = function(){
	var res = '';
	switch(this.sort){
		case 0: res = '0-0'; break;
		case 1: res = '0-1'; break;
	}
	return res;
};

Main.sortSelectNext = function(){
	if (this.sort < EX_Sort.length - 1){
		this.sort++;
	} else {
		this.sort=0;
	}
	Main.NewJanr(this.janrURL);
	Main.save();
};

Main.getResumeTime = function(url){
	var seekTime = 0;
	
	$.each(Player.data['resumeTime'], function(key,val) {
		if (val.url == url) {
			seekTime = val.time;
		}
	});
	
	return seekTime;
};

Main.save = function() {
	var obj = this.set;
	obj.defaultKeybMode = this.defaultKeybMode;
	obj.sort = this.sort;

	var fileSystemObj = new FileSystem();
	if (!fileSystemObj.isValidCommonPath(curWidget.id)) fileSystemObj.createCommonDir(curWidget.id);
    var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/settings.data','w');
    if (fileObj)
    {
        var str = JSON.stringify(obj);
		fileObj.writeAll(str);
        fileSystemObj.closeCommonFile(fileObj);
    }
	
	obj = null;
};

Main.load = function() {
	var fileSystemObj = new FileSystem();
	var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/settings.data','r');
	if (fileObj){
		var strResult = fileObj.readAll();
		if (strResult) {
			this.set = JSON.parse(strResult);
			if('sort' in this.set) this.sort = this.set.sort;
			if('keyb' in this.set && this.set['keyb'] != '') this.customKeyb = (this.set.keyb == 'qwerty') ? true : false;
			if('defaultKeybMode' in this.set && this.set['defaultKeybMode'] != '') this.defaultKeybMode = this.set.defaultKeybMode;
			if('perPage' in this.set && this.set['perPage'] != '') this.perPage = this.set.perPage;
			if('gmt' in this.set && this.set['gmt'] != '') this.clockOffset = this.set.gmt;
			if('player' in this.set && this.set['player'] != '') this.player = this.set.player;
			if('video' in this.set && this.set['video'] != '') this.video = this.set.video;
		}
		strResult = null;
		fileSystemObj.closeCommonFile(fileObj);
	}
};

Main.changeCategory = function(catID) 
{
	if(EX_CategoryWords[catID] != undefined){
		if (this.playlist == 0) {
			Main.mnCurrentCategory = catID;
			Main.NewJanr(this.prefixURL + EX_Category_URL[Main.mnCurrentCategory], EX_CategoryWords[Main.mnCurrentCategory]);
		}

		if(Main.menu){
			Main.focusMenu();
			Main.selectMenu(3);
		}
	}
}

// Получаем версию виджета из config.xml
Main.getVersion = function() {
	$.ajax({
		type: "GET",
		dataType: "html",
		url: 'http://tuxbox:8000/js/version.json',
		async: false,
		success: function(data) {
			try {
			data = JSON.parse(data);
			Main.version = data.stage;
			widgetPath = 'http://tuxbox:8000'; //local
			alert("Widget version: " + Main.version);
				//Main.setMenu();
				
			} catch (e){
				alert("Get version error "+e);
			}
		},
		error: function(xhr, ajaxOptions, thrownError) { 
			alert("AJAX Error get version.json! "+thrownError); //add github.io
		}
	});
}

Main.checkMaterialType = function()
{
	var ext = '';
	
	if(URLtoXML.pName[b] != undefined){
		ext = URLtoXML.pName[b].split("."); // узнаем расширение файла
		ext = ext[ext.length-1].toLowerCase();
	}
	
	if(URLtoXML.arrVideoExt.indexOf(ext) > -1){
		Main.MATERIALL = 1;
	}
	else if(URLtoXML.arrAudioExt.indexOf(ext) > -1){
		Main.MATERIALL = 2;
	} else {
		Main.MATERIALL = 3;
	}
	
	// нужно для обновления типа плеера, который будет использоваться для выбранного раздела
	Player.deinit();
	Player.init();
}

// Top Menu
Main.setCategory = function() 
{
	EX_Category = [];
	EX_CategoryWords = [];
	EX_Category_URL = [];
	
	$.support.cors = true;
	
	$.ajax({
		type: "GET",
		dataType: "html",
		url: widgetPath+'/js/catalog.json',
		//url: 'http://31.129.166.181/ex_server/1_0_2/catalog.json', // удалить после решения проблемы с сервером
		async: false,
		success: function(data) {
			try {
//				data = $.parseJSON(data);
				data = JSON.parse(data);
				
				for (var lang in data){
					if (data.hasOwnProperty(lang))
					{
						var materials = data[lang];
						
						if(Main.lang == lang){
							for (var material in materials){
								if (materials.hasOwnProperty(material))
								{
									var category = data[lang][material];
									
									if(Main.materialType == material){
										for (var key in category){
											if (category.hasOwnProperty(key))
											{
												var value = data[lang][material][key];
												
												EX_Category[key] = value['chanel'];
												EX_CategoryWords[value['chanel']] = value['title'];
												EX_Category_URL[value['chanel']] = value['url'];
											}
										}
									}
								}
							}
						}
					}
				}
				
//				$.each(data, function(lang,materials) {
//					if(Main.lang == lang){
//						$.each(materials, function(material,category) {
//							if(Main.materialType == material){
//								$.each(category, function(key,value) {
//									EX_Category[key] = value['chanel'];
//									EX_CategoryWords[value['chanel']] = value['title'];
//									EX_Category_URL[value['chanel']] = value['url'];
//								});
//							}
//						});
//					}
//				});
				
				data = null;
				
				Main.setMenu();
				
			} catch (e){
				alert("Main.setCategory() "+e);
			}
		},
		error: function(xhr, ajaxOptions, thrownError) { 
			alert("Main.setCategory() AJAX Error get catalog.json! "+thrownError);
		}
	});
}

Main.setMenu = function() 
{
	Main.topMenu = {};
	//Main.topMenu['lang'] = EX_Langs;
	Main.topMenu['materialType'] = EX_MaterialType;
	Main.topMenu['category'] = EX_CategoryWords;
	//Main.topMenu['sort'] = EX_Sort;
	Main.showTopMenu(Main.topMenu);
}

Main.focusMenu = function() 
{
	Main.menu = true;
	Main.menuIndex = 1;
	Main.selectMenu(Main.menuIndex);
	
	$(".block").each(function(){
		$(this).removeClass('selected');
	});
}

Main.blurMenu = function() 
{
	Main.menu = false;
	Main.menuIndex = 1;
	$("#menu > li").removeClass("active");
	$("#bloc" + Main.index).addClass('selected');
}

Main.selectMenu = function(index) 
{
	Main.menuIndex = index;
	$("#menu > li").removeClass("active");
	$("#menu_"+index).addClass("active");
}

Main.selectMenuItem = function(direction) 
{
	var menu = $("#menu_"+Main.menuIndex).attr('data');
	
	switch(menu)
	{
		case 'lang':
			
			var tempArr = [];
			
			$.each(EX_Langs, function(key,title) {
				tempArr.push(key);
			});
			
			var index = tempArr.indexOf(Main.lang);

			if(index > -1){
				if(direction == 'next'){
					index = ((index + 1) < tempArr.length) ? index + 1 : 0;
				} else {
					index = ((index - 1) >= 0) ? index - 1 : tempArr.length - 1;
				}

				Main.lang = tempArr[index];
				Main.mnCurrentCategory = 1;
				
				Main.setCategory();
				Main.clearBlocks();

				if(EX_CategoryWords[Main.mnCurrentCategory] != undefined){
					Main.changeCategory(Main.mnCurrentCategory);
				}
				
				Main.selectMenu(1);
			}
			
			break;
			
		case 'materialType':
			
			var tempArr = [];
			
			$.each(EX_MaterialType, function(key,title) {
				tempArr.push(key);
			});
			
			var index = tempArr.indexOf(Main.materialType);

			if(index > -1){
				if(direction == 'next'){
					index = ((index + 1) < tempArr.length) ? index + 1 : 0;
				} else {
					index = ((index - 1) >= 0) ? index - 1 : tempArr.length - 1;
				}
				
				Main.materialType = tempArr[index];
				Main.mnCurrentCategory = 1;
				
				Main.setCategory();
				Main.clearBlocks();

				if(EX_CategoryWords[Main.mnCurrentCategory] != undefined){
					Main.changeCategory(Main.mnCurrentCategory);
				}
				
				Main.selectMenu(2);
			}
			
			break;
			
		case 'category':
			if(direction == 'next'){
				// переключение категори
				if(EX_CategoryWords.length > 0){
					var loop = true;
					while(loop){
						Main.mnCurrentCategory = (Main.mnCurrentCategory < (EX_CategoryWords.length - 1)) ? parseInt(Main.mnCurrentCategory) + 1 : 0;
						if(EX_CategoryWords[Main.mnCurrentCategory] != undefined){
							loop = false;
							Main.changeCategory(Main.mnCurrentCategory);
						}
					}
				}
			} else {
				// переключение категори в обратном порядке
				if(EX_CategoryWords.length > 0){
					var loop = true;
					while(loop){
						Main.mnCurrentCategory = (Main.mnCurrentCategory > 0) ? parseInt(Main.mnCurrentCategory) - 1 : EX_CategoryWords.length - 1;
						if(EX_CategoryWords[Main.mnCurrentCategory] != undefined){
							loop = false;
							Main.changeCategory(Main.mnCurrentCategory);
						}
					}
				}
			}
			break;
			
		case 'sort':
			if(direction == 'next'){
				if (Main.sort < EX_Sort.length - 1){
					Main.sort++;
				} else {
					Main.sort = 0;
				}
			} else {
				if (Main.sort > 0){
					Main.sort--;
				} else {
					Main.sort = EX_Sort.length - 1;
				}
			}
			
			Main.changeCategory(Main.mnCurrentCategory);
			Main.selectMenu(4);
			Main.save();
			
			break;
	}
}

Main.showTopMenu = function(data)
{
	var i = 0;
	
	$("#menu").empty();
	
	$.each(data, function(key,obj) {
		
		i++;
		$("#menu").append('<li id="menu_'+i+'" data="'+key+'"></li>');
		
		$.each(obj, function(id,val) {
			if((key == 'lang' && Main.lang == id) || 
			   (key == 'materialType' && Main.materialType == id) || 
			   (key == 'category' && Main.mnCurrentCategory == id) ||
			   (key == 'sort' && Main.sort == id)){
			   $("#menu_"+i).append('<span>'+val+'</span>');
			}
		});
	});
};

// удаление скриптов и другого со странички
function DelTrash(sOut) {
	sOut = sOut.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");
	sOut = sOut.replace(/<object[^>]*>[\s\S]*?<\/object>/g, "");
	sOut = sOut.replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");
	sOut = sOut.replace(/<head[^>]*>[\s\S]*?<\/head>/g, "");
	return sOut;
};

function Debug(title, variable)
{
	if(Main.debugMode && typeof(title) != 'undefined'){
		$.each(Main.debugSection, function(index, section) {
			if(title.indexOf(section) > -1 || section == "" || section == "All"){
				alert("["+Info.getTime("dd.MM.yy HH:mm:ss")+"] "+title + dump(variable));
			}
		});
	}
	
	return false;
}

function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "\t";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		dumped_text += " : (object) {\t\t";
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += "\n\t\t" + level_padding + "'" + item + "'";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += "\n\t\t" + level_padding + "'" + item + "' : \"" + value + "\"";
			}
		}
		dumped_text += "\n\t"+level_padding+"}";
	} else { //Stings/Chars/Numbers etc.
		if(typeof(arr) != 'undefined') dumped_text += " : " + arr;
	}
	return dumped_text;
}