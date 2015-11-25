var Info = {
	items: new Array(),
	isVisible: false,
	news : false,
};

Info.open = function() {
	this.isVisible = true;
	
	// set widget version
	$("#date").attr('id','widget_ver').html("v."+Main.version); //"Model:"+Main.hardware+"   Type:"+Main.hardware_char+
	
	if($("#time").length == 0){
		$("#top").append('<div id="time" />');
	}
	
	Info.load();
	//Info.include();
	Info.setClock();
};

Info.close = function() {
	//this.isVisible = false;
	//document.getElementById("info").style.display = "none";
};

Info.hidestatus = function()
{
	this.isVisible = false;
	document.getElementById("info").style.display="none";
};

Info.statusTimer = function()
{
	this.status1_timer=setTimeout("Info.hidestatus()",10000);
};

Info.load = function() 
{
	var helpLine = $("#help_line .info_block");
	
	helpLine.empty();
	
	if (Main.playlist == 0) {
		if (Favorites.isVisible){
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/yellow.png" /> - Удалить из избранного</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/tools.png" /><img src="'+widgetPath+'/img/buttons/guide.png" /> - Поиск</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/back.png" /> - Назад</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/exit.png" /> - Выход</div>');
		}
		else if (Main.keybMode) {
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/red.png" /> - Язык</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/green.png" /> - Caps</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/yellow.png" /> - Backspace</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/blue.png" /> - Очистить</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/move.png" /> - Навигация</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/tools.png" /><img src="'+widgetPath+'/img/buttons/guide.png" /> - Поиск</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/enter.png" /> - Выбор</div>');
			$('#chlist_search').hide();
		} 
		else if (Main.search) {
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/red.png" /> - Избранное</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/yellow.png" /> - Доб. в избранное</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/move.png" /> - Навигация</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/0_9.png" /><img src="'+widgetPath+'/img/buttons/chanel.png" /> - Категория</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/tools.png" /><img src="'+widgetPath+'/img/buttons/guide.png" /> - Поиск</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/exit.png" /> - Выход</div>');
		}
		else if (Main.menu) {
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/lr.png" /> - Навигация</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/ud.png" /> - Выбор</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/0_9.png" /><img src="'+widgetPath+'/img/buttons/chanel.png" /> - Категория</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/back.png" /> - Выйти из меню</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/exit.png" /> - Выход</div>');
		}
		else {
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/red.png" /> - Избранное</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/yellow.png" /> - Доб. в избранное</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/blue.png" /> - Меню</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/0_9.png" /><img src="'+widgetPath+'/img/buttons/chanel.png" /> - Категория</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/tools.png" /><img src="'+widgetPath+'/img/buttons/guide.png" /> - Поиск</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/info.png" /> - Настройки</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/exit.png" /> - Выход</div>');
		}
	}
	
	if (Main.playlist == 1) {
		if(Display.fullDescVisible){
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/yellow.png" /> - Доб. в избранное</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/ud.png" /> - Листать текст</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/back.png" /> - Скрыть полное описание</div>');
		} else {
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/yellow.png" /> - Доб. в избранное</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/ud.png" /> - Навигация</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/enter.png" /> - Выбор</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/info.png" /> - Полное описание</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/back.png" /> - Назад</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/exit.png" /> - Выход</div>');
		}
	}
	
	if (Main.playlist == 2) {
		if(Display.fullDescVisible){
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/yellow.png" /> - Доб. в избранное</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/ud.png" /> - Листать текст</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/back.png" /><img src="'+widgetPath+'/img/buttons/info.png" /> - Скрыть полное описание</div>');
		} else {
			if (Main.video == 'original'){
				helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/red.png" /> - Web версия</div>');
			}
			
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/yellow.png" /> - Доб. в избранное</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/ud.png" /> - Навигация</div>');
			
			if (Main.video == 'original'){
				helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/enter.png" /> - Оригинальная версия</div>');
			} else {
				helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/enter.png" /> - Просмотр</div>');
			}
			
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/info.png" /> - Полное описание</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/back.png" /> - Назад</div>');
			helpLine.append('<div class="helpLineButton"><img src="'+widgetPath+'/img/buttons/exit.png" /> - Выход</div>');
		}
	}
};

/*Info.include = function() {
	this.news = true;
	var html_doc = document.getElementsByTagName('head').item(0);
	var js = document.createElement('script');
	var urljs_new = 'http://wiget.pp.ua/ex_server/news.js';
	js.setAttribute('language', 'javascript');
	js.setAttribute('type', 'text/javascript');
	js.setAttribute('src', urljs_new);
	html_doc.appendChild(js);
	alert ("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! DONE !!!!!!!!!!!!!!!!!!!!!!!!");
	return false;
};*/
 
/* TIME / CLOCK */
Info.setClock = function () {
//	widgetAPI.putInnerHTML(document.getElementById("time"), Info.getTime("EE, dd MMM yyyy HH:mm:ss"));
	widgetAPI.putInnerHTML(document.getElementById("time"), Info.getTime("HH:mm"));
	widgetAPI.putInnerHTML(document.getElementById("player_time"), Info.getTime("HH:mm"));
	setTimeout(Info.setClock,60000);
};

Info.getTime = function (format) {
    var dt = Info.getLocalTime();
    return dt.format(format);
};

Info.getLocalTime = function () {
    var pluginTime = document.getElementById('pluginTime');
    var time = 0;
    var epochtime = 0;
    var dt = null;
    var offsetHrs = 0;
    var offsetMS = 0;

    if ($.isFunction(pluginTime.GetEpochTime)) {
        epochtime = pluginTime.GetEpochTime();
        time = epochtime * 1000;
    }
    else {
        time = new Date().getTime();
    }

    if (epochtime <= 0) {
        time = new Date().getTime();
    }

	if ((Main.clockOffset || 0) !== 0) {
		offsetHrs = parseInt(Main.clockOffset, 10);
		offsetMS = offsetHrs * 3600000;
	}

    if ($.isFunction(pluginTime.ConvertEpochToLocalTime)) {
        var t = pluginTime.ConvertEpochToLocalTime(epochtime);
        var x = t.split("/");
        dt = new Date(x[0], x[1] - 1, x[2], x[3], x[4], x[5]);
        dt = dt.add("h", offsetHrs);
    } else {
        time += new Date().getTimezoneOffset();
        dt = new Date(time + offsetMS);
    }

    if (!isFinite(dt)) {
        time += new Date().getTimezoneOffset();
        dt = new Date(time + offsetMS);
    }
	
    return dt;
};