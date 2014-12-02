/* This software is licensed under a BSD license; see the LICENSE file for details. */

function createJsHTMLTag(s, namesHash) {
    m = s.match(/^\s*(\w+)(?::(\w+))?$/);
    if (! m)
        assert(false, "Badly formatted jsHTML tag: '" + s + "'.");
    var elem = document.createElement(m[1]);
    var n = m[2];
    if (namesHash != null && n)
        namesHash[n] = elem;
    return elem;
}

function jsHTML(html, namesHash) {
    if (typeof(html) == "string") {
        return document.createTextNode(html);
    }

    assert_is_arraylike(html, "Bad jsHTML.");
    assert(html.length > 0, "Bad jsHTML.");
    var elem;
    if (typeof(html[0]) == "string") {
        if (! (html[0].charAt(0) == "&" && html[0].charAt(html[0].length - 1) == (";"))) {
            elem = createJsHTMLTag(html[0], namesHash);
        }
        else {
            assert(html.length == 1, "Entity cannot have children.");
            // Bit of a hack -- haven't been able to find a proper DOM way to do this.
            if (! html[0].match(/^&\s*(?:(?:[a-zA-Z]+)|(?:#\d+))\s*;$/)) {
                assert(false, "Bad entity: '" + html + "'.");
            }
            elem = document.createElement("span");
            elem.innerHTML = html[0];
        }
    }
    else {
        assert_is_arraylike(html[0], "Bad jsHTML.");
        assert(html[0].length == 1 || html[0].length == 2, "Bad jsHTML.");
        elem = createJsHTMLTag(html[0][0], namesHash);
        if (html[0].length == 2) {
            for (var k in html[0][1]) {
                // Is this setting an attribute or a DOM object key?
                if (! (k.charAt(0) == "@")) {
                    elem.setAttribute(k, html[0][1][k]);
                    if (k == "class")
                        elem.setAttribute("className", html[0][1][k]);
                }
                else {
                    var m = k.match(/^@\s*(?:([a-zA-Z_]\w*)\.)*([a-zA-Z_]\w*)\s*$/);
                    assert(m, "Badly formatted DOM attribute selector in jsHTML.");
                    var initials = m[1] ? m[1].split(".") : [];
                    var lastObject = elem;
                    for (var i = 0; i < initials.length; ++i)
                        lastObject = lastObject[initials[i]];
                    lastObject[m[2]] = html[0][1][k];
                }
            }
        }
    }

    for (var i = 1; i < html.length; ++i) {
        elem.appendChild(jsHTML(html[i], namesHash));
        // Should we add a space separator?
        if (i < html.length - 1                                       &&
            (! (typeof(html[i]) == "object" &&
                typeof(html[i][0]) == "string" &&
                html[i][0].charAt(0) == "&" &&
                html[i][0].charAt(html[i][0].length - 1) == ";"))     &&
            (! (i < html.length - 2 &&
               typeof(html[i + 1]) == "object" &&
               typeof(html[i + 1][0]) == "string" &&
               html[i + 1][0].charAt(0) == "&" &&
               html[i + 1][0].charAt(html[i + 1][0].length - 1) == ";"))) {
            elem.appendChild(document.createTextNode(" "));
        }
    }

    return elem;
}
function jsHTMLWithNames(names, html) { return jsHTML(html, names); }

var CHUNKS_DICT = { };
function setChunks(cd) {
    CHUNKS_DICT = cd;
}

function htmlCodeToDOM(html, readyCallback) {
    if (typeof(html) == "string") {
        var d = document.createElement("div");
        d.innerHTML = html;
        if (readyCallback)
            readyCallback(d);
        return d;
    }
    else if (typeof(html.include) == "string") {
        if (typeof(CHUNKS_DICT[html.include]) != 'string')
            alert("Unknown chunk_include '" + html.include + "'");
        var chunk = CHUNKS_DICT[html.include];
        var d = document.createElement("div");
        d.innerHTML = chunk;
        if (readyCallback)
            readyCallback(d);
        return d;
    }
    else {
        var h = (typeof(html.html) == "string" ? $("<div>").html(html.html) : jsHTML(html));
        if (readyCallback)
            readyCallback(h);
        return h;
    }
}

// Taken from http://aymanh.com/9-javascript-tips-you-may-not-know
function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
    return 'AssertException: ' + this.message;
}
function assert(exp, message) {
    if (! exp) {
        if (message)
            alert("ERROR: " + message);
        throw new AssertException(message);
    }
}

function assert_is_arraylike(expr, message) {
    assert((! (expr == null)) && typeof(expr.length) == "number", message)
}

function assert_is_dict(expr, message) {
    for (var _ in expr) {
        return;
    }
    assert(false, message);
}

function stringStartsWith(k, s) {
    // Avoid searching through the whole string in cases where
    // it's not necessary.
    if (s.length == 0 && k.length == 0)
        return true;
    else if (s.charAt(0) != k.charAt(0))
        return false;
    else
        return s.indexOf(k) == 0;
}
function stringEndsWith(k, s) {
    // Avoid searching through the whole string in cases where
    // it's not necessary.
    if (s.length == 0 && k.length == 0)
        return true;
    else if (s.charAt(s.length - 1) != k.charAt(k.length - 1))
        return false
    else {
        var i = s.indexOf(k);
        return k != -1 && i == s.length - k.length;
    }
}

function custom_url_encode(s, specials) {
    function is_special(c) {
        for (var k = 0; k < specials.length; ++k) {
            if (specials.charAt(k) == c.charAt(0))
                return true;
        }
        return false;
    }

    var insertions = [];
    for (var i = 0; i < s.length; ++i) {
        if (s.charCodeAt(i) < 32 || s.charCodeAt(i) == 127 || (specials && is_special(s.charAt(i)))) {
            var sr = s.charCodeAt(i).toString(16).toUpperCase();
            if (sr.length == 1) sr = "0" + sr;
            insertions.push([i, "%" + sr])
        }
    }
    var slices = [];
    var lastIndex = 0;
    for (var j = 0; j < insertions.length; ++j) {
        var ins = insertions[j];
        if (lastIndex != ins[0])
            slices.push(s.slice(lastIndex, ins[0]));
        slices.push(ins[1]);
        lastIndex = ins[0] + 1;
    }

    var js = slices.join("");
    if (insertions.length > 0 && insertions[insertions.length-1][0] < s.length)
        js += s.slice(insertions[insertions.length-1][0] + 1, s.length);
    else
        js = s;
    return js;
}

// URL encode chars in a string which will screw up a CSV file (we leave spaces in as it gets very ugly otherwise).
function csv_url_encode(s) {
    return custom_url_encode(s, ",");
}

function filter(f, a, initialLength) {
    if (initialLength != null && initialLength != undefined)
        initialLength = Math.floor(a.length / 3);

    na = new Array(initialLength);
    var count = 0;
    for (var i = 0; i < a.length; ++i) {
        var x = a[i];
        if (f(x)) {
            if (count < na.length)
                na.length += Math.floor(a.length / 3);
            na[count] = x;
            ++count;
        }
    }
    na.length = count;
    return na;
}

function list_contains(x, l) {
    for (var i = 0; i < l.length; ++i) {
        if (x == l[i])
            return true;
    }
    return false;
}

// See http://www.quirksmode.org/js/cookies.html
function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
}

// Ditto.
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function copy_dict(d) {
    var newd = {};
    for (var k in d) {
        newd[k] = d[k];
    }
    return newd;
}

function merge_dicts(d1, d2) {
    var newd = {};
    for (var k in d1)
        newd[k] = d1[k];
    for (var k in d2)
        newd[k] = d2[k];
    return newd;
}

function merge_list_of_dicts(ds) {
    var newd = {};
    for (var i = 0; i < ds.length; ++i) {
        for (k in ds[i])
            newd[k] = ds[i][k];
    }
    return newd;
}

function dget(d1, k, default_) {
    var v = d1[k];
    if (v === undefined)
        return default_;
    else
        return v;
}

function flattenHTML(html)
{
    var a = new Array();
    var idx = 0;

    function rec(nd)
    {
        a[idx++] = nd;
        if (nd.childNodes && nd.childNodes.length > 0) {
            for (var i = 0; i < nd.childNodes.length; ++i) {
                rec(nd.childNodes[i]);
            }
        }
    }
    rec(html);

    return a;
}

function truncateHTML(html, maxLength)
{
    var flat = flattenHTML(html);
    var length = 0;
    var i = 0;
    for (i = 0; i < flat.length && length < maxLength; ++i) {
        if (flat[i].nodeType == 3 /* == a text node */ &&
            ((! flat[i].parent) || (flat[i].parent.tagName != "SCRIPT"))) {
            length += flat[i].data.length;
        }
    }
    if (i > 0) --i;

    if (flat[i].nodeType == 3 /* == a text node */ && length > maxLength) {
        flat[i].textContent = flat[i].textContent.slice(0, flat[i].textContent.length - (length - maxLength));
        flat[i].textContent += " [...]";
    }

    // Now we've truncated the flattened tree, we need to
    // remove the necessary nodes at all levels of the original tree to get the
    // correct result.
    for (var nd = flat[i]; nd; nd = nd.parentNode) {
        for (var sib = nd.nextSibling; sib;) {
            var nextSib = sib.nextSibling;
            sib.parentNode.removeChild(sib);
            sib = nextSib;
        }
    }

    return html;
}

// Methods we add to all widgets for handling events which need to be cleaned
// up after widget has gone but which can't be attached to this.element.
function methodToAdd_safeBind(jqobj, ename, func) {
    jqobj.bind(ename, func);
    if (! this._eventsToRemove) this._eventsToRemove = [[jqobj, ename, func]];
    else this._eventsToRemove.push([jqobj, ename, func]);
}
function makeMethodToAdd_destroy(origDestroyMethod) { // Call original destroy method too if there was one.
    return function () {
        var t = this;
        $.each(t._eventsToRemove || [], function () {
            this[0].unbind(this[1], this[2]);
        });
        if (origDestroyMethod) origDestroyMethod.call(t);
    };
}
function addSafeBindMethodPair(name) {
    if (! $.ui[name].prototype.safeBind) {
        $.ui[name].prototype.safeBind = methodToAdd_safeBind;
        $.ui[name].prototype.destroy = makeMethodToAdd_destroy($.ui[name].prototype.destroy);
    }
}

function ibex_controller_set_properties(name, options) {
    $.ui[name]._ibex_options = options;
}
function ibex_controller_get_property(cname, oname) {
    return $.ui[cname]._ibex_options[oname];
}

function ibex_controller_name_to_css_prefix(cname) {
    return cname + '-';
}

function define_ibex_controller(opts) {
    var name = opts.name;
    var jqueryWidget = opts.jqueryWidget;
    var properties = opts.properties;

    // Automatically add a CSS class corresponding to the controller name to the main div
    // for the controller.
    var oldInit = jqueryWidget._init;
    function newInit() {
        $(this.element).addClass(ibex_controller_name_to_css_prefix(name) + name);
        if (oldInit)
            return oldInit.apply(this, arguments);
    }
    jqueryWidget._init = newInit;

    $.widget("ui." + name, jqueryWidget);
    ibex_controller_set_properties(name, properties);
}

// Test whether they're using an iPhone/iPod touch.
var isIPhone = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i);

// Useful in data files when definite a 'modifyRunningOrder' function.
function DynamicElement(controller, options, hideResults) {
    this.controller = controller;
    this.options = options;
    this.hideResults = hideResults;
}


/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
function core_hmac_md5(key, data)
{
  var bkey = str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of little-endian words to a base-64 string
 */
function binl2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

var withSoundManager;
(function () {
var sm;
withSoundManager = function (callback) {
    if (sm)
        return callback(sm);
    sm = soundManager.setup({
        url: window.location.pathname.replace(/\/[^/]*$/, '/'),
        flashVersion: 8,
        onready: function () {
            callback(sm);
        },
        onerror: function () {
            alert("Error initializing sound");
            throw "Error initializing sound";
        }
    });
}
})();
