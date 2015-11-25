var Favorites = {
	items: new Array(),
	itemsw: new Array(),
	itemsv: new Array(), // элементы, которые соответствуют выбранным фильтрам (нужны для правильного подсчета страниц)
	isVisible: false,
	xmlHTTPFav : null,
	isDell: false,
};

var FavoritesSections = [
	"Избранное",
];

Favorites.open = function() {
	Favorites.isVisible = true;
	Favorites.items = new Array();
	Main.page = 0;
	Main.search = false;
	Main.blurMenu();
	Favorites.read();
	Favorites.showItems();
	Favorites.changeFilter();
};

Favorites.read = function() {
	Favorites.items = new Array();
	var fileSystemObj = new FileSystem();
	var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/fav.data','r');
	if (fileObj){
		var strResult = fileObj.readAll();
		if (strResult){
			Favorites.items = JSON.parse(strResult);
		}
		fileSystemObj.closeCommonFile(fileObj);
	}
};

Favorites.write = function() {
	var fileSystemObj = new FileSystem();
	if (!fileSystemObj.isValidCommonPath(curWidget.id)) fileSystemObj.createCommonDir(curWidget.id);
    var fileObj = fileSystemObj.openCommonFile(curWidget.id+'/fav.data','w');
    if (fileObj)
    {
		var str = JSON.stringify(Favorites.items);
		fileObj.writeAll(str);
		fileSystemObj.closeCommonFile(fileObj);
    }
};

Favorites.showItems = function() {
	Main.clearBlocks();
	Favorites.itemsv = Favorites.items;
	
	if (Favorites.itemsv.length > 0){
		for (var i = Main.page*Main.perPage; i < Favorites.itemsv.length && i < (Main.page+1)*Main.perPage; i++){
			if (Favorites.itemsv[i].descr){ delete Favorites.itemsv[i].descr; }
			Favorites.itemsv[i].url = Favorites.itemsv[i].url.replace(/\?r=.*/g, '');
			
			URLtoXML.ImgDickr[i+1-Main.page*Main.perPage] = Favorites.itemsv[i].img;
			URLtoXML.UrlSt[i+1-Main.page*Main.perPage] = Favorites.itemsv[i].url;
			URLtoXML.sName[i+1-Main.page*Main.perPage] = Favorites.itemsv[i].name;
			URLtoXML.pDes[i+1-Main.page*Main.perPage] = '';

			if (URLtoXML.sName[Main.index]){
				$("#title").html(URLtoXML.sName[Main.index]);
			}else{
				$("#title").html('');
			}
			
			$("#spisok2").append('<div id="bloc' + (i+1-Main.page*Main.perPage) + '" class="block"></div>');
			$("#bloc" + (i+1-Main.page*Main.perPage)).html("<span class='blockImage' id='imgst" + (i+1-Main.page*Main.perPage) +  "></span>");
			$("#bloc" + (i+1-Main.page*Main.perPage)).css('background-image', 'url("' + URLtoXML.ImgDickr[i+1-Main.page*Main.perPage] + '")');
			$("#bloc" + Main.index).addClass('selected'); // активный элемент
		}
	}
};

Favorites.add  = function(){
	Favorites.read(); // read favorites from tv
	Favorites.addLine();
};

Favorites.del = function(){
	Favorites.delLine();
};

Favorites.addLine = function() {
	var obj = new Object();
		
	obj.url = URLtoXML.UrlSt[Main.index].replace(/\?r=.*/g, '');;
	obj.name = URLtoXML.sName[Main.index];
	obj.img = URLtoXML.ImgDickr[Main.index];
	
	var isAdd = true;
	for(var i=0; i < this.items.length && isAdd; i++){
		if (this.items[i].url == obj.url){
			isAdd = false;
		}
	}

	if (isAdd){
		Favorites.items[Favorites.items.length] = obj;
		Favorites.write();
		Display.infoBlock(obj.name + "<br /><span style='color: #99FF00'>добавленно в избранное</span>");
	} else {
		Display.infoBlock(obj.name + "<br /><span style='color: #FF6600'>уже присутствует в избранном</span>");
	}
};

Favorites.delLine = function(){
	// get selected item index
	var index = '';
	$.each(Favorites.items, function(i, item) {	
		if (item.url == Favorites.itemsv[Main.index + Main.page*Main.perPage - 1].url){
			index = i;
		}
	});
	
	if (index !== ''){
		var d = Main.index + Main.page*Main.perPage - 1;
		Display.infoBlock(Favorites.items[index].name + "<br /><span style='color: #FF6600'>удалено из избранного</span>");
		Main.clearBlocks();
		Favorites.items.splice(index, 1);
		Favorites.write();
		if (Favorites.items.length <= (Main.page*Main.perPage) && Main.page > 0) Main.page--;
		Favorites.showItems();
		if(Favorites.itemsv.length == d) d--;
		Main.ActivString(d - Main.page*Main.perPage); // устанавливаем активный элемент на туже позицию, которая была удалена
	}
};

Favorites.changePage = function() {
	var idx = Main.index;
	Favorites.showItems();
	Main.index = idx + Main.smeh;
	$(".block").removeClass('selected');
	$("#bloc" + Main.index).addClass('selected'); // активный элемент
	
	if (Favorites.itemsv.length > (Main.page*Main.perPage)){
		return 1;
	}else{
		if (Main.page > 0) Main.page--;
		Favorites.showItems();
		return 0;
	}
};

Favorites.changeFilter = function() {
	Main.page = 0;

	$("#menu").html("");
	$("#menu").append('<li id="menu_1"><span>Избранное</span></li>');
};