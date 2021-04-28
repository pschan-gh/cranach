function nsResolver(prefix) {
    var ns = {
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
    console.log(this.rootURL);
    console.log(this.params);

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
        'cranachString': '',
        'preCranachString': '',
        'localName':'untitled',
        'editor':null,
        'editMode':false,
        /* Initial Presentation */
        'selectedItem' : null,
        'selectedSection' : null,
        'selectedSlide' : 1,
        'selectedKeyword' : null,
        'present' : false,
        /* DOM elements */
        'preCranachDoc': null,
        'cranachDoc': null,
        'indexDoc': null,
        'lectureMode' : 0
    };

    this.hasXML = false;
    this.hasWb = false;
    this.macroString = '';
    this.macros = '';
    this.bare = false;
    this.output = null;

    this.loadMacros = function() {
        return new Promise((resolve, reject) => {
            var el = this;
            var ajax = $.ajax({
                url:  el.attr['dir'] + '/macros.tex',
                dataType: "text"
            })
            .done(function(macros) {
                report('MACROS FILE FOUND');
                el.macrosString = macros;
                el.macros = new DOMParser().parseFromString('<div>\\(' + macros + '\\)</div>', "text/xml");
                // el.macros = new DOMParser().parseFromString('<div>\\(' + macros + '\\)</div>', "text/xml");
                resolve(el);
            })
            .fail(function() {
                report('NO MACROS FILE PRESENT');
                el.macrosString = '';
                el.macros = new DOMParser().parseFromString('<div>\\(\\)</div>', "text/xml");
                resolve(el);
            });
        });
    }

    this.loadIndex = function() {
        var el = this;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: el.attr['dir'] + '/' + el.attr['index'] + '?version='+Math.random(),
                // url: el.attr['dir'] + '/' + el.attr['index'],
                dataType: 'xml'
            })
            .done(function(indexDoc) {
                el.attr['indexDoc'] = indexDoc;
                console.log(indexDoc);
                resolve(el);
            })
            .fail(function() {
                report("INDEX FILE DOESN'T EXIST");
                resolve(el);
            })
        });
    }

    this.setup = function(options) {
        this.output = document.getElementById(this.attr['outputID']);
        var domparser = new DOMParser();
        if (this.params) {
            var params = this.params;
            var urlParams = new URLSearchParams(params[1]);
            report('URLPARAMS: ' + urlParams);
            if(urlParams.has('wb') || urlParams.has('xml')) {
                var pathname = urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');
                this.attr['filepath'] = pathname;
                var match;
                var dir = '';
                if (match = pathname.match(/^(.*?)\/[^\/]+\.(?:wb|xml)/)) {
                    dir = match[1];
                }
                console.log('DIR: ' + dir);
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
                var query = urlParams.get('query');
                report('QUERY: ' + query);
                this.hasQuery = true;
                this.attr['query'] = query;
            }

            if (urlParams.has('slide')) {
                // this.attr['slideIndex'] = urlParams.get('slide');;
                this.attr['selectedSlide'] = urlParams.get('slide');
                console.log('SLIDE: ' + this.attr['selectedSlide']);
            }
            if (urlParams.has('present')) {
                this.attr['present'] = true;
            }
            if (urlParams.has('item')) {
                this.attr['selectedItem'] = urlParams.get('item');
            }
            if (urlParams.has('section')) {
                this.attr['selectedSection']= urlParams.get('section');
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

        if(options) {
            for (let key in options){
                if(options.hasOwnProperty(key)){
                    this.attr[key] = options[key];
                }
            }
        }

        console.log(this.attr);


        var el = this;

        return this.loadMacros()
        .then(cranach => cranach.loadIndex())
        .then(cranach => {
            if (cranach.attr['indexDoc'] == null) {
                var docDom = document.implementation.createDocument ('http://www.math.cuhk.edu.hk/~pschan/elephas_index', '', null);
                var preindexDom = docDom.createElementNS('http://www.math.cuhk.edu.hk/~pschan/elephas_index', 'index');
                docDom.appendChild(preindexDom);
                this.attr['indexDoc'] = docDom;
            }
            var el = cranach;
            if (el.attr['xmlPath']) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url:  el.attr['xmlPath'] + '?version=' + Math.random(),
                        dataType: "xml"
                    })
                    .done(function(xml) {
                        $('.progress-bar').css('width', '50%').attr('aria-valuenow', '50');
                        el.attr['cranachDoc'] = xml;
                        resolve(el);
                    })
                    .fail(function(xml){
                        el.attr['cranachDoc'] = null;
                        resolve(el);
                    });
                });
            }  else if (el.attr['wbPath']) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url:  el.attr['wbPath'] + '?version=' + Math.random(),
                        dataType: "text"
                    })
                    .done(function(wb) {
                        // editor.setValue(wb, 1);
                        el.attr['preCranachDoc'] = domparser.parseFromString(generateXML(wb), "text/xml");
                        console.log(el.attr['preCranachDoc']);
                        resolve(el);
                    })
                    .fail(function(wb){
                        el.attr['preCranachDoc'] = null;
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
        this.attr['cranachDoc'] = doc;
        return this;
    }
    this.setPreCranachDoc = function(predoc) {
        this.attr['preCranachDoc'] = predoc;
        return this;
    }
    this.setIndexDoc = function(index) {
        this.attr['indexDoc'] = index;
        return this;
    }


    /* interact with Browser */

    this.preCranachDocToCranachDoc = function() {
        var el = this;
        var xsltProcessor = new XSLTProcessor();
        var indexDom = this.attr['indexDoc'];
        console.log(indexDom);

        var preCranachDoc = this.attr['preCranachDoc'];

        if (indexDom.getElementsByTagName('index')[0]) {
            var index = indexDom.getElementsByTagNameNS("http://www.math.cuhk.edu.hk/~pschan/elephas_index", 'index')[0].cloneNode(true);
            console.log(index);
            // index.setAttribute('xmlns', 'http://www.math.cuhk.edu.hk/~pschan/elephas_index');
            preCranachDoc.getElementsByTagName('root')[0].appendChild(index);
        }
        console.log(preCranachDoc);

        var el = this;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'xsl/cranach.xsl',
                dataType: "xml"
            })
            .done(function(xslFile) {
                report('PRECRANACHTOCRANACH');
                // report(preCranachDoc);
                xsltProcessor.importStylesheet(xslFile);

                /* FIREFOX WORK-AROUND */
                // preCranachStr = new XMLSerializer().serializeToString(preCranachDoc);
                // var preCranachDOM = new DOMParser().parseFromString(preCranachStr, 'text/xml');
                /* END FIREFOX WORK-AROUND */

                console.log(preCranachDoc);
                var cranachDoc = xsltProcessor.transformToDocument(preCranachDoc);
                console.log(cranachDoc);
                el.attr['cranachDoc'] = cranachDoc;

                resolve(el);
            });
        });
    }

    this.displayPreCranachDocToHtml = function() {
        $('#loading_icon').show();
        // this.preCranachDocToCranachDoc(preCranachDoc, function(cranachDoc) {el.updateIndexToHtml(cranachDoc, output);});
        return this.preCranachDocToCranachDoc().then(renderer => {
            return renderer.updateIndexAndRender();
        });
    }
    this.displayCranachDocToHtml = function() {
        // var cranachDoc = this.attr['cranachDoc'];
        report('IN DISPLAYCRANACHDOCTOHTML');
        // report(cranachDoc);
        var xsltProcessor = new XSLTProcessor();
        var xsl = this.bare ? 'xsl/cranach2html_bare.xsl' : 'xsl/cranach2html.xsl';
        var el = this;
        var output = this.output;
        console.log(output);
        $(output).find('#loading_icon').show();
        $(output).find('.progress-bar').first().css('width', '50%').attr('aria-valuenow', '50');
        return new Promise((resolve, reject) => {
            $.ajax({
                url: xsl,
                dataType: "xml"
            })
            .done(function(wbxslFile) {
                $(output).find('.progress-bar').css('width', '75%').attr('aria-valuenow', '75');
                setTimeout(function() {
                    xsltProcessor.importStylesheet(wbxslFile);
                    xsltProcessor.setParameter(null, "timestamp", new Date().getTime());
                    console.log(el.attr['contentURL']);
                    xsltProcessor.setParameter('', 'contenturl', el.attr['contentURL']);
                    xsltProcessor.setParameter('', 'contentdir', el.attr['dir']);
                    // xsltProcessor.setParameter('', 'contenturl', '');
                    console.log('displayCranachDocToHtml');
                    $(output).find('.progress-bar').css('width', '80%').attr('aria-valuenow', '80');
                    setTimeout(function() {
                        var cranachDoc = el.attr['cranachDoc'];
                        console.log(cranachDoc);
                        var fragment = xsltProcessor.transformToFragment(cranachDoc, document);
                        console.log(fragment);
                        // var str = new XMLSerializer().serializeToString(fragment).replace(/\n+(,|\))/g, "$1"); // UGH!
                        $(output).html('');
                        // $(output).html(str);
                        $(output).append(fragment);
                        resolve(el);
                    }, 0);
                }, 0);
            });
        });
    }
    this.xmlDocQueryAndRender = function(output) {
        if (output) {
            this.output = output;
        }

        var cranachDoc = this.attr['cranachDoc'];
        var queryString = this.attr['query'];
        console.log(queryString);
        if (queryString != '') {
            report('XML DOM');
            report(cranachDoc);
            report('END XML DOM');

            var queries = cranachDoc.evaluate(queryString, cranachDoc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            var queryDom = document.implementation.createDocument("", "", null);
            var bare = queryDom.createElementNS("http://www.math.cuhk.edu.hk/~pschan/cranach", "root");
            bare.setAttribute('query', 1);

            for ( var i = 0 ; i < queries.snapshotLength; i++ ) {
                bare.appendChild(queries.snapshotItem(i));
            }
            queryDom.appendChild(bare);

            report('QUERY DOM');
            report(queryDom);
            report('END QUERY DOM');

            this.attr['preCranachDoc'] = queryDom;

            $('.progress-bar').css('width', '75%').attr('aria-valuenow', '75');
            var el = this;

            return this.updateIndex().then(cranach => {
                return cranach.preCranachDocToCranachDoc().then(renderer => {
                    return renderer.displayCranachDocToHtml();
                });
            });
        } else {
            this.attr['cranachDoc'] = cranachDoc;
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
        console.log('UPDATEINDEXTOHTML');
        var cranachDoc = this.attr['cranachDoc'];
        // var filename = 'local';
        var filename = this.attr['localName'];
        var contents = new XMLSerializer().serializeToString(cranachDoc);

        var docDom = document.implementation.createDocument('http://www.math.cuhk.edu.hk/~pschan/elephas_index', '', null);
        console.log(this.attr['indexDoc']);
        if (this.attr['indexDoc'].getElementsByTagNameNS("http://www.math.cuhk.edu.hk/~pschan/elephas_index", 'index').length) {
            docDom.appendChild(this.attr['indexDoc'].getElementsByTagNameNS("http://www.math.cuhk.edu.hk/~pschan/elephas_index", 'index')[0]);
        }
        // console.log(docDom);

        var preindexDom = docDom.createElementNS('http://www.math.cuhk.edu.hk/~pschan/elephas_index', 'preindex');

        var xmlDom = cranachDoc;

        var fileMD5 = md5(contents);

        var query = "//idx:branch[@filename!='" + filename + "']|//idx:ref[(@filename!='" + filename + "') and (@filename!='self')]|//idx:section";
        // var oldBranches = select(query, docDom);
        var oldBranches = docDom.evaluate(query, docDom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for ( var i = 0 ; i < oldBranches.snapshotLength; i++ ) {
            report('ADDING OLD BRANCH: ' + oldBranches.snapshotItem(i).textContent);
            preindexDom.appendChild(oldBranches.snapshotItem(i));
        }


        var query = "//lv:keyword[@slide!='all']";
        var newBranches = xmlDom.evaluate(query, xmlDom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);


        for ( var i = 0 ; i < newBranches.snapshotLength; i++ ) {
            report('ADDING NEW BRANCH: ' + newBranches.snapshotItem(i).textContent);
            newBranches.snapshotItem(i).setAttribute('filename', filename);
            newBranches.snapshotItem(i).setAttribute('file_md5', fileMD5);
            newBranches.snapshotItem(i).setAttribute('keyword', newBranches.snapshotItem(i).textContent.toLowerCase());
            preindexDom.appendChild(newBranches.snapshotItem(i));
            report('ADDING OLD BRANCH: ' + newBranches.snapshotItem(i).textContent);
            preindexDom.appendChild(newBranches.snapshotItem(i));
        }


        var query = "//lv:statement|//lv:substatement|//lv:figure|//lv:ref|//lv:*[(lv:label) and (@type='Section')]";

        // var newBranches = select(query, xmlDom);
        var newBranches = xmlDom.evaluate(query, xmlDom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for (var i = 0; i < newBranches.snapshotLength; i++) {
            report('ADDING NEW BRANCH: ' + newBranches.snapshotItem(i).textContent);
            var newBranch = newBranches.snapshotItem(i).cloneNode(true);
            var branch = docDom.createElementNS('http://www.math.cuhk.edu.hk/~pschan/elephas_index', newBranch.tagName);
            // report('ADDING NEW STATEMENT: ' + newBranches[i].getAttribute('md5'));

            if (newBranch.hasAttributes()) {
                var attrs = newBranch.attributes;
                for(var j = attrs.length - 1; j >= 0; j--) {
                    branch.setAttribute(attrs[j].name, attrs[j].value);
                }
            }
            branch.setAttribute('filename', filename);
            branch.setAttribute('file_md5', fileMD5);

            // var titles = select('./lv:title', newBranch);
            var titles = xmlDom.evaluate('./lv:title', newBranch, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            report('TITLES: ' + titles.snapshotLength);
            if (titles.snapshotLength > 0) {
                for (var j = titles.snapshotLength - 1; j >= 0 ; j--) {
                    var clone = titles.snapshotItem(j).cloneNode(true);
                    branch.appendChild(clone);
                }
            }

            // var labels = select('lv:label', newBranch);
            var labels = xmlDom.evaluate('./lv:label', newBranch, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            // console.log('LABELS: ' + labels.snapshotLength);
            for (var j = labels.snapshotLength - 1; j >= 0 ; j--) {
                var clone = labels.snapshotItem(j).cloneNode(true);
                branch.appendChild(clone);                
            }
            preindexDom.appendChild(branch);
            // console.log(branch);
        }
        
        var el = this;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'xsl/akhawunti.xsl',
                dataType: "xml"
            }).done(function(indexXsl) {
                var xsltProcessor = new XSLTProcessor();
                xsltProcessor.importStylesheet(indexXsl);
                console.log(preindexDom);
                var indexDoc = xsltProcessor.transformToDocument(preindexDom);

                console.log(indexDoc);
                el.attr['indexDoc'] = indexDoc;

                resolve(el);
            });
        });

    }

    this.displayIndexDocToHtml = function(target) {
        // var contentURLDir = this.attr['contentURLDir'];
        var contentURLDir = this.attr['rootURL'] + '\/?xml=' + this.attr['dir']
        var indexDoc = this.attr['indexDoc'];
        var el = this;
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'xsl/index2html.xsl',
                dataType: "xml"
            })
            .done(function(wbxslFile) {
                var xsltProcessor = new XSLTProcessor();
                xsltProcessor.importStylesheet(wbxslFile);
                xsltProcessor.setParameter('cranach_index', 'contenturldir', contentURLDir);
                fragment = xsltProcessor.transformToFragment(indexDoc, document);
                console.log('INDEX FRAGMENT');
                console.log(fragment);
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

        $('.slide').each(function() {
            $(this).addClass('tex2jax_ignore');
        });

        var xmlString = generateXML(wbString);
        console.log(xmlString);
        var preCranachDoc = new DOMParser().parseFromString(xmlString, 'text/xml');
        console.log(preCranachDoc);
        this.attr['preCranachDoc'] = preCranachDoc;
        return this.displayPreCranachDocToHtml();
    }

    this.render = function(output) {
        if (output) {
            this.output = output;
        }

        if (this.attr['cranachDoc']) {
            return this.xmlDocQueryAndRender();
        } else {
	    return this.displayPreCranachDocToHtml();
        }
    }

    this.openIndex = function(filePath) {
        var file    = filePath.files[0];
        var reader  = new FileReader();
        reader.addEventListener("load", function () {
            report(reader.result);
            $('#source_text').val(reader.result);
        }, false);
        reader.readAsText(file);
    }

}
