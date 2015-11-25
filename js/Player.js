var ScreenWidth = 960;
var ScreenHeight = 540;

var VideoWidth = 0;
var VideoHeight = 0;
var VideoDuration = 0;
var modeName="";

var DISPLAY_MODE = new Array();
DISPLAY_MODE[0] = '3D MODE - OFF';
DISPLAY_MODE[1] = '3D MODE - TOP BOTTOM';
DISPLAY_MODE[2] = '3D MODE - SIDE BY SIDE';
DISPLAY_MODE[7] = '3D MODE - FROM 2D TO 3D';

var Player = {
	plugin : null,
	state : -1,
	stopCallback : null,

	STOPPED : 0,
	PLAYING : 1,
	PAUSED : 2,
	FORWARD : 3,
	REWIND : 4,
	
	// BD-Player Front Display
    PLAY: 100,
    STOP: 101,
    PAUSE: 102,
    ONLINE: 200,
	
	duration : 0,
    current_time : 0,
	seekTime : 0,
	minDuration : 600000, // минимальная продолжительность записи, для которой запоминается остановка воспроизведения (10 мин).
	lastPlayedUrl : null, // url последнего открытого файла в выбраной папке
	playWeb : false,
	useSEF : false, // true - используем SEF плеер, false - используем стандартный плеер
	support3DMode : false, // поддерживается ли 3D режим
	change3DMode : false, // этот флаг нужен что бы определить изменялся ли режим 3D для корректного выхода из него
	arrSaveLastPlayed : [ // перечень разделов, где запоминается последний открытый файл
"/ru/video/our_series",
//		EX_Category.THE_ANIMATED_SERIES,
//		EX_Category.TV_SHOWS,
//		EX_Category.COLLECTIONS,
//		EX_Category.ALBUMS,
//		EX_Category.SOUND_TRACKS
	],
	data : {
		resumeTime : new Array(),
		lastPlayed : new Array()
	},
	screenSaverTime: 180, // 3 мин
};

Player.init = function() {
	var success = true;
	this.state = this.STOPPED;
	Player.pluginScreen = document.getElementById("pluginScreen");
	
	if (Main.player == 'standart' || Main.MATERIALL == 3) {
		Player.useSEF = false;
	} else {
		Player.useSEF = true;
	}
	
	if(Player.pluginScreen.Flag3DEffectSupport() == 1 && Main.MATERIALL == 1){
		Player.support3DMode = true;
	} else {
		Player.support3DMode = false;
	}
	
	if(Player.useSEF){
		Player.plugin = document.getElementById("PluginSef");
		
		if (!Player.plugin ){
			Player.setWindow();
			success = false;
		}
		
		Player.plugin.Open('Player', '1.010', 'Player');
		Player.plugin.OnEvent = 'Player.onPlayerEvent';
	} else {
		Player.plugin = document.getElementById("pluginPlayer");
		
        if (!Player.plugin ){
        	Player.setWindow();
            success = false;
        }
		
		Player.plugin.OnCurrentPlayTime = 'Player.setCurTime';
		Player.plugin.OnStreamInfoReady = 'Player.OnStreamInfoReady';
		Player.plugin.OnBufferingStart = 'Player.onBufferingStart';
		Player.plugin.OnBufferingProgress = 'Player.onBufferingProgress';
		Player.plugin.OnBufferingComplete = 'Player.onBufferingComplete';
	}
	
	Player.readSavedData();
	
	return success;
};

Player.deinit = function()
{
	if (Player.plugin) {
		if(Player.useSEF){
			Player.plugin.Execute('Stop');
		} else {
			Player.plugin.Stop();
		}
		
		//Player.saveResumeTime();
	}
};

// переключение типа полноэкранного режима, значения от 1 до 3
Player.setScreenMode = function(modesize) {
	if (VideoWidth <= 0 || VideoHeight <= 0) {return -1;}
	
	var wCorr = VideoWidth < (VideoHeight * 4 / 3) ? VideoHeight * 4 / 3 : VideoWidth ;
	
	var crop = {
		x : 0,
		y : 0,
		w : VideoWidth ,
		h : VideoHeight
	};
	
	var disp = {
		x : 0,
		y : 0,
		w : ScreenWidth,
		h : ScreenHeight
	};
 
  //  var result = modesize;//((!modesize) ? 1 : modesize) + "";
   
	switch (modesize) {
	case 1:
		if ( VideoWidth/VideoHeight < 16/9 ) {
			modeName="FullScreen 4x3";
			var h1 = wCorr * 9 / 16;
			crop = {
				x : 0,
				y : parseInt( (VideoHeight - h1) / 2),
				w : VideoWidth ,
				h : parseInt(h1)
			};
		} else {
			modeName="FullScreen 16x9";
			var w1 = VideoHeight * 16 / 9;
			crop = {
				x : parseInt( (VideoWidth - w1) / 2),
				y : 0,
				w : parseInt(w1),
				h : VideoHeight
			};
		}
		break;
	case 2:
		if (VideoWidth/VideoHeight < 16/9 ) {
			modeName="Original 4x3";
			var h1 = ScreenHeight;
			var w1 = h1 * wCorr / VideoHeight;
			var x = (ScreenWidth - w1) / 2;
			if (x < 0)
				x = 0;
			disp = {
				x : parseInt(x),
				y : 0,
				w : parseInt(w1),
				h : parseInt(h1)
			};
		} else {
			modeName="Original 16x9";
			var w1 = ScreenWidth;
			var h1 = w1 * VideoHeight / VideoWidth;
			var y = (ScreenHeight - h1) / 2;
			if (y < 0)
				y = 0;
			disp = {
				x : 0,
				y : parseInt(y),
				w : parseInt(w1),
				h : parseInt(h1)
			};
		}
		;
		break;
	case 3:
		modeName="FullScreen 14x9";
		crop = {
			x : 0,
			y : parseInt(0.0625 * VideoHeight),
			w : VideoWidth ,
			h : parseInt(0.875 * VideoHeight)
		};
		break;
	default:
		break;
}

	if(Player.useSEF){
		Player.plugin.Execute("SetCropArea", crop.x, crop.y, crop.w, crop.h);
		Player.plugin.Execute('SetDisplayArea',disp.x,disp.y,disp.w,disp.h);
	} else {
		Player.plugin.SetCropArea(crop.x, crop.y, crop.w, crop.h);
		Player.plugin.SetDisplayArea(disp.x, disp.y, disp.w, disp.h);
	}
	
	currentStatusLineText = modeName + " (" + crop.w + "x" + crop.h + ")";
	widgetAPI.putInnerHTML(document.getElementById("player_info"), currentStatusLineText);
	Display.showplayer();

	if (this.state == this.PAUSED) {
		if(Player.useSEF){
			Player.plugin.Execute('Pause');
		} else {
			Player.plugin.Pause();
		}
	
	}
};

Player.playVideo = function() // играть
{	
	pluginAPI.unregistKey(tvKey.KEY_TOOLS);
	pluginAPI.setOffScreenSaver(); // выключаем скринсейвер
	this.state = this.PLAYING;
	Player.frontPanelSetStatus(Player.PLAY);
	Main.setFullScreenMode();
	Display.music();
	
	alert("Play: "+url);
	
	if(Player.useSEF){
		alert ("player SEF");
		Player.plugin.Execute('InitPlayer',url);
		if(this.seekTime > 0 && Main.sta == 2) {
			Player.plugin.Execute('StartPlayback',this.seekTime);
		} else {
			Player.plugin.Execute('StartPlayback');
		}
	} else {
		alert ("player C");
		if(Player.seekTime > 0 && Main.sta == 2) {
			Player.plugin.ResumePlay(url, this.seekTime);
		} else {
			Player.plugin.Play(url);
		}
	}
	
	for(var i = 0; i < Player.arrSaveLastPlayed.length; i++) {
		//if (URLtoXML.selectedCatalog.indexOf(EX_Category_URL[Player.arrSaveLastPlayed[i]])>-1) {
			//alert(">>>>>>>> " + URLtoXML.selectedCatalog.indexOf(EX_Category_URL[Player.arrSaveLastPlayed[i]]));
			Player.saveLastPlayedFile();
		//}
	}
};

Player.onPlayerEvent = function(e,a)
{
	switch(e)
	{
		case 9:// OnStreamInfoReady
			Video = "<"+Player.plugin.Execute ("GetVideoResolution", 1)+">";
			Video = Video.replace("|","><");
			myRe = new RegExp("\<(.*)\>\<(.*)\>","igm");
				while (rozm = myRe.exec(Video)) {
					VideoWidth=rozm[1];
					VideoHeight=rozm[2];
				}
			Player.setScreenMode(currentFSMode);
			VideoDuration = Player.plugin.Execute('GetDuration');
			Display.setTotalTime(VideoDuration);
		break;
		case 11: // OnBufferingStart
		   Player.onBufferingStart(a);
		break;
		case 12: // OnBufferingComplete
		   Player.onBufferingComplete(a);
		break;	
		case 13: // OnBufferingProgress, param = progress in % 
			Player.onBufferingProgress(a);
		break;
		case 14:// OnCurrentPlayBackTime, param = playback time in ms
			Player.setCurTime(a);
		break;
	};
};

Player.setWindow = function() // видео скрыто
{
	if(Player.useSEF){
		Player.plugin.Execute('SetDisplayArea',0,0,0,0);
	} else {
		Player.plugin.SetDisplayArea(0, 0, 0, 0);
	}
};

Player.setFullscreen = function() // полноэкранный режим
{
	if(Player.useSEF){
		Player.plugin.Execute('SetDisplayArea',0,0,ScreenWidth,ScreenHeight);
	} else {
		Player.plugin.SetDisplayArea(0, 0, ScreenWidth, ScreenHeight);	
	}
};

Player.pauseVideo = function() // пауза
{
	this.state = this.PAUSED;
	Player.frontPanelSetStatus(Player.PAUSE);
	pluginAPI.setOnScreenSaver(Player.screenSaverTime); // устанавливаем скринсейвер
	
	if(Player.useSEF){
		Player.plugin.Execute('Pause');
	} else {
		Player.plugin.Pause();
	}
	Display.showplayer();
	Player.saveResumeTime();
};

Player.stopVideo = function() // стоп
{
	if (this.state != this.STOPPED) {
		pluginAPI.registKey(tvKey.KEY_TOOLS);
		pluginAPI.setOffScreenSaver(); // выключаем скринсейвер
			
		// Если режим 3D изменялся, переключаемся на режим SIDE_BY_SIDE. 
		// Почему-то только так получается корректно выйти из 3D режима после выполнения команды Stop
		if (Player.change3DMode) {
			Player.pluginScreen.Set3DEffectMode(2);
		}
		
		if(Player.useSEF){
			Player.setScreenMode (2); // Сбрасываем размер на оригинал перед выходом.
			Player.plugin.Execute('Stop');
		} else {
			Player.plugin.Stop();
		}
		
		this.state = this.STOPPED;
		Player.frontPanelSetStatus(Player.STOP);
		$("#progressBar").css("width", "0px");
		$("#statusline").hide();
		Display.setTime(0);
		Player.saveResumeTime();
	}
};

Player.resumeVideo = function() // стоп кадр
{
	this.state = this.PLAYING;
	pluginAPI.setOffScreenSaver(); // выключаем скринсейвер
	
	if(Player.useSEF){
		Player.plugin.Execute('Resume');
	} else {
		Player.plugin.Resume();
	}
	
    Display.showplayer();
};

Player.getState = function() // текущее состояние
{
	return this.state;
};

Player.skipForwardVideo = function(time) {
	this.skipState = this.FORWARD;
	if(Player.useSEF){
		Player.plugin.Execute('JumpForward',time);
	} else {
		Player.plugin.JumpForward(time);
	}
	Display.showplayer();
};

Player.skipBackwardVideo = function(time) {
	this.skipState = this.REWIND;
	if(Player.useSEF){
		Player.plugin.Execute('JumpBackward',time);
	} else {
		Player.plugin.JumpBackward(time);
	}
	Display.showplayer();
};

//Прыжок в %
Player.PercentJump = function(percent) {
	this.statusmessage = percent*10 + "%";
	var jump_to_minutes = Math.round((VideoDuration*percent/10));
	jump_to_minutes = jump_to_minutes - this.current_time;
	jump_to_minutes = jump_to_minutes / 1000;
	if(Player.useSEF){
		if (jump_to_minutes > 0) Player.plugin.Execute('JumpForward',jump_to_minutes);
		if (jump_to_minutes < 0) Player.plugin.Execute('JumpBackward',jump_to_minutes*-1);
	} else {
		if (jump_to_minutes > 0) Player.plugin.JumpForward(jump_to_minutes);
		if (jump_to_minutes < 0) Player.plugin.JumpBackward(jump_to_minutes*-1);
	}
	widgetAPI.putInnerHTML(Display.statusDiv,(this.statusmessage));
	Display.showplayer();
};

// Перемотка вперед в %
Player.PercentJumpForward = function(percent) {
	this.statusmessage = percent + "%";
	var jump_to_minutes = Math.round((VideoDuration*percent/100));
	jump_to_minutes = jump_to_minutes / 1000;
	if(Player.useSEF){
		Player.plugin.Execute('JumpForward',jump_to_minutes);
	} else {
		Player.plugin.JumpForward(jump_to_minutes);
	}
	widgetAPI.putInnerHTML(Display.statusDiv,(this.statusmessage));
	Display.showplayer();
};

//Перемотка назад в %
Player.PercentJumpBackward = function(percent) {
	this.statusmessage = "-" + percent + "%";
	var jump_to_minutes = Math.round((VideoDuration*percent/100));
	jump_to_minutes = jump_to_minutes / 1000;
	if(Player.useSEF){
		Player.plugin.Execute('JumpBackward',jump_to_minutes);
	} else {
		Player.plugin.JumpBackward(jump_to_minutes);
	}
	widgetAPI.putInnerHTML(Display.statusDiv,(this.statusmessage));
	Display.showplayer();
};

//Прыжок в сек.
Player.JumpToTime = function(time) {
	var jump_to_minutes = time / 1000;
	if(Player.useSEF){
		Player.plugin.Execute('JumpForward',jump_to_minutes);
	} else {
		Player.plugin.JumpForward(jump_to_minutes);
	}
	Display.showplayer();
};

// функция таймера проигрывания трека, вызывается плагином:
// plugin.OnCurrentPlayTime
Player.setCurTime = function(time) {
	this.current_time = time;
	Display.setTime(time);
};

Player.onBufferingComplete = function() 
{
   alert("onBufferingComplete");
};   

Player.onBufferingProgress = function(percent)
{
	Display.statusLine ("Buffering "+percent+"%");
	//widgetAPI.putInnerHTML(document.getElementById("player_date"), "Buffering "+percent+"%");
	alert ("buffering progress = "+percent);
};

Player.onBufferingStart =function()
{
	alert ("buffering start");
};

Player.nextAudio = function() {
	if(Player.useSEF){
		var audio = Player.plugin.Execute('GetCurrentStreamID',1);
		var max_audio = (Player.plugin.Execute('GetTotalNumOfStreamID',1)-1);
		if (max_audio != 0) {
			if (audio != max_audio) {
				Player.plugin.Execute('SetStreamID',1,(audio+1));
				Display.statusLine ("Звуковая дорожка № "+(audio+2));
			} 
			if (audio == max_audio) {
				Player.plugin.Execute('SetStreamID','1','0');
				Display.statusLine ("Звуковая дорожка № 1");
			} 
				
		}
	} else {
		Display.statusLine ("Не поддерживаеться");
	}
};

Player.OnStreamInfoReady = function() {
	alert("OnStreamInfoReady");
	VideoDuration = Player.plugin.GetDuration();
	VideoWidth = Player.plugin.GetVideoWidth();
	VideoHeight = Player.plugin.GetVideoHeight();
	Display.setTotalTime(VideoDuration);
	Player.setScreenMode (currentFSMode);
};

Player.frontPanelSetTime = function (timeHour, timeMinute, timeSecond) {
    var fpPlugin = document.getElementById("pluginFrontPanel");
    try {
        fpPlugin.DisplayVFD_Time(timeHour, timeMinute, timeSecond);
    }
    catch (err) {
    }

};

Player.frontPanelSetStatus = function (status) {
    var fpPlugin = document.getElementById("pluginFrontPanel");
    try {
        fpPlugin.DisplayVFD_Show(status);
    }
    catch (err) {
    }
};

Player.saveResumeTime = function() {

	var obj = new Object();
		
	obj.url = url;
	obj.time = this.current_time/1000; // получаем время в сек.
	
	var isAdd = true;
	
	for(var i = 0; i < this.data['resumeTime'].length && isAdd; i++) {
		if (this.data['resumeTime'][i].url==obj.url) {
			if(VideoDuration < this.minDuration || this.current_time/VideoDuration < 0.05 || this.current_time/VideoDuration > 0.95) {
				this.data['resumeTime'].splice(i,1); // удаляем элемент массива
			} else {
				this.data['resumeTime'][i].time = obj.time;
				isAdd = false;
			}
		}
	}
	
	if(VideoDuration < this.minDuration || this.current_time/VideoDuration < 0.05 || this.current_time/VideoDuration > 0.95) {
		isAdd = false;
	}

	if (isAdd) {
		this.data['resumeTime'][this.data['resumeTime'].length] = obj;
	}
	
	if(this.data['resumeTime'].length > 20) {
		this.data['resumeTime'].shift(); // удаляем первый элемент массива
	}
	
	var fileSystemObj = new FileSystem();
	if (!fileSystemObj.isValidCommonPath(curWidget.id)) fileSystemObj.createCommonDir(curWidget.id);
    var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/ex_player.data','w');
    if (fileObj)
    {
        var str = JSON.stringify(this.data);
		fileObj.writeAll(str);
        fileSystemObj.closeCommonFile(fileObj);
    }
};

Player.saveLastPlayedFile = function() {

	var obj = new Object();
		
	obj.cat = URLtoXML.selectedCatalog;
	obj.url = URLtoXML.pUrlSt[b];
	obj.web = this.playWeb;
	obj.name = URLtoXML.pName[b];
	alert ('obj.name '+obj.name);
	
	if(obj.cat != '' && obj.url != '') {
		var isAdd = true;

		for(var i = 0; i < this.data['lastPlayed'].length && isAdd; i++) {
			if (this.data['lastPlayed'][i].cat==obj.cat) {
				this.data['lastPlayed'][i].url = obj.url;
				this.data['lastPlayed'][i].web = obj.web;
				this.data['lastPlayed'][i].web = obj.name;
				isAdd = false;
			}
		}

		if (isAdd) {
			this.data['lastPlayed'][this.data['lastPlayed'].length] = obj;
		}

		if(this.data['lastPlayed'].length > 20) {
			this.data['lastPlayed'].shift(); // удаляем первый элемент массива
		}

		var fileSystemObj = new FileSystem();
		if (!fileSystemObj.isValidCommonPath(curWidget.id)) fileSystemObj.createCommonDir(curWidget.id);
		var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/ex_player.data','w');
		if (fileObj)
		{
			var str = JSON.stringify(this.data);
			fileObj.writeAll(str);
			fileSystemObj.closeCommonFile(fileObj);
		}
	}
};

Player.readSavedData = function() {
	var fileSystemObj = new FileSystem();
	var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/ex_player.data','r');
	if (fileObj){
		var strResult = fileObj.readAll();
		if (strResult) {
			var data = JSON.parse(strResult);
			if(data['resumeTime'] instanceof Array && data['lastPlayed'] instanceof Array) {
				this.data = JSON.parse(strResult);
			}
		}
		fileSystemObj.closeCommonFile(fileObj);
	}
};

Player.change3dMode = function() {
	
	alert("============= Change 3D mode");
	alert("============= Flag3DEffectSupport: "+Player.support3DMode);
	
	if (Player.support3DMode) {
		alert("============= Player.useSEF = true");

		var cur3dMode = old3dMode = Player.pluginScreen.Get3DEffectMode();
		alert("============= cur3dMode: "+cur3dMode);

		if (cur3dMode < 7){
			if(cur3dMode == 2){
				cur3dMode = 7;
			} else {
				cur3dMode++;
			}
		} else {
			cur3dMode=0;
		}
		
		Player.change3DMode = true; // указываем, что 3D режим изменялся
		Player.pluginScreen.Set3DEffectMode(cur3dMode);
		//Player.plugin.SetPlayerProperty(2, '3', 1); // третий параметр: 1 - 3D включен, 0 - выключен (вроде бы нужно для D серии, потом проверю)

		var new3dMode = Player.pluginScreen.Get3DEffectMode();
		alert("============= new3dMode: "+new3dMode);
		
		if(new3dMode != old3dMode){
			Display.statusLine(DISPLAY_MODE[new3dMode]);
		}
	} else {
		Display.statusLine('3D режим не поддерживается!');
	}
};