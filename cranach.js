const domparser = new DOMParser();
const xsltProcessor = new XSLTProcessor();

function nsResolver(prefix) {
	let ns = {
		'lv' : "http://www.math.cuhk.edu.hk/~pschan/cranach",
		'idx' : "http://www.math.cuhk.edu.hk/~pschan/elephas_index",
		'xh' : 'http://www.w3.org/1999/xhtml',
		'm': 'http://www.w3.org/1998/Math/MathML'
	};
	return ns[prefix] || null;
}


function Cranach(url) {

	this.rootURL = url.match(/^(.*?)\/*(?:\?|$)/).length ? url.match(/^(.*?)\/*(?:\?|$)/)[1] : '';
	this.params = url.match(/\?(.*?)(#|$)/);

	this.attr = {
		'wbPath':'content/default.wb',
		'xmlPath':null,
		'filepath':'',
		'index':'index.xml',
		'dir':'./content/',
		'rootURL': this.rootURL,
		'contentURLDir': this.rootURL,
		'contentURL': this.rootURL + '?wb=content/default.wb',
		'query':'',
		'outputID': 'output',
		'localName':'untitled',
		/* Initial Presentation */
		'selectedItem' : null,
		'selectedSection' : null,
		'selectedSlide' : null,
		'selectedKeyword' : null,
		'present' : false,
		'lectureMode' : 0
	};

	this.hasXML = false;
	this.hasWb = false;

	this.preCranachDoc = null;
	this.cranachDoc = null;
	this.indexDoc = null;

	this.macrosString = '';
	this.macros = '';
	this.bare = false;
	this.output = null;

	this.loadMacros = function() {
		return new Promise((resolve, reject) => {
			let el = this;
			fetch(el.attr['dir'] + '/macros.tex')
            .then(function(response) {
                if (!response.ok) {
                    throw Error(response.statusText);                    
                }
                console.log('MACROS FILE FOUND');
                return response.text();
            })
            .then(macroString => {
                el.macrosString = macroString;
                el.macros = domparser.parseFromString('<div>\\(' + el.macrosString + '\\)</div>', "text/xml");
                resolve(el);
            })
            .catch(error => {
                console.log(error);
                el.macrosString = '';
                el.macros = domparser.parseFromString('<div>\\(\\)</div>', "text/xml");
                resolve(el);
            });
		});
	}

	this.loadIndex = function() {
		let el = this;
		let url = el.attr['dir'] + '/' + el.attr['index'] + '?version='+ Math.random().toString();

		return new Promise((resolve, reject) => {
			fetch(url)
			    .then(response => {
					if (!response.ok) {
                        throw Error("INDEX FILE DOESN'T EXIST");            
					}
                    return response.text();
				})
				.then(xmltext => {
					el.indexDoc = domparser.parseFromString(xmltext, "text/xml");
					resolve(el);
				})
                .catch(error => {
                    console.log(error);
                    el.indexDoc = null;
                    resolve(el);
                });
		});
	}

	this.setup = function(options) {
		this.output = document.getElementById(this.attr['outputID']);
		
		if(options) {
			for (let key in options){
				if(options.hasOwnProperty(key)){
					this.attr[key] = options[key];
				}
			}
		}

		if (this.params) {
			let params = this.params;
			let urlParams = new URLSearchParams(params[1]);
			report('URLPARAMS: ' + urlParams);
			if(urlParams.has('wb') || urlParams.has('xml')) {
				let pathname = urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');
				this.attr['filepath'] = pathname;
				let match;
				let dir = '';
				if (match = pathname.match(/^(.*?)\/[^\/]+\.(?:wb|xml)/)) {
					dir = match[1];
				}
				this.attr['dir'] = dir;
				this.hasWb = urlParams.has('wb');
				this.hasXML = urlParams.has('xml');

				if (urlParams.has('wb')) {
					this.attr['wbPath'] = pathname;
					this.attr['contentURL'] = this.attr['rootURL'] + '\/?wb=' + this.attr['wbPath'];
					this.attr['contentURLDir'] = this.attr['rootURL'] + '\/?wb=' + this.attr['dir'];
				} else if (urlParams.has('xml')){
					this.attr['xmlPath'] = pathname;
					this.attr['contentURL'] = this.attr['rootURL'] + '\/?xml=' + this.attr['xmlPath'];
					this.attr['contentURLDir'] = this.attr['rootURL'] + '\/?xml=' + this.attr['dir'];
				}
				report(pathname);
				this.attr['localName'] = pathname.match(/(local|([^\/]+)\.(?:wb|xml))$/)[1];
			}

			if (urlParams.has('query')) {
				report('HAS QUERY');
				let query = urlParams.get('query');
				report('QUERY: ' + query);
				this.hasQuery = true;
				this.attr['query'] = query;
			}

			if (urlParams.has('slide')) {
				this.attr['selectedSlide'] = urlParams.get('slide');
			}
			if (urlParams.has('present')) {
				this.attr['present'] = true;
			}
			if (urlParams.has('item')) {
				this.attr['selectedItem'] = urlParams.get('item');
			}
			if (urlParams.has('section')) {
				this.attr['selectedSection'] = urlParams.get('section');
			}
			if (urlParams.has('keyword')) {
				this.attr['selectedKeyword'] = urlParams.get('keyword');
			}
			if (urlParams.has('lecture')) {
				this.attr['lectureMode'] = 1;
			}
			if (urlParams.has('bare')) {
				this.setBare();
				console.log(this.bare);
			}
		}

		let el = this;

		return this.loadMacros()
		.then(cranach => cranach.loadIndex())
		.then(cranach => {
			if (cranach.indexDoc == null) {
				let docDom = document.implementation.createDocument ('http://www.math.cuhk.edu.hk/~pschan/elephas_index', '', null);
				let preindexDom = docDom.createElementNS('http://www.math.cuhk.edu.hk/~pschan/elephas_index', 'index');
				docDom.appendChild(preindexDom);
				this.indexDoc = docDom;
			}
			let el = cranach;
			if (el.attr['xmlPath']) {
				return new Promise((resolve, reject) => {
					fetch(el.attr['xmlPath'] + '?version=' + Math.random())
					.then(function(response) {
						if (!response.ok) {
                            throw Error('FILE NOT FOUND');
                        } 
                        return response.text();
					})
					.then(xmltext => {
						$('.progress-bar').css('width', '50%').attr('aria-valuenow', '50');
						el.cranachDoc = domparser.parseFromString(xmltext, "text/xml");
                        console.log(el.cranachDoc);
						resolve(el);
					})
                    .catch(error => {
                        alert(error);                        
                        console.log(error);
                        el.cranachDoc = null;
                        resolve(el);
                    });
				});
			} else if (el.attr['wbPath']) {
				return new Promise((resolve, reject) => {
					fetch(el.attr['wbPath'] + '?version=' + Math.random())
					.then(response => {
						if (!response.ok) {
                            throw Error('FILE NOT FOUND');
						}
                        return response.text();
					})
					.then(wb => {
						el.preCranachDoc = domparser.parseFromString(generateXML(wb), "text/xml");
						resolve(el);
					})
                    .catch(error => {
                        alert(error);
                        console.error(error);
                        el.preCranachDoc = null;
                        resolve(el);
                    });
				});
			} else {
				return el;
			}
		});

	}

	this.setBare = function() {
		this.bare = true;
		return this;
	}

	this.setOutput = function(output) {
		this.output = output;
		return this;
	}

	this.setCranachDoc = function(doc) {
		this.cranachDoc = doc;
		return this;
	}
	this.setPreCranachDoc = function(predoc) {
		this.preCranachDoc = predoc;
		return this;
	}
	this.setIndexDoc = function(index) {
		this.indexDoc = index;
		return this;
	}


	/* interact with Browser */

	this.preCranachDocToCranachDoc = function() {
		let el = this;
		let indexDom = this.indexDoc;
		let preCranachDoc = this.preCranachDoc;

		if (indexDom.getElementsByTagName('index')[0]) {
			let index = indexDom.getElementsByTagNameNS("http://www.math.cuhk.edu.hk/~pschan/elephas_index", 'index')[0].cloneNode(true);
			preCranachDoc.getElementsByTagName('root')[0].appendChild(index);
		}

		return new Promise((resolve, reject) => {
			fetch('xsl/cranach.xsl')
				.then(response => response.text())
				.then(xsltext => {
					report('PRECRANACHTOCRANACH');
					xsltProcessor.importStylesheet(domparser.parseFromString(xsltext, "text/xml"));
					let cranachDoc = xsltProcessor.transformToDocument(preCranachDoc);
					el.cranachDoc = cranachDoc;
					resolve(el);
				});
		});
	}

	this.displayPreCranachDocToHtml = function() {
		$(output).find('#loading_icon').show();
		return this.preCranachDocToCranachDoc().then(renderer => {
			return renderer.updateIndexAndRender();
		});
	}
	this.displayCranachDocToHtml = function() {
		report('IN DISPLAYCRANACHDOCTOHTML');
		let xsl = this.bare ? 'xsl/cranach2html_bare.xsl' : 'xsl/cranach2html.xsl';
		let el = this;
		let output = this.output;
		// console.log(output);
		$(output).find('#loading_icon').show();
		$(output).find('.progress-bar').first().css('width', '50%').attr('aria-valuenow', '50');
		// return new Promise((resolve, reject) => {
		// 	$.ajax({
		// 		url: xsl,
		// 		dataType: "xml"
		// 	})
		// 	.done(function(wbxslFile) {
		// 		$(output).find('.progress-bar').css('width', '75%').attr('aria-valuenow', '75');
		// 		setTimeout(function() {
		// 			xsltProcessor.importStylesheet(wbxslFile);
		// 			xsltProcessor.setParameter(null, "timestamp", new Date().getTime());
		// 			xsltProcessor.setParameter('', 'contenturl', el.attr['contentURL']);
		// 			xsltProcessor.setParameter('', 'contentdir', el.attr['dir']);
		// 			$(output).find('.progress-bar').css('width', '80%').attr('aria-valuenow', '80');
		// 			setTimeout(function() {
		// 				let cranachDoc = el.cranachDoc;
		// 				let fragment = xsltProcessor.transformToFragment(cranachDoc, document);
		// 				$(output).html('');
		// 				$(output).append(fragment);
		// 				resolve(el);
		// 			}, 0);
		// 		}, 0);
		// 	});
		// });
		return new Promise((resolve, reject) => {
			fetch(xsl)
			    .then(response => response.text())
				.then(xsltext => {
					$(output).find('.progress-bar').css('width', '75%').attr('aria-valuenow', '75');
					setTimeout(function() {
						xsltProcessor.importStylesheet(domparser.parseFromString(xsltext, "text/xml"));
						xsltProcessor.setParameter(null, "timestamp", new Date().getTime());
						xsltProcessor.setParameter('', 'contenturl', el.attr['contentURL']);
						xsltProcessor.setParameter('', 'contentdir', el.attr['dir']);
						$(output).find('.progress-bar').css('width', '80%').attr('aria-valuenow', '80');
						setTimeout(function() {
							let cranachDoc = el.cranachDoc;
							let fragment = xsltProcessor.transformToFragment(cranachDoc, document);
							$(output).html('');
							$(output).append(fragment);
							resolve(el);
						}, 0);
					}, 0);
				});
			});
		}
		this.xmlDocQueryAndRender = function(output) {
		report('xmlDocQueryAndRender');
		if (output) {
			this.output = output;
		}

		let cranachDoc = this.cranachDoc;
		let queryString = this.attr['query'];
		if (queryString != '') {

			let queries = cranachDoc.evaluate(queryString, cranachDoc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

			let queryDom = document.implementation.createDocument("", "", null);
			let bare = queryDom.createElementNS("http://www.math.cuhk.edu.hk/~pschan/cranach", "root");
			bare.setAttribute('query', 1);

			for ( let i = 0 ; i < queries.snapshotLength; i++ ) {
				bare.appendChild(queries.snapshotItem(i));
			}
			queryDom.appendChild(bare);

			$('.progress-bar').css('width', '75%').attr('aria-valuenow', '75');
			let el = this;

			this.preCranachDoc = queryDom;
			return this.updateIndex().then(cranach => {
				return cranach.preCranachDocToCranachDoc().then(renderer => {
					return renderer.displayCranachDocToHtml();
				});
			});

		} else {
			this.cranachDoc = cranachDoc;
			$('.progress-bar').css('width', '75%').attr('aria-valuenow', '75');

			return this.displayCranachDocToHtml();
		}
	}
	this.updateIndexAndRender = function() {
		return this.updateIndex().then(cranach => {
			return cranach.preCranachDocToCranachDoc().then(renderer => {
				return renderer.xmlDocQueryAndRender();
			});
		});
	}
	this.updateIndex = function() {
		let xmlDom = this.cranachDoc;
		let filename = this.attr['localName'];

		let contents = new XMLSerializer().serializeToString(xmlDom);
		let fileMD5 = md5(contents);

		let docDom = document.implementation.createDocument('http://www.math.cuhk.edu.hk/~pschan/elephas_index', '', null);

		if (this.indexDoc.getElementsByTagNameNS("http://www.math.cuhk.edu.hk/~pschan/elephas_index", 'index').length) {
			docDom.appendChild(this.indexDoc.getElementsByTagNameNS("http://www.math.cuhk.edu.hk/~pschan/elephas_index", 'index')[0]);
		}

		let preindexDom = docDom.createElementNS('http://www.math.cuhk.edu.hk/~pschan/elephas_index', 'preindex');

		let query, newBranches;

		query = "//idx:branch[@filename!='" + filename + "']|//idx:ref[(@filename!='" + filename + "') and (@filename!='self')]|//idx:section";
		let oldBranches = docDom.evaluate(query, docDom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for ( let i = 0 ; i < oldBranches.snapshotLength; i++ ) {
			report('ADDING OLD BRANCH: ' + oldBranches.snapshotItem(i).textContent);
			preindexDom.appendChild(oldBranches.snapshotItem(i));
		}

		query = "//lv:keyword[@slide!='all']";
		newBranches = xmlDom.evaluate(query, xmlDom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for ( let i = 0 ; i < newBranches.snapshotLength; i++ ) {
			report('ADDING NEW BRANCH: ' + newBranches.snapshotItem(i).textContent);
			newBranches.snapshotItem(i).setAttribute('filename', filename);
			newBranches.snapshotItem(i).setAttribute('file_md5', fileMD5);
			newBranches.snapshotItem(i).setAttribute('keyword', newBranches.snapshotItem(i).textContent.toLowerCase());
			preindexDom.appendChild(newBranches.snapshotItem(i));
			report('ADDING OLD BRANCH: ' + newBranches.snapshotItem(i).textContent);
			preindexDom.appendChild(newBranches.snapshotItem(i));
		}


		query = "//lv:statement|//lv:substatement|//lv:figure|//lv:ref|//lv:*[(lv:label) and (@type='Section')]";
		newBranches = xmlDom.evaluate(query, xmlDom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for (let i = 0; i < newBranches.snapshotLength; i++) {
			report('ADDING NEW BRANCH: ' + newBranches.snapshotItem(i).textContent);
			let newBranch = newBranches.snapshotItem(i).cloneNode(true);
			let branch = docDom.createElementNS('http://www.math.cuhk.edu.hk/~pschan/elephas_index', newBranch.tagName);

			if (newBranch.hasAttributes()) {
				let attrs = newBranch.attributes;
				for(let j = attrs.length - 1; j >= 0; j--) {
					branch.setAttribute(attrs[j].name, attrs[j].value);
				}
			}
			branch.setAttribute('filename', filename);
			branch.setAttribute('file_md5', fileMD5);

			let titles = xmlDom.evaluate('./lv:title', newBranch, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			report('TITLES: ' + titles.snapshotLength);
			if (titles.snapshotLength > 0) {
				for (let j = titles.snapshotLength - 1; j >= 0 ; j--) {
					let clone = titles.snapshotItem(j).cloneNode(true);
					branch.appendChild(clone);
				}
			}

			let labels = xmlDom.evaluate('./lv:label', newBranch, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			for (let j = labels.snapshotLength - 1; j >= 0 ; j--) {
				let clone = labels.snapshotItem(j).cloneNode(true);
				branch.appendChild(clone);
			}
			preindexDom.appendChild(branch);
		}

		let el = this;
		return new Promise((resolve, reject) => {
			fetch('xsl/akhawunti.xsl')
			    .then(response => response.text())
				.then(function(xsltext) {
					xsltProcessor.importStylesheet(domparser.parseFromString(xsltext, "text/xml"));
					let indexDoc = xsltProcessor.transformToDocument(preindexDom);
					el.indexDoc = indexDoc;
					resolve(el);
				});
		});

	}

	this.displayIndexDocToHtml = function(target) {
		let contentURLDir = this.attr['rootURL'] + '\/?xml=' + this.attr['dir']
		let indexDoc = this.indexDoc;
		let el = this;
		return new Promise((resolve, reject) => {
			fetch('xsl/index2html.xsl')
			    .then(response => response.text())
				.then(xsltext => {
					xsltProcessor.importStylesheet(domparser.parseFromString(xsltext, "text/xml"));
					xsltProcessor.setParameter('cranach_index', 'contenturldir', contentURLDir);
					fragment = xsltProcessor.transformToFragment(indexDoc, document);
					$(target).html('');
					$(target).append(fragment);
					resolve(el);
			    });
		});
	}

	this.renderWb = function(wbString, output) {
		if (output) {
			this.output = output;
		}

		let xmlString = generateXML(wbString);
		let preCranachDoc = domparser.parseFromString(xmlString, 'text/xml');
		this.preCranachDoc = preCranachDoc;
		return this.displayPreCranachDocToHtml();
	}

	this.render = function(output) {
		if (output) {
			this.output = output;
		}

		if (this.cranachDoc) {
			return this.xmlDocQueryAndRender();
		} else {
			return this.displayPreCranachDocToHtml();
		}
	}

	this.openIndex = function(filePath) {
		let file    = filePath.files[0];
		let reader  = new FileReader();
		reader.addEventListener("load", function () {
			report(reader.result);
			$('#source_text').val(reader.result);
		}, false);
		reader.readAsText(file);
	}
}
