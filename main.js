if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    }
}

// не протестенно
/*
if(!Event.pageX){
    Event.prototype.pageX = function(){
        var html = document.documentElement;
        var body = document.body;
        return this.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
    }
}

if(!Event.pageY){
    Event.prototype.pageY = function(){
        var html = document.documentElement;
        var body = document.body;
        return this.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
    }
}
*/

Element.prototype.remove = function(){
    this.parentNode.removeChild(this);
}

Element.prototype.getParent = function(tag){
    var obj = this;
    while (tag.indexOf(obj.tagName) == -1) {
        obj = obj.parentNode;
    }
    return obj;
}

Element.prototype.addEvent = function(type, handler){
  if (this.addEventListener)
    this.addEventListener(type, handler, false);
  else
    this.attachEvent("on" + type, handler);
}

Element.prototype.removeEvent = function(type, handler){
    if (this.addEventListener) {
        this.removeEventListener(type, handler, false)
                return
    }

    this.detachEvent('on' + type, handler)
}

Element.prototype.hasClass = function(cls){
  return this.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}

Element.prototype.addClass = function(cls){
  if (!this.hasClass(cls)) this.className += " " + cls;
}

Element.prototype.removeClass = function(cls){
    if (this.hasClass(cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        this.className = this.className.replace(reg,' ');
    }
}

Element.prototype.getCoord = function(){
    var top=0;
    var left=0;
    var elem = this;
    while(elem) {
        top = top + parseInt(elem.offsetTop)
        left = left + parseInt(elem.offsetLeft)
        elem = elem.offsetParent
    }

    return {top: top, left: left}
}

Element.prototype.setOpacity = function(nOpacity){
    var opacityProp = getOpacityProperty();

    if (!this || !opacityProp) return;

    if (opacityProp=="filter"){  // Internet Exploder 5.5+

        nOpacity *= 100;

        var oAlpha = this.filters['DXImageTransform.Microsoft.alpha'] || this.filters.alpha;
        if (oAlpha)
            oAlpha.opacity = nOpacity;
        else
            this.style.filter += "progid:DXImageTransform.Microsoft.Alpha(opacity="+nOpacity+")";
    }
    else
        this.style[opacityProp] = nOpacity;
}

function getOpacityProperty(){
    if (typeof document.body.style.opacity == 'string') // CSS3 compliant (Moz 1.7+, Safari 1.2+, Opera 9)
        return 'opacity';
    else if (typeof document.body.style.MozOpacity == 'string') // Mozilla 1.6, Firefox 0.8
        return 'MozOpacity';
    else if (typeof document.body.style.KhtmlOpacity == 'string') // Konqueror 3.1, Safari 1.1
        return 'KhtmlOpacity';
    else if (document.body.filters && navigator.appVersion.match(/MSIE ([\d.]+);/)[1]>=5.5) // Internet Exploder 5.5+
        return 'filter';

    return false;
}

Element.prototype.sendpost = function(path){
    var inps = this.getElementsByTagName('input');
    var data = {};
    for(var i = 0; i < inps.length; i++)
        data[inps[i].name] = inps[i].value;
    if(path == 'undefined')
        $.post(this.action, data);
    else
        $.post(path, data);
}

Element.prototype.insertAfter = function(elem){
    var parent = this.parentNode;
    var next = this.nextElementSibling; //nextSibling
    if (next)
        return parent.insertBefore(elem, next);
    else
        return parent.appendChild(elem);
}

// -------------------------------- Math -----------------------------------

function crossObj(obj1, obj2){
    obj1 = coord(obj1);
    obj2 = coord(obj2);
    return crossRectangle(obj1, obj2);
}

function coord(elem){
    return {
        x1: elem.offsetLeft,
        x2: elem.offsetLeft + elem.offsetWidth,
        y1: elem.offsetTop,
        y2: elem.offsetTop + elem.offsetHeight
    }
}

function cross(a, b){
    var x1 = Math.max(a.beg, b.beg);
    var x2 = Math.min(a.end, b.end);
    return (x1 < x2) || (a.x1 == x1 && a.x2 == x2) || (b.x1 == x1 && b.x2 == x2);
}

function crossRectangle(a, b){
    var x = cross({beg: a.x1, end: a.x2}, {beg: b.x1, end: b.x2});
    var y = cross({beg: a.y1, end: a.y2}, {beg: b.y1, end: b.y2});
    return x && y;
}

function disableSelection(target){
    if (typeof target.onselectstart!="undefined") // для IE:
        target.onselectstart=function(){return false}
    else if (typeof target.style.MozUserSelect!="undefined") //для Firefox:
        target.style.MozUserSelect="none"
    else // для всех других (типа Оперы):
        target.onmousedown=function(){return false}
    target.style.cursor = "default"
}

// ----------------- cookies ---------------------
function set_cookie ( name, value, exp_y, exp_m, exp_d, path, domain, secure ){
    var cookie_string = name + "=" + escape ( value );
    if ( exp_y ){
        var expires = new Date ( exp_y, exp_m, exp_d );
        cookie_string += "; expires=" + expires.toGMTString();
    }
    
    if ( path ) cookie_string += "; path=" + escape ( path );
    if ( domain ) cookie_string += "; domain=" + escape ( domain );
    if ( secure ) cookie_string += "; secure";

    document.cookie = cookie_string;
}

function get_cookie ( cookie_name ){
    var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
    if ( results ) return ( unescape ( results[2] ) );
    else return null;
}

function get_cookies ( cookie_name ){
    var arr = [];
    for(var c in document.cookie.split(";")){
        var cc = c.split("=");
        arr[cc[0]] = cc[1];
    }
    return arr;
}