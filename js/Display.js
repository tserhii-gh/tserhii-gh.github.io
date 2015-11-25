var Display =
{
	obj: null, // тут хранится объект Main или Settings в зависимости от того, где была вызвана функция init()
	
    status_vol_timer : null,
    status_line_timer : null,
    info_block_timer : null,
    
    statusVolSpan : null,
    statusLineSpan : null,
    
    status1_timer : null,
    status1Div : null,
    index : 1, 
    run: 0,
    totalTime : 0,
    time : 0,
	resumeFromTimeVisible : false,
	lastPlayedVisible : false,
	fullDescVisible: false,
};

Display.init = function(obj)
{
    var success = true;
	this.obj = obj;
    this.status1Div = document.getElementById("status1");
    this.statusVolSpan = document.getElementById("status_vol_span");
    this.statusLineSpan = document.getElementById("status_line_span");

    if (!this.statusVolSpan&&!this.status1Div&&!this.statusLineSpan)
    {
        success = false;
    }
    
    return success;
};
  
/////////////////////// STATUS LINE///////////////////////////////////
Display.statusLine = function(param_string)
{   
	if (Display.obj.mode == Display.obj.FULLSCREEN){
		$("#statusline").attr("class","statusline_player");
		$("#status_line_span").attr("class","status_line_span_player");
	} else {
		$("#statusline").attr("class","statusline");
		$("#status_line_span").attr("class","status_line_span");
	}
	$("#player_info").hide();
	$("#statusline").fadeIn("fast");
    widgetAPI.putInnerHTML(this.statusLineSpan, param_string);
	clearTimeout(this.status_line_timer);
	Display.statusLineTimer();
};

Display.statusLineTimer = function()
{
	this.status_line_timer=setTimeout("Display.hideStatusLine()",3000);
};

Display.hideStatusLine = function()
{
	$("#statusline").fadeOut("slow", function(){
		$("#player_info").show();
	});
};
/////////////////////// STATUS LINE///////////////////////////////////

/////////////////////// INFO BLOCK///////////////////////////////////
Display.infoBlock = function(param_string)
{   
	$("#infoBlock").remove();
	$("body").append('<div id="infoBlock" class="statusline"><span>'+param_string+'</span></div>');
	$("#infoBlock").fadeIn("fast");
	clearTimeout(this.info_block_timer);
	Display.infoBlockTimer();
};

Display.infoBlockTimer = function()
{
	this.info_block_timer = setTimeout("Display.hideInfoBlock()",3000);
};

Display.hideInfoBlock = function()
{
	$("#infoBlock").fadeOut("slow");
};
/////////////////////// INFO BLOCK///////////////////////////////////

Display.hidemenu = function()
{
	document.getElementById("main").style.display="none";
};

Display.showmenu = function()
{
	document.getElementById("main").style.display="block";
};


Display.hideplayer = function()
{
	document.getElementById("player").style.display="none";
	
	if(Player.state == Player.PLAYING)
	{
		document.getElementById("help_navi_l_player").style.display="none";
		document.getElementById("help_navi_player").style.display="block";
	}
};


Display.showplayer = function()
{

    if(Player.state == Player.PLAYING || Player.state == Player.PAUSED)
	{
		document.getElementById("help_navi_l_player").style.display="none";
		document.getElementById("help_navi_player").style.display="block";
		document.getElementById("infoMovi").style.display="block";
    }        
    
    if(Player.state == Player.PAUSED){
		document.getElementById("but_pause").style.display="block";
		document.getElementById("but_play").style.display="none";                       
    } else {
		document.getElementById("but_pause").style.display="none";
		document.getElementById("but_play").style.display="block";     
	}  
    
    if(Player.state == Player.PLAYING_LIVE){
		document.getElementById("help_navi_l_player").style.display="block";
		document.getElementById("help_navi_player").style.display="none";
		document.getElementById("infoMovi").style.display="none";
	}
	
	clearTimeout(this.infobar_timer);
	
	$("#player").show();
	
	// Добавляем кнопки управления плеером
	
	$("#help_line_2 > .info_block").html('');
	if(Player.useSEF && Display.obj.MATERIALL == 1){
		$("#help_line_2 > .info_block").append('<span id="audio"><div id="HelpLineButton"><img src="'+widgetPath+'/img/buttons/red.png" /></div><span id="HelpLineText"> Дорожка</span></span>');
	}
	if(Player.support3DMode){
		$("#help_line_2 > .info_block").append('<span id="screenMode"><div id="HelpLineButton"><img src="'+widgetPath+'/img/buttons/green.png" /></div><span id="HelpLineText"> Режим 3D</span></span>');
	}
	if(Display.obj.MATERIALL == 1){
		$("#help_line_2 > .info_block").append('<div id="HelpLineButton"><img src="'+widgetPath+'/img/buttons/blue.png" /></div><span id="HelpLineText"> Формат изобр.</span>');
	}
	$("#help_line_2 > .info_block").append('<div id="HelpLineButton"><img src="'+widgetPath+'/img/buttons/chanel.png" /></div><span id="HelpLineText"> След / Пред</span>');
	$("#help_line_2 > .info_block").append('<div id="HelpLineButton"><img src="'+widgetPath+'/img/buttons/llrr.png" /></div><span id="HelpLineText"> - + 10 с</span>');
	$("#help_line_2 > .info_block").append('<div id="HelpLineButton"><img src="'+widgetPath+'/img/buttons/ud.png" /></div><span id="HelpLineText"> - + 30 с</span>');
	$("#help_line_2 > .info_block").append('<div id="HelpLineButton"><img src="'+widgetPath+'/img/buttons/lr.png" /></div><span id="HelpLineText"> - + 2 м</span>');
	$("#help_line_2 > .info_block").append('<div id="HelpLineButton"><img src="'+widgetPath+'/img/buttons/0_9.png" /></div><span id="HelpLineText"> Перем. 10%-90%</span>');

	$("#play_name").html(URLtoXML.pName[b]);
	
	if(Player.state != Player.PAUSED && !this.resumeFromTimeVisible) {
	    Display.infobarTimer();
	}
};
	
Display.infobarTimer = function()
{
	this.infobar_timer=setTimeout("Display.hideplayer()",4000);
};

Display.status1 = function(status1)
{
	document.getElementById("statusbar1").style.display="block";
    widgetAPI.putInnerHTML(this.status1Div, status1);
	clearTimeout(this.status1_timer);
	Display.status1Timer();
};


Display.hidestatus1 = function()
{
	document.getElementById("statusbar1").style.display="none";
};

Display.status1Timer = function()
{
	this.status1_timer=setTimeout("Display.hidestatus1()",2000);
};

Display.setTotalTime = function(total)
{
	this.totalTime = total;
};

Display.setTime = function(time)
{
	var timePercent =(100 * time) / this.totalTime;
	var Barwidth = Math.floor(timePercent*5);
	var timeHTML = "";
	var timeHour = 0;
	var timeMinute = 0;
	var timeSecond = 0;
	var totalTimeHour = 0; 
	var totalTimeMinute = 0; 
	var totalTimeSecond = 0;
	var currentLocalTime = Info.getTime("HH:mm"); //Local time format 00:00
	var currentLocalTimeArr = currentLocalTime.toString().split(':'); //
	var finishTime = ""; //Elapsed time format 00:00
	var finishMinutes = 0;
	var finishHours = 0;
	var timeToMs = 0;
	var msToTime =0;


	document.getElementById("progressBar").style.width = Barwidth + "px";
	
	if(Player.state == Player.PLAYING || Player.state == Player.PAUSED)
	{
		totalTimeHour = Math.floor(this.totalTime/3600000);
		timeHour = Math.floor(time/3600000);
		totalTimeMinute = Math.floor((this.totalTime%3600000)/60000);
		timeMinute = Math.floor((time%3600000)/60000);
		totalTimeSecond = Math.floor((this.totalTime%60000)/1000);
		timeSecond = Math.floor((time%60000)/1000);
		
		timeHTML = timeHour + ":";
		if(timeMinute == 0)
			timeHTML += "00:";
		else if(timeMinute <10)
			timeHTML += "0" + timeMinute + ":";
		else
			timeHTML += timeMinute + ":";
		if(timeSecond == 0)
			timeHTML += "00/";
		else if(timeSecond <10)
			timeHTML += "0" + timeSecond + "/";
		else
			timeHTML += timeSecond + "/";

		timeHTML += totalTimeHour + ":";
		if(totalTimeMinute == 0)
			timeHTML += "00:";
		else if(totalTimeMinute <10)
			timeHTML += "0" + totalTimeMinute+":";
		else
			timeHTML += totalTimeMinute+":";
		if(totalTimeSecond == 0)
			timeHTML += "00";
		else if(totalTimeSecond <10)
			timeHTML += "0" + totalTimeSecond;
		else
			timeHTML += totalTimeSecond;
		
		if (totalTimeMinute != 0) {
			if (timeSecond >= totalTimeSecond && timeMinute >= totalTimeMinute && timeHour >= totalTimeHour) {
				Player.stopVideo();
				timeHTML = "0:00:00 / 0:00:00";
				finishTime = currentLocalTime;
				setTimeout("Display.Timeout()", 3000);
			}
		}
	}
	else {
		timeHTML = "0:00:00/0:00:00";	
	}
	
	Player.frontPanelSetTime(timeHour, timeMinute, timeSecond);
	// + " (" + Math.floor(timePercent) + "%)"
	//Время окончания просмотра----------
	timeToMs = currentLocalTimeArr[0] * 3600 * 1000; //hours
	timeToMs += currentLocalTimeArr[1] * 60 * 1000; //minutes
	msToTime = timeToMs + this.totalTime - time;
	finishMinutes = parseInt((msToTime/(1000*60))%60);
	finishHours = parseInt((msToTime/(1000*60*60))%24);
	finishHours = (finishHours < 10) ? "0" + finishHours : finishHours;
	finishMinutes = (finishMinutes < 10) ? "0" + finishMinutes : finishMinutes;
	finishTime = finishHours + ":" + finishMinutes;
	//---------------------------------------------
	document.getElementById("timeInfo").innerHTML=timeHTML;
	document.getElementById("finishTime").innerHTML=finishTime;
};

Display.Timeout = function() {
	if (b<URLtoXML.pUrlSt.length-1){
		Display.obj.selectNextElem(); // переключение на след. трек
		if(Player.playWeb) {
			url = URLtoXML.getWebVerURL(URLtoXML.WpUrlSt[b]); // get web url for content
		} else {
			url = URLtoXML.pUrlSt[b];
		}
		Display.obj.play(url, true); // второй параметр: true - с начала, false - с места остановки
	}else{
		Player.stopVideo();
		Display.obj.setWindowMode();
	}
};

Display.showResumeFromTime = function() {
	$("#statusline").hide();
	Display.obj.sta = 2;
	Display.resumeFromTimeVisible = true;
	Display.resumeFromTime(true); // select button "YES" by default
	$("#confirmBoxTitle").html("Начать воспроизведение с последнего места проигрывания?");
	$("#confirmBox").show();
};

Display.hideResumeFromTime = function() {
	Display.resumeFromTimeVisible = false;
	$("#confirmBox").hide();
};

Display.resumeFromTime = function(value) {
	if(value === true) {
		Display.obj.sta = 2;
		$("#buttonNo").removeClass('selected');
		$("#buttonYes").addClass('selected');
	} else {
		Display.obj.sta = 1;
		$("#buttonNo").addClass('selected');
		$("#buttonYes").removeClass('selected');
	}
};

Display.showLastPlayed = function(name) {
	alert ('Display.obj.name '+name);
	$("#statusline").hide();
	Display.obj.sta = 2;
	Display.obj.fromLastPlayed = true;
	Display.lastPlayedVisible = true;
	Display.lastPlayed(true);
	if(name != undefined){
		$("#confirmBoxTitle").html("Продолжить с файла, на котором вы остановились в прошлый раз?<br /><b>"+name+"</b>");
	} else {
		$("#confirmBoxTitle").html("Продолжить с файла, на котором вы остановились в прошлый раз?");
	}
	$("#confirmBox").show();
};

Display.hideLastPlayed = function() {
	Display.lastPlayedVisible = false;
	$("#confirmBox").hide();
};

Display.lastPlayed = function(value) {
	if(value) {
		Display.obj.sta = 2;
		Display.obj.fromLastPlayed = true;
		$("#buttonNo").removeClass('selected');
		$("#buttonYes").addClass('selected');
	} else {
		Display.obj.sta = 1;
		Display.obj.fromLastPlayed = false;
		$("#buttonNo").addClass('selected');
		$("#buttonYes").removeClass('selected');
	}
};

Display.music = function() 
{
	if(Display.obj.MATERIALL == 2 || Display.obj.MATERIALL == 3) {
		document.getElementById("fon").style.display="block";
		widgetAPI.putInnerHTML(document.getElementById("stroka"), URLtoXML.pName[b]+" <span>\" "+URLtoXML.sName[Display.obj.index]+" \"</span>");
	}
};

Display.showFullDesc = function(){
	Display.fullDescVisible = true;
	Info.load();
	$("#list").hide();
	
	if(Display.obj.arr_hardware_char.indexOf(Display.obj.hardware_char)>-1){
		var width = '920px';
	} else {
		var width = '926px';
	}
	
	$("#descript").animate({width: width}, {duration: 250});
}

Display.hideFullDesc = function(){
	Display.fullDescVisible = false;
	Info.load();
	$("#descript").animate({width: "460px"}, {complete:  function() {
		$("#list").show();
		$('.desc').css("top", "0px");
		$('.poster').css("top", "0px");
	}, duration: 250});
}

Display.slideUpDesc = function(){
	var DesPosition = $('.desc').position().top;

	if(DesPosition < 0){
		$('.desc').css("top", DesPosition+50+"px");
		$('.poster').css("top", DesPosition+50+"px");
	}
}

Display.slideDownDesc = function(){
	var DesPosition = $('.desc').position().top;
	var DesHeight = $('.desc').height();
	var FrameHeight = $('#description').height();
	
	if((FrameHeight - DesHeight) < DesPosition) {  
		$('.desc').css("top", DesPosition-50+"px");
		$('.poster').css("top", DesPosition-50+"px");
	}
}

Display.showLoading = function(type){
	if (type){
		$("#loadingDescr").show();
	} else {
		if(Display.obj.playlist == 0){
			$("#loading").css('top','74px').css('height','434px');
		} else {
			$("#loading").css('top','48px').css('height','460px');
		}
		$("#loading").show();
	}
};

Display.hideLoading = function(type){
	if (type){
		$("#loadingDescr").hide();
	} else {
		$("#loading").hide();
	}
};