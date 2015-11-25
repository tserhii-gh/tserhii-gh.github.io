var widgetAPI = new Common.API.Widget();
var tvKey = new Common.API.TVKeyValue();
var pluginAPI = new Common.API.Plugin();

var currentStatusLineText = '';

var optDescriptions = new Array();
	optDescriptions[1] = new Array();
	optDescriptions[1][1] = "Выберите количество элементов, которое будет отображаться на страницах категорий Фильмы, Музыка, Передачи и т.д.";
	optDescriptions[1][2] = "Выберите количество элементов, которое будет отображаться на страницах категорий Фильмы, Музыка, Передачи и т.д.";
	optDescriptions[2] = new Array();
	optDescriptions[2][1] = "Для воспроизведения файлов будет использоваться стандартный плеер. <br /><br />\n\
							Плюсы:<br />\n\
							- работает на всех сериях ТВ; <br />\n\
							- более стабильная буферизация при воспроизведении файлов больших размеров. <br /><br />\n\
							Минусы:<br />\n\
							- не поддерживает смену звуковых дорожек.";
	optDescriptions[2][2] = "Для воспроизведения будет использоваться SEF плеер. <br /><br />\n\
							Плюсы:<br />\n\
							- поддерживает смену звуковых дорожек. <br /><br />\n\
							Минусы:<br />\n\
							- работает только на ТВ 2012+ года (E серия и выше); <br />\n\
							- имеет проблемы с буферизацией файлов больших размеров; <br />\n\
							- не всегда открывает файлы с расширением mkv.";
	optDescriptions[3] = new Array();
	optDescriptions[3][1] = "По умолчанию будет воспроизводиться оригинальная версия файла (mkv, avi и т.д.).";
	optDescriptions[3][2] = "По умолчанию будет воспроизводиться оптимизированная версия (веб версия) файла (mp4). Если она отсутствует, будет воспроизводиться оригинал.";
	optDescriptions[4] = new Array();
	optDescriptions[4][1] = "По умолчанию будет использоваться стандартная клавиатура Samsung.<br /><br /> \n\
							Плюсы:<br />\n\
							- поддерживает голосовой ввод и Smart Remote. <br /><br />\n\
							Минусы:<br />\n\
							- QWERTY клавиатура Samsung поддерживается только на ТВ 2012+ года (E серия и выше). Для более ранних моделей доступна только 3х4 клавиатура.";
	optDescriptions[4][2] = "По умолчанию будет использоваться пользовательская QWERTY клавиатура.<br /><br /> \n\
							Плюсы:<br />\n\
							- работает на всех сериях ТВ; <br />\n\
							- более простое переключение между русской и английской раскладкой. <br /><br />\n\
							Минусы:<br />\n\
							- не поддерживает голосовой ввод и Smart Remote.";
	optDescriptions[5] = new Array();
	optDescriptions[5][1] = "Для изменения значения часового пояса используйте стрелки Влево/Вправо.";
	
var Settings = {
	version : "",
	mode : 0, // состояние полноэкранного режима
	WINDOW : 0,
	FULLSCREEN : 1,
	
	prefixURL : "http://ex.ua",
	
	TVPlugin : 0,
	hardware : 0,
	hardware_type : 0,
	serieC : false,
	serieE : false,
	serieB : false,
	serieText:"", // текстовая версия ТВ
	arr_hardware_char : ["C", "D", "B"],  //Старые версии ТВ
	
	set: new Object(), // содержит настройки прочитанные из файла
	
	keybMode : false,
	defaultKeybMode : '12key', // '12key' или 'qwerty' режим для стандартной клавиатуры
	clockOffset : 0, // смещение часового пояса
};

var widgetPath = "";
var setIndex = 1; // индекс активной строки
var valIndex = 1; // индекс активной опции

showHandler = function() {
	// Стандартный индикатор громкости
	document.getElementById('pluginObjectNNavi').SetBannerState(1);
	pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
	// Отключаем скринсейвер
	pluginAPI.setOffScreenSaver();
};

Settings.onLoad = function() {
	widgetAPI.sendReadyEvent();// Сообщаем менеджеру приложений о готовности
	window.onShow =  showHandler; // Стандартный индикатор Volume-OSD
	
	this.TVPlugin = document.getElementById("pluginTV");
	this.hardware_type = this.TVPlugin.GetProductType();
	this.hardware = this.TVPlugin.GetProductCode(1);
	this.hardware_char = this.hardware.substring(4,5);
	
	Settings.load(); // загружаем сохраненные настройки
	Settings.getVersion(); // получаем версию виджета
	
	if (Display.init(this)) {

		$("label").removeClass("selected");
		$("div.radio").removeClass("active");
		$(".set_"+setIndex+" > label.val_"+valIndex).addClass("selected");
		$("#description").html(optDescriptions[setIndex][valIndex]);

		$.each(this.set, function(setting, value) {
			$("input[name="+setting+"]").val(value);
			if(setting == 'perPage' || setting == 'player' || setting == 'video' || setting == 'keyb'){
				$("#"+value).addClass("active");
			}
		});
		
		if(this.arr_hardware_char.indexOf(this.hardware_char)>-1){
			$("#sef").addClass("disabled");
		}
		
		var helpLine = $("#help_line .info_block");
		helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/red.png" /> - Сохранить настройки</div>');
		helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/move.png" /> - Навигация</div>');
		helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/enter.png" /> - Выбор</div>');
		helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/back.png" /> - Выйти из настроек</div>');

		$("#main").show();
		$("#anchor").focus(); // Помещение фокуса на элемент "anchor"
		$("#black").hide();
		$(".window input").removeClass('plainText');
		$("#vidget_ver").attr('id','widget_ver').html("Model:"+this.hardware+"   Type:"+this.hardware_char+"   v."+this.version);

		this.include();
	}
};

// Вставка клавиатуры
Settings.include = function() {
    var html_doc = document.getElementsByTagName('head').item(0);
    var js = document.createElement('script');
	if(this.arr_hardware_char.indexOf(this.hardware_char)>-1){
		var urljs = '$MANAGER_WIDGET/Common/IME/ime2.js';
	}else{
		var urljs = '$MANAGER_WIDGET/Common/IME_XT9/ime.js';
	}
	
    js.setAttribute('language', 'javascript');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', urljs);
    html_doc.appendChild(js);
	
	return false;
};

Settings.onUnload = function() {
	
};

Settings.keyDown = function() {
	var keyCode = event.keyCode;
	
	switch (keyCode) {
	
	case tvKey.KEY_EXIT:
		widgetAPI.blockNavigation(event); //отменяем заводскую реакцию на событие.
		Display.showLoading(0);
		
		setTimeout(function(){
			window.location = "index.html"+location.search;
		}, 500);
		
		break;
		
	case tvKey.KEY_TOOLS:

		break;
		
	case tvKey.KEY_INFO:

		break;
		
	case tvKey.KEY_RED:
		Settings.save();
		Display.statusLine("Настройки сохранены!");
		break;
		
	case tvKey.KEY_YELLOW:

		break;
		
	case tvKey.KEY_BLUE:

		break;
		
	case tvKey.KEY_GREEN:
	
		break;

	case tvKey.KEY_RETURN:
	case tvKey.KEY_PANEL_RETURN:
		widgetAPI.blockNavigation(event); // блокируем по умолчанию RETURN 
		Display.showLoading(0);
		setTimeout(function(){
			window.location = "index.html"+location.search;
		}, 500);
		break;

	case tvKey.KEY_LEFT: // лево
		if ($(".set_"+setIndex+" label.val_"+(valIndex-1)).length > 0){
			valIndex--;
			$("label").removeClass("selected");
			$(".set_"+setIndex+" label.val_"+valIndex).addClass("selected");
			$("#description").html(optDescriptions[setIndex][valIndex]);
		}
		else if($(".set_"+setIndex+" input.val_"+valIndex).attr("name") == 'gmt'){
			var value = $(".set_"+setIndex+" input.val_"+valIndex).val();
			if(--value >= -12){
				if(value > 0) value = "+"+value;
				$(".set_"+setIndex+" input.val_"+valIndex).val(value);
			}
		}
		break;

	case tvKey.KEY_RIGHT: // право
		if ($(".set_"+setIndex+" label.val_"+(valIndex+1)).length > 0){
			valIndex++;
			$("label").removeClass("selected");
			$(".set_"+setIndex+" label.val_"+valIndex).addClass("selected");
			$("#description").html(optDescriptions[setIndex][valIndex]);
		} 
		else if($(".set_"+setIndex+" input.val_"+valIndex).attr("name") == 'gmt'){
			var value = $(".set_"+setIndex+" input.val_"+valIndex).val();
			if(++value <= 12){
				if(value > 0) value = "+"+value;
				$(".set_"+setIndex+" input.val_"+valIndex).val(value);
			}
		}
		break;

	case tvKey.KEY_UP:
		if ($(".set_"+(setIndex-1)+" label.val_1").length > 0){
			setIndex--;
			valIndex = 1;
			$("label").removeClass("selected");
			$(".set_"+setIndex+" label.val_"+valIndex).addClass("selected");
			$("#description").html(optDescriptions[setIndex][valIndex]);
		}
		break;

	case tvKey.KEY_DOWN:
		if ($(".set_"+(setIndex+1)+" label.val_1").length > 0){
			setIndex++;
			valIndex = 1;
			$("label").removeClass("selected");
			$(".set_"+setIndex+" label.val_"+valIndex).addClass("selected");
			$("#description").html(optDescriptions[setIndex][valIndex]);
		}
		break;

	case tvKey.KEY_ENTER:
	case tvKey.KEY_PANEL_ENTER:
		if ($(".set_"+setIndex+" div.val_"+valIndex).length > 0 && $(".set_"+setIndex+" div.val_"+valIndex).hasClass("radio")){
			var value = $(".set_"+setIndex+" div.val_"+valIndex).attr("id");
			
			if(value == "sef" && this.arr_hardware_char.indexOf(this.hardware_char)>-1){
				Display.statusLine("SEF плеер не поддерживается этой серией ТВ!");
				break;
			}
			
			$(".set_"+setIndex+" input[type=hidden]").val(value);
			$(".set_"+setIndex+" div.radio").removeClass("active");
			$(".set_"+setIndex+" div.val_"+valIndex).addClass("active");
//			alert($(".set_"+setIndex+" input[type=hidden]").val());
		}
		break;
		
	default:
		alert("Unhandled key");
		break;
	}
};

Settings.save = function() {
	var obj = this.set;
//	obj.userLogin = $("input[name=userLogin]").val();
//	obj.userPass = $("input[name=userPass]").val();
	obj.perPage = $("input[name=perPage]").val();
	obj.player = $("input[name=player]").val();
	obj.video = $("input[name=video]").val();
	obj.keyb = $("input[name=keyb]").val();
	obj.gmt = $("input[name=gmt]").val();
	obj.defaultKeybMode = this.defaultKeybMode;

	var fileSystemObj = new FileSystem();
	if (!fileSystemObj.isValidCommonPath(curWidget.id)) fileSystemObj.createCommonDir(curWidget.id);
    var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/settings.data','w');
    if (fileObj)
    {
        var str = JSON.stringify(obj);
		fileObj.writeAll(str);
        fileSystemObj.closeCommonFile(fileObj);
    }
};

Settings.load = function() {
	var fileSystemObj = new FileSystem();
	var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/settings.data','r');
	if (fileObj){
		var strResult = fileObj.readAll();
		if (strResult) {
			this.set = JSON.parse(strResult);
			if(this.set['perPage'] == undefined || this.set['perPage'] == '') this.set['perPage'] = 10;
			if(this.set['player'] == undefined || this.set['player'] == '') this.set['player'] = 'standart';
			if(this.set['video'] == undefined || this.set['video'] == '') this.set['video'] = 'original';
			if(this.set['keyb'] == undefined || this.set['keyb'] == '') this.set['keyb'] = 'samsung';
			if('defaultKeybMode' in this.set) this.defaultKeybMode = this.set.defaultKeybMode;
			if('gmt' in this.set) this.clockOffset = this.set.gmt;
		}
		fileSystemObj.closeCommonFile(fileObj);
	} else {
		this.set['perPage'] = 10;
		this.set['player'] = 'standart';
		this.set['video'] = 'original';
		this.set['keyb'] = 'samsung';
		this.set['gmt'] = 0;
		this.set['defaultKeybMode'] = '12key';
	}
};

// Получаем версию виджета из config.xml
Settings.getVersion = function() 
{
	$.ajax({
		type: "GET",
		dataType: "html",
		url: 'http://tuxbox:8000/js/version.json',
		async: false,
		success: function(data) {
			try {
			data = JSON.parse(data);
			Settings.version = data.stage;
			widgetPath = 'http://tuxbox:8000';
			alert("Settings vidget version: " + Settings.version);
				
			} catch (e){
				alert("Get version error "+e);
			}
		},
		error: function(xhr, ajaxOptions, thrownError) { 
			alert("AJAX Error get version.json! "+thrownError);
		}
	});
	
}