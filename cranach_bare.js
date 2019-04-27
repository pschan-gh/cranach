function nsResolver(prefix) {
    var ns = {
        'lv' : "http://www.math.cuhk.edu.hk/~pschan/cranach",
        'xh' : 'http://www.w3.org/1999/xhtml',
        'm': 'http://www.w3.org/1998/Math/MathML'
    };
    return ns[prefix] || null;
}

function Cranach(baseURL, id) {
    this.attr = {'wbPath':null, 'xmlPath':null, 'index':null, 'dir':'.', 'query':'document/*', 'doc':null};
    this.hasXML = false;
    this.hasWb = false;
    this.hasIndex = false;
    this.hasQuery = false;
    // this.doc = null;
    this.outputId = 'query_container';
    this.baseURL = baseURL;
    this.id = id.toString();
    console.log('CRANACH: ' + this.id);

    this.preCranachDocToCranachDoc = function(docPreCranach, callback) {
        var el = this;
        $jq.ajax({
            url: 'xsl/cranach.xsl',
            type: "post",
            data:{},
            dataType: "xml",
            success: function(xslFile) {

                var xsltProcessor = new XSLTProcessor();
                xsltProcessor.importStylesheet(xslFile);
                console.log('PRECRANACHTOCRANACH docPrcranach');
                console.log(docPreCranach);

                /* FIREFOX WORK-AROUND */
                preCranachStr = new XMLSerializer().serializeToString(docPreCranach);
                var preCranachDOM = new DOMParser().parseFromString(preCranachStr, 'text/xml');
                /* END FIREFOX WORK-AROUND */

                var docCranach = xsltProcessor.transformToDocument(preCranachDOM, document);
                console.log(docCranach);
                el.attr['doc'] = docCranach;

                callback(docCranach);

            }
        });

    }
    this.displayPreCranachDocToHtml = function(docPreCranach) {
        this.preCranachDocToCranachDoc(docPreCranach, this.displayCranachDocToHtml);
    }

    this.displayCranachDocToHtml = function(docCranach, xsl) {
        var baseURL = this.baseURL;
        $jq.ajax({
            url: 'xsl/cranach2html_bare.xsl',
            data:{},
            type: "GET",
            dataType: "xml",
            success: function(wbxslFile) {
                var xsltProcessor = new XSLTProcessor();
                xsltProcessor.importStylesheet(wbxslFile);
                console.log(baseURL);
                xsltProcessor.setParameter(null, "contenturl", baseURL);
                xsltProcessor.setParameter(null, "timestamp", new Date().getTime());
                console.log('displayCranachDocToHtml');
                console.log(docCranach);
                var fragment = xsltProcessor.transformToFragment(docCranach, document);
                console.log('BARE LML2HTML');
                console.log(fragment);
                console.log('BASE ID: ' + '#query_container_' + id);
                $jq('#query_container_' + id).append(fragment);
                // $jq('#query_container').html(baseURL);
                // $jq('#query_container').html(top.location.href);

            }
        });

    }
    this.xmlDocQuery = function(queryString, docCranach) {
        if (queryString != 'document/*') {
            console.log('XML DOM');
            console.log(docCranach);
            console.log('END XML DOM');

            var queries = docCranach.evaluate(queryString, docCranach, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            var queryDom = document.implementation.createDocument("http://www.math.cuhk.edu.hk/~pschan/cranach", "", null);
            var bare = queryDom.createElementNS("http://www.math.cuhk.edu.hk/~pschan/cranach", "lv:root");
            // bare.setAttribute('query', 1);

            for ( var i = 0 ; i < queries.snapshotLength; i++ ) {
                // console.log('QUERY RESULT: ' + queries.snapshotItem(i).textContent);
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
        }
    }
    this.renderWb = function(wbString) {
        var docPreCranach = generateXML(wbString);
        this.displayPreCranachDocToHtml(docPreCranach);
    }
    this.render = function() {
        var el = this;
        if (this.hasWb) {
            $jq.ajax({
                url:  el.attr['wbPath'],
                success: function(wb) {
                    console.log(wb);
                    el.preCranachDocToCranachDoc(generateXML(wb), function(docCranach) { el.xmlDocQuery(el.attr['query'], docCranach);});
                }
            });
        } else if (this.hasXML) {
            $jq.ajax({
                url:  el.attr['xmlPath'],
                success: function(xml) {
                    el.attr['doc'] = xml;
                    el.xmlDocQuery(el.attr['query'], xml);
                }
            });
        } else {
            this.attr['wbPath'] = 'content/default.wb';
            $jq.ajax({
                url:  'default.wb',
                success: function(wb) {
                    el.preCranachDocToCranachDoc(generateXML(wb), function(docCranach) { el.xmlDocQuery(el.attr['query'], docCranach);});
                }
            });
        }
    }

}
