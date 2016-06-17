/*

Multi_DBAP
Arguments: number_knob number_destination
inlet: knobpos(x1,y1,x2,y2,,,),speakerpos(x1,y1,x2,y2,,,)
outlet: gainlist1(1,2,3,,,speakernum),gainlist2(1,2,3,,,speakernum),,,,gainlist_knobnum(1,2,3,,,speakernum);
*/

sketch.default2d();
var knobnum = 1;
var nodenum = 1;
var knobpos;
var nodepos;
var selectedknob =0;
var blur_radius = [];
var distancelist=[];
var gainlist=[];
var gainlist2=[];
var gainlist3=[];
var rolloff = 3;
var mousex;
var mousey;
var LINEWIDTH = 20;
inlets = 4;
var height = box.rect[3] - box.rect[1]; 
var width = box.rect[2] - box.rect[0];

// process arguments
if (jsarguments.length>1){
	knobnum = jsarguments[1];
	outlets = knobnum;
}
for(var i=0;i<knobnum;i++){
blur_radius[i]=0.001;
}
	

if (jsarguments.length>2){
	nodenum = jsarguments[2];

}

knobpos = new Array(knobnum*2);
nodepos = new Array(nodenum*2);


draw();

function draw()
{
	with (sketch) {
		glclear();
				
			font("Sans serif");
			fontsize(12);
			textalign("center","center");
			
			glcolor(0.9,0.7,0.7);
		for(var i=0;i<knobpos.length;i+=2){
			if(selectedknob!=i){
			moveto(knobpos[i],knobpos[i+1]);
			circle(blur_radius[i/2]);
			}	
		}
			glcolor(1.0,0.8,0.8);
			moveto(knobpos[selectedknob],knobpos[selectedknob+1]);
			circle(blur_radius[selectedknob/2]);
		for(var i=0;i<knobpos.length;i+=2){
			for(var j=0;j<nodepos.length;j+=2){
				var coeff = gainlist3[i/2*nodenum+j/2];
				glcolor(coeff*0.5,coeff*0.5,coeff);
			gllinewidth(Math.pow(coeff,2)*LINEWIDTH);
			moveto(knobpos[i],knobpos[i+1]);
			lineto(nodepos[j],nodepos[j+1]);
		}
		}
		
		for(var i=0;i<nodepos.length;i+=2){
			glcolor(0.3,0.7,0.3);
			moveto(nodepos[i],nodepos[i+1]);
			sketch.circle(0.05);
			glcolor(0.,0.,0.);			
			text(String(i/2+1));
		}
		
		for(var i=0;i<knobpos.length;i+=2){
			if(selectedknob==i){
			glcolor(1.0,0.3,0.3);
			}else{
			glcolor(0.7,0.3,0.3);
			}
			moveto(knobpos[i],knobpos[i+1]);
			circle(0.05);
			glcolor(0.,0.,0.);			
			text(String(i/2+1));
			
		}
		
	}
	
}

function bang(){
	var silced=[];
	gainlist3=[];
	distancelist = computedistArray(knobpos,nodepos,blur_radius);
	for(var i =0;i<knobnum;i++){
		sliced = distancelist.slice(i*nodenum,i*nodenum+nodenum);
		with(Math){
			for(var j= 0;j<sliced.length;j++){
				gainlist[j] = 	1/(pow(sliced[j],rolloff/(20*log(2)/log(10))));
			}
			for(var j= 0;j<sliced.length;j++){
				gainlist2[j] = gainlist[j]/sqrt(sumpow2(gainlist));
			}
		}
		outlet(i,gainlist2);		
		Array.prototype.push.apply(gainlist3, gainlist2);
	}
	
	draw();
	refresh();
}

function msg_float(v){
	if(inlet==2){
		rolloff = v;
		}else if(inlet ==3){
		    for(var i=0;i<knobnum;i++){
				blur_radius[i]=v;
			}
	}
	bang();
}
function list()
{
if(inlet == 0){
	knobpos = arrayfromargs(arguments);

	}else if(inlet == 1){
	nodepos = arrayfromargs(arguments);

	}else if(inlet ==3){
    blur_radius = arrayfromargs(arguments);
}
	bang();

}
var sumpow2  = function(arr) {
    var sum = 0;
    for (var i=0,len=arr.length; i<len; ++i) {
        sum += Math.pow(arr[i],2);
    };
    return sum;
};
sumpow2.local = 1;
function computedist(x1,y1,x2,y2){
	var dist;
	 	with (Math) {
			dist =	sqrt(pow((x1-x2),2)+pow((y1-y2),2));
			//post("dist = "+dist+"\n");
		}
	return dist;
}
computedist.local = 1;
function computedist_blur(x1,y1,x2,y2,r){
	var dist;
	 	with (Math) {
			dist =	sqrt(pow((x1-x2),2)+pow((y1-y2),2)+pow(r,2));
			//post("dist = "+dist+"\n");
		}
	return dist;
}
computedist_blur.local = 1;
function computedistArray(array1,array2,radius){
	var list = [];
	for(var i=0;i<knobnum;i++){ // 1,2,3,4,,,
		for(var j=0;j<nodenum;j++){ // 1,2,3,4,,,
			var index = i*nodenum+j;
			//post("index: "+index +"\n");
			list[index] = computedist_blur(array1[i*2],array1[i*2+1],array2[j*2],array2[j*2+1],radius[i]);
		//	post("index "+ index +"\n");
		}
	}

	return list;
}
computedistArray.local = 1;


// Mouse Event

function onclick(x,y,but,cmd,shift,capslock,option,ctrl)
{
		var moveknob = true;
		mousex = sketch.screentoworld(x,y)[0];
		mousey = sketch.screentoworld(x,y)[1];
		for(var i=0;i<knobpos.length;i+=2){
			var mousedist = computedist(mousex,mousey,knobpos[i],knobpos[i+1]);
			if(mousedist<0.05){
				if(selectedknob!=i){
					selectedknob = i;
				}
				moveknob = false;
			}
		}
		mousedist = computedist(mousex,mousey,knobpos[selectedknob],knobpos[selectedknob+1]);
		if(moveknob){
		    knobpos[selectedknob] = mousex;
			knobpos[selectedknob+1] = mousey;
		}

	bang();

}
onclick.local = 1; //private. could be left public to permit "synthetic" events

function ondrag(x,y,but,cmd,shift,capslock,option,ctrl)
{
			var moveknob = true;
		mousex = sketch.screentoworld(x,y)[0];
		mousey = sketch.screentoworld(x,y)[1];

	mousedist = computedist(mousex,mousey,knobpos[selectedknob],knobpos[selectedknob+1]);
	if(moveknob){
	knobpos[selectedknob] = mousex;
	knobpos[selectedknob+1] = mousey;
	}

	bang();
}
ondrag.local = 1; //private. could be left public to permit "synthetic" events

function ondblclick(x,y,but,cmd,shift,capslock,option,ctrl)
{

}
ondblclick.local = 1; //private. could be left public to permit "synthetic" events

function forcesize(w,h)
{

}
forcesize.local = 1; //private

function onresize(w,h)
{
height = box.rect[3] - box.rect[1]; 
width = box.rect[2] - box.rect[0];

draw();
refresh();

}
onresize.local = 1; //private
