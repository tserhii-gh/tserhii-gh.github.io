var News = {
	vers: "1.0.2", // Новая Версия
	isVisible: false,
};

alert ("VERSION "+Main.version);
alert ("New VERSION "+News.vers);

News.hidestatus = function()
{
	this.isVisible = false;
	document.getElementById("new").style.display="none";
};

News.statusTimer = function()
{
	this.status1_timer=setTimeout("News.hidestatus()",10000);
};

if (Main.version < News.vers) {
	News.statusTimer();
	document.getElementById("new").style.display = "block";
	widgetAPI.putInnerHTML(document.getElementById("new_text"),"<b>Доступна новая версия виджета "+News.vers+".</b><br />Для обновления вашего виджета скачайте новую версию с сайта http://wiget.pp.ua и обновите на своем ТВ");
}