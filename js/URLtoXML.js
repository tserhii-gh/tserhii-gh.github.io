var URLtoXML = {
	outTXT : "",// строка, куда соберем список
	fMode : true, // режим обмена данными (асинхронный=true синхронный=false)
	
	edit_fold : false,
	userId : "",
	editId : "",  // ID материала в редактировании
	
	nStart : 0, // начальный символ поиска в ответе нужных данных

	xmlHTTP : null,
	xmlHTTPWebVer : null,
	xmlHTTPDescr : null,

	sName : new Array(), // имя файла
	UrlSt : new Array(), // адрес
	edit_id : new Array(),
	ImgDickr : new Array(), // картинка
	pName : new Array(),
	pDes : new Array(),
	qDes : new Array(),
	pSize : new Array(), // размер файла
	
	folders: new Array(),

	pUrlSt : new Array(),
	WpUrlSt : new Array(),

	arrVideoExt	: ["avi", "asf", "asx", "3gp","3g2", "3gp2", "3gpp", "flv", "mp4", "mp4v", "m4v", "m2v","m2ts", "m2t", "mp2v", "mov", "mpg", "mpe", "mpeg", "mkv","swf", "mts", "wm", "wmx", "wmv", "vob", "iso", "f4v", "ts", "divx", "wvx", "mpls", "mpl"],
	arrAudioExt	: ["m3u", "m3u8", "wav", "wma", "mpa", "mp2", "m1a", "m2a", "mp3", "ogg", "m4a", "aac", "mka", "ra", "flac", "ape", "mpc", "mod", "ac3", "eac3", "dts", "dtshd", "wv", "tak", "pls", "wax", "cue"],
   
	//двумерный массив строк, которые нужно заменить в тексте - первый вариант на второй
	arrReplWordsDesc : [["h1>", "b>"], ["</*p>","<br>"], ["\\s*<br>\\s*<br>", "<br>"], ["</*p>","</*p>"]],
	arrReplWordsFrwd : [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ["'", "&apos;"], ["\"", "&quot;"]],
	//массив строк-масок регулярных выражений, подлежащих удалению из текста
	arrDelWords : ["<\\s*a[^<^>]*>", "<\\s*/\\s*a\\s*>", "<\\s*/*\\s*span[^>]*>", "<\\s*/*\\s*div[^>]*>", "<\\s*/*\\s*img[^>]*>", "<\\s*/*\\s*strong[^>]*>"],
	prefixTAG : "<a href='",
	endedTAG : "'>",
    mpHttpResponseParser : null,
	selectedCatalog : '',
	blockEnter : false
};

URLtoXML.deinit = function () {
	if (this.xmlHTTP ) {
		this.xmlHTTP.abort();
	}
};

URLtoXML.SetHtmlParser = function(pHtmlParser){
	URLtoXML.mpHttpResponseParser = pHtmlParser;
};

// обработка ссылки
URLtoXML.Proceed = function(sURL) {
	this.outTXT = "";// очищаем строку-приемник конечного плейлиста
	if (this.xmlHTTP == null) {// инициализируем связь с интернетом
		Display.showLoading();
		
		alert ('sURL '+sURL);
		
		try{
			this.xmlHTTP = new XMLHttpRequest();
			this.xmlHTTP.url = sURL;

			// отсылаем пустой запрос и ловим страницу в строку
			this.xmlHTTP.open("GET", sURL, this.fMode); // ?асинхронно

			this.xmlHTTP.onreadystatechange = function() {
				if (URLtoXML.xmlHTTP.readyState == 4) {
					if(URLtoXML.mpHttpResponseParser != null){
						URLtoXML.mpHttpResponseParser();
						URLtoXML.mpHttpResponseParser = null;
						if(!URLtoXML.blockEnter){
							Display.hideLoading();
						}
					} else {
						URLtoXML.outTXT = URLtoXML.ParseXMLData(); // генерим конечный плейлист на основании полученных данных
						if(!URLtoXML.blockEnter){
							Display.hideLoading();
						}
					}
				}
			};

			this.xmlHTTP.setRequestHeader("User-Agent","Opera/9.80 (Windows NT 5.1; U; ru) Presto/2.9.168 Version/11.51");
			this.xmlHTTP.send();
		} catch(e) {
			alert(e);
		}
	}
	this.getPageDescr(sURL);
};


URLtoXML.getPageDescr = function(sURL) {
	if (this.pDes[Main.index] == '' && Main.playlist == 1){
		Display.showLoading(1);
		
		this.xmlHTTPDescr = null;
		this.xmlHTTPDescr = new XMLHttpRequest();
		this.xmlHTTPDescr.open("GET", sURL, true); // ?асинхронно
	
		this.xmlHTTPDescr.onreadystatechange = function() {
			if (URLtoXML.xmlHTTPDescr && URLtoXML.xmlHTTPDescr.readyState == 4) {
				URLtoXML.ParsePageDesctData(); // генерим конечный плейлист на основании полученных данных
				Display.hideLoading(1);
			}
		};
		
		this.xmlHTTPDescr.setRequestHeader("User-Agent","Opera/9.80 (Windows NT 5.1; U; ru) Presto/2.9.168 Version/11.51");
		this.xmlHTTPDescr.send();
	}
};

URLtoXML.ParsePageDesctData = function() {
	var sOut;
	var descr;
	
	if (this.xmlHTTPDescr.status == 200){

		sOut = DelTrash(this.xmlHTTPDescr.responseText);
		sOut = sOut.substr(0,200000);

		if (Main.MATERIALL == 3){
			var myRe = new RegExp("valign=top>\r\n[\\s\\S]*<\/script>([\\s\\S]*)<\/td><td width=","igm");
			if (match = myRe.exec(sOut)){
				this.pDes[Main.index] = '<div class="desc">'+match[1]+'</div>';
				this.pDes[Main.index] = this.pDes[Main.index].replace("&nbsp;"," ");
				
				$("#description").html("<div class='poster'><img src='" + this.ImgDickr[Main.index] + "'/></div>" + this.pDes[Main.index]);
			}
		} else {
			var myRe = new RegExp("valign=top>\\n<img src=\'(.*)\' width=[\\s\\S]*<\/small>([\\s\\S]*)\<table id=\'ad_block_1\'","igm");
			if (descr = myRe.exec(sOut)){
				
				var ImgDickr_D = descr[1];
				
				// Описание
				this.pDes[Main.index] = '<div class="desc">'+descr[2]+'</div>';
				this.pDes[Main.index] = this.pDes[Main.index].replace("&nbsp;"," ");
				
				$("#description").html("<div class='poster'><img src='" + ImgDickr_D + "'/></div>" + this.pDes[Main.index]);
			} else {
				$("#description").html("<div class='poster'><img src='" + this.ImgDickr[Main.index] + "'/></div>");
			}
		}
	}
	
	sOut = null;
};

// из полученного ответа вытаскиваем нужные данные
URLtoXML.ParseXMLData = function() {
	var sOut;
//	var $sOut;
	var index = 0; // индекс масcива

	if (this.xmlHTTP.status == 200)// если ответ от сервера корректный
	{
		sOut = this.xmlHTTP.responseText;
//		sOut = DelTrash(this.xmlHTTP.responseText);
//		$sOut = $($.parseHTML(sOut));
		var myRe;

		if (Main.playlist == 0) {
			if (Main.search)
			{
				sOut = DelTrash(this.xmlHTTP.responseText);
				
				myRe = new RegExp("<table[^>]*class=panel>([\\s\\S]*?)<\/table>","igm");
				if(match = myRe.exec(sOut))
				{
					var table = match[0];
					
					myRe = new RegExp("<td[^>]*>(.*?)<\/td>","igm");
					if(arr = table.match(myRe)) // не нашел как заставить exec искать все совпадения, поэтому использую match
					{
						for (var i in arr) 
						{
							// get url
							myRe = new RegExp("<a href='(.*?)'>","igm");
							if(match = myRe.exec(arr[i]))
							{
								index++;
								
								URLtoXML.UrlSt[index] = Main.prefixURL + match[1];
								
								// get poster
								myRe = new RegExp("<img src='(.*?)'","igm");
								if(match = myRe.exec(arr[i])){
									URLtoXML.ImgDickr[index] = match[1].replace(/\?[0-9]+/,"?200");
								} else {
									URLtoXML.ImgDickr[index] = widgetPath+'/img/logo.png';
								}
								
								// get title
								myRe = new RegExp("<b[^>]*>(.*?)<\/b>","igm");
								if(match = myRe.exec(arr[i])){
									URLtoXML.sName[index] = match[1];
								}

								URLtoXML.pDes[index] = '';
								
								$("#title").html(URLtoXML.sName[Main.index]);
								$("#spisok2").append('<div id="bloc' + index + '" class="block"></div>');
								$("#bloc" + index).html("<span class='blockImage' id='imgst" + index + "></span>");
								$("#bloc" + index).css('background-image', 'url("' + URLtoXML.ImgDickr[index] + '")');
								//Poster shadow test
								//$("#bloc" + index).html("<span><img class='blockImage' id='imgst" + index +  "'/></span>");
								//document.getElementById("imgst" + index).style.backgroundImage = URLtoXML.ImgDickr[index];
							}
						}
						
						if(!Main.menu){
							$("#bloc" + Main.index).addClass('selected'); // активный элемент
						}
					}
				}
			} else {
				
				sOut = DelTrash(this.xmlHTTP.responseText);
				
				myRe = new RegExp("<table[^>]*class=include_0>([\\s\\S]*?)<\/table>","igm");
				if(match = myRe.exec(sOut))
				{
					var table = match[0];

					myRe = new RegExp("<td[^>]*>(.*?)<\/td>","igm");
					if(arr = table.match(myRe)) // не нашел как заставить exec искать все совпадения, поэтому использую match
					{
						for (var i in arr) 
						{
							// get url
							myRe = new RegExp("<a href='(.*?)'>","igm");
							if(match = myRe.exec(arr[i]))
							{
								index++;
								
								URLtoXML.UrlSt[index] = Main.prefixURL + match[1];

								// get poster
								myRe = new RegExp("<img src='(.*?)'","igm");
								if(match = myRe.exec(arr[i])){
									URLtoXML.ImgDickr[index] = match[1].replace(/\?[0-9]+/,"?200");
								} else {
									URLtoXML.ImgDickr[index] = widgetPath+'/img/logo.png';
								}

								// get title
								myRe = new RegExp("<b[^>]*>(.*?)<\/b>","igm");
								if(match = myRe.exec(arr[i])){
									URLtoXML.sName[index] = match[1];
								}

								URLtoXML.pDes[index] = '';

								$("#title").html(URLtoXML.sName[Main.index]);
								$("#spisok2").append('<div id="bloc' + index + '" class="block"></div>');
								$("#bloc" + index).html("<span class='blockImage' id='imgst" + index +  "></span>");
								//$("#bloc" + index).html("<span><img class='blockImage' id='imgst" + index +  "' src='" + URLtoXML.ImgDickr[index] + "'/></span>");
								//$("#bloc" + index).html("<span></span>");
								$("#bloc" + index).css('background-image', 'url("' + URLtoXML.ImgDickr[index] + '")');
								//Poster shadow test
								//$("#bloc" + index).html("<span class='blockImage' id='imgst" + index +  "' style='background: url('" + URLtoXML.ImgDickr[index] + "')''></span>");
								//document.getElementById("imgst" + index).style.backgroundImage = "url('" + URLtoXML.ImgDickr[index] + "')";
							} 
							else if(arr[i].indexOf('Нет доступа к объекту') > -1) 
							{
								index++;

								URLtoXML.UrlSt[index] = null;
								URLtoXML.ImgDickr[index] = null;
								
								// get title
								myRe = new RegExp("<td[^>]*>(.*?)<\/td>","igm");
								if(match = myRe.exec(arr[i])){
									URLtoXML.sName[index] = match[1];
								}
								
								URLtoXML.pDes[index] = null;

								$("#title").html(URLtoXML.sName[Main.index]);
								$("#spisok2").append('<div id="bloc' + index + '" class="block"><p>'+URLtoXML.sName[index]+'</p></div>');
							}
						}
						
						if(!Main.menu){
							$("#bloc" + Main.index).addClass('selected'); // активный элемент
						}
					}
				}
			}
		} else if (Main.playlist == 1) {
			alert ('Main.playlist'+Main.playlist);

			var obj = new Object();
			obj.names = new Array();
			obj.urls = new Array();
			obj.isFolders = new Array();
			obj.currIdx = 1;
			
			myRe = new RegExp("<table[^>]*class=include_0[^>]*>([\\s\\S]*?)<\/table>","igm");
			if(match = myRe.exec(sOut))
			{
				var table = match[0];

				myRe = new RegExp("<td[^>]*>(.*?)<\/td>","igm");
				if(arr = table.match(myRe)) // не нашел как заставить exec искать все совпадения, поэтому использую match
				{
					for (var i in arr) 
					{
						// get url
						myRe = new RegExp("<a href='(.*?)'>","igm");
						if(match = myRe.exec(arr[i]))
						{
							index++;
							
							obj.urls[obj.urls.length] = Main.prefixURL + match[1];
							
							// get title
							myRe = new RegExp("<b[^>]*>(.*?)<\/b>","igm");
							if(match = myRe.exec(arr[i])){
								var name = match[1];
								obj.names[obj.names.length] = name;
							}

							$("#list2").append('<div id="str'+index+'">'+name+'</div>');
						}
					}
				}
			}
						
			if (obj.urls.length>0){
				this.folders[this.folders.length] = obj;
			} else {
				Main.playlist = 2;
				Info.load();
			}
			
			Main.handleActiv();
		}
		
		if (Main.playlist == 2) {
			alert ('Main.playlist'+Main.playlist);
			this.pName = [];
			this.pUrlSt = [];
			this.WpUrlSt = [];
			this.selectedCatalog = '';
			
			var web_url = new Array();
			
			// Ищем упрощенку
			myRe = new RegExp("\"url\"\:\ \"([^}]*)\"\ \}","igm");
			while (sres = myRe.exec(sOut)) {	
				//alert (web_url.length+" "+sres[1]);
				web_url[web_url.length] = sres[1];
			}
					
			//myRe = new RegExp("\<a href=\'\/get\/(.*)\' title.*>(.*)<\/a>.*\r\n\.*width=110>(.*)\r\n.*\r\n(.*)","igm");
			myRe = new RegExp("\<a href=\'\/get\/(.*)\' title.*>(.*)<\/a>.*\n.*width=110>(.*)\n.*\n(.*)\n.*\n\\s*<b>(.*)</b>","igm");
			while (sres = myRe.exec(sOut)) {
				//alert (sres[0]);
				alert ("full: "+sres[1]);
				//alert (sres[2]);
				//alert ("web: "+web_url[sres[3]]);
				var form = sres[2].split("."); // узнаем расширение файла
				if(this.arrVideoExt.indexOf(form[form.length-1].toLowerCase())>-1 ||
				   this.arrAudioExt.indexOf(form[form.length-1].toLowerCase())>-1){
					index++;
					//web_myRe = new RegExp(".*onclick='.*([0-9])[)]\;\'>","igm");
					web_myRe = new RegExp(".*onclick='[^\\d]*(\\d+)[)]\;\'>","igm");
					while (web_sres = web_myRe.exec(sres[3])) {
						//alert (web_sres[0]);
						//alert ("link_id: "+web_sres[1]);
						alert ("web: "+web_url[web_sres[1]]);
						this.WpUrlSt[index] = web_url[web_sres[1]];	
					}
					this.pName[index] = decodeURIComponent(sres[2].replace(new RegExp("\\+","g"),  " "));
					this.pUrlSt[index] = "http://www.ex.ua/get/" + sres[1];
					
					var s = sres[5].replace(/,/g, "");
					if(s = parseInt(s)){
						this.pSize[index] = humanFileSize(s);
					}
					
					var size = '';
					
					if(this.pSize[index] != undefined){
						size = "<b>(" + this.pSize[index] + ")</b>";
					}
									
					$("#list2").append('<div id="str'+index+'"><span>'+this.pName[index]+'</span>'+size+'</div>');
				}
			}
			
			// Парсер для РАДИО
			if(sOut.indexOf("radio.js") > -1){
				Main.MATERIALL = 3;
			}; 
			
			if (Main.MATERIALL == 3){

				var name = '';
				var url = '';
				
				var myRe = new RegExp(/\<h1\>(.*)\<\/h1\>\<br\>/);
				if (match = myRe.exec(sOut)){
					name = match[1];
				}
				
				var myRe = new RegExp(/radio\(\'([^)]+)\'\)/);
				if (match = myRe.exec(sOut)){
					url = match[1];
				}
				
				if(name && url){
					this.pName[1] = decodeURIComponent(name.replace(new RegExp("\\+","g"),  " "));
					this.pUrlSt[1] = url;				
					$("#list2").append('<div id="str1">'+name+'</div>');
				}
			}
					
			Main.handleActiv();
			
			// Диалоговое окно "Продолжить с последнего открытого файла"
			this.selectedCatalog = this.xmlHTTP.url;
			for(var i = 0; i < Player.data['lastPlayed'].length; i++) {
				if (Player.data['lastPlayed'][i].cat==this.xmlHTTP.url) {
					Player.lastPlayedUrl = Player.data['lastPlayed'][i].url;
					Display.showLastPlayed(Player.data['lastPlayed'][i].name);
				}
			}
		}
		
		sOut = null;
	}
};

// удаление "мусора" из строки
URLtoXML.DelTrash = function(str) {
	// заменяем мусор на пробелы
	str = str.replace(new RegExp("&nbsp;", 'gim'), " ");
	str = str.replace(new RegExp("&mdash;", 'gim'), " ");
	str = str.replace(new RegExp("\t", 'gim'), " "); // табуляция
	str = str.replace(new RegExp("\n", 'gim'), " "); // конец строки
	str = str.replace(new RegExp("\r", 'gim'), " "); // перевод каретки

	// заменяем все "длинные" пробелы на один
	while (str.indexOf("  ") >= 0) {
		str = str.replace(new RegExp("  ", 'gim'), " ");
	}
	return URLtoXML.trim(str);
};

//удаление исключенных слов из результата
URLtoXML.DelWords = function(sVal){
var wrd, sRes;

    sRes = sVal;
    //удаляем из входной строки все встречающиеся в массиве исключений слова
    for (var i in this.arrDelWords){
       //слово из массива
       wrd = this.arrDelWords[i];
       sRes = sRes.replace(new RegExp(wrd, 'gim'), "");
    }
    
    //возвращаем результат
    return sRes;
};

// удаляемa пробелы в конце и в начале
URLtoXML.trim = function(str) {
	while (str.charAt(str.length - 1) == " ") {
		str = str.substring(0, str.length - 1);
	}
	while (str.charAt(0) == " ") {
		str = str.substring(1);
	}
	return str;
};

function humanFileSize(bytes) {
    var thresh = 1024;
    if(bytes < thresh) return bytes + ' Б';
    var units = ['кБ','МБ','ГБ','ТБ','ПБ','ЭБ','ЗБ','ЙБ'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
};