var Keyboard = { 
	x : 6,
	y : 2 ,
	str: "",
	run: false ,
	cursor: false,
	shift: false,
	cyr: true,
	callback: null
};
    
var  keysCode_0 = new Array( 33, 35, 36, 38, 42, 40, 41, 95, 43, 34, 94, 37, 64, 123, 125);
var  keysCode_1 = new Array( 39, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 45, 61,   8,   8);
var  keysCode_2 = new Array( 0, 113,119,101,114,116,121,117,105,111,112,91,93,13,13);
var  keysCode_3 = new Array(10, 97, 115,100,102,103,104,106,107,108,58,39,126,13,13);
var  keysCode_4 = new Array(1, 124,122,120,99,118,98,110,109,44,46,47,63,9,9);
var  keysCode_5 = new Array(2, 3,4,32,32,32,32,32,32,32,32,5,6,7,8);

var  keysCode_2cyr = new Array( 39,0x439,0x446,0x443,0x43a,0x435,0x43d,0x433,0x448,0x449,0x437,0x445,0x44a,13,13);
var  keysCode_3cyr = new Array(10,0x444,0x44b,0x432,0x430,0x43f,0x440,0x43e,0x43b,0x434,0x436,0x44d,126,13,13);
var  keysCode_4cyr = new Array(0x7c, 0x5c,0x44f,0x447,0x441,0x43c,0x438,0x442,0x44c,0x431,0x44e,47,63,46,46);
var  keysCode_5cyr = new Array(2, 0x3a,0x3b,32,32,32,32,32,32,32,32,91,93,0x2c,0x2c);

Keyboard.init=function(callback) {
    Keyboard.callback=callback;
    Keyboard.x=6;
    Keyboard.y=2;
    Keyboard.setKey(Keyboard.x,Keyboard.y);
	alert("[QWERTY_KBD] INIT");
};

Keyboard.setKey=function(x,y) {
	var xPos;
	var yPos;
	var Xo=0;
	var Yo=45;
	switch(y) {
		case 0:
			xPos=Xo+x*53;
			break;
	 
		case 1:
			if (x>=13) {
				xPos=Xo+715;
			} else {
				xPos=Xo+x*53;
			}
			break;
 
		case 2:
			if (x==0) {
				xPos=Xo+10;
			} else if (x>=13) {
				xPos=Xo+740;
			} else {
				xPos=Xo+24+x*53;
			}
			break;
				
		case 3:
			if (x==0) {
				xPos=Xo+22;
			} else if (x>=13) {
				xPos=Xo+740;
			} else {
				xPos=Xo+53+x*53;
			}
			break;
			   
		case 4:
			if (x==0) {
				xPos=Xo+10;
			} else if (x>=13) {
				xPos=Xo+720;
			} else {
				xPos=Xo+24+x*53;
			}
			break;
				
		case 5:
			if (x==0) {
				xPos=Xo+10;
			} else if (x>=3 && x<=10) {
				xPos=Xo+370;
			} else if (x>=13) {
				xPos=Xo+720;
			} else {
				xPos=Xo+24+x*53;
			}
			break;
	}
	
	if((y==2 || y==3) && x>=13){
		yPos=170;
	} else {
		yPos=Yo+y*54;
	}
	
	//alert("[QWERTY_KBD] setRight - [" + xPos + ":" + yPos + "]");
	
	document.getElementById("cursorKeyb").style.left=xPos+"px";
	document.getElementById("cursorKeyb").style.top=yPos+"px";   
};   

Keyboard.setRight=function() {
	if (Keyboard.x<14) {
		if (Keyboard.y == 5 && (Keyboard.x >= 3 && Keyboard.x <= 10)) {
			Keyboard.x = 11;
		}
		else {
			Keyboard.x++;
		}
		Keyboard.setKey(Keyboard.x,Keyboard.y);
		//alert("[QWERTY_KBD] setRight - [" + Keyboard.x + ":" + Keyboard.y + "]");
	}
}; 

Keyboard.setLeft=function() {
	if (Keyboard.x>0) {
		if(Keyboard.y != 0 && Keyboard.x > 13){
			Keyboard.x -= 2;
		}
		else if (Keyboard.y == 5 && (Keyboard.x >= 3 && Keyboard.x <= 10)) {
			Keyboard.x = 2;
		}
		else {
			Keyboard.x--;
		}
		Keyboard.setKey(Keyboard.x,Keyboard.y);
		//alert("[QWERTY_KBD] setLeft - [" + Keyboard.x + ":" + Keyboard.y + "]");
	}
}; 
    
Keyboard.setDown=function() {
	if (Keyboard.y<5) {
		if (Keyboard.y == 2 && Keyboard.x >= 13) {
			Keyboard.y += 2;
		}
		else if (Keyboard.y == 4 && (Keyboard.x >= 3 && Keyboard.x <= 10)) {
			Keyboard.x = 6;
			Keyboard.y++;
		}
		else {
			Keyboard.y++;
		}
		Keyboard.setKey(Keyboard.x,Keyboard.y);
		//alert("[QWERTY_KBD] setDown - [" + Keyboard.x + ":" + Keyboard.y + "]");
	}
};
    
Keyboard.setUp=function() {
	if (Keyboard.y>0) {
		if (Keyboard.y == 3 && Keyboard.x >= 13) {
			Keyboard.y -= 2;
		}
		else if (Keyboard.y == 5 && (Keyboard.x >= 3 && Keyboard.x <= 10)) {
			Keyboard.x = 6;
			Keyboard.y--;
		}
		else {
			Keyboard.y--;
		}
		Keyboard.setKey(Keyboard.x,Keyboard.y);
		//alert("[QWERTY_KBD] setUp - [" + Keyboard.x + ":" + Keyboard.y + "]");
	}
};  
 
Keyboard.backSpace=function() {
    Keyboard.str = Keyboard.str.substr(0,Keyboard.str.length-1);
	alert("[QWERTY_KBD] backSpace - [" + Keyboard.str + "]");
};

Keyboard.clear=function() {
    Keyboard.str = '';
	alert("[QWERTY_KBD] backSpace - [" + Keyboard.str + "]");
};
 
Keyboard.show=function() {
    Keyboard.shift = false;
	
	document.getElementById("Keyb").style.display = "block";
	
	if (Keyboard.cyr) {
		document.getElementById("imgKeybCyr").style.visibility="visible";
	} else {
        document.getElementById("imgKeyb").style.visibility="visible";
	}
	
	document.getElementById("cursorKeyb").style.visibility="visible";
	
	Keyboard.str = $(".plainText").val();
	
	Keyboard.run = true;
	Main.keybMode = true;
	Keyboard.blink(true);
	Info.load();
	alert("[QWERTY_KBD] show");
};
    
Keyboard.hide=function() {
	document.getElementById("Keyb").style.display="none";
	document.getElementById("imgKeybCyr").style.visibility="hidden";
	document.getElementById("imgKeyb").style.visibility="hidden";
	document.getElementById("cursorKeyb").style.visibility="hidden";
	document.getElementById("shiftKeyb").style.visibility="hidden";
	$(".plainText").val(Keyboard.str);
	Keyboard.run=false;
	Main.keybMode = Keyboard.run;
	Info.load();
	alert("[QWERTY_KBD] hide");
};

Keyboard.blink=function(c) {
	if(Keyboard.run){
		var l=Keyboard.str.length;
		var m=$('.plainText').attr('size');
		if (c) {
			if (l>m) {
				$(".plainText").val("..."+Keyboard.str.substr(l-m));
			} else {
				$(".plainText").val(Keyboard.str);
			}
			if (Keyboard.run) {
				setTimeout("Keyboard.blink(false);", 500);
			}
		} else {
			if (l>m) {
				$(".plainText").val("..."+Keyboard.str.substr(l-m)+"_");
			} else {
				$(".plainText").val(Keyboard.str+"_");
			}
			if (Keyboard.run) {
				setTimeout("Keyboard.blink(true);", 500);
			}
		}
	}
};
    
Keyboard.setText=function(text) {
	Keyboard.str=text;
	$(".plainText").val(Keyboard.str);
	alert("[QWERTY_KBD] setText [" + Keyboard.str + "]");
};
    
Keyboard.shiftChange=function() {
	Keyboard.shift=! Keyboard.shift;
	if  (Keyboard.shift) {
		 document.getElementById("shiftKeyb").style.visibility="visible";
	} else {
		 document.getElementById("shiftKeyb").style.visibility="hidden";
	}
	alert("[QWERTY_KBD] shiftChange [" + Keyboard.shift + "]");
};   

Keyboard.langChange=function() {
    Keyboard.cyr=! Keyboard.cyr;
    if (Keyboard.cyr) {
		document.getElementById("imgKeybCyr").style.visibility="visible";
		document.getElementById("imgKeyb").style.visibility="hidden";
	} else {
		document.getElementById("imgKeyb").style.visibility="visible";
		document.getElementById("imgKeybCyr").style.visibility="hidden";
	}
	alert("[QWERTY_KBD] shiftChange [" + Keyboard.cyr + "]");
};   

Keyboard.addKey=function() {
    var k;
    var s="";
    
	switch(Keyboard.y) {
		case 0:
			k= keysCode_0[Keyboard.x];
			break;
                    
	    case 1:
			k= keysCode_1[Keyboard.x];
			break;
                    
		case 2:
			if  (Keyboard.cyr) k= keysCode_2cyr[Keyboard.x]; 
			else k= keysCode_2[Keyboard.x];
			break;
               
		case 3:
			if  (Keyboard.cyr) k= keysCode_3cyr[Keyboard.x]; 
			else k= keysCode_3[Keyboard.x];
			break;
                    
		case 4:
			if  (Keyboard.cyr) k= keysCode_4cyr[Keyboard.x]; 
			else k= keysCode_4[Keyboard.x];
			break;
              
		case 5:
			if  (Keyboard.cyr) k= keysCode_5cyr[Keyboard.x]; 
			else k= keysCode_5[Keyboard.x];
			break;
    }
            
	if (k>31) {
		s=String.fromCharCode(k);
	} else if (k==0) {
		s=".com";
	} else if (k==1) {
		s=".net";
	} else if (k==2) {
	   Keyboard.cyr=! Keyboard.cyr; 
	} else if (k==3) {
		s=".de";
	} else if (k==4) {
		s=".uk";
	} else if (k==5) {
		s=".cz";
	} else if (k==6) {
		s=".pl";
	} else if (k==7) {
		s=".xml";
	} else if (k==9) {
		s="www.";
	} else if (k==10) {
	   Keyboard.shift =! Keyboard.shift;
	}

    if  (Keyboard.cyr) {
		document.getElementById("imgKeybCyr").style.visibility="visible";
		document.getElementById("imgKeyb").style.visibility="hidden";
    } else {
	    document.getElementById("imgKeyb").style.visibility="visible";
	    document.getElementById("imgKeybCyr").style.visibility="hidden";
    }
            
	if  (Keyboard.shift) {
		s=s.toUpperCase();
		document.getElementById("shiftKeyb").style.visibility="visible";
    } else {
        document.getElementById("shiftKeyb").style.visibility="hidden";
	}
    
	Keyboard.str=Keyboard.str+s;
          
	if (k==8) {
		Keyboard.str=Keyboard.str.substr(0,Keyboard.str.length-1);
	} else if (k==13) {
		
		// Удаляем _ в конце строки если он есть
		var str  = $(".plainText").val();
		var last_char = str.charAt(str.length - 1);

		if(last_char == "_"){
			$(".plainText").val(str.slice(0, -1));
		}
		
		Keyboard.callback(Keyboard.str);
	}
	
	//alert("[QWERTY_KBD] addKey [" + s + "]");
};

Keyboard.returnKey = function() {
	alert("[QWERTY_KBD] returnKey");
	Search.textobjKeyFunc();
};

Keyboard.change = function() {
	alert("[QWERTY_KBD] change keyboard");
	Keyboard.hide();
	Main.customKeyb = false;
	Search.Input();
};