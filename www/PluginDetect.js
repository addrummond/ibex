/* PluginDetect v0.7.1 by Eric Gerds www.pinlady.net/PluginDetect [ onWindowLoaded isMinVersion getVersion onDetectionDone beforeInstantiate Java(OTF&getInfo) QT DevalVR Shockwave Flash WMP Silverlight VLC ] */var PluginDetect={handler:function(c,b,a){return function(){c(b,a)
}
},isDefined:function(b){return typeof b!="undefined"
},isArray:function(b){return(b&&b.constructor===Array)
},isFunc:function(b){return typeof b=="function"
},isString:function(b){return typeof b=="string"
},num:function(a){return(this.isString(a)&&(/\d/).test(a))
},getNumRegx:/[\d][\d\.\_,-]*/,splitNumRegx:/[\.\_,-]/g,getNum:function(b,c){var d=this,a=d.num(b)?(d.isDefined(c)?new RegExp(c):d.getNumRegx).exec(b):null;
return a?a[0].replace(d.splitNumRegx,","):null
},compareNums:function(h,f,d){var e=this,c,b,a,g=parseInt;
if(e.num(h)&&e.num(f)){if(e.isDefined(d)&&d.compareNums){return d.compareNums(h,f)
}c=h.split(e.splitNumRegx);
b=f.split(e.splitNumRegx);
for(a=0;
a<Math.min(c.length,b.length);
a++){if(g(c[a],10)>g(b[a],10)){return 1
}if(g(c[a],10)<g(b[a],10)){return -1
}}}return 0
},formatNum:function(b){var c=this,a,d;
if(!c.num(b)){return null
}d=b.replace(/\s/g,"").split(c.splitNumRegx).concat(["0","0","0","0"]);
for(a=0;
a<4;
a++){if(/^(0+)(.+)$/.test(d[a])){d[a]=RegExp.$2
}}if(!(/\d/).test(d[0])){d[0]="0"
}return d.slice(0,4).join(",")
},$$hasMimeType:function(a){return function(d){if(!a.isIE){var c,b,e,f=a.isString(d)?[d]:d;
for(e=0;
e<f.length;
e++){if(/[^\s]/.test(f[e])&&(c=navigator.mimeTypes[f[e]])&&(b=c.enabledPlugin)&&(b.name||b.description)){return c
}}}return null
}
},findNavPlugin:function(g,d){var a=this.isString(g)?g:g.join(".*"),e=d===false?"":"\\d",b,c=new RegExp(a+".*"+e+"|"+e+".*"+a,"i"),f=navigator.plugins;
for(b=0;
b<f.length;
b++){if(c.test(f[b].description)||c.test(f[b].name)){return f[b]
}}return null
},AXO:window.ActiveXObject,getAXO:function(b,a){var g=null,f,d=false,c=this;
try{g=new c.AXO(b);
d=true
}catch(f){}if(c.isDefined(a)){delete g;
return d
}return g
},convertFuncs:function(f){var a,g,d,b=/^[\$][\$]/,c={};
for(a in f){if(b.test(a)){c[a]=1
}}for(a in c){try{g=a.slice(2);
if(g.length>0&&!f[g]){f[g]=f[a](f)
}}catch(d){}}},initScript:function(){var $=this,nav=navigator,userAgent=$.isString(nav.userAgent)?nav.userAgent:"",vendor=$.isString(nav.vendor)?nav.vendor:"",platform=$.isString(nav.platform)?nav.platform:"";
$.OS=(/win/i).test(platform)?1:((/mac/i).test(platform)?2:((/linux/i).test(platform)?3:4));
$.convertFuncs($);
$.isIE=
/*@cc_on!@*/
false;
$.IEver=$.isIE&&((/MSIE\s*(\d\.?\d*)/i).exec(userAgent))?parseFloat(RegExp.$1,10):-1;
$.ActiveXEnabled=false;
if($.isIE){var x,progid=["Msxml2.XMLHTTP","Msxml2.DOMDocument","Microsoft.XMLDOM","ShockwaveFlash.ShockwaveFlash","TDCCtl.TDCCtl","Shell.UIHelper","Scripting.Dictionary","wmplayer.ocx"];
for(x=0;
x<progid.length;
x++){if($.getAXO(progid[x],1)){$.ActiveXEnabled=true;
break
}}$.head=$.isDefined(document.getElementsByTagName)?document.getElementsByTagName("head")[0]:null
}$.isGecko=!$.isIE&&$.isString(navigator.product)&&(/Gecko/i).test(navigator.product)&&(/Gecko\s*\/\s*\d/i).test(userAgent);
$.GeckoRV=$.isGecko?$.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(userAgent)?RegExp.$1:"0.9"):null;
$.isSafari=!$.isIE&&(/Safari\s*\/\s*\d/i).test(userAgent)&&(/Apple/i).test(vendor);
$.isChrome=!$.isIE&&(/Chrome\s*\/\s*\d/i).test(userAgent);
$.isOpera=!$.isIE&&(/Opera\s*[\/]?\s*\d/i).test(userAgent);
;
$.addWinEvent("load",$.handler($.runWLfuncs,$));

},init:function(d,a){var c=this,b;
if(!c.isString(d)){return -3
}if(d.length==1){c.getVersionDelimiter=d;
return -3
}b=c[d.toLowerCase().replace(/\s/g,"")];
if(!b||!b.getVersion){return -3
}c.plugin=b;
if(!c.isDefined(b.installed)||a==true){b.installed=b.version=b.version0=b.getVersionDone=null;
b.$=c
}c.garbage=false;
if(c.isIE&&!c.ActiveXEnabled){if(b!==c.java){return -2
}}return 1
},fPush:function(b,a){var c=this;
if(c.isArray(a)&&(c.isFunc(b)||(c.isArray(b)&&b.length>0&&c.isFunc(b[0])))){a[a.length]=b
}},callArray:function(b){var c=this,a;
if(c.isArray(b)){for(a=0;
a<b.length;
a++){if(b[a]===null){return
}c.call(b[a]);
b[a]=null
}}},call:function(c){var b=this,a=b.isArray(c)?c.length:-1;
if(a>0&&b.isFunc(c[0])){c[0](b,a>1?c[1]:0,a>2?c[2]:0,a>3?c[3]:0)
}else{if(b.isFunc(c)){c(b)
}}},$$isMinVersion:function(a){return function(h,g,d,c){var e=a.init(h),f,b=-1;
if(e<0){return e
}f=a.plugin;
g=a.formatNum(typeof g=="number"?g.toString():(a.isString(g)?a.getNum(g):"0"));
if(!a.num(g)){return -3
}if(f.getVersionDone!=1){f.getVersion(d,c);
if(f.getVersionDone===null){f.getVersionDone=1
}}a.cleanup();
if(f.installed!==null){b=f.installed<=0.5?f.installed:(f.version===null?0:(a.compareNums(f.version,g,f)>=0?1:-1))
}return b
}
},getVersionDelimiter:",",$$getVersion:function(a){return function(g,d,c){var e=a.init(g),f,b;
if(e<0){return null
}f=a.plugin;
if(f.getVersionDone!=1){f.getVersion(d,c);
if(f.getVersionDone===null){f.getVersionDone=1
}}a.cleanup();
b=(f.version||f.version0);
return b?b.replace(a.splitNumRegx,a.getVersionDelimiter):b
}
},$$getInfo:function(a){return function(g,d,c){var b={},e=a.init(g),f;
if(e<0){return b
}f=a.plugin;
if(f.getInfo){if(f.getVersionDone===null){a.isMinVersion?a.isMinVersion(g,"0",d,c):a.getVersion(g,d,c)
}b=f.getInfo()
}return b
}
},cleanup:function(){
var a=this;
if(a.garbage&&a.isDefined(window.CollectGarbage)){window.CollectGarbage()
}
},isActiveXObject:function(b){var d=this,a,g,f="/",c='<object width="1" height="1" style="display:none" '+d.plugin.getCodeBaseVersion(b)+">"+d.plugin.HTML+"<"+f+"object>";
if(d.head.firstChild){d.head.insertBefore(document.createElement("object"),d.head.firstChild)
}else{d.head.appendChild(document.createElement("object"))
}d.head.firstChild.outerHTML=c;
try{d.head.firstChild.classid=d.plugin.classID
}catch(g){}a=false;
try{if(d.head.firstChild.object){a=true
}}catch(g){}try{if(a&&d.head.firstChild.readyState<4){d.garbage=true
}}catch(g){}d.head.removeChild(d.head.firstChild);
return a
},codebaseSearch:function(c){var e=this;
if(!e.ActiveXEnabled){return null
}if(e.isDefined(c)){return e.isActiveXObject(c)
}var j=[0,0,0,0],g,f,b=e.plugin.digits,i=function(k,l){return e.isActiveXObject((k==0?l:j[0])+","+(k==1?l:j[1])+","+(k==2?l:j[2])+","+(k==3?l:j[3]))
},h,d,a=false;
for(g=0;
g<b.length;
g++){h=b[g]*2;
j[g]=0;
for(f=0;
f<20;
f++){if(h==1&&g>0&&a){break
}if(h-j[g]>1){d=Math.round((h+j[g])/2);
if(i(g,d)){j[g]=d;
a=true
}else{h=d
}}else{if(h-j[g]==1){h--;
if(!a&&i(g,h)){a=true
}break
}else{if(!a&&i(g,h)){a=true
}break
}}}if(!a){return null
}}return j.join(",")
},addWinEvent:function(d,c){var e=this,a=window,b;
if(e.isFunc(c)){if(a.addEventListener){a.addEventListener(d,c,false)
}else{if(a.attachEvent){a.attachEvent("on"+d,c)
}else{b=a["on"+d];
a["on"+d]=e.winHandler(c,b)
}}}},winHandler:function(d,c){return function(){d();
if(typeof c=="function"){c()
}}
},WLfuncs:[0],runWLfuncs:function(a){a.winLoaded=true;
a.callArray(a.WLfuncs);
if(a.onDoneEmptyDiv){a.onDoneEmptyDiv()
}},winLoaded:false,$$onWindowLoaded:function(a){return function(b){if(a.winLoaded){a.call(b)
}else{a.fPush(b,a.WLfuncs)
}}
},$$beforeInstantiate:function(a){return function(e,d){var b=a.init(e),c=a.plugin;
if(b==-3){return
}if(!a.isArray(c.BIfuncs)){c.BIfuncs=[]
}a.fPush(d,c.BIfuncs)
}
},$$onDetectionDone:function(a){return function(h,g,e,b){var c=a.init(h),j,d;
if(c==-3){return -1
}d=a.plugin;
if(d.getVersionDone!=1){j=a.isMinVersion?a.isMinVersion(h,"0",e,b):a.getVersion(h,e,b)
}if(d.installed!=-0.5&&d.installed!=0.5){a.call(g);
return 1
}if(d!==a.java){return 1
};
return 1
}
},div:null,divWidth:50,pluginSize:1,emptyDiv:function(){var c=this,a,e,b,d=0;
if(c.div&&c.div.childNodes){for(a=c.div.childNodes.length-1;
a>=0;
a--){b=c.div.childNodes[a];
if(b&&b.childNodes){if(d==0){for(e=b.childNodes.length-1;
e>=0;
e--){b.removeChild(b.childNodes[e])
}c.div.removeChild(b)
}else{}}}}},onDoneEmptyDiv:function(){var a=this;
if(!a.winLoaded){return
}if(a.WLfuncs&&a.WLfuncs.length>0&&a.isFunc(a.WLfuncs[a.WLfuncs.length-1])){return
}if(a.java){if(a.java.OTF==3){return
}if(a.java.funcs&&a.java.funcs.length>0&&a.isFunc(a.java.funcs[a.java.funcs.length-1])){return
}}a.emptyDiv()
},getObject:function(c,a){var g,d=this,f=null,b=d.getContainer(c);
try{if(b&&b.firstChild){f=b.firstChild
}if(a&&f){f.focus()
}}catch(g){}return f
},getContainer:function(a){return(a&&a[0]?a[0]:null)
},instantiate:function(i,c,f,a,j){var l,m=document,h=this,q,p=m.createElement("span"),o,g,n="/";
var k=function(s,r){var u=s.style,d,t;
if(!u){return
}u.outline="none";
u.border="none";
u.padding="0px";
u.margin="0px";
u.visibility="visible";
if(h.isArray(r)){for(d=0;
d<r.length;
d=d+2){try{u[r[d]]=r[d+1]
}catch(t){}}return
}},b=function(){var s,t="pd33993399",r=null,d=(m.getElementsByTagName("body")[0]||m.body);
if(!d){try{m.write('<div id="'+t+'">o<'+n+"div>");
r=m.getElementById(t)
}catch(s){}}d=(m.getElementsByTagName("body")[0]||m.body);
if(d){if(d.firstChild&&h.isDefined(d.insertBefore)){d.insertBefore(h.div,d.firstChild)
}else{d.appendChild(h.div)
}if(r){d.removeChild(r)
}}else{}};
if(!h.isDefined(a)){a=""
}if(h.isString(i)&&(/[^\s]/).test(i)){q="<"+i+' width="'+h.pluginSize+'" height="'+h.pluginSize+'" ';
for(o=0;
o<c.length;
o=o+2){if(/[^\s]/.test(c[o+1])){q+=c[o]+'="'+c[o+1]+'" '
}}q+=">";
for(o=0;
o<f.length;
o=o+2){if(/[^\s]/.test(f[o+1])){q+='<param name="'+f[o]+'" value="'+f[o+1]+'" />'
}}q+=a+"<"+n+i+">"
}else{q=a
}if(!h.div){h.div=m.createElement("div");
g=m.getElementById("plugindetect");
if(g){h.div=g
}else{h.div.id="plugindetect";
b()
}k(h.div,["width",h.divWidth+"px","height",(h.pluginSize+3)+"px","fontSize",(h.pluginSize+3)+"px","lineHeight",(h.pluginSize+3)+"px","verticalAlign","baseline","display","block"]);
if(!g){k(h.div,["position","absolute","right","0px","top","0px"])
}}if(h.div&&h.div.parentNode){h.div.appendChild(p);
k(p,["fontSize",(h.pluginSize+3)+"px","lineHeight",(h.pluginSize+3)+"px","verticalAlign","baseline","display","inline"]);
;
if(j&&j.BIfuncs){h.callArray(j.BIfuncs)
};
try{if(p&&p.parentNode){p.focus()
}}catch(l){}try{p.innerHTML=q
}catch(l){}if(p.childNodes.length==1&&!(h.isGecko&&h.compareNums(h.GeckoRV,"1,5,0,0")<0)){k(p.firstChild,["display","inline"])
}return[p]
}return[null]
},quicktime:{mimeType:["video/quicktime","application/x-quicktimeplayer","image/x-macpaint","image/x-quicktime"],progID:"QuickTimeCheckObject.QuickTimeCheck.1",progID0:"QuickTime.QuickTime",classID:"clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",minIEver:7,HTML:'<param name="src" value="A14999.mov" /><param name="controller" value="false" />',getCodeBaseVersion:function(a){return'codebase="#version='+a+'"'
},digits:[8,64,16,0],getVersion:function(){var g=this,d=g.$,c=null,f;
if(!d.isIE){if(d.OS!=3){f=d.findNavPlugin(["QuickTime","(Plug-in|Plugin)"]);
if(f&&f.name&&d.hasMimeType(g.mimeType)){c=d.getNum(f.name)
}}}else{var e;
if(d.IEver>=g.minIEver){if(g.BIfuncs){d.callArray(g.BIfuncs)
}c=d.codebaseSearch()
}else{e=d.getAXO(g.progID);
if(e&&e.QuickTimeVersion){c=e.QuickTimeVersion.toString(16);
c=c.charAt(0)+"."+c.charAt(1)+"."+c.charAt(2)
}}}g.installed=c?1:-1;
c=d.formatNum(c);
if(c){var b=c.split(d.splitNumRegx);
if(d.isIE&&d.compareNums(c,"7,50,0,0")>=0&&d.compareNums(c,"7,60,0,0")<0){b=[b[0],b[1].charAt(0),b[1].charAt(1),b[2]]
}b[3]="0";
c=b.join(",")
}g.version=d.formatNum(c)
}},java:{mimeType:["application/x-java-applet","application/x-java-vm","application/x-java-bean"],mimeTypeJPI:"application/x-java-applet;jpi-version=",classID:"clsid:8AD9C840-044E-11D1-B3E9-00805F499D93",DTKclassID:"clsid:CAFEEFAC-DEC7-0000-0000-ABCDEFFEDCBA",DTKmimeType:["application/java-deployment-toolkit","application/npruntime-scriptable-plugin;DeploymentToolkit"],JavaVersions:[[1,9,2,30],[1,8,2,30],[1,7,2,30],[1,6,1,30],[1,5,1,30],[1,4,2,30],[1,3,1,30]],searchJavaPluginAXO:function(){var h=null,a=this,c=a.$,g=[],j=[1,5,0,14],i=[1,6,0,2],f=[1,3,1,0],e=[1,4,2,0],d=[1,5,0,7],b=false;
if(!c.ActiveXEnabled){return null
};
b=true;
;
if(c.IEver>=a.minIEver){g=a.searchJavaAXO(i,i,b);
if(g.length>0&&b){g=a.searchJavaAXO(j,j,b)
}}else{
if(b){g=a.searchJavaAXO(d,d,true)
};
if(g.length==0){g=a.searchJavaAXO(f,e,false)
}}if(g.length>0){h=g[0]
}a.JavaPlugin_versions=[].concat(g);
return h
},searchJavaAXO:function(l,i,m){var n,f,h=this.$,p,k,a,e,g,j,b,q=[];
if(h.compareNums(l.join(","),i.join(","))>0){i=l
}i=h.formatNum(i.join(","));
var o,d="1,4,2,0",c="JavaPlugin."+l[0]+""+l[1]+""+l[2]+""+(l[3]>0?("_"+(l[3]<10?"0":"")+l[3]):"");
for(n=0;
n<this.JavaVersions.length;
n++){f=this.JavaVersions[n];
p="JavaPlugin."+f[0]+""+f[1];
g=f[0]+"."+f[1]+".";
for(a=f[2];
a>=0;
a--){b="JavaWebStart.isInstalled."+g+a+".0";
if(h.compareNums(f[0]+","+f[1]+","+a+",0",i)>=0&&!h.getAXO(b,1)){continue
}o=h.compareNums(f[0]+","+f[1]+","+a+",0",d)<0?true:false;
for(e=f[3];
e>=0;
e--){k=a+"_"+(e<10?"0"+e:e);
j=p+k;
if(h.getAXO(j,1)&&(o||h.getAXO(b,1))){q[q.length]=g+k;
if(!m){return q
}}if(j==c){return q
}}if(h.getAXO(p+a,1)&&(o||h.getAXO(b,1))){q[q.length]=g+a;
if(!m){return q
}}if(p+a==c){return q
}}}return q
},minIEver:7,getMimeJPIversion:function(){var g,a=this,d=a.$,c=new RegExp("("+a.mimeTypeJPI+")(\\d.*)","i"),j=new RegExp("Java","i"),e,i,h={},f=0,b;
for(g=0;
g<navigator.mimeTypes.length;
g++){i=navigator.mimeTypes[g];
if(c.test(i.type)&&(e=i.enabledPlugin)&&(i=RegExp.$2)&&(j.test(e.description)||j.test(e.name))){h["a"+d.formatNum(i)]=i
}}b="0,0,0,0";
for(g in h){f++;
e=g.slice(1);
if(d.compareNums(e,b)>0){b=e
}}a.mimeTypeJPIresult=f>0?a.mimeTypeJPI+h["a"+b]:"";
return f>0?b:null
},queryNoApplet00:function(a){var b=window.java,c;
try{if(b.lang){a.value=[b.lang.System.getProperty("java.version")+" ",b.lang.System.getProperty("java.vendor")+" "]
}}catch(c){}},queryNoApplet:function(){var c=this,d=c.$,b=navigator.userAgent,f,a=c.queryNoApplet;
if(!a.value){a.value=[null,null];
if(!d.isIE&&window.java){if((/opera.9\.(0|1)/i).test(b)&&d.OS==2){}else{if(d.isGecko&&d.compareNums(d.GeckoRV,"1,9,0,0")<0&&d.compareNums(d.GeckoRV,"1,8,0,0")>=0){}else{c.queryNoApplet00(a)
}}}}return a.value
},forceVerifyTag:[],jar:[],Enabled:navigator.javaEnabled(),VENDORS:["Sun Microsystems Inc.","Apple Computer, Inc."],init:function(){var a=this,b=a.$;
a.tryApplet=[2,2,2];
a.DOMobj=[0,0,0,0,0,0];
a.Applet0Index=3;
a.OTF=0;
a.BridgeResult=[[null,null],[null,null],[null,null]];
a.JavaActive=[0,0,0];
a.All_versions=[];
a.mimeTypeJPIresult="";
a.mimeObj=b.hasMimeType(a.mimeType);
a.JavaPlugin_versions=[];
a.funcs=[];
var c=a.NOTF;
if(c){c.$=b;
c.count=0;
c.intervalLength=250;
c.countMax=33
}},getVersion:function(c,h){var e,b=this,d=b.$,g=vendor=versionEnabled=null;
if(b.getVersionDone===null){b.init()
}var i;
if(d.isArray(h)){for(i=0;
i<b.tryApplet.length;
i++){if(typeof h[i]=="number"){b.tryApplet[i]=h[i]
}}}for(i=0;
i<b.forceVerifyTag.length;
i++){b.tryApplet[i]=b.forceVerifyTag[i]
}if(d.isString(c)){b.jar[b.jar.length]=c
}if(b.getVersionDone==0){if(!b.version||b.useAnyTag()){e=b.queryAnyApplet(c);
if(e[0]){b.installed=1;
b.EndGetVersion(e[0],e[1])
}}return
}var f=b.queryDeployTK();
if(f.JRE){g=f.JRE;
vendor=b.VENDORS[0]
}if(!d.isIE){var l,j,a,k;
k=(b.mimeObj&&b.Enabled)?true:false;
if(!g&&(e=b.getMimeJPIversion())!==null){g=e
}if(!g&&b.mimeObj){e="Java[^\\d]*Plug-in";
a=d.findNavPlugin(e);
if(a){e=new RegExp(e,"i");
l=e.test(a.description)?d.getNum(a.description):null;
j=e.test(a.name)?d.getNum(a.name):null;
if(l&&j){g=(d.compareNums(d.formatNum(l),d.formatNum(j))>=0)?l:j
}else{g=l||j
}}}if(!g&&b.mimeObj&&d.isSafari&&d.OS==2){a=d.findNavPlugin("Java.*\\d.*Plug-in.*Cocoa",false);
if(a){l=d.getNum(a.description);
if(l){g=l
}}}if(g){b.version0=g;
if(b.Enabled){versionEnabled=g
}}}else{if(!g&&f.status==0){g=b.searchJavaPluginAXO();
if(g){vendor=b.VENDORS[0]
}}if(g){b.version0=g;
if(b.Enabled&&d.ActiveXEnabled){versionEnabled=g
}}}if(!versionEnabled||b.useAnyTag()){e=b.queryAnyApplet(c);
if(e[0]){versionEnabled=e[0];
vendor=e[1]
}}if(!versionEnabled&&(e=b.queryNoApplet())[0]){b.version0=versionEnabled=e[0];
vendor=e[1];
if(b.installed==-0.5){b.installed=0.5
}}if(d.isSafari&&d.OS==2){if(!versionEnabled&&k){if(b.installed===null){b.installed=0
}else{if(b.installed==-0.5){b.installed=0.5
}}}}if(b.jreDisabled()){versionEnabled=null
};
if(b.isPlugin2==0&&(e=b.mimeObj)&&(e=e.enabledPlugin.description)){if((/Next.*Generation.*Java.*Plug-in/i).test(e)){b.isPlugin2=1
}else{if((/Classic.*Java.*Plug-in/i).test(e)){b.isPlugin2=-1
}}};
if(b.installed===null){b.installed=versionEnabled?1:(g?-0.2:-1)
}b.EndGetVersion(versionEnabled,vendor)
},EndGetVersion:function(b,d){var a=this,c=a.$;
if(a.version0){a.version0=c.formatNum(c.getNum(a.version0))
}if(b){a.version=c.formatNum(c.getNum(b));
a.vendor=(c.isString(d)?d:"")
}if(a.getVersionDone!=1){a.getVersionDone=0
}},jreDisabled:function(){var c=this,e=c.$,d=c.queryDeployTK().JRE,a=0,b;
if(d&&e.OS==1){if((e.isGecko&&e.compareNums(e.GeckoRV,"1,9,2,0")>=0&&e.compareNums(d,"1,6,0,12")<0)||(e.isChrome&&e.compareNums(d,"1,6,0,12")<0)){a=1
}};
if(e.OS==3&&(b=c.mimeObj)&&(b=b.enabledPlugin.description)&&(/Next.*Generation.*Java.*Plug-in/i).test(b)&&c.isPlugin2<2&&!c.Browser4Plugin2()){a=1
};
return a
},queryDeployTK:function(){var d=this,g=d.$,b=d.queryDeployTK,i,a,c,h=len=null;
if(!b.JREall){b.JREall=[];
b.JRE=null;
b.status=0
}else{return b
}if((g.isGecko&&g.compareNums(g.GeckoRV,g.formatNum("1.6"))<=0)||g.isSafari||(g.isIE&&!g.ActiveXEnabled)){return b
}if(g.isIE&&g.IEver>=6){d.DOMobj[0]=g.instantiate("object",[],[]);
h=g.getObject(d.DOMobj[0])
}else{if(!g.isIE&&(c=g.hasMimeType(d.DTKmimeType))&&c.type){d.DOMobj[0]=g.instantiate("object",["type",c.type],[]);
h=g.getObject(d.DOMobj[0])
}}if(h){if(g.isIE&&g.IEver>=6){try{h.classid=d.DTKclassID
}catch(i){}};
try{if(Math.abs(d.isPlugin2)<2){d.isPlugin2=h.isPlugin2()?2:-2
}}catch(i){};
try{var f=h.jvms;
if(f){len=f.getLength();
if(typeof len=="number"){b.status=len>0?1:-1;
for(a=0;
a<len;
a++){c=g.getNum(f.get(len-1-a).version);
if(c){b.JREall[a]=c
}}}}}catch(i){}}if(b.JREall.length>0){b.JRE=g.formatNum(b.JREall[0])
}return b
},queryAnyApplet:function(f){var n=this,e=n.$,o=n.BridgeResult,h=n.DOMobj,b=n.Applet0Index,i="&nbsp;&nbsp;&nbsp;&nbsp;",r="A.class";
if(!e.isString(f)||!(/\.jar\s*$/).test(f)||(/\\/).test(f)){return[null,null]
}if(n.OTF<1){n.OTF=1
}if(n.jreDisabled()){return[null,null]
}if((e.isGecko||e.isChrome||(e.isOpera&&!n.Enabled))&&!n.mimeObj&&!n.queryNoApplet()[0]){return[null,null]
}if(n.OTF<2){n.OTF=2
}if(!h[1]&&n.canUseObjectTag()){h[1]=e.instantiate("object",[],[],i)
}if(!h[2]){h[2]=e.instantiate("",[],[],i)
}var d=f,q="",m;
if((/[\/]/).test(f)){m=f.split("/");
d=m[m.length-1];
m[m.length-1]="";
q=m.join("/")
}var j=["archive",d,"code",r],l=["mayscript","true"],p=["scriptable","true"].concat(l),g=!e.isIE&&n.mimeObj&&n.mimeObj.type?n.mimeObj.type:n.mimeType[0];
if(!h[b]&&n.canUseObjectTag()&&n.canTryApplet(0)){h[b]=e.isIE?e.instantiate("object",["type",g].concat(j),["codebase",q].concat(j).concat(p),i,n):e.instantiate("object",["type",g,"archive",d,"classid","java:"+r],["codebase",q,"archive",d].concat(p),i,n);
o[0]=[0,0];
n.query1Applet(b)
}if(!h[b+1]&&n.canUseAppletTag()&&n.canTryApplet(1)){h[b+1]=e.isIE?e.instantiate("applet",["alt",i].concat(l).concat(j),["codebase",q].concat(l),i,n):e.instantiate("applet",["codebase",q,"alt",i].concat(l).concat(j),[].concat(l),i,n);
o[1]=[0,0];
n.query1Applet(b+1)
}if(!h[b+2]&&n.canUseObjectTag()&&n.canTryApplet(2)){h[b+2]=e.isIE?e.instantiate("object",["classid",n.classID],["codebase",q].concat(j).concat(p),i,n):e.instantiate();
o[2]=[0,0];
n.query1Applet(b+2)
};
var k,a=0;
for(k=0;
k<o.length;
k++){if(h[b+k]||n.canTryApplet(k)){a++
}else{break
}}if(a==o.length){n.getVersionDone=n.forceVerifyTag.length>0?0:1
}return n.getBR()
},canUseAppletTag:function(){var a=this;
return((!a.$.isIE||a.Enabled)?true:false)
},canUseObjectTag:function(){return((!this.$.isIE||this.$.ActiveXEnabled)?true:false)
},useAnyTag:function(){var b=this,a;
for(a=0;
a<b.tryApplet.length;
a++){if(b.canTryApplet(a)){return true
}}return false
},canTryApplet:function(c){var a=this,b=a.$;
if(a.tryApplet[c]==3){return true
}if(!a.version0||!a.Enabled||(b.isIE&&!b.ActiveXEnabled)){if(a.tryApplet[c]==2){return true
}if(a.tryApplet[c]==1&&!a.getBR()[0]){return true
}}return false
},getBR:function(){var b=this.BridgeResult,a;
for(a=0;
a<b.length;
a++){if(b[a][0]){return[b[a][0],b[a][1]]
}}return[b[0][0],b[0][1]]
},query1Applet:function(g){var f,c=this,d=c.$,a=vendor=null,b=d.getObject(c.DOMobj[g],true);
if(b){try{a=b.getVersion()+" ";
vendor=b.getVendor()+" ";
b.statusbar(d.winLoaded?" ":" ")
}catch(f){}if(d.num(a)){c.BridgeResult[g-c.Applet0Index]=[a,vendor]
}try{if(d.isIE&&a&&b.readyState!=4){d.garbage=true;
b.parentNode.removeChild(b)
}}catch(f){};
if(a&&Math.abs(c.isPlugin2)<2){c.isPlugin2=-2;
try{if(c.minJRE4Plugin2(a)&&b.Packages.java.applet){c.isPlugin2=2
}}catch(f){}}
}},append:function(e,d){for(var c=0;
c<d.length;
c++){e[e.length]=d[c]
}},isPlugin2:0,minJRE4Plugin2:function(a){var c=this.$,b=c.formatNum(c.getNum(a));
return b?(c.compareNums(b,"1,6,0,10")>=0):0
},Browser4Plugin2:function(){var a=this.$;
if(a.isIE){if(a.IEver<6){return 0
}}else{if(a.isGecko&&a.compareNums(a.GeckoRV,"1,9,0,0")<0){return 0
}}return 1
},getInfo:function(){var a=this,d=a.$,i,n=a.installed,e=a.queryDeployTK(),f=a.BridgeResult,l=-1,o={All_versions:[],DeployTK_versions:[],DeploymentToolkitPlugin:(e.status==0?false:true),vendor:(d.isString(a.vendor)?a.vendor:""),OTF:(a.OTF<3?0:(a.OTF==3?1:2)),PLUGIN:null};
if(n==1&&a.minJRE4Plugin2(a.version)){if(a.isPlugin2<0||(a.isPlugin2<2&&!a.Browser4Plugin2())){}else{l=a.isPlugin2>0?1:0
}}o.isPlugin2=l;
for(i=0;
i<f.length;
i++){if(f[i][0]){o.PLUGIN=d.getObject(a.DOMobj[a.Applet0Index+i]);
break
}}var h=[null,null,null];
for(i=0;
i<f.length;
i++){if(f[i][0]){h[i]=1
}else{if(a.JavaActive[i]==1){h[i]=0
}else{if(a.tryApplet[i]>=1&&a.OTF!=3){if((i==1&&!a.canUseAppletTag())||(i!=1&&!a.canUseObjectTag())||n==-0.2||n==-1||a.JavaActive[i]<0||(i==2&&(!d.isIE||(/Microsoft/i).test(o.vendor)))){h[i]=-1
}}}}}o.objectTag=h[0];
o.appletTag=h[1];
o.objectTagActiveX=h[2];
var c=o.All_versions,m=o.DeployTK_versions,b=a.JavaPlugin_versions;
a.append(m,e.JREall);
a.append(c,(m.length>0?m:(b.length>0?b:(d.isString(a.version)?[a.version]:[]))));
for(i=0;
i<c.length;
i++){c[i]=d.formatNum(d.getNum(c[i]))
}var j,g=null;
if(!d.isIE){j=a.mimeObj||d.hasMimeType(a.mimeTypeJPIresult);
if(j){g=j.enabledPlugin
}}o.name=g?g.name:"";
o.description=g?g.description:"";
var k=null;
if((n==0||n==1)&&o.vendor==""){if(d.OS==2){k=a.VENDORS[1]
}else{if(!d.isIE&&d.OS==1){k=a.VENDORS[0]
}else{if(d.OS==3){k=a.VENDORS[0]
}}}if(k){o.vendor=k
}}return o
},JavaFix:function(){}},devalvr:{mimeType:"application/x-devalvrx",progID:"DevalVRXCtrl.DevalVRXCtrl.1",classID:"clsid:5D2CF9D0-113A-476B-986F-288B54571614",getVersion:function(){var a=null,g,c=this.$,f;
if(!c.isIE){g=c.findNavPlugin("DevalVR");
if(g&&g.name&&c.hasMimeType(this.mimeType)){a=g.description.split(" ")[3]
}this.installed=a?1:-1
}else{var b,h,d;
h=c.getAXO(this.progID,1);
if(h){b=c.instantiate("object",["classid",this.classID],["src",""],"",this);
d=c.getObject(b);
if(d){try{if(d.pluginversion){a="00000000"+d.pluginversion.toString(16);
a=a.substr(a.length-8,8);
a=parseInt(a.substr(0,2),16)+","+parseInt(a.substr(2,2),16)+","+parseInt(a.substr(4,2),16)+","+parseInt(a.substr(6,2),16)
}}catch(f){}}}this.installed=a?1:(h?0:-1)
}this.version=c.formatNum(a)
}},flash:{mimeType:["application/x-shockwave-flash","application/futuresplash"],progID:"ShockwaveFlash.ShockwaveFlash",classID:"clsid:D27CDB6E-AE6D-11CF-96B8-444553540000",getVersion:function(){var c=function(i){if(!i){return null
}var e=/[\d][\d\,\.\s]*[rRdD]{0,1}[\d\,]*/.exec(i);
return e?e[0].replace(/[rRdD\.]/g,",").replace(/\s/g,""):null
};
var j,g=this.$,h,f,b=null,a=null,d=null;
if(!g.isIE){j=g.findNavPlugin("Flash");
if(j&&j.description&&g.hasMimeType(this.mimeType)){b=c(j.description)
}}else{for(f=15;
f>2;
f--){a=g.getAXO(this.progID+"."+f);
if(a){d=f.toString();
break
}}if(d=="6"){try{a.AllowScriptAccess="always"
}catch(h){return"6,0,21,0"
}}try{b=c(a.GetVariable("$version"))
}catch(h){}if(!b&&d){b=d
}}this.installed=b?1:-1;
this.version=g.formatNum(b);
return true
}},shockwave:{mimeType:"application/x-director",progID:"SWCtl.SWCtl",classID:"clsid:166B1BCA-3F9C-11CF-8075-444553540000",getVersion:function(){var a=null,b=null,f,d,c=this.$;
if(!c.isIE){d=c.findNavPlugin("Shockwave for Director");
if(d&&d.description&&c.hasMimeType(this.mimeType)){a=c.getNum(d.description)
}}else{try{b=c.getAXO(this.progID).ShockwaveVersion("")
}catch(f){}if(c.isString(b)&&b.length>0){a=c.getNum(b)
}else{if(c.getAXO(this.progID+".8",1)){a="8"
}else{if(c.getAXO(this.progID+".7",1)){a="7"
}else{if(c.getAXO(this.progID+".1",1)){a="6"
}}}}}this.installed=a?1:-1;
this.version=c.formatNum(a)
}},windowsmediaplayer:{mimeType:["application/x-mplayer2","application/asx"],progID:"wmplayer.ocx",classID:"clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6",getVersion:function(){var a=null,e=this.$,b=null;
this.installed=-1;
if(!e.isIE){if(e.hasMimeType(this.mimeType)){if(e.findNavPlugin(["Windows","Media","(Plug-in|Plugin)"],false)||e.findNavPlugin(["Flip4Mac","Windows","Media"],false)){this.installed=0
}var d=e.isGecko&&e.compareNums(e.GeckoRV,e.formatNum("1.8"))<0;
if(!d&&e.findNavPlugin(["Windows","Media","Firefox Plugin"],false)){var c=e.instantiate("object",["type",this.mimeType[0]],[],"",this),f=e.getObject(c);
if(f){a=f.versionInfo
}}}}else{b=e.getAXO(this.progID);
if(b){a=b.versionInfo
}}if(a){this.installed=1
}this.version=e.formatNum(a)
}},silverlight:{mimeType:"application/x-silverlight",progID:"AgControl.AgControl",digits:[9,20,9,12,31],getVersion:function(){var e=this.$,j=document,i=null,c=null,h=false,b=[1,0,1,1,1],r=[1,0,1,1,1],k=function(d){return(d<10?"0":"")+d.toString()
},n=function(s,d,u,v,t){return(s+"."+d+"."+u+k(v)+k(t)+".0")
},o=function(d,s){return q((d==0?s:r[0]),(d==1?s:r[1]),(d==2?s:r[2]),(d==3?s:r[3]),(d==4?s:r[4]))
},q=function(t,s,w,v,u){var u;
try{return c.IsVersionSupported(n(t,s,w,v,u))
}catch(u){}return false
};
if(!e.isIE){var a=[null,null],f=e.findNavPlugin("Silverlight Plug-in",false),g=e.isGecko&&e.compareNums(e.GeckoRV,e.formatNum("1.6"))<=0;
if(f&&e.hasMimeType(this.mimeType)){i=e.formatNum(f.description);
if(i){r=i.split(e.splitNumRegx);
if(parseInt(r[2],10)>=30226&&parseInt(r[0],10)<2){r[0]="2"
}i=r.join(",")
}if(e.isGecko&&!g){h=true
}if(!h&&!g&&i){a=e.instantiate("object",["type",this.mimeType],[],"",this);
c=e.getObject(a);
if(c){if(q(b[0],b[1],b[2],b[3],b[4])){h=true
}if(!h){c.data="data:"+this.mimeType+",";
if(q(b[0],b[1],b[2],b[3],b[4])){h=true
}}}}}}else{c=e.getAXO(this.progID);
var m,l,p;
if(c&&q(b[0],b[1],b[2],b[3],b[4])){for(m=0;
m<this.digits.length;
m++){p=r[m];
for(l=p+(m==0?0:1);
l<=this.digits[m];
l++){if(o(m,l)){h=true;
r[m]=l
}else{break
}}if(!h){break
}}if(h){i=n(r[0],r[1],r[2],r[3],r[4])
}}}this.installed=h&&i?1:(i?-0.2:-1);
this.version=e.formatNum(i)
}},vlc:{mimeType:"application/x-vlc-plugin",progID:"VideoLAN.VLCPlugin",compareNums:function(e,d){var c=this.$,k=e.split(c.splitNumRegx),i=d.split(c.splitNumRegx),h,b,a,g,f,j;
for(h=0;
h<Math.min(k.length,i.length);
h++){j=/([\d]+)([a-z]?)/.test(k[h]);
b=parseInt(RegExp.$1,10);
g=(h==2&&RegExp.$2.length>0)?RegExp.$2.charCodeAt(0):-1;
j=/([\d]+)([a-z]?)/.test(i[h]);
a=parseInt(RegExp.$1,10);
f=(h==2&&RegExp.$2.length>0)?RegExp.$2.charCodeAt(0):-1;
if(b!=a){return(b>a?1:-1)
}if(h==2&&g!=f){return(g>f?1:-1)
}}return 0
},getVersion:function(){var b=this.$,d,a=null,c;
if(!b.isIE){if(b.hasMimeType(this.mimeType)){d=b.findNavPlugin(["VLC","(Plug-in|Plugin)"],false);
if(d&&d.description){a=b.getNum(d.description,"[\\d][\\d\\.]*[a-z]*")
}}this.installed=a?1:-1
}else{d=b.getAXO(this.progID);
if(d){try{a=b.getNum(d.VersionInfo,"[\\d][\\d\\.]*[a-z]*")
}catch(c){}}this.installed=d?1:-1
}this.version=b.formatNum(a)
}},zz:0};
PluginDetect.initScript();
