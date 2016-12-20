/* httprequest */
if (typeof (wng_includesTracker) == 'undefined') { var wng_includesTracker = {}; } wng_includesTracker['/global/interface/httprequest/httprequest.js'] = 1; if (!wng_includesTracker['/global/interface/globals.js']) { var wng_includesDomain = ''; var wng_includesVersion = ''; try { wng_includesDomain = wng_pageInfo.contentDomain; wng_includesVersion = wng_pageInfo.includesVersion; } catch (e) { wng_includesDomain = 'http://content.worldnow.com'; wng_includesVersion = '20070120'; } document.writeln('<scr' + 'ipt type="text/javascript" src="' + wng_includesDomain + '/global/interface/globals.js?ver=' + wng_includesVersion + '"></scr' + 'ipt>'); } var wng_doc = document; var WNHttpRequestManager = function () { var _PROXY_URL = '/global/interface/httprequest/hrproxy.asp'; var _PROXY_PARAM_URL = 'url'; var _METHODS = { GET: 1, HEAD: 1, POST: 1, PUT: 1, DELETE: 1 }; var _METHOD_DEFAULT = 'GET'; var _POST_MIMETYPE_DEFAULT = 'application/x-www-form-urlencoded'; var _XMLPARSER_LIBVERSIONS = [['MSXML2', '3.0'], ['MSXML2', '2.6'], ['Microsoft', '']]; var _RESPONSE_HEADERS_DELIMITER = new RegExp(':\\s+|\\n', 'g'); var _READYSTATE_HANDLERS = { onSuccess: true, onError: true, onCompleted: 4, onInteractive: 3, onLoaded: 2, onLoading: 1, onUninitialized: 0 }; var _encodeURIComponent = (typeof (encodeURIComponent) != 'undefined') ? encodeURIComponent : escape; function _convertXMLParserObjectType(libraryName, objectType) { if (libraryName != 'Microsoft') { return objectType; } switch (objectType) { case 'DOMDocument': { return 'XMLDOM'; break; } case 'FreeThreadedDOMDocument': { return 'FreeThreadedXMLDOM'; break; } case 'DSOControl': { return 'XMLDSO'; break; } default: { return objectType; break; } } } function _getProgId(libraryName, objectType, version) { var progId = ''; if (libraryName && objectType) { progId = libraryName + '.' + objectType; if (version) { progId += '.' + version; } } return progId; } function _getXMLParserActiveXControl(objectType) { if (!objectType || !window.ActiveXObject) { return; } var libraryName = _getXMLParserActiveXControl.libraryName; if (libraryName) { objectType = _convertXMLParserObjectType(libraryName, objectType); return new ActiveXObject(_getProgId(libraryName, objectType, _getXMLParserActiveXControl.version)); } var libVersion, libraryName, version, tempObjectType, xmlHttp, xmlParserObj; for (var i = 0, v = _XMLPARSER_LIBVERSIONS, l = v.length; i < l; i++) { libVersion = v[i], libraryName = libVersion[0], version = libVersion[1]; try { tempObjectType = _convertXMLParserObjectType(libraryName, objectType); xmlParserObj = new ActiveXObject(_getProgId(libraryName, tempObjectType, version)); _getXMLParserActiveXControl.libraryName = libraryName; _getXMLParserActiveXControl.version = version; return xmlParserObj; } catch (e) { } } } function _getXMLHttpRequest() { var request = null; try { if (window.XMLHttpRequest) { request = new XMLHttpRequest(); } else { request = _getXMLParserActiveXControl('XMLHTTP'); } } catch (e) { request = null; } return request; } function _loadXMLDocFromString(text) { var xmlDoc = null; if (text) { if (window.DOMParser) { var parser = new DOMParser(); xmlDoc = parser.parseFromString(text, 'text/xml'); if (xmlDoc.documentElement.nodeName == 'parsererror') { xmlDoc = null; } } else { xmlDoc = _getXMLParserActiveXControl('DOMDocument'); if (xmlDoc) { xmlDoc.async = false; loaded = xmlDoc.loadXML(text); if (!loaded) { xmlDoc = null; } } } } return xmlDoc; } function _setRequestHeaders(request, headers) { try { for (var header in headers) { request.setRequestHeader(header, headers[header]); } } catch (e) { } } function _extractResponseHeaders(headersText) { var values = headersText.split(_RESPONSE_HEADERS_DELIMITER); var headers = {}; var l = headers.length; if (l) { var i = 0; do { headers[values[i++]] = values[i++]; } while (i < l); } return headers; } function _XMLHttpResponse(request) { this.status = request.status; this.statusText = request.statusText; this.responseText = request.responseText; responseXML = request.responseXML; if (!responseXML || !responseXML.documentElement) { responseXML = _loadXMLDocFromString(this.responseText); } this.responseXML = responseXML; this._headersText = request.getAllResponseHeaders(); this._headers = null; } _XMLHttpResponse.prototype = { getResponseHeader: function (header) { if (!this._headers) { this._headers = _extractResponseHeaders(this._headersText); } return this._headers[header]; }, getAllResponseHeaders: function () { return this._headersText; } }; function _XMLHttpWrapper(url, options) { this.url = url; this.setOptions(options); this._statesHandled = {}; var self = this; this._handleRequestChange = function () { try { var readyState = self.request.readyState; } catch (e) { self.onRequestError(e); } switch (readyState) { case 0: { self._performCallback('onUninitialized'); break; } case 1: { self._performCallback('onLoading'); break; } case 2: { self._performCallback('onLoaded'); break; } case 3: { self._performCallback('onInteractive'); break; } case 4: { self._onRequestStateCompleted(); break; } } }; } _XMLHttpWrapper.prototype = { PROXY_URL: _PROXY_URL, setOptions: function (options) { if (typeof (options) != 'object' || options instanceof Array) { options = {}; } options.async = true; if (!_METHODS[options.method]) { options.method = _METHOD_DEFAULT; } if (!options.requestHeaders) { options.requestHeaders = {}; } if (options.method == 'POST') { if (!options.postData) { options.postData = ''; } if (!options.requestHeaders['Content-Type']) { options.requestHeaders['Content-Type'] = _POST_MIMETYPE_DEFAULT; } } if (!options.parameters) { options.parameters = ''; } this.options = options; }, getRequestUrl: function () { var url = this.url, useProxy = false; if (!url || typeof (url) != 'string') { return null; } var domainStart = url.indexOf('//'), slashIndex = url.indexOf('/'), urlLen = url.length; var hostEnd = (slashIndex > -1) ? slashIndex : urlLen; if (domainStart > -1 || (url.substring(0, hostEnd)).indexOf('.') > -1) { var protocol = url.substring(0, url.indexOf(':') + 1); if (protocol && protocol != window.location.protocol) { useProxy = true; } else { var domainEnd = url.indexOf('/', domainStart + 2); domainStart = (domainStart != -1) ? domainStart + 2 : 0, domainEnd = (domainEnd != -1) ? domainEnd : urlLen; var domain = url.substring(domainStart, domainEnd); if (window.location.host != domain) { useProxy = true; } } } var separator = (url.indexOf('?') == -1) ? '?' : '&'; var options = this.options; if (options.method == 'GET') { var parameters = this.getRequestParameters(); if (parameters.length) { url += separator + parameters; } } var fullUrl = ''; if (useProxy) { url = _encodeURIComponent(url); fullUrl += this.PROXY_URL; var separator = (fullUrl.indexOf('?') == -1) ? '?' : '&'; var parameters = this.getRequestParameters('proxyParameters'); if (parameters.length) { fullUrl += separator + parameters; separator = '&'; } fullUrl += separator + _PROXY_PARAM_URL + '='; } fullUrl += url; var separator = (fullUrl.indexOf('?') == -1) ? '?' : '&'; fullUrl += separator + 'rand=' + (Math.floor(Math.random() * 999999)); return fullUrl; }, getRequestParameters: function (type) { var parameters = (type != 'proxyParameters') ? this.options['parameters'] : this.options['proxyParameters']; var paramsTypeOf = typeof (parameters); var paramsStr = ''; if (parameters && paramsTypeOf == 'string') { var params = parameters.split('&'); for (var i = 0, l = params.length, param; i < l; i++) { param = params[i].split('='); paramsStr += '&' + _encodeURIComponent(param[0]) + '=' + _encodeURIComponent(param[1]); } } else if (paramsTypeOf == 'object' && !(parameters instanceof Array)) { for (var key in parameters) { paramsStr += '&' + _encodeURIComponent(key) + '=' + _encodeURIComponent(parameters[key]); } } if (paramsStr) { paramsStr = paramsStr.substr(1); } return paramsStr; }, makeRequest: function () { try { var request = _getXMLHttpRequest(); if (request) { var url = this.getRequestUrl(); if (url) { this.request = request; var options = this.options, method = options.method, headers = options.requestHeaders; var content = null; if (method == 'POST') { content = options.postData; if (headers.mimetype == _POST_MIMETYPE_DEFAULT) { var parameters = this.getRequestParameters(); if (parameters) { if (content) { content += '&'; } content += parameters; } } headers['Content-Length'] = content.length; headers['Connection'] = 'close'; } request.onreadystatechange = this._handleRequestChange; if (typeof (WNClosureTracker) != 'undefined') { WNClosureTracker.add(this.request, 'onreadystatechange', true); WNClosureTracker.add(this, 'request'); } request.open(method, url, options.async); _setRequestHeaders(request, headers); request.send(content); } else { throw new Error('Invalid request url'); } } else { throw new Error('XMLHTTPRequest not supported by this browser'); } } catch (e) { this.onRequestError(e); } }, _performCallback: function (name) { try { if (this._statesHandled[name]) { return; } this._statesHandled[name] = true; var callback = this.options[name]; if (callback) { var handler, args = []; if (typeof (callback) == 'function') { handler = callback; } else if (callback instanceof Array) { handler = callback[0]; if (callback.length > 1) { args = callback[1]; } } else if (typeof (callback) == 'object') { handler = callback.callback; if (typeof (callback.args) != 'undefined') { args = callback.args; } } if (!(args instanceof Array)) { args = [args]; } if (arguments.length > 1) { var al = args.length; for (var i = 1, l = arguments.length; i < l; i++) { args[al++] = arguments[i]; } } if (typeof (handler) == 'function') { if (handler.apply) { handler.apply(this, args); } else { var arg; for (var i = 0, l = args.length, arg; i < l; i++) { arg = args[i]; if (typeof (arg) == 'string') { args[i] = "'" + arg + "'"; } } eval('handler(' + args.toString() + ')'); } } } } catch (e) { if (name != 'onError') { this.onRequestError(e); } else { } } }, onRequestError: function (e) { this.errorMessage = (e.message || e); this._performCallback('onError', e); }, _onRequestStateCompleted: function () { try { if (this._statesHandled['onCompleted']) { return; } this.response = new _XMLHttpResponse(this.request); this._performCallback('onCompleted'); var status = this.response.status; delete this.request['onreadystatechange']; this.request = null; if (status == 200 || status == 304) { this._performCallback('onSuccess'); } else { throw new Error('XMLHTTPRequest status was ' + status); } } catch (e) { this.onRequestError(e); } } }; var Manager = { Handlers: {}, makeRequest: function (url, options) { var xmlHttpRequest = new _XMLHttpWrapper(url, options); xmlHttpRequest.makeRequest(); return xmlHttpRequest; }, transferNodeData: function (parent, nodeName, target) { var result = false; try { var source = parent.getElementsByTagName(nodeName); source = (source.length) ? source[0] : this.retrieveChildElement(parent, nodeName); if (source) { var hasInnerHTML = typeof (target.innerHTML) != 'undefined'; var nLen = source.childNodes.length; if (hasInnerHTML && nLen == 1) { target.innerHTML = source.firstChild.nodeValue; result = true; } else if (hasInnerHTML && typeof (source.xml) != 'undefined' && nLen) { if (nLen == 1) { target.innerHTML = source.firstChild.xml; } else { var htmlStr = ''; var child = source.firstChild; if (child) { do { htmlStr += child.xml; } while (child = child.nextSibling); } target.innerHTML = htmlStr; } result = true; } else { try { target.appendChild(wng_doc.importNode(source, true)); result = true; } catch (e) { } } } } catch (e) { } if (!result && target && target.style) { target.style.display = 'none'; } return result; }, retrieveChildElement: function (parent, nodeName) { if (!parent.childNamesIndex) { parent.childNamesIndex = { _index: 0 }; } var namesIndex = parent.childNamesIndex; var nIndex = (!recalculate) ? namesIndex._index : 0; var nodes = parent.childNodes, nLen = nodes.length; if (nIndex === nLen) { var cIndex = namesIndex[nodeName]; return (typeof (cIndex) == 'number') ? nodes[cIndex] : null; } var node; while (nIndex < nLen) { node = nodes[nIndex]; if (node.nodeType === 1) { namesIndex[node.nodeName] = nIndex; if (node.nodeName === nodeName) { break; } } nIndex++; } namesIndex._index = nIndex; parent.childNamesIndex = namesIndex; var cIndex = namesIndex[nodeName]; return (typeof (cIndex == 'number')) ? nodes[cIndex] : null; } }; Manager.Handlers.RSS = function () { var _RSS_TARGET_DEFAULT = '_blank'; var _RSS_REQUIRED_NODES_DEFAULT = { link: 1, title: 1 }; function _createItemStructure(target) { var item = wng_doc.createElement('DIV'); item.className = 'rssItem'; var href = wng_doc.createElement('A'); href.setAttribute('target', target); item.appendChild(href); var desc = wng_doc.createElement('DIV'); desc.className = 'rssItemDesc'; item.appendChild(desc); return item; } return { onSuccess: function (targetId, options) { try { if (!options) { options = {}; } var wrapper = wng_doc.getElementById(targetId); if (options.clearTarget) { var child = wrapper.firstChild; while (child) { wrapper.removeChild(child); child = wrapper.firstChild; } } var xmlDoc = this.response.responseXML; var nodes = xmlDoc.documentElement.getElementsByTagName('item'), nLen = nodes.length; if (nLen == 0 && options.hideEmpty) { return; } var limit = options.limit; if (typeof (limit) != 'number' || limit > nLen) { limit = nLen; } var bucket = wng_doc.createElement('DIV'); bucket.className = 'rssBucket'; var header = wng_doc.createElement('DIV'); header.className = 'rssHeader'; var oHeader = options.header; if (oHeader) { if (typeof (header.innerHTML) != 'undefined') { header.innerHTML = oHeader; } else { oHeader = (oHeader.nodeType) ? oHeader.cloneNode(true) : wng_doc.createTextNode(oHeader); header.appendChild(oHeader); } } var footer = wng_doc.createElement('DIV'); footer.className = 'rssFooter'; var oFooter = options.footer; if (oFooter) { if (typeof (footer.innerHTML) != 'undefined') { footer.innerHTML = oFooter; } else { oFooter = (oFooter.nodeType) ? oFooter.cloneNode(true) : wng_doc.createTextNode(oFooter); footer.appendChild(oFooter); } } var items = wng_doc.createElement('DIV'); items.className = 'rssItems'; var displayWhileLoading = options.displayWhileLoading; if (displayWhileLoading) { bucket.appendChild(header); bucket.appendChild(items); wrapper.appendChild(bucket); } var itemClone = _createItemStructure(options.target || _RSS_TARGET_DEFAULT); var requiredNodes = options.requiredNodes || _RSS_REQUIRED_NODES_DEFAULT; var transfer = WNHttpRequestManager.transferNodeData; var retrieve = WNHttpRequestManager.retrieveChildElement; for (var i = 0, node, item, linkVal; i < limit; i++) { node = nodes[i]; item = itemClone.cloneNode(true); linkVal = node.getElementsByTagName('link'); linkVal = (linkVal.length) ? linkVal[0] : retrieve(node, 'link'); linkVal = (linkVal) ? linkVal.firstChild : null; if (linkVal && linkVal.nodeValue) { item.firstChild.setAttribute('href', linkVal.nodeValue); } else if (requiredNodes['link']) { continue; } if (!transfer(node, 'title', item.firstChild) && requiredNodes['title']) { continue; } if (!transfer(node, 'description', item.lastChild) && requiredNodes['description']) { continue; } items.appendChild(item); } if (!displayWhileLoading) { bucket.appendChild(header); bucket.appendChild(items); } bucket.appendChild(footer); if (!displayWhileLoading) { wrapper.appendChild(bucket); } } catch (e) { this.onRequestError(e); } }, onError: function (targetId, options, e) { try { if (!options) { options = {}; } if (options.hideTarget) { var wrapper = wng_doc.getElementById(targetId); wrapper.style.display = 'none'; } } catch (e) { } } }; } (); return Manager; } ();

/*! jCarousel - v0.3.3 - 2015-02-28
* http://sorgalla.com/jcarousel/
* Copyright (c) 2006-2015 Jan Sorgalla; Licensed MIT */
(function (t) { "use strict"; var i = t.jCarousel = {}; i.version = "0.3.3"; var s = /^([+\-]=)?(.+)$/; i.parseTarget = function (t) { var i = !1, e = "object" != typeof t ? s.exec(t) : null; return e ? (t = parseInt(e[2], 10) || 0, e[1] && (i = !0, "-=" === e[1] && (t *= -1))) : "object" != typeof t && (t = parseInt(t, 10) || 0), { target: t, relative: i} }, i.detectCarousel = function (t) { for (var i; t.length > 0; ) { if (i = t.filter("[data-jcarousel]"), i.length > 0) return i; if (i = t.find("[data-jcarousel]"), i.length > 0) return i; t = t.parent() } return null }, i.base = function (s) { return { version: i.version, _options: {}, _element: null, _carousel: null, _init: t.noop, _create: t.noop, _destroy: t.noop, _reload: t.noop, create: function () { return this._element.attr("data-" + s.toLowerCase(), !0).data(s, this), !1 === this._trigger("create") ? this : (this._create(), this._trigger("createend"), this) }, destroy: function () { return !1 === this._trigger("destroy") ? this : (this._destroy(), this._trigger("destroyend"), this._element.removeData(s).removeAttr("data-" + s.toLowerCase()), this) }, reload: function (t) { return !1 === this._trigger("reload") ? this : (t && this.options(t), this._reload(), this._trigger("reloadend"), this) }, element: function () { return this._element }, options: function (i, s) { if (0 === arguments.length) return t.extend({}, this._options); if ("string" == typeof i) { if (s === void 0) return this._options[i] === void 0 ? null : this._options[i]; this._options[i] = s } else this._options = t.extend({}, this._options, i); return this }, carousel: function () { return this._carousel || (this._carousel = i.detectCarousel(this.options("carousel") || this._element), this._carousel || t.error('Could not detect carousel for plugin "' + s + '"')), this._carousel }, _trigger: function (i, e, r) { var n, o = !1; return r = [this].concat(r || []), (e || this._element).each(function () { n = t.Event((s + ":" + i).toLowerCase()), t(this).trigger(n, r), n.isDefaultPrevented() && (o = !0) }), !o } } }, i.plugin = function (s, e) { var r = t[s] = function (i, s) { this._element = t(i), this.options(s), this._init(), this.create() }; return r.fn = r.prototype = t.extend({}, i.base(s), e), t.fn[s] = function (i) { var e = Array.prototype.slice.call(arguments, 1), n = this; return "string" == typeof i ? this.each(function () { var r = t(this).data(s); if (!r) return t.error("Cannot call methods on " + s + " prior to initialization; " + 'attempted to call method "' + i + '"'); if (!t.isFunction(r[i]) || "_" === i.charAt(0)) return t.error('No such method "' + i + '" for ' + s + " instance"); var o = r[i].apply(r, e); return o !== r && o !== void 0 ? (n = o, !1) : void 0 }) : this.each(function () { var e = t(this).data(s); e instanceof r ? e.reload(i) : new r(this, i) }), n }, r } })(jQuery), function (t, i) { "use strict"; var s = function (t) { return parseFloat(t) || 0 }; t.jCarousel.plugin("jcarousel", { animating: !1, tail: 0, inTail: !1, resizeTimer: null, lt: null, vertical: !1, rtl: !1, circular: !1, underflow: !1, relative: !1, _options: { list: function () { return this.element().children().eq(0) }, items: function () { return this.list().children() }, animation: 400, transitions: !1, wrap: null, vertical: null, rtl: null, center: !1 }, _list: null, _items: null, _target: t(), _first: t(), _last: t(), _visible: t(), _fullyvisible: t(), _init: function () { var t = this; return this.onWindowResize = function () { t.resizeTimer && clearTimeout(t.resizeTimer), t.resizeTimer = setTimeout(function () { t.reload() }, 100) }, this }, _create: function () { this._reload(), t(i).on("resize.jcarousel", this.onWindowResize) }, _destroy: function () { t(i).off("resize.jcarousel", this.onWindowResize) }, _reload: function () { this.vertical = this.options("vertical"), null == this.vertical && (this.vertical = this.list().height() > this.list().width()), this.rtl = this.options("rtl"), null == this.rtl && (this.rtl = function (i) { if ("rtl" === ("" + i.attr("dir")).toLowerCase()) return !0; var s = !1; return i.parents("[dir]").each(function () { return /rtl/i.test(t(this).attr("dir")) ? (s = !0, !1) : void 0 }), s } (this._element)), this.lt = this.vertical ? "top" : "left", this.relative = "relative" === this.list().css("position"), this._list = null, this._items = null; var i = this.index(this._target) >= 0 ? this._target : this.closest(); this.circular = "circular" === this.options("wrap"), this.underflow = !1; var s = { left: 0, top: 0 }; return i.length > 0 && (this._prepare(i), this.list().find("[data-jcarousel-clone]").remove(), this._items = null, this.underflow = this._fullyvisible.length >= this.items().length, this.circular = this.circular && !this.underflow, s[this.lt] = this._position(i) + "px"), this.move(s), this }, list: function () { if (null === this._list) { var i = this.options("list"); this._list = t.isFunction(i) ? i.call(this) : this._element.find(i) } return this._list }, items: function () { if (null === this._items) { var i = this.options("items"); this._items = (t.isFunction(i) ? i.call(this) : this.list().find(i)).not("[data-jcarousel-clone]") } return this._items }, index: function (t) { return this.items().index(t) }, closest: function () { var i, e = this, r = this.list().position()[this.lt], n = t(), o = !1, l = this.vertical ? "bottom" : this.rtl && !this.relative ? "left" : "right"; return this.rtl && this.relative && !this.vertical && (r += this.list().width() - this.clipping()), this.items().each(function () { if (n = t(this), o) return !1; var a = e.dimension(n); if (r += a, r >= 0) { if (i = a - s(n.css("margin-" + l)), !(0 >= Math.abs(r) - a + i / 2)) return !1; o = !0 } }), n }, target: function () { return this._target }, first: function () { return this._first }, last: function () { return this._last }, visible: function () { return this._visible }, fullyvisible: function () { return this._fullyvisible }, hasNext: function () { if (!1 === this._trigger("hasnext")) return !0; var t = this.options("wrap"), i = this.items().length - 1, s = this.options("center") ? this._target : this._last; return i >= 0 && !this.underflow && (t && "first" !== t || i > this.index(s) || this.tail && !this.inTail) ? !0 : !1 }, hasPrev: function () { if (!1 === this._trigger("hasprev")) return !0; var t = this.options("wrap"); return this.items().length > 0 && !this.underflow && (t && "last" !== t || this.index(this._first) > 0 || this.tail && this.inTail) ? !0 : !1 }, clipping: function () { return this._element["inner" + (this.vertical ? "Height" : "Width")]() }, dimension: function (t) { return t["outer" + (this.vertical ? "Height" : "Width")](!0) }, scroll: function (i, s, e) { if (this.animating) return this; if (!1 === this._trigger("scroll", null, [i, s])) return this; t.isFunction(s) && (e = s, s = !0); var r = t.jCarousel.parseTarget(i); if (r.relative) { var n, o, l, a, h, u, c, f, d = this.items().length - 1, _ = Math.abs(r.target), p = this.options("wrap"); if (r.target > 0) { var g = this.index(this._last); if (g >= d && this.tail) this.inTail ? "both" === p || "last" === p ? this._scroll(0, s, e) : t.isFunction(e) && e.call(this, !1) : this._scrollTail(s, e); else if (n = this.index(this._target), this.underflow && n === d && ("circular" === p || "both" === p || "last" === p) || !this.underflow && g === d && ("both" === p || "last" === p)) this._scroll(0, s, e); else if (l = n + _, this.circular && l > d) { for (f = d, h = this.items().get(-1); l > f++; ) h = this.items().eq(0), u = this._visible.index(h) >= 0, u && h.after(h.clone(!0).attr("data-jcarousel-clone", !0)), this.list().append(h), u || (c = {}, c[this.lt] = this.dimension(h), this.moveBy(c)), this._items = null; this._scroll(h, s, e) } else this._scroll(Math.min(l, d), s, e) } else if (this.inTail) this._scroll(Math.max(this.index(this._first) - _ + 1, 0), s, e); else if (o = this.index(this._first), n = this.index(this._target), a = this.underflow ? n : o, l = a - _, 0 >= a && (this.underflow && "circular" === p || "both" === p || "first" === p)) this._scroll(d, s, e); else if (this.circular && 0 > l) { for (f = l, h = this.items().get(0); 0 > f++; ) { h = this.items().eq(-1), u = this._visible.index(h) >= 0, u && h.after(h.clone(!0).attr("data-jcarousel-clone", !0)), this.list().prepend(h), this._items = null; var v = this.dimension(h); c = {}, c[this.lt] = -v, this.moveBy(c) } this._scroll(h, s, e) } else this._scroll(Math.max(l, 0), s, e) } else this._scroll(r.target, s, e); return this._trigger("scrollend"), this }, moveBy: function (t, i) { var e = this.list().position(), r = 1, n = 0; return this.rtl && !this.vertical && (r = -1, this.relative && (n = this.list().width() - this.clipping())), t.left && (t.left = e.left + n + s(t.left) * r + "px"), t.top && (t.top = e.top + n + s(t.top) * r + "px"), this.move(t, i) }, move: function (i, s) { s = s || {}; var e = this.options("transitions"), r = !!e, n = !!e.transforms, o = !!e.transforms3d, l = s.duration || 0, a = this.list(); if (!r && l > 0) return a.animate(i, s), void 0; var h = s.complete || t.noop, u = {}; if (r) { var c = { transitionDuration: a.css("transitionDuration"), transitionTimingFunction: a.css("transitionTimingFunction"), transitionProperty: a.css("transitionProperty") }, f = h; h = function () { t(this).css(c), f.call(this) }, u = { transitionDuration: (l > 0 ? l / 1e3 : 0) + "s", transitionTimingFunction: e.easing || s.easing, transitionProperty: l > 0 ? function () { return n || o ? "all" : i.left ? "left" : "top" } () : "none", transform: "none"} } o ? u.transform = "translate3d(" + (i.left || 0) + "," + (i.top || 0) + ",0)" : n ? u.transform = "translate(" + (i.left || 0) + "," + (i.top || 0) + ")" : t.extend(u, i), r && l > 0 && a.one("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", h), a.css(u), 0 >= l && a.each(function () { h.call(this) }) }, _scroll: function (i, s, e) { if (this.animating) return t.isFunction(e) && e.call(this, !1), this; if ("object" != typeof i ? i = this.items().eq(i) : i.jquery === void 0 && (i = t(i)), 0 === i.length) return t.isFunction(e) && e.call(this, !1), this; this.inTail = !1, this._prepare(i); var r = this._position(i), n = this.list().position()[this.lt]; if (r === n) return t.isFunction(e) && e.call(this, !1), this; var o = {}; return o[this.lt] = r + "px", this._animate(o, s, e), this }, _scrollTail: function (i, s) { if (this.animating || !this.tail) return t.isFunction(s) && s.call(this, !1), this; var e = this.list().position()[this.lt]; this.rtl && this.relative && !this.vertical && (e += this.list().width() - this.clipping()), this.rtl && !this.vertical ? e += this.tail : e -= this.tail, this.inTail = !0; var r = {}; return r[this.lt] = e + "px", this._update({ target: this._target.next(), fullyvisible: this._fullyvisible.slice(1).add(this._visible.last()) }), this._animate(r, i, s), this }, _animate: function (i, s, e) { if (e = e || t.noop, !1 === this._trigger("animate")) return e.call(this, !1), this; this.animating = !0; var r = this.options("animation"), n = t.proxy(function () { this.animating = !1; var t = this.list().find("[data-jcarousel-clone]"); t.length > 0 && (t.remove(), this._reload()), this._trigger("animateend"), e.call(this, !0) }, this), o = "object" == typeof r ? t.extend({}, r) : { duration: r }, l = o.complete || t.noop; return s === !1 ? o.duration = 0 : t.fx.speeds[o.duration] !== void 0 && (o.duration = t.fx.speeds[o.duration]), o.complete = function () { n(), l.call(this) }, this.move(i, o), this }, _prepare: function (i) { var e, r, n, o, l = this.index(i), a = l, h = this.dimension(i), u = this.clipping(), c = this.vertical ? "bottom" : this.rtl ? "left" : "right", f = this.options("center"), d = { target: i, first: i, last: i, visible: i, fullyvisible: u >= h ? i : t() }; if (f && (h /= 2, u /= 2), u > h) for (; ; ) { if (e = this.items().eq(++a), 0 === e.length) { if (!this.circular) break; if (e = this.items().eq(0), i.get(0) === e.get(0)) break; if (r = this._visible.index(e) >= 0, r && e.after(e.clone(!0).attr("data-jcarousel-clone", !0)), this.list().append(e), !r) { var _ = {}; _[this.lt] = this.dimension(e), this.moveBy(_) } this._items = null } if (o = this.dimension(e), 0 === o) break; if (h += o, d.last = e, d.visible = d.visible.add(e), n = s(e.css("margin-" + c)), u >= h - n && (d.fullyvisible = d.fullyvisible.add(e)), h >= u) break } if (!this.circular && !f && u > h) for (a = l; ; ) { if (0 > --a) break; if (e = this.items().eq(a), 0 === e.length) break; if (o = this.dimension(e), 0 === o) break; if (h += o, d.first = e, d.visible = d.visible.add(e), n = s(e.css("margin-" + c)), u >= h - n && (d.fullyvisible = d.fullyvisible.add(e)), h >= u) break } return this._update(d), this.tail = 0, f || "circular" === this.options("wrap") || "custom" === this.options("wrap") || this.index(d.last) !== this.items().length - 1 || (h -= s(d.last.css("margin-" + c)), h > u && (this.tail = h - u)), this }, _position: function (t) { var i = this._first, s = i.position()[this.lt], e = this.options("center"), r = e ? this.clipping() / 2 - this.dimension(i) / 2 : 0; return this.rtl && !this.vertical ? (s -= this.relative ? this.list().width() - this.dimension(i) : this.clipping() - this.dimension(i), s += r) : s -= r, !e && (this.index(t) > this.index(i) || this.inTail) && this.tail ? (s = this.rtl && !this.vertical ? s - this.tail : s + this.tail, this.inTail = !0) : this.inTail = !1, -s }, _update: function (i) { var s, e = this, r = { target: this._target, first: this._first, last: this._last, visible: this._visible, fullyvisible: this._fullyvisible }, n = this.index(i.first || r.first) < this.index(r.first), o = function (s) { var o = [], l = []; i[s].each(function () { 0 > r[s].index(this) && o.push(this) }), r[s].each(function () { 0 > i[s].index(this) && l.push(this) }), n ? o = o.reverse() : l = l.reverse(), e._trigger(s + "in", t(o)), e._trigger(s + "out", t(l)), e["_" + s] = i[s] }; for (s in i) o(s); return this } }) } (jQuery, window), function (t) { "use strict"; t.jcarousel.fn.scrollIntoView = function (i, s, e) { var r, n = t.jCarousel.parseTarget(i), o = this.index(this._fullyvisible.first()), l = this.index(this._fullyvisible.last()); if (r = n.relative ? 0 > n.target ? Math.max(0, o + n.target) : l + n.target : "object" != typeof n.target ? n.target : this.index(n.target), o > r) return this.scroll(r, s, e); if (r >= o && l >= r) return t.isFunction(e) && e.call(this, !1), this; for (var a, h = this.items(), u = this.clipping(), c = this.vertical ? "bottom" : this.rtl ? "left" : "right", f = 0; ; ) { if (a = h.eq(r), 0 === a.length) break; if (f += this.dimension(a), f >= u) { var d = parseFloat(a.css("margin-" + c)) || 0; f - d !== u && r++; break } if (0 >= r) break; r-- } return this.scroll(r, s, e) } } (jQuery), function (t) { "use strict"; t.jCarousel.plugin("jcarouselControl", { _options: { target: "+=1", event: "click", method: "scroll" }, _active: null, _init: function () { this.onDestroy = t.proxy(function () { this._destroy(), this.carousel().one("jcarousel:createend", t.proxy(this._create, this)) }, this), this.onReload = t.proxy(this._reload, this), this.onEvent = t.proxy(function (i) { i.preventDefault(); var s = this.options("method"); t.isFunction(s) ? s.call(this) : this.carousel().jcarousel(this.options("method"), this.options("target")) }, this) }, _create: function () { this.carousel().one("jcarousel:destroy", this.onDestroy).on("jcarousel:reloadend jcarousel:scrollend", this.onReload), this._element.on(this.options("event") + ".jcarouselcontrol", this.onEvent), this._reload() }, _destroy: function () { this._element.off(".jcarouselcontrol", this.onEvent), this.carousel().off("jcarousel:destroy", this.onDestroy).off("jcarousel:reloadend jcarousel:scrollend", this.onReload) }, _reload: function () { var i, s = t.jCarousel.parseTarget(this.options("target")), e = this.carousel(); if (s.relative) i = e.jcarousel(s.target > 0 ? "hasNext" : "hasPrev"); else { var r = "object" != typeof s.target ? e.jcarousel("items").eq(s.target) : s.target; i = e.jcarousel("target").index(r) >= 0 } return this._active !== i && (this._trigger(i ? "active" : "inactive"), this._active = i), this } }) } (jQuery), function (t) { "use strict"; t.jCarousel.plugin("jcarouselPagination", { _options: { perPage: null, item: function (t) { return '<a href="#' + t + '">' + t + "</a>" }, event: "click", method: "scroll" }, _carouselItems: null, _pages: {}, _items: {}, _currentPage: null, _init: function () { this.onDestroy = t.proxy(function () { this._destroy(), this.carousel().one("jcarousel:createend", t.proxy(this._create, this)) }, this), this.onReload = t.proxy(this._reload, this), this.onScroll = t.proxy(this._update, this) }, _create: function () { this.carousel().one("jcarousel:destroy", this.onDestroy).on("jcarousel:reloadend", this.onReload).on("jcarousel:scrollend", this.onScroll), this._reload() }, _destroy: function () { this._clear(), this.carousel().off("jcarousel:destroy", this.onDestroy).off("jcarousel:reloadend", this.onReload).off("jcarousel:scrollend", this.onScroll), this._carouselItems = null }, _reload: function () { var i = this.options("perPage"); if (this._pages = {}, this._items = {}, t.isFunction(i) && (i = i.call(this)), null == i) this._pages = this._calculatePages(); else for (var s, e = parseInt(i, 10) || 0, r = this._getCarouselItems(), n = 1, o = 0; ; ) { if (s = r.eq(o++), 0 === s.length) break; this._pages[n] = this._pages[n] ? this._pages[n].add(s) : s, 0 === o % e && n++ } this._clear(); var l = this, a = this.carousel().data("jcarousel"), h = this._element, u = this.options("item"), c = this._getCarouselItems().length; t.each(this._pages, function (i, s) { var e = l._items[i] = t(u.call(l, i, s)); e.on(l.options("event") + ".jcarouselpagination", t.proxy(function () { var t = s.eq(0); if (a.circular) { var e = a.index(a.target()), r = a.index(t); parseFloat(i) > parseFloat(l._currentPage) ? e > r && (t = "+=" + (c - e + r)) : r > e && (t = "-=" + (e + (c - r))) } a[this.options("method")](t) }, l)), h.append(e) }), this._update() }, _update: function () { var i, s = this.carousel().jcarousel("target"); t.each(this._pages, function (t, e) { return e.each(function () { return s.is(this) ? (i = t, !1) : void 0 }), i ? !1 : void 0 }), this._currentPage !== i && (this._trigger("inactive", this._items[this._currentPage]), this._trigger("active", this._items[i])), this._currentPage = i }, items: function () { return this._items }, reloadCarouselItems: function () { return this._carouselItems = null, this }, _clear: function () { this._element.empty(), this._currentPage = null }, _calculatePages: function () { for (var t, i, s = this.carousel().data("jcarousel"), e = this._getCarouselItems(), r = s.clipping(), n = 0, o = 0, l = 1, a = {}; ; ) { if (t = e.eq(o++), 0 === t.length) break; i = s.dimension(t), n + i > r && (l++, n = 0), n += i, a[l] = a[l] ? a[l].add(t) : t } return a }, _getCarouselItems: function () { return this._carouselItems || (this._carouselItems = this.carousel().jcarousel("items")), this._carouselItems } }) } (jQuery), function (t) { "use strict"; t.jCarousel.plugin("jcarouselAutoscroll", { _options: { target: "+=1", interval: 3e3, autostart: !0 }, _timer: null, _init: function () { this.onDestroy = t.proxy(function () { this._destroy(), this.carousel().one("jcarousel:createend", t.proxy(this._create, this)) }, this), this.onAnimateEnd = t.proxy(this.start, this) }, _create: function () { this.carousel().one("jcarousel:destroy", this.onDestroy), this.options("autostart") && this.start() }, _destroy: function () { this.stop(), this.carousel().off("jcarousel:destroy", this.onDestroy) }, start: function () { return this.stop(), this.carousel().one("jcarousel:animateend", this.onAnimateEnd), this._timer = setTimeout(t.proxy(function () { this.carousel().jcarousel("scroll", this.options("target")) }, this), this.options("interval")), this }, stop: function () { return this._timer && (this._timer = clearTimeout(this._timer)), this.carousel().off("jcarousel:animateend", this.onAnimateEnd), this } }) } (jQuery);


document.write('<script type="text/javascript" src="http://ftpcontent.worldnow.com/professionalservices/clients/wvir/mostpopular2015.js"></script>');
document.write('<script type="text/javascript" src="http://WBBH.images.worldnow.com/interface/js/WNVideo.js"></script>');

var MostPopularStoriesCategoryNumber = "188685";
var MostPopularVideosCategoryNumber = "188686";
var MostPopularNumberOfItems = "5";
var FeaturedVideoFormat = false;
var MPslideshowURL = "/category/310438/slideshows";
var VideoLandingPage = "";
var zipcode = ['22901','24402','22963'];
var nameZipcode = ['Charlottesville', 'Staunton', 'Fluvanna'];
var CDEVWVIR = {
  defaultImg: 'http://WBBH.images.worldnow.com/images/10871178_G.jpg',

  newsTeamSocialInfo: {
      debfarris : ['https://www.facebook.com/KAKEDebFarris/','https://twitter.com/deb_farris','mailto:DFarris@kake.com'],
      jimgrimes : ['https://www.facebook.com/KAKETV','https://twitter.com/KAKEnews','mailto:jgrimes@kake.com'],
      jaypratercbm : ['https://www.facebook.com/JayPraterCBM/','https://twitter.com/JayPraterCBM','mailto:jay.prater@kake.com'],
      jemelleholopirek : ['https://www.facebook.com/jemelle.holopirek/','https://twitter.com/jemellegmk','mailto:JHolopirek@kake.com'],
      alysonacklin : ['https://www.facebook.com/alysonacklinkake/','https://twitter.com/AlysonAcklin','mailto:aacklin@kake.com'],
      shaneewing : ['https://www.facebook.com/KAKE-Shane-Ewing-133398763391920/','https://twitter.com/ShaneEwing','mailto:sewing@kake.com'],
      jakeschlegel : ['https://www.facebook.com/KAKETV','https://twitter.com/Jake_Schlegel','mailto:jschlegel@kake.com'],
      benpringlecbm : ['https://www.facebook.com/KAKETV','https://twitter.com/KAKEnews','mailto:bpringle@kake.com'],
      chrisstanford : ['https://www.facebook.com/ChrisStanfordKAKE/','https://twitter.com/ChrisAStanford','mailto:Cstanford@kake.com'],
      lilywu : ['https://www.facebook.com/kslilywu/','https://twitter.com/KansasLily','mailto:lwu@kake.com']
  },

  sportsTeamSocialInfo: {
      mattloveless : ['https://www.facebook.com/Matt-Loveless-WAND-Today-164341706984031/','https://twitter.com/MattLoveless','mailto:news@wandtv.com'],
      noahnewman : ['https://www.facebook.com/wandtv/','https://twitter.com/NoahNewmanWAND','mailto:noah.newman@wandtv.com'],
  },

  wxTeamSocialInfo: {
      robertvanwinkle : ['https://www.facebook.com/RobertVanWinkleWx','https://twitter.com/RVWweather','mailto:weather@nbc-2.com'],
      haleywebb : ['https://www.facebook.com/MeteorologistHaleyWebb','https://twitter.com/HaleyWebbWx','mailto:weather@nbc-2.com'],
      jasondunning : ['https://www.facebook.com/JasonDunningWx','https://twitter.com/JasonDunning','mailto:weather@nbc-2.com'],
      robduns : ['https://www.facebook.com/pages/Rob-Duns/192542820796943','https://twitter.com/RobDunsTV','mailto:weather@nbc-2.com'],
      kristenkirchhaine : ['https://www.facebook.com/KristenKirchhaineWx/','https://twitter.com/KristenWeather','mailto:weather@nbc-2.com']
  },

  breakingNews: function(){
    var $tgt = $wn('.displaysize-30.breaking-news-a');

    if($tgt.find('.item').length > 1){
      $tgt.addClass('multiple-item');
      $tgt.find('.item:first').append('<ul class="related-items"></ul>');
    } else {
      $tgt.addClass('single-item');
    }

    $tgt.find('.item').each(function(x){
      if(x>0){
        $(this).addClass('other-item');
        $(this).appendTo($tgt.find('.related-items'));
      }
      if(x>2){
        $(this).addClass('hidden-item');
      }
      if($(this).find('.image > img').length > 0){
        $(this).addClass('has-image');
      }
    })

    return;
  },

  breakingNewsAPI: function(){

    function WNGetRSS(rssURL) {
        function rssInitContent() {
            rssParseXML(this);
        }

        function rssErrorFunction(e) {}

        function makeRSSRequest() {
            WNHttpRequestManager.makeRequest(rssURL, {
                onSuccess: rssInitContent,
                onError: rssErrorFunction
            });
        };

        makeRSSRequest();

        function rssParseXML(xml) {
            var fullFeed = xml.response.responseXML,
              stories = $(fullFeed).find("item").length,
              buildContainer = '';

              if(stories > 0){
                buildContainer += '<section class="block displaysize-30 wnclear breaking-news-a single-item" id="breaking-news-api">';
                buildContainer += '<ul class="group ">';
                buildContainer += '<li class="item wnclear story">';
                buildContainer += '<a href="' + $(fullFeed).find("item:first link").text() +'" class="headline"><h4>' + $(fullFeed).find("item:first title").text() + '</h4></a>';
                buildContainer += '</li>';
                buildContainer += '</ul>';
                buildContainer += '</section>';

                $('#WNCols234-5').before(buildContainer);
                $('#breaking-news-api').show();
              }
        }
    }

    WNGetRSS('/category/315521/site-wide-breaking-news?clienttype=rss');

    return;
  },

  searchTools: function(loc,mthd){
    var $tgt = $wn('#Masthead').find('.tools');

    $wn(loc)[mthd]('<ul id="col4Search"></ul>');
    $tgt.clone().appendTo($wn('#col4Search'));
    $wn('#col4Search').find('input.text').attr('placeholder','Search Our Site');
    return;
  },

  socialIcons: function(){

    var socialHTML = '';
    socialHTML += '<ul id="CDEV-footer-social-icons" class="cdev-footer-social-icons">';
      socialHTML += '<li class="facebook"><a href="https://www.facebook.com/KAKETV"><i class="fa fa-facebook">Facebook</i></a></li>';
      socialHTML += '<li class="twitter"><a href="https://twitter.com/KAKEnews"><i class="fa fa-twitter">Twitter</i></a></li>';
      socialHTML += '<li class="pinterest"><a href="#"><i class="fa fa-pinterest-p">Pinterest</i></a></li>';
      socialHTML += '<li class="rss"><a href="#"><i class="fa fa-rss">RSS</i></a></li>';
      socialHTML += '<li class="contact"><a href="#"><i class="fa fa-envelope">Contact Us</i></a></li>';
    socialHTML += '</ul>';

    $('.simple-a.main').prepend(socialHTML);
    return;
  },

  sectionBlockDefaultImg: function(ds,dImg){
    $(ds).each(function(){
      var $item = $(this);
      if($item.find('.image img').length === 0){
        $item.find('.image').html('<img src="' + dImg + '" alt="" title="" border="0" width="90" class="wnImage wnImageLeft wnImageWidth-90">');
      }
    });
    return;
  },

  homepage: function(){
  	if($('body').hasClass('wnMobile')){
  		$wn('#WNCol2 #DisplaySizeId-20').after('<div id="home-feature" class="clearfix"><div id="col4-section"></div></div>');
  	} else {
  		$wn('#WNCol23').before('<div id="home-feature" class="clearfix"><div id="col23-section"></div><div id="col4-section"></div></div>');
      	CDEVWVIR.tsrConfig('home',4,0,CDEVWVIR.defaultImg,false,'five-main');
      	$wn('#home-tsr').appendTo($wn('#col23-section'));
  	}
      	CDEVWVIR.searchTools('#col4-section','append');
      	$wn('#col4-section').append('<div id="home-live-player" class="clearfix"><div class="header clearfix"><a href="/category/300756/nbc2-247-streaming-video">Live Stream</a></div><div><iframe src="http://livestream.com/accounts/1140/events/4105198/player?width=296&height=167&autoPlay=false&mute=false" width="296" height="167" frameborder="0" scrolling="no"></iframe></div><div><a href="/category/300756/nbc2-247-streaming-video">Click here for the large player.</a></div></div><script type=\'text/javascript\' src=\'http://api.worldnow.com/feed/v2.0/widgets/192034?alt=js&contextaffiliate=505\'></script>');
        $wn('#divWNWidgetsContainer192034').appendTo('#col4-section');
  },

  tsrConfig: function (tClass,tItem,oItem,dImg,rotate,dType) {
    var $tgt = $('.displaysize-20.rotate-a'),
      timer;

    $tgt.removeClass('rotate-a').addClass('tsr').addClass(tClass + '-tsr').attr('id',tClass + '-tsr').addClass(dType);

    if($tgt.find('.item').length > 1){
      $tgt.find('.item:lt(' + tItem + ')').addClass('item-main');
      $tgt.find('.item:gt(' + (tItem-1) + ')').addClass('item-hidden');
      if(oItem > 0){
        var overflowFrame = '<section id="displaysize-20-overflow" class="block displaysize-20 wnclear"><ul class="group rotate-a-overflow"></ul></section>';
        if($wn('#WNAd1').length > 0){
          $wn('#WNAd1').after(overflowFrame);
        } else {
          $tgt.after(overflowFrame);
        }
        $tgt.find('.item-hidden:lt(' + oItem + ')').clone().appendTo($('#displaysize-20-overflow').find('.rotate-a-overflow')).removeClass('item-hidden');
        $('<li class="wnItem header"><h3><span class="text siteDefault">More News</span></h3></li>').prependTo($('#displaysize-20-overflow').find('.rotate-a-overflow'));
        if($('#displaysize-20-overflow .item').length > 0){
          $('#displaysize-20-overflow .item').each(function(){
            var $item = $(this);
            /*
            if($item.parent().hasClass('rotate-a-overflow')){
              $item.append('<a class="overflow-more-link" href="' + $item.find('.headline').attr('href') + '">More</a>')
            }
            */
          });
        } else {
          $('#displaysize-20-overflow').addClass('item-hidden');
        }

      }
      if(dType === 'slideshow'){
        $tgt.find('.item-hidden').remove();
        $tgt.after('<section id="' + dType + '-thumb" class="block displaysize-20 wnclear"><ul class="group ' + dType + '-thumb"></ul></section>');
        $tgt.find('.item-main').clone().appendTo($('#' + dType + '-thumb').find('.' + dType + '-thumb'));
      }


    }

    if($tgt.find('.item').length > 0){
      if(dType === 'static'){
        var heroHTML = '<li id="" data-id="" data-type="story" class="item wnclear story hero">';
        heroHTML += '<a href="#" class="image">';
        heroHTML += '<img src="' + dImg + '" title="" border="0" width="90" alt="" class="wnImage wnImageLeft wnImageWidth-90">';
        heroHTML += '</a>';
        heroHTML += '<a href="#" class="headline">';
        heroHTML += '<h4>Loading...</h4></a>';
        heroHTML += '<summary><p></p></summary>';
        heroHTML += '</li>';

        $tgt.find('.group').prepend(heroHTML);

        $(document).ready(function(){
          CDEVWVIR.sectionBlockDefaultImg('#' + $tgt.attr('id') + ' .item',dImg);
          CDEVWVIR.sectionBlockDefaultImg('#displaysize-20-overflow .item',dImg);
          $tgt.addClass('rotate-a');
          $tgt.find('.item-main').mouseover(function(e){
            e.preventDefault();
            e.stopPropagation();
            var info = $(this).html();
            if($(this).hasClass('hasclip') || $(this).hasClass('clip')){
              $tgt.find('.hero').addClass('hasclip');
            } else {
              $tgt.find('.hero').removeClass('clip').removeClass('hasclip');
            }
            $tgt.find('.hero').html(info);
            return;
          });
          $tgt.find('.item-main:eq(0)').mouseover();
          $tgt.addClass('ready');
        });
      }
      if(dType === 'five-main'){
        $tgt.find('.item-main:eq(0)').clone().prependTo('#home-tsr > ul');
        $tgt.find('.item-main:eq(0)').addClass('hero');
        $tgt.find('.item-main').hover(function(){
          $tgt.find('.item-main:eq(0)').css('opacity', '0.3');
          var hasClip = $(this).hasClass('hasclip');
          var storyURL = $(this).find('a').attr('href');
          var imgURL = $(this).find('a.image img').attr('src');
          var headline = $(this).find('a.headline > h4').text();

          $tgt.find('.item-main:eq(0)').find('a.image').attr('href', storyURL);
          $tgt.find('.item-main:eq(0)').find('a.headline').attr('href', storyURL);
          $tgt.find('.item-main:eq(0)').find('a.image img').attr('src', imgURL);
          $tgt.find('.item-main:eq(0)').find('a.headline h4').text(headline);
          if (hasClip) {
            if (!$tgt.find('.item-main:eq(0)').hasClass('hasclip')) {
              $tgt.find('.item-main:eq(0)').addClass('hasclip');
            }
          } else {
              $tgt.find('.item-main:eq(0)').removeClass('hasclip');
          }

          $tgt.find('.item-main:eq(0)').css('opacity', '1');


        });
        $(document).ready(function(){
          $tgt.addClass('rotate-a');
          $('.item-main')
            .find('summary').dotdotdot({
                  wrap : 'word',
                  height : 85
              });

          $tgt.addClass('ready');
        });
      }
      if(dType === 'slideshow'){
        try{
          $('.item-main')
            .find('.headline h4').dotdotdot({
                  wrap : 'word',
                  height : 110
              });

          $('.item-main')
            .find('summary').dotdotdot({
                  wrap : 'word',
                  height : 85
              });
        } catch(err){
                console.log('tsr slideshow Error: ' + err.message);
        }

        $(document).ready(function(){
          $('#slideshow-thumb .slideshow-thumb').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '#' + $tgt.attr('id') + ' .group',
            dots: false,
            centerMode: false,
            focusOnSelect: true,
            asNavFor: '#' + $tgt.attr('id') + ' .group'
          });

          $('#' + $tgt.attr('id') + ' .group').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true/*,
            asNavFor: '#slideshow-thumb .slideshow-thumb'*/
          });

          $('#slideshow-thumb .slideshow-thumb .item').mouseover(function(e){
            e.preventDefault();
            e.stopPropagation();
            gotoSlide = parseInt($(this).attr('data-slick-index'),10);
            $('#' + $tgt.attr('id') + ' .group')[0].slick.slickGoTo(gotoSlide);
          });
          CDEVWVIR.sectionBlockDefaultImg('#' + $tgt.attr('id') + ' .item',dImg);
          CDEVWVIR.sectionBlockDefaultImg('#slideshow-thumb .item',dImg);
          $('#slideshow-thumb').after('<div id="slideshow-more" class="wnItem toggle cdev-more-link clearfix"><a class="wnContent more enabled" href="/category/310963/news"><span class="text">More</span></a><div class="wnClear"></div></div>');
          $tgt.addClass('ready');
          $('#slideshow-thumb').addClass('ready');
        });
      }

    } else {
      $tgt.addClass('ready');
    }

    return;
  },

  tabs: function (displayGroup, dImg, numb) {

    var toMatch = function (ds) { return ds.attr('class').match(/displaySizeId([0-9-]+)/); },
      backupImg = dImg || CDEVWVIR.defaultImg,
      $srcContainer,
      numb = numb || 4;


    if($wn(displayGroup).find('.contentGroup').length > 0){
      $wn(displayGroup).addClass('cdev-tabs');
      $srcContainer = $wn(displayGroup + '.cdev-tabs');
      $srcContainer.prepend('<ul id="cdev-tabs"></ul>');

      $srcContainer.find('.contentGroup').each(function (m) {
        var $that = $wn(this);
        $that.attr('id', 'cdev-tab-' + m).removeClass('odd').removeClass('even').removeClass('last');
        $wn('#cdev-tabs').append('<li><a href="#cdev-tab-' + m + '">' + $that.find('.header .abridgedHeadline').text() + '</a></li>');

        $that.find('.feature').each(function (item) {
          var $this = $wn(this),
            foundClass = toMatch($this),
            tURL,
            thenum;

            if (foundClass[0] !== 'displaySizeId-7') {
              $this.removeClass(foundClass[0]).addClass('displaySizeId-7');
              if($this.hasClass('odd')){
                $this.removeClass(function (index, css) {
                  return (css.match (/(^|\s)odd-\S+/g) || []).join(' ');
                }).removeClass(function (index, css) {
                  return (css.match (/(^|\s)even-\S+/g) || []).join(' ');
                });
              }
            }

              return;

        });
      });

      CDEVWVIR.swapImageHadline(displayGroup,true,dImg);

      $srcContainer.tabs({
        active: 0
      });
    }
    return;
  },

  hb2a: function (displayGroup, dImg, numb) {

    var toMatch = function (ds) { return ds.attr('class').match(/displaySizeId([0-9-]+)/); },
      backupImg = dImg || CDEVWVIR.defaultImg,
      $srcContainer,
      numb = numb || 4;

    $wn(displayGroup).addClass('cdev-hbox2a');
    $srcContainer = $wn(displayGroup + '.cdev-hbox2a');

    $srcContainer.find('.contentGroup').each(function () {
      var $that = $wn(this);
      $that.removeClass('odd').removeClass('even').removeClass('last');
      $that.find('.feature:eq(' + (numb-1) + ')').addClass('last');
      $that.find('.feature:gt(' + (numb-1) + ')').hide();
      $that.find('.feature').each(function (item) {
        var $this = $wn(this),
          foundClass = toMatch($this),
          tURL,
          thenum;

        if (item > (numb-1)) {
          return;
        };

        if(item === 0){
          if (foundClass[0] !== 'displaySizeId-7') {
            $this.removeClass(foundClass[0]).addClass('displaySizeId-7');
            if($this.hasClass('odd')){
              $this.removeClass(function (index, css) {
                return (css.match (/(^|\s)odd-\S+/g) || []).join(' ');
              }).removeClass(function (index, css) {
                return (css.match (/(^|\s)even-\S+/g) || []).join(' ');
              });
            }
          }

          if ($this.find('.summaryImage.abridged').length > 0) {
              $this.find('.summaryImage.abridged').addClass('clearfix').prependTo($this);
              $this.find('.summaryImage.abridged img').attr('src', $this.find('.summaryImage.abridged img').attr('data-path'));
          } else {
              $this.prepend('<div class="wnContent summaryImage abridged clearfix"><a href="' + $this.find('.headline.abridged a').attr('href') + '"><img border="0" data-path="' + backupImg + '" src="' + backupImg + '"></a></div>');
          }

          if ($this.find('.wn-icon-clip').length > 0 || $this.find('.wn-icon-video-included').length > 0) {
              $this.find('.summaryImage.abridged').addClass('hasVideo');
          }

            return;
        }

        if (foundClass[0] !== 'displaySizeId-4') {
          $this.removeClass(foundClass[0]).addClass('displaySizeId-4');
          $this.removeClass('odd').removeClass('even');
          if(item%2===0){
          	$this.addClass('even');
          } else {
          	$this.addClass('odd');
          }
          /*
          if($this.hasClass('odd')){
            $this.removeClass(function (index, css) {
            return (css.match (/(^|\s)odd-\S+/g) || []).join(' ');
            });
          } else {
            $this.removeClass(function (index, css) {
            return (css.match (/(^|\s)even-\S+/g) || []).join(' ');
            });
          }
          */
        }

        if(item === item.lengh - 1){
          $this.addClass('last');
        }

      });

    });

    return;

  },

  hb2b: function (displayGroup, dImg, numb) {

    var toMatch = function (ds) { return ds.attr('class').match(/displaySizeId([0-9-]+)/); },
      backupImg = dImg || CDEVWVIR.defaultImg,
      $srcContainer,
      numb = numb || 5;

    $wn(displayGroup).addClass('cdev-hbox2b');
    $srcContainer = $wn(displayGroup + '.cdev-hbox2b');

    $srcContainer.find('.contentGroup').each(function () {
      var $that = $wn(this);
      $that.removeClass('last');
      $that.find('.feature:eq(' + (numb-1) + ')').addClass('last');
      $that.find('.feature:gt(' + (numb-1) + ')').hide();
      $that.find('.feature').each(function (item) {
        var $this = $wn(this),
          foundClass = toMatch($this),
          tURL,
          thenum;

        if (item > (numb-1)) {
          return;
        };

        if (foundClass[0] !== 'displaySizeId-10') {
          $this.removeClass(foundClass[0]).addClass('displaySizeId-10');
          if($this.hasClass('odd')){
            $this.removeClass(function (index, css) {
            return (css.match (/(^|\s)odd-\S+/g) || []).join(' ');
            });
          } else {
            $this.removeClass(function (index, css) {
            return (css.match (/(^|\s)even-\S+/g) || []).join(' ');
            });
          }
        }

        if(item === item.lengh - 1){
          $this.addClass('last');
        }

      });

    });

    return;

  },

  carousel: function (displayGroup,dImg,objName,nClass) {
      var toMatch = function (ds) { return ds.attr('class').match(/displaySizeId([0-9-]+)/); },
          backupImg = dImg,
          $srcContainer;

      $wn(displayGroup).addClass('cdev-carousel').addClass(nClass);
      $srcContainer = $wn(displayGroup + '.cdev-carousel');

      $srcContainer.find('.contentGroup:gt(2)').addClass('cdev-hidden').hide();
      $srcContainer.find('.contentGroup').not('.cdev-hidden').removeClass('odd').removeClass('even').removeClass('last').addClass('cdev-carousel-group');

      $srcContainer .find('.cdev-carousel-group').each(function (i) {

          var $that = $wn(this),
              increment = (i === 2) ? 6 : 1,
              eH = (i === 2) ? 30 : 40;

          	$that.find('.feature').each(function (item) {
              var $this = $wn(this),
              tURL,
              thenum,
              buildDiv = '';
              var foundClass = toMatch($this);
              if (foundClass[0] !== 'displaySizeId-7') {
                  $this.removeClass(foundClass[0]).addClass('displaySizeId-7');
              }
              if ($this.find('.summaryImage.abridged').length > 0) {
                  $this.find('.summaryImage.abridged').prependTo($this);
                  $this.find('.summaryImage.abridged img').attr('src', $this.find('.summaryImage.abridged img').attr('data-path'));
              } else {
                  $this.prepend('<div class="wnContent summaryImage abridged"><a href="' + $this.find('.headline.abridged a').attr('href') + '"><img border="0" data-path="' + backupImg + '" src="' + backupImg + '"></a></div>');
              }
  	          if($this.find('.wn-icon-video-included').length > 0 || $this.find('.wn-icon-clip').length > 0){
	            $this.find('.summaryImage.abridged').addClass('hasClip');
	          }

              if(objName){
                var name = $this.find('.headline.abridged .text').text().toLowerCase().replace(/ /g,'').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'');
                $that.addClass('team');
	            if($this.find('.sectionTitle').length > 0){
	              $this.find('.sectionTitle').insertAfter($this.find('.headline.abridged'));
	            }

		          buildDiv += '<div class="cdev-contact-info">';
		            buildDiv += '<a class="fb" href="' + objName[name][0] + '" target="_blank">Facebook</a>';
		            buildDiv += '<a class="twitter" href="' + objName[name][1] + '" target="_blank">Twitter</a>';
		            buildDiv += '<a class="email" href="' + objName[name][2] + '" target="_blank">Email</a>';
		          buildDiv += '</div>';
		          $this.find('.wnContent:last').after(buildDiv);
        	  }

          });

          $that.find('.feature').wrapAll("<ul class='item-list' />");
          $that.find('.item-list').wrapAll("<div class='jcarousel' />");
          $that.find('.jcarousel').wrapAll("<li class='wnItem jcarousel-wrapper' />");
          $that.find('.jcarousel-wrapper').append('<a href="#" class="jcarousel-control jcarousel-control-prev">Previous</a><a href="#" class="jcarousel-control jcarousel-control-next">Next</a>');
          try {
              $that.find('.headline a').dotdotdot({
                  // configuration goes here
                  ellipsis: ' ...',
                  wrap: 'word',
                  height: eH
              });
          } catch (err) {
              console.log('hb Error: ' + err.message);
          }

          $that.find('.jcarousel').jcarousel();

          $that.find('.jcarousel-control-prev')
          .on('jcarouselcontrol:active', function () {
              $wn(this).removeClass('inactive');
          }).on('jcarouselcontrol:inactive', function () {
              $wn(this).addClass('inactive');
          })
                .jcarouselControl({
                    target: '-=' + increment
                });

          $that.find('.jcarousel-control-next')
          .on('jcarouselcontrol:active', function () {
              $wn(this).removeClass('inactive');
          }).on('jcarouselcontrol:inactive', function () {
              $wn(this).addClass('inactive');
          })
                .jcarouselControl({
                    target: '+=' + increment
                });

          $wn(document).ready(function () {
              $wn('.cdev-carousel-group').find('.toggle').each(function () {
                  $wn(this).insertAfter($(this).closest('.cdev-carousel-group').find('.jcarousel-wrapper'));
              })
          })

      });
      return;

  },

  mostPopular: function (ds) {

    var $container = $wn(ds);

    function imostPopular() {
      //$wn('#CDEV-temp-mp').closest('.wnDVUtilityBlock').addClass('cdev-hidden').hide();
      if($wn('#wnMostPopularTabbed').length > 0){
        return;
      }
      var buildHTML = '';

      buildHTML += '<div class="wnBlock displaySize displaySizeId80 headlineBox" id="wnMostPopularTabbed">';
          buildHTML += '<div class="wnGroup contentGroup collapsible closed">';
              buildHTML += '<div class="wnItem header"><h3><span class="text siteDefault">Most Popular</span><div class="wnContent more enabled"><span class="text">More&gt;&gt;</span></div><div class="wnClear"></div></h3></div>';
              buildHTML += '<div class="wnMPTabs clearfix">';
                  buildHTML += '<div class="wnTab wnTabOn" rel="s">Stories</div>';
                  buildHTML += '<div class="wnTab" rel="v">Videos</div>';
                  buildHTML += '<div class="wnTabNoAction">Slideshows</div>';
              buildHTML += '</div>';
              buildHTML += '<ul class="mpGroup wnGroup contentGroup collapsible closed clearfix">';
                      buildHTML += '<li class="feature">';
                  buildHTML += '<div class="mpLoading">loading...</div>';
                      buildHTML += '</li>';
                      buildHTML += '<div class="wnClear"></div>';
              buildHTML += '</ul>';
            //buildHTML += '<div class="wnItem toggle cdev-more-link"><a class="wnContent more enabled" href="/"><span class="text">More</span></a><div class="wnClear"></div></div>';
          buildHTML += '</div>';
      buildHTML += '</div>';

      $container.html(buildHTML);

        return;
    }

    imostPopular();
    $container.addClass('group-visible');
    return;
  },

    pollStyle: function () {

    var $container = $wn('.wnItem.poll');

    $container.each(function () {
      var $this = $wn(this),
      $contentGroup = $this.closest('.contentGroup');

      $contentGroup.addClass('cdev-poll');

      if ($contentGroup.find('.header').length < 1) {
          $contentGroup.prepend('<li class="wnItem header"><h3><span class="text siteDefault">Poll</span><div class="wnContent more enabled"><span class="text">More&gt;&gt;</span></div><div class="wnClear"></div></h3></li>');
          //$contentGroup.css('margin-bottom', '15px');
          return;
      }

      if (!$contentGroup.find('.header').is(':visible')) {
          $contentGroup.find('.header')
          .removeClass('hide')
          .css('display', 'block');
      }

    });

      return;
  },

  formStyle: function () {

    var $container = $wn('.wnItem.form');

    $container.each(function () {

        var $this = $wn(this),
        $contentGroup = $this.closest('.contentGroup'),
        headline = $this.find('.headline .text').text();

        $contentGroup.addClass('cdev-form');

        if ($contentGroup.find('.header').length < 1) {
            $contentGroup.prepend('<li class="wnItem header"><h3><span class="text siteDefault">' + headline + '</span><div class="wnContent more enabled"><span class="text">More&gt;&gt;</span></div><div class="wnClear"></div></h3></li>');
            $contentGroup.css('margin-bottom', '15px');
            return;
        }

        if (!$contentGroup.find('.header').is(':visible')) {
            $contentGroup.find('.header')
            .removeClass('hide')
            .css('display', 'block');
        }

    });
    return;
  },

  swapImageHadline: function(ds,ab,dImg){
    var $container = $wn(ds),
      abridged = ab === true ? 'abridged' : '',
      abridgedClass = ab === true ? '.abridged' : '';

      $container.addClass('cdev-swap').find('.feature').each(function(){
        if($wn(this).find('.summaryImage' + abridgedClass).length > 0){
          $wn(this).find('.summaryImage' + abridgedClass + ' img').attr('src', $wn(this).find('.summaryImage' + abridgedClass + ' img').attr('data-path'));
          $wn(this).find('.summaryImage' + abridgedClass).prependTo($wn(this));
        } else {
            $wn(this).prepend('<div class="wnContent summaryImage ' + abridged + ' clearfix"><a href="' + $wn(this).find('.headline.abridged a').attr('href') + '"><img border="0" data-path="' + dImg + '" src="' + dImg + '"></a></div>');

        }
      })

    return;
  },

    threeColumnGrid: function (displayGroup,dImg) {

      var toMatch = function (ds) { return ds.attr('class').match(/displaySizeId([0-9-]+)/); };

        $wn(displayGroup).addClass('cdev-three-column-grid');
        CDEVWVIR.swapImageHadline(displayGroup,true,dImg);

      $wn('.cdev-three-column-grid').find('.contentGroup').each(function () {
          var $that = $wn(this);
          $that.find('.feature:eq(5)').addClass('last');
          $that.find('.feature:gt(5)').remove();

          $that.find('.feature').each(function (item) {
              var $this = $wn(this);

              if (item > 5) {
                    return;
                };

        if (item%3 === 0){
                    $this.addClass('cdev-row');
                    $this.before('<li class="cdev-clear wnClear"></li>');
                }

                if (item%3 === 2){
                    $this.addClass('cdev-third');
                }

                if($this.find('.wn-icon-video-included').length > 0 || $this.find('.wn-icon-clip').length > 0){
                  $this.addClass('hasVideo');
                }

              var foundClass = toMatch($this);

              if (foundClass !== null && foundClass[0] !== 'displaySizeId-7') {
                  $this.removeClass(foundClass[0]).addClass('displaySizeId-7');
              }

          });

          $that.find('.feature.last').after('<li class="cdev-last cdev-clear wnClear"></li>');

      });

        return;

    },

    videoGrid: function (displayGroup,dImg,mtd,attachGroup) {

      var toMatch = function (ds) { return ds.attr('class').match(/displaySizeId([0-9-]+)/); };

        $wn(displayGroup).addClass('cdev-video-grid');
        CDEVWVIR.swapImageHadline(displayGroup,true,dImg);

      $wn('.cdev-video-grid').find('.contentGroup').each(function () {
          var $that = $wn(this);
          $that.find('.feature:eq(4)').addClass('last');
          $that.find('.feature:gt(4)').remove();

          $that.find('.feature').each(function (item) {
              var $this = $wn(this);

                if($this.find('.wn-icon-video-included').length > 0 || $this.find('.wn-icon-clip').length > 0){
                  $this.addClass('hasVideo');
                }

              var foundClass = toMatch($this);

              if (foundClass !== null && foundClass[0] !== 'displaySizeId-7') {
                  $this.removeClass(foundClass[0]).addClass('displaySizeId-7');
              }

          });

      });

    $wn('.cdev-video-grid')[mtd]($wn(attachGroup));

        return;

    },

  team: function (displayGroup, dImg, ds, theme, objName) {

    var toMatch = function (ds) { return ds.attr('class').match(/displaySizeId([0-9-]+)/); },
    $srcContainer;

    $wn(displayGroup).addClass('cdev-team').addClass(theme);
    CDEVWVIR.swapImageHadline(displayGroup,true,dImg);
    $srcContainer = $wn(displayGroup + '.cdev-team');

    $srcContainer.find('.contentGroup').removeClass('odd').removeClass('even').removeClass('last');

    $srcContainer.find('.contentGroup').each(function () {
      var $that = $wn(this);
      $that.find('.feature').each(function (item) {

        var $this = $wn(this),
          tURL,
          thenum,
          name = $this.find('.headline.abridged .text').text().toLowerCase().replace(/ /g,'').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'');
          buildDiv = '',
          foundClass = toMatch($this);

        if (foundClass[0] !== ds) {
            $this.removeClass(foundClass[0]).addClass(ds);
            if($this.hasClass('odd')){
              $this.removeClass(function (index, css) {
                return (css.match (/(^|\s)odd-\S+/g) || []).join(' ');
            }).addClass('odd-4');
            } else {
                $this.removeClass(function (index, css) {
                return (css.match (/(^|\s)even-\S+/g) || []).join(' ');
            }).addClass('even-4');
          }
        }

        if($this.find('.sectionTitle').length > 0){
          $this.find('.sectionTitle').insertAfter($this.find('.headline.abridged'));
        }

        buildDiv += '<div class="cdev-contact-info">';
          buildDiv += '<a class="fb" href="' + objName[name][0] + '" target="_blank">Facebook</a>';
          buildDiv += '<a class="twitter" href="' + objName[name][1] + '" target="_blank">Twitter</a>';
          buildDiv += '<a class="email" href="' + objName[name][2] + '" target="_blank">Email</a>';
        buildDiv += '</div>';

        $this.find('.wnContent:last').after(buildDiv);

      });

    });
    return;
  },

  storyPage: function(){
  	$wn('#WNStoryUtils').appendTo($wn('#WNStoryHeader'));
  	$wn('#WNStoryHeader').addClass('clearfix');
  	return;
  },

  col4social: function(ds,mthd){

    var buildHTML = '';
    buildHTML += '<div id="col4-social-icons">';
    buildHTML += '<a href="https://www.facebook.com/KAKETV" class="fb">Facebook</a>';
    buildHTML += '<a href="https://www.instagram.com/kake.news/" class="ln">Instagram</a>';
    buildHTML += '<a href="https://twitter.com/KAKEnews" class="tw">Twitter</a>';
    buildHTML += '<a href="/story/32124200/rss-feeds" class="rss">RSS</a>';
    buildHTML += '<a href="/link/765176/registration?function=manageprofile&mode=login&referrer=http%3A//www.kake.com/" class="mail">Mail</a>';
    buildHTML += '</div>';

    $(ds)[mthd](buildHTML);

    return;
  },

  moveAd: function(adid,newadid,sel,aStyle){
    if (wng_pageInfo.ads[adid]) {
        var myad = wng_pageInfo.ads[adid];
        var ad = wng_pageInfo.ads[adid];
        ad = null;
        myad.id = newadid;
        Worldnow.AdMan.attachAd({ selector: sel, attachStyle: aStyle }, myad);
        $('#WNAd' + adid).remove();
    }
    return;
  },

  wxLinks: function (displayGroup, dImg, ds) {
    var toMatch = function (ds) { return ds.attr('class').match(/displaySizeId([0-9-]+)/); },
    $srcContainer;
    $wn(displayGroup).addClass('cdev-wx-links');
    $srcContainer = $wn(displayGroup + '.cdev-wx-links');
    $srcContainer.find('.contentGroup').removeClass('odd').removeClass('even').removeClass('last');

    $srcContainer.find('.contentGroup').each(function () {
      var $that = $wn(this);
      $that.find('.feature').each(function (item) {

        var $this = $wn(this),
          tURL,
          thenum,
          name = $this.find('.headline.abridged .text').text().toLowerCase().replace(/ /g,'').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'');
          foundClass = toMatch($this);


        if (foundClass !== null && foundClass[0] !== ds) {
            $this.removeClass(foundClass[0]).addClass(ds);
            if($this.hasClass('odd')){
              $this.removeClass(function (index, css) {
                return (css.match (/(^|\s)odd-\S+/g) || []).join(' ');
            }).addClass('odd-4');
            } else {
                $this.removeClass(function (index, css) {
                return (css.match (/(^|\s)even-\S+/g) || []).join(' ');
            }).addClass('even-4');
          }
        }

      });

    });
    return;
  },

  schoolClosings: function() {

    function WNGetRSS(rssURL) {
        function rssInitContent() {
            rssParseXML(this);
        }

        function rssErrorFunction(e) {}

        function makeRSSRequest() {
            WNHttpRequestManager.makeRequest(rssURL, {
                onSuccess: rssInitContent,
                onError: rssErrorFunction
            });
        };

        makeRSSRequest();

        function rssParseXML(xml) {
            var fullFeed = xml.response.responseXML;
            var schoolClosings = parseInt($(fullFeed).find("NUM_CLOSINGS").text(),10);
            var schoolClosingsContainer = '<section class="block displaysize-30 wnclear school-closings" id="schoolClosingsContainer">';
        schoolClosingsContainer += '<ul class="group"><li class="item wnclear"><a href="#" class="headline"><h4></h4></a><summary></summary></li></ul>';
        schoolClosingsContainer += '</section>';
        if (schoolClosings > 0) {
          $wn(schoolClosingsContainer).insertBefore('#WNCols234-5');
        }
            if (schoolClosings === 1) {
              $('#schoolClosingsContainer .headline h4').text(schoolClosings + ' Current Closing');
            } else if ((schoolClosings > 1) || (schoolClosings !== '1') ) { // should be greater than 0 in finished product
              $('#schoolClosingsContainer .headline h4').text(schoolClosings + ' Current Closings');
            }
        }
    }

    WNGetRSS('http://ftpcontent5.worldnow.com/kake/closings.xml');

  },

  moreRibbon: function () {

      var $header = $wn('.wnItem.header'),
            $moreLink;

      $header
              .find('.more.enabled').each(function () {
                  var $this = $wn(this);
                  $this.find('.text').html('More');
                  $this.closest('.contentGroup').addClass('cdev-more-ribbon');

                  if (!$wn('html').hasClass('ie7')) {
                      if ($this.closest('.contentGroup').find('.toggle').length === 0) {
                          $this.closest('.contentGroup').find('.wnItem:last').after('<div class="wnItem toggle cdev-more-link"><div class="wnClear"></div></div>');
                      }
                      $this.closest('.contentGroup').find('.toggle').addClass('cdev-more-link clearfix').prepend($this);
                  } else {
                      $this.closest('.contentGroup').find('.toggle').addClass('cdev-more-link clearfix').appendTo($this.closest('.contentGroup')).prepend($this);
                  }

              });

      return;
  },

  promoArea: function () {

    $('#Masthead .table li.branding').after('<li class="promo-area"><a class="promo-item" href="/link/773068/branding-link-do-not-delete"><img src="http://wbbh.images.worldnow.com/images/11100754_G.jpg" border="0"></a></li>');
    return;
  },

  brandingWx: function (){
	function CDEVweatherPage(url, zip, defaultStation){
		var buildHTML = '<div id="CDEV-branding-weather">';
      buildHTML += '<div class="list-zipcode">';
      buildHTML += '<select >';
      for ( var i = 0; i < zipcode.length; i++){
        buildHTML +='<option value="'+zipcode[i]+'">' + nameZipcode[i] + '</option>';
      }
      buildHTML += '</select>';
      buildHTML += '<input type="checkbox" value="checked">';
      buildHTML += '<span>SAVE THIS LOCATION</span>';
      buildHTML += '</div>';
		 	buildHTML += '<div class="buttons"><a class="button" href="http://www.nbc-2.com/category/170788/interactive-radar">Doppler Radar</a><a class="button" href="http://www.nbc-2.com/category/170949/weather-7-day-forecast">7-Day</a><a class="button" href="#">State Radar</a></div>';
			buildHTML += '<div class="wx-location"></div>';
		 	buildHTML += '<div class="temperature"></div>';
		 	buildHTML += '<div class="wx-icon"></div>';
		 	buildHTML += '<div class="feelslike"></div>';
		 	buildHTML += '<div class="forecast"><sapn class="lo"></span>';
		 	buildHTML += '<span class="hi"></span></div>';
		 	buildHTML += '<div class="precip"></div>';
		 	buildHTML += '<div class="humidity"></div>';
		 	buildHTML += '</div>';

		$('#Masthead .table li.branding').after(buildHTML);
    $wn('#CDEV-branding-weather > div.list-zipcode > select').val(zip);
    if ($wn('#CDEV-branding-weather > div.list-zipcode > select').val() == defaultStation) {
        $wn('#CDEV-branding-weather > div.list-zipcode > input[type="checkbox"]').prop('checked', true);
    } else {
        $wn('#CDEV-branding-weather > div.list-zipcode > input[type="checkbox"]').prop('checked', false);
    }
	  var $container = $wn('#CDEV-branding-weather'),
	    totalZips = zipcode.length,
	    h = 0,
	    timer;

	  function makeRequest(url){
	    $container.find('.wx-location').text('');
	    $container.find('.wx-condition').html('');
	    $container.find('.temperature').html('');
	    $container.find('.feelslike').html('');
	    $container.find('.precip').html('');
    	$container.find('.humidity').html('');
	    $container.find('.wx-icon')
	      .text('')
	      .css({
	        'background-image' : 'none'
	        });
	    $container.find('.forecast').html('<span class="lo"></span>&nbsp;<span class="hi"></span>');

	      WNHttpRequestManager.makeRequest(url, {
	        onSuccess: function() {

	        // Load API data
	            var $data = $wn(this.response.responseXML),
	              $city = $data.find('City'),
	              $cO = $data.find('CurrentObservation'),
	              $tF = $data.find('DailyForecast').find('Day:eq(0)'),
	              $cH = $data.find('HourlyForecast').find('Hour:eq(0)'),
	              cityName = $city.attr('Name'),
	              stateAbbr = $city.attr('StateAbbr');

	            if($data.children().length < 1){
	              this.onError();
	            }
	          $container.find('.wx-location').text(cityName);
	          $container.find('.temperature').html($cO.attr('TempF') + '&deg;');
	          $container.find('.feelslike').html('Feels like ' + $cO.attr('FeelsLikeF') + '&deg;');
	          $container.find('.precip').html('Precipitation ' + $tF.attr('PrecipChance') + '%');
	          $container.find('.humidity').html('Humidity ' + $cH.attr('RelHumidity') + '%');
	          $container.find('.wx-icon')
	            .text($cO.attr('Sky'))
	            .css({
	              'background-image' : 'url(http://ftpcontent.worldnow.com/wncustom/wx_icons/wsi55/' + $cO.attr('IconCode') + '.png'
	              });
	          $container.find('.hi').html('High ' + $tF.attr('HiTempF') + '&deg;&nbsp;');
	          $container.find('.lo').html('Low ' + $tF.attr('LoTempF') + '&deg;');
	            return;
	        },
	        onError: function(e){
	          console.log('error');
	          return;
	        }
	    });
	    }

	  // function rotate(){
    //
	  //   if(h < totalZips-1){
	  //     h++;
	  //   } else {
	  //     h = 0;
	  //   }
    //
	  //   makeRequest('http://data-services.wsi.com/200904-01/710249140/Weather/Report/' + zipcode[h]);
	  // }

	  makeRequest(url);
    // events
    $wn('#CDEV-branding-weather > div.list-zipcode > select').change(function() {
      var value = $wn(this).val();
      makeRequest('http://data-services.wsi.com/200904-01/710249140/Weather/Report/' + value);
      var defaultStation = WNCookie.get('defaultzipcodewvir');
      if (value == defaultStation) {
          $wn('#CDEV-branding-weather > div.list-zipcode > input[type="checkbox"]').prop('checked', true);
      } else {
          $wn('#CDEV-branding-weather > div.list-zipcode > input[type="checkbox"]').prop('checked', false);
      }
    });
    // save location
    // Handle remembering and forgetting the default city
    $wn('#CDEV-branding-weather > div.list-zipcode > input[type="checkbox"]').change(function () {
        if (this.checked) {
            // Expire one year from now
            var expDate = new Date();
            expDate.setFullYear(expDate.getFullYear() + 1);

            var defaultStation = $wn('#CDEV-branding-weather > div.list-zipcode > select').val();
            WNCookie.set('defaultzipcodewvir', defaultStation, {
                expires: expDate
            });

        } else {
            defaultStation = null;
            WNCookie.set('defaultzipcodewvir', defaultStation, {
                expires: new Date(0)
            });
        }
    });
	  // timer = setInterval(function(){rotate()},5000);
	}
  // get first region
  var cookieName = 'defaultzipcodewvir';
  var zip = zipcode[0];
  var defaultStation = WNCookie.get(cookieName);
  if (defaultStation != null) {
      zip = defaultStation;
  }

	CDEVweatherPage('http://data-services.wsi.com/200904-01/710249140/Weather/Report/' + zip, zip, defaultStation );
  },

  buildVideoTab: function(divid,loc,mthd,w,h){
    var buildHTML = '';
    buildHTML += '<div id="' + divid + '">';
    buildHTML +='<ul id="v-tabs"></ul>';
    buildHTML += '</div>';

    $(loc)[mthd](buildHTML);

    CDEVWVIR.buildVideoPlayer('182555','314586','#'+divid,'2',w,h);
    $('#v-tabs').append('<li><a href="#divWNWidgetsContainer182555">South Central</a></li>');
    CDEVWVIR.buildVideoPlayer('182553','314588','#'+divid,'4',w,h);
    $('#v-tabs').append('<li><a href="#divWNWidgetsContainer182553">North Central</a></li>');
    CDEVWVIR.buildVideoPlayer('182554','314592','#'+divid,'1',w,h);
    $('#v-tabs').append('<li><a href="#divWNWidgetsContainer182554">Northwest</a></li>');
    CDEVWVIR.buildVideoPlayer('182556','314590','#'+divid,'3',w,h);
    $('#v-tabs').append('<li><a href="#divWNWidgetsContainer182556">Southwest</a></li>');

    $('#v-tabs li a').click(function(e){
      e.preventDefault();
      e.stopPropagation();

      $('#v-tabs li').removeClass();
      $(this).closest('li').addClass('tab-active');
      $('#videoTab > div').removeClass();
      $($(this).attr('href')).addClass('show');
    })

    $('#v-tabs li:first a').click();

    return;
  },

  buildVideoPlayer: function (divid,catid,loc,m,w,h) {
    var buildHTML = '';

    buildHTML += '<div id="divWNWidgetsContainer' + divid + '">';
    buildHTML += '<div id="divWNVideoCanvas' + divid + '"></div>';
    buildHTML += '<div id="divWNGallery' + divid + '"></div>';
    buildHTML += '</div>';

    $(loc).append(buildHTML);

    var vp = {};
    var wid = 'wnWidgetId_'+divid,
      canid = 'WNVideoCanvas'+divid,
      galid = 'WNGallery'+divid;
      /*
      vp[wid] = '1';
      vp[canid] = '2';
      vp[galid] = '3';*/




    if (vp[wid] == undefined) vp['wnWidgetId'+divid] = divid;

    vp[canid] = new WNVideoWidget("WNVideoCanvas", "divWNVideoCanvas" + divid, m);
    vp[canid].SetStylePackage("dark");
    vp[canid].SetVariable("widgetId", wid);
    vp[canid].SetVariable("addThisDivId", "divWNImageCanvas" + divid + "_addThis");
    vp[canid].SetVariable("incanvasAdDivId", "divWNImageCanvas" + divid + "_adDiv");
    vp[canid].SetVariable("isMute", "false");
    vp[canid].SetVariable("isAutoStart", "false");
    vp[canid].SetVariable("assignablelink", "http%253A%252F%252Fapi.worldnow.com%252Ffeed%252Fv2.0%252Fwidgets%252F182555%253Falt%253Djs%2526contextaffiliate%253D1279");
    vp[canid].SetSkin(CANVAS_SKINS.flat.silver);
    vp[canid].SetVariable("toolsShareButtons", "link,share");
    vp[canid].SetVariable("overlayShareButtons", "link,share");
    vp[canid].SetWidth(w);
    vp[canid].SetHeight(h);
    vp[canid].RenderWidget();

    vp[galid] = new WNVideoWidget("WNGallery", "divWNGallery" + divid, m);
    vp[galid].SetStylePackage("dark");
    vp[galid].SetVariable("widgetId", wid);
    vp[galid].SetVariable("addThisDivId", "divWNImageCanvas" + divid + "_addThis");
    vp[galid].SetVariable("incanvasAdDivId", "divWNImageCanvas" + divid + "_adDiv");
    vp[galid].SetVariable("isContinuousPlay", "false");
    vp[galid].SetVariable("hasSearch", "false");
    vp[galid].SetVariable("topVideoCatNo", catid);
    vp[galid].SetWidth(1);
    vp[galid].SetHeight(1);
    vp[galid].RenderWidget();

    return;
  },

  footer: function(){
  	var buildHTML = '';

  	buildHTML += '<div id="cdev-footer">';
	  	buildHTML += '<div class="station-row">';
			buildHTML += '<div class="station-info">';
				buildHTML += '<div><a class="text-link" href="#">EEO</a></div>';
		  		buildHTML += '<div><a class="ss-icon fb" href="#">Facebook</a><a class="ss-icon twitter" href="#">Twitter</a><a class="ss-icon rss" href="#">RSS</a></div>';
		  		buildHTML += '<div><a class="text-link" href="#">FCC</a></div>';
	  		buildHTML += '</div>';
	  		buildHTML += '<div class="station-info">';
				buildHTML += '<div>WVIR-TV NBC29</div>';
		  		buildHTML += '<div>503 E. Market Street, Charlottesville, VA 22902</div>';
		  		buildHTML += '<div>434 220 2900</div>';
	  		buildHTML += '</div>';
	  	buildHTML += '</div>';
  	buildHTML += '</div>';

  	$('.footer.wn-bg-page-worldnow').before(buildHTML);
  },

  ///change home nav-item is font icon home when sticky
  stickyNav: function(){
    //add font-awesome into head tag
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css";
    $("head").append(s);

    //when scroll down with navbar is fixed
    $(document).scroll(function() {
      if ($('#WNColsAll .wn-sticky').css('position') == 'fixed'){
        $('.wn-bg-page-nav nav.main ul.sf-navbar > li > a').first().html('<i class="fa fa-home" aria-hidden="true"></i>');
      } else if ($('#WNColsAll .wn-sticky').css('position') == 'static') {
        $('.wn-bg-page-nav nav.main ul.sf-navbar > li > a').first().html('Home');
      }
    });
  }

}


Worldnow.EventMan.event('WNCol23done', function () {
  CDEVWVIR.breakingNews();
  if (wng_pageInfo.containerType === 'C') {
      if (wng_pageInfo.containerClass !== 'home'){
    	CDEVWVIR.tsrConfig('category',7,35,CDEVWVIR.defaultImg,false,'static');
      }
  }
  if (wng_pageInfo.containerClass !== 'home'){
    CDEVWVIR.breakingNewsAPI();
    }
  if ($('#DisplaySizeId-7').length > 0){
    CDEVWVIR.swapImageHadline('#DisplaySizeId-7',false,CDEVWVIR.defaultImg);
  }
  CDEVWVIR.hb2a('#DisplaySizeId80',CDEVWVIR.defaultImg,5);
  if (wng_pageInfo.containerType === 'C') {
    CDEVWVIR.carousel('#DisplaySizeId82',CDEVWVIR.defaultImg);
  }
  if (wng_pageInfo.containerType === 'S') {
    CDEVWVIR.hb2b('#DisplaySizeId82',CDEVWVIR.defaultImg,5);
    $('.main.wn-bg-page-main .nav.wn-bg-page-nav .sf-navbar>li:eq(1)').addClass('active');
    $('.main.wn-bg-page-main .nav.wn-bg-page-nav .sf-navbar>li:eq(1)>a').addClass('active');
    if($('#DisplaySizeId8').length > 0){
    	$('#DisplaySizeId8').insertBefore($('#wnSocialToolsSection'));
    }
  }
  CDEVWVIR.carousel('#DisplaySizeId7',CDEVWVIR.defaultImg,null,'dark');
  //CDEVWVIR.promoArea();
  CDEVWVIR.hb2b('#DisplaySizeId27',CDEVWVIR.defaultImg,5);
    /*
    if (wng_pageInfo.containerClass === 'home'){

		var myad = wng_pageInfo.ads[46];
        var ad = wng_pageInfo.ads[46];
        ad = null;
        myad.id = "246";
        Worldnow.AdMan.attachAd({selector:'header.simple-a',attachStyle:'prepend'},myad);
        $('#WNAd46').remove();
	}
	*/
});

Worldnow.EventMan.event('WNCol4done', function () {
 if (wng_pageInfo.containerClass !== 'home'){
	//CDEVWVIR.searchTools('#WNCol4','prepend');
 }
 if (wng_pageInfo.containerClass !== 'home' && wng_pageInfo.contentClassification !== 'Weather'){
 	CDEVWVIR.col4wx();
 	$('#CDEV-col4-weather').addClass('other-page');
 }
  CDEVWVIR.mostPopular('.displaysize78.mostpopular');
  $wn('.displaysize78.mostpopular').hide();
  if(wng_pageInfo.contentClassification === 'Weather'){
	$('body').addClass('weather');
    CDEVWVIR.team('#DisplaySizeId68',CDEVWVIR.defaultImg,'displaySizeId-7','dark',CDEVWVIR.wxTeamSocialInfo);
  }
});

Worldnow.EventMan.event('bodydone', function () {
  if (wng_pageInfo.containerType === 'S') {
    CDEVWVIR.storyPage();
  }
    CDEVWVIR.pollStyle();
    CDEVWVIR.formStyle();
  if (wng_pageInfo.containerType === 'C') {
      if (wng_pageInfo.containerClass === 'home'){
      	CDEVWVIR.homepage();
      }
  }
  CDEVWVIR.footer();
  // fix cover bug
  if (wng_pageInfo.containerClass == "weather" )
    $wn('#WNAffWVIR #WNColsAll #WNCols23-4').css('margin-top', '50px');
  
});

$(document).ready(function(){
  CDEVWVIR.stickyNav();
	CDEVWVIR.moreRibbon();
	CDEVWVIR.brandingWx();
  if (wng_pageInfo.contentClassification === 'Weather') {
  	console.log($('#WNAd2101').length)
    if($('#WNAd2101').length > 0){
    	$('.cdev-team').insertBefore($('#WNAd2101'));
    }
  }
  if($('.block.displaysize78.mostpopular').length > 0){
  	if (wng_pageInfo.containerClass !== 'home'){
  		$('.block.displaysize78.mostpopular').insertAfter($('#col4Search'));
  	} else {
  		$('.block.displaysize78.mostpopular').insertBefore($('#WNDS64'));
  	}
  }
  if (wng_pageInfo.containerType === 'S') {
  	$('#taboola-below-main-column-mix').appendTo($('#wnSocialToolsSection'));
  	$('#WN_Taboola').appendTo($('#wnSocialToolsSection'));
  }

    var wnAd_wncc = wng_pageInfo.contentClassification.toLowerCase();
    var newOwnerInfo = $wn.parseJSON('{"' + wng_pageInfo.affiliateName.toLowerCase() + '": {"share":1 }}');
    while (wnAd_wncc.indexOf(" ") != -1) {
        wnAd_wncc = wnAd_wncc.replace(" ", "");
    }
    var ad = new Worldnow.Ad({
        id : "155",
        ownerinfo : newOwnerInfo,
        width : '150',
        height : '30',
        wncc : wnAd_wncc,
        type : 'dom',
        application : 'banner',
        parent : 'WNAd155'
    });
    ad.load();
    // move most popular at bottom col4
    $wn('.displaysize78.mostpopular').insertAfter('#WNAd52');
    $wn('.displaysize78.mostpopular').show();

 	if(window.WNMemberCenterManager) {
		WNMemberCenterManager.MEMBER_CENTER_WRAPPER_ELEMENT = 'li.tools';
		if ($('.wnMemberType-user').css('display') == 'none') {
			$('li.tools .membercenter').attr('membercenter-message','Member center:');
		} else {
			$('li.tools .membercenter').attr('membercenter-message','');
		}
		$('li.tools .membercenter').each(function() {
			$(this).attr('refresh','1').append('<li class="wnMemberType-user"><a href="javascript: WNMemberCenterManager.gotoLoginLink()">Manage Account</a></li><li class="message wnMemberType-user"><a style="margin-right: 0px" href="javascript: WNMemberCenterManager.gotoLoginLink(&quot;logout&quot;)">Log Out</a></li>');
		});
		WNMemberCenterManager.populateBoxes();
		$('header.simple-a li.tools').css('width','333px');
		$('header.simple-a .membercenter a').css('margin-right','0em');
		$('header.simple-a .membercenter li').css('margin-right','1em');
	}
});
