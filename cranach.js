function nsResolver(prefix) {
    var ns = {
        'lv' : "http://www.math.cuhk.edu.hk/~pschan/cranach",
        'xh' : 'http://www.w3.org/1999/xhtml',
        'm': 'http://www.w3.org/1998/Math/MathML'
    };
    return ns[prefix] || null;
}

function openWb(filePath) {

    var file    = filePath.files[0];
    var reader  = new FileReader();

    console.log('READER');
    console.log(file);

    reader.addEventListener("load", function () {
        console.log('READER RESULT');
        console.log(reader.result);
        editor.setValue(reader.result, 1);
    }, false);

    if (file) {
        // https://stackoverflow.com/questions/857618/javascript-how-to-extract-filename-from-a-file-input-control
        var fullPath = filePath.value;
        if (fullPath) {
            var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
            var filename = fullPath.substring(startIndex);
            if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                filename = filename.substring(1);
            }
        }
        reader.readAsText(file);
    }
}

function saveText(text, cranach, ext) {
    var dummyLink = document.createElement('a');
    uriContent = "data:application/octet-stream," + encodeURIComponent(text);
    console.log('URICONTENT');
    console.log(uriContent);
    dummyLink.setAttribute('href', uriContent);

    var filename = cranach.attr['localName'];

    dummyLink.setAttribute('download', filename + '.' + ext);
    dummyLink.click();
}

function Cranach(rootURL, params) {
    this.attr = {
        'wbPath':'content/default.wb',
        'xmlPath':null,
        'filepath':'',
        'index':'index.xml',
        'dir':'.',
        'contentURLDir':'',
        'query':'',
        'outputID': 'output',
        'doc':null,
        'localName':'untitled'
    };
    this.hasXML = false;
    this.hasWb = false;
    this.hasIndex = false;
    this.hasQuery = false;
    this.selectedItem = null;
    this.selectedSlide = 1;
    this.present = false;
    // this.doc = null;
    // this.outputId = 'output';
    this.postprocess = postprocess;
    this.preprocess = function() {$('.icon.latex, .icon.xml').hide();};
    this.rootURL = rootURL;
    this.contentURL = rootURL + '?wb=content/default.wb';
    this.contentURLDir = rootURL;
    this.macros = null;

    this.setup = function() {
        if (params) {
            var urlParams = new URLSearchParams(params[1]);
            console.log('URLPARAMS: ' + urlParams);
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
                    this.contentURL = this.rootURL + '\/?wb=' + this.attr['wbPath'];
                    this.contentURLDir = this.rootURL + '\/?wb=' + this.attr['dir'];
                    this.attr['contentURLDir'] = this.rootURL + '\/?wb=' + this.attr['dir'];
                } else if (urlParams.has('xml')){
                    this.attr['xmlPath'] = pathname;
                    this.contentURL = this.rootURL + '\/?xml=' + this.attr['xmlPath'];
                    this.attr['contentURLDir'] = this.rootURL + '\/?xml=' + this.attr['dir'];
                }
                this.attr['localName'] = pathname.match(/([^\/]+)\.(?:wb|xml)$/)[1];
            }

            if (urlParams.has('query')) {
                console.log('HAS QUERY');
                var query = urlParams.get('query');
                console.log('QUERY: ' + query);
                this.hasQuery = true;
                this.attr['query'] = query;
            }

            if (urlParams.has('slide')) {
                this.selectedSlide = urlParams.get('slide');
                console.log('SLIDE: ' + urlParams.get('slide'));
            }
            if (urlParams.has('present')) {
                this.present = true;
            }
            if (urlParams.has('item')) {
                this.selectedItem = urlParams.get('item');
            }
        }

        return this;

    }

    this.getRootURL = function() {
        return this.rootURL;
    }

    this.preCranachDocToCranachDoc = function(docPreCranach, callback) {
        var el = this;
        var xsltProcessor = new XSLTProcessor();
        $.ajax({
            url: 'xsl/cranach.xsl',
            dataType: "xml"
        })
        .done(function(xslFile) {
            console.log('PRECRANACHTOCRANACH');
            // console.log(docPreCranach);
            xsltProcessor.importStylesheet(xslFile);

            /* FIREFOX WORK-AROUND */
            preCranachStr = new XMLSerializer().serializeToString(docPreCranach);
            var preCranachDOM = new DOMParser().parseFromString(preCranachStr, 'text/xml');
            /* END FIREFOX WORK-AROUND */

	    console.log(preCranachDOM);
            var docCranach = xsltProcessor.transformToDocument(preCranachDOM);
            console.log(docCranach);
            el.attr['doc'] = docCranach;
            if(!el.hasWb) {
                el.convertCranachDocToWb(docCranach);
            }
            callback(docCranach);
        });
    }
    this.displayPreCranachDocToHtml = function(docPreCranach) {
        $('#loading_icon').show();
        this.preCranachDocToCranachDoc(docPreCranach, this.displayCranachDocToHtml);
    }
    this.displayIndexDocToHtml = function(docIndex, target) {
        var contentURLDir = this.attr['contentURLDir'];
        $.ajax({
            url: 'xsl/index2html.xsl',
            data:{},
            type: "GET",
            dataType: "xml"
        })
        .done(function(wbxslFile) {
            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(wbxslFile);
            xsltProcessor.setParameter('cranach_index', 'contenturldir', contentURLDir);
            fragment = xsltProcessor.transformToFragment(docIndex, document);
            console.log('INDEX FRAGMENT');
            console.log(fragment);
            $(target).html('');
            $(target).append(fragment);
        });
    }
    this.displayCranachDocToHtml = function(docCranach) {
	console.log('IN DISPLAYCRANACHDOCTOHTML');
	var xsltProcessor = new XSLTProcessor();
        var xsl = 'xsl/cranach2html.xsl';
        var el = this;
        $('#loading_icon').show();
        $.ajax({
            url: xsl,
            dataType: "xml"
        })
        .done(function(wbxslFile) {
                xsltProcessor.importStylesheet(wbxslFile);
                xsltProcessor.setParameter(null, "timestamp", new Date().getTime());
                console.log('displayCranachDocToHtml');
                console.log(docCranach);
                var fragment = xsltProcessor.transformToFragment(docCranach, document);
                console.log('LML2HTML');
                console.log(fragment);
                var output = document.getElementById('output');
                $(output).html('');
                $(output).append(fragment);
                el.postprocess();
        });
    }

    this.xmlDocQuery = function(queryString, docCranach) {
        if (queryString != '') {
            console.log('XML DOM');
            console.log(docCranach);
            console.log('END XML DOM');

            var queries = docCranach.evaluate(queryString, docCranach, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            var queryDom = document.implementation.createDocument("", "", null);
            var bare = queryDom.createElementNS("http://www.math.cuhk.edu.hk/~pschan/cranach", "lv:root");
            bare.setAttribute('query', 1);

            for ( var i = 0 ; i < queries.snapshotLength; i++ ) {
                bare.appendChild(queries.snapshotItem(i));
            }
            queryDom.appendChild(bare);

            console.log('QUERY DOM');
            console.log(queryDom);
            console.log('END QUERY DOM');

            this.attr['doc'] = queryDom;

            this.preCranachDocToCranachDoc(queryDom, this.displayCranachDocToHtml);
        } else {
            this.attr['doc'] = docCranach;
            this.displayCranachDocToHtml(docCranach);
            this.convertCranachDocToWb(docCranach);
        }
    }
    this.convertCranachDocToWb = function(docCranach) {
        console.log('convertCranachDocToWb');
        var el = this;
        $.ajax({
            url: 'xsl/cranach2wb.xsl',
        })
        .done(function(xsl) {
            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsl);
            fragment = xsltProcessor.transformToFragment(docCranach, document);
            //console.log(fragment);
            fragmentStr = new XMLSerializer().serializeToString(fragment);
            // console.log(fragmentStr);
            editor.setValue(fragmentStr
                .replace(/(\n(\ )*)+/g, "\n")
                .replace(/@newline\s*/g, "\n\n")
                .replace(/&amp;/g, '&')
                .replace(/\<\/*root\>/g, '')
                .replace(/@((course|week|lecture|chapter|section|subsection|subsubsection)(?:{.*?}))\n*@slide/g, "@$1")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&')
		.replace(/&apos;/g, "'")
		.replace(/^\n*/, '')
                , 1);
                resetHighlight();
                showTexSource(false);
        });
    }

    this.renderWb = function(wbString) {
        this.preprocess();
        var docPreCranach = generateXML(wbString);
        $('.slide').each(function() {
            $(this).addClass('tex2jax_ignore');
        });
        this.displayPreCranachDocToHtml(docPreCranach);
    }

    this.render = function() {
        console.clear();
        this.preprocess();

        var el = this;

        $.ajax({
            url:  'macros.tex',
            dataType: "text"
        })
        .done(function(macros) {
            console.log('MACROS FILE FOUND');
            console.log(macros);
            el.macros = new DOMParser().parseFromString('<div>\\(' + macros + '\\)</div>', "text/xml");
        })
        .fail(function() {
            console.log('NO MACROS FILE PRESENT');
        })
        .always(function() {
            if (el.attr['xmlPath']) {
                $.ajax({
                    url:  el.attr['xmlPath'],
                    dataType: "xml"
                })
                .done(function(xml) {
                    el.attr['doc'] = xml;
                    el.xmlDocQuery(el.attr['query'], xml);
                });
            }  else if (el.attr['wbPath']) {
                $.ajax({
                    url:  el.attr['wbPath'],
                    dataType: "text"
                })
                .done(function(wb) {
                    // console.log(wb);
                    editor.setValue(wb, 1);
                    el.preCranachDocToCranachDoc(generateXML(wb), function(docCranach) { el.xmlDocQuery(el.attr['query'], docCranach);});
                });
            }
        });

        $.ajax({
            url:  el.attr['dir'] + '/' + el.attr['index']
        })
        .done(function(index) {
            console.log('DISPLAYING INDEX: ' + el.attr['dir'] + '/' + el.attr['index']);
            console.log(index);
            el.displayIndexDocToHtml(index, $('#index')[0]);
        })
        .fail(function() {
            console.log("INDEX FILE DOESN'T EXIST");
            return 0;
        });
    }
    this.showXML = function() {
        $('.render.xml').show();
        $('#source_text').val('');
        $('#source_text').val(new XMLSerializer().serializeToString(this.attr['doc']));
        $('#wb_modal').find('button.save').attr('ext', 'xml');
        $('#wb_modal').find('.modal-title').html('Cranach XML');

    }
    this.showLatex = function() {
        $('.render.xml').hide();

        var xsltProcessor = new XSLTProcessor();
        $('#wb_modal').find('button.save').attr('ext', 'tex');
        $('#wb_modal').find('.modal-title').html('LaTeX');

        var docCranach = this.attr['doc'];
        var contentURLDir = this.attr['contentURLDir'];
        $.ajax({
            url: 'xsl/cranach2latex.xsl',
        })
        .done(function(xsl) {
            var oParser = new DOMParser();
            var xml = new XMLSerializer().serializeToString(docCranach);
            xml = xml.replace(/&lt;(div|table|thead|tr|td|th|a)\s*.*?&gt;/g, '<$1>');
            xml = xml.replace(/&lt;\/(div|table|thead|tr|td|th|a)\s*&gt;/g, '</$1>');
            xml = xml.replace(/#/g, '\#');
            console.log(xml);
            var xmlDOM = oParser.parseFromString(xml, "application/xml");
            xsltProcessor.importStylesheet(xsl);
            xsltProcessor.setParameter('', 'contenturldir', contentURLDir);
            fragment = xsltProcessor.transformToFragment(xmlDOM, document);
            console.log(fragment);
            fragmentStr = new XMLSerializer().serializeToString(fragment);
            $('#source_text').val('');
            var latex = fragmentStr.replace(/\n\n\n*/g, "\n\n")
                .replace(/\n(\ )*/g, "\n")
                .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                .replace(/\<!--.*?--\>/g, '')
                .replace(/&amp;/g, "&")
                .replace(/\\class{.*?}/g, '')
                .replace(/&ocirc/g, '\\^o');
            $('#source_text').val(latex);
        });
    }

    this.saveWb = function() {
        saveText(editor.session.getValue(), this, 'wb');
    }

    this.openXml = function(filePath) {

        editor.setValue('');

        var file    = filePath.files[0];
        var reader  = new FileReader();

        console.log('READER');
        console.log(file);

        var el = this;
        reader.addEventListener("load", function () {
            console.log('READER RESULT');
            console.log(reader.result);
            var docCranach = new DOMParser().parseFromString(reader.result, "application/xml");
            el.displayCranachDocToHtml(docCranach);
            if(!el.hasWb) {
                el.convertCranachDocToWb(docCranach);
            }
        }, false);

        if (file) {
            // https://stackoverflow.com/questions/857618/javascript-how-to-extract-filename-from-a-file-input-control
            var fullPath = filePath.value;
            if (fullPath) {
                var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
                var filename = fullPath.substring(startIndex);
                if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                    filename = filename.substring(1);
                }
                this.attr['localName'] = filename;
            }
            reader.readAsText(file);
        }
    }

}
