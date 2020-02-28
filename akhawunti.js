this.updateIndex = function(contents, indexDoc, cranach) {

    // $.ajax({
    //     url: indexfile,
    //     dataType: "xml"
    // }).done(function(indexXml) {
    //     var indexDoc = new DOMParser().parseFromString(indexXml);
    // }).fail(function() {
    //     var indexDoc = new DOMParser().parseFromString('<document xmlns="elephas_index"/>');
    // });

    var filename = 'local';

    var preindexDom = indexDoc.createElementNS('elephas_index', 'preindex');

	var xmlDom = new DOMParser().parseFromString(contents, 'text/xml');

	var fileMD5 = md5(contents);

	var select = xpath.useNamespaces({"idx": "elephas_index", "lv":"http://www.math.cuhk.edu.hk/~pschan/cranach"});

	var query = "//idx:branch[@filename!='" + filename + "']|//idx:ref[(@filename!='" + filename + "') and (@filename!='self')]|//idx:section";
	var oldBranches = select(query, indexDoc);
	console.log('BRANCHES: ' + oldBranches.length);
	for (var i = 0; i < oldBranches.length; i++) {
	    console.log('ADDING OLD BRANCH: ' + oldBranches[i].textContent);
	    preindexDom.appendChild(oldBranches[i]);
	}

	var query = "//lv:keyword[@slide!='all']";
	var newBranches = select(query, xmlDom);
	// console.log('NEW KEYWORDS: ' + newBranches.length);
	for (var i = 0; i < newBranches.length; i++) {
	    console.log('ADDING NEW BRANCH: ' + newBranches[i].textContent);
	    newBranches[i].setAttribute('filename', filename);
	    newBranches[i].setAttribute('file_md5', fileMD5);
	    newBranches[i].setAttribute('keyword', newBranches[i].textContent.toLowerCase().replace(/[^a-z0-9\s]/, ' '));
	    newBranches[i].setAttribute('xmlns', 'elephas_index');
	    preindexDom.appendChild(newBranches[i]);
	}

	var query = "//lv:statement|//lv:substatement|//lv:figure|//lv:ref|//lv:*[(lv:label) and (@type='Section')]";

	var newBranches = select(query, xmlDom);

	for (var i = 0; i < newBranches.length; i++) {
        console.log('ADDING NEW BRANCH: ' + newBranches[i].textContent);
	    var newBranch = newBranches[i].cloneNode(true);
	    var branch = indexDoc.createElementNS('elephas_index', newBranch.tagName);
            // console.log('ADDING NEW STATEMENT: ' + newBranches[i].getAttribute('md5'));

	    if (newBranch.hasAttributes()) {
            var attrs = newBranch.attributes;
            for(var j = attrs.length - 1; j >= 0; j--) {
                branch.setAttribute(attrs[j].name, attrs[j].value);
            }
        }
        branch.setAttribute('filename', filename);
        branch.setAttribute('file_md5', fileMD5);
        branch.setAttribute('xmlns', 'elephas_index');

	    var titles = select('./lv:title', newBranch);
        console.log('TITLES: ' + titles.length);
        if (titles.length > 0) {
            for (var j = titles.length - 1; j >= 0 ; j--) {
                var clone = titles[j].cloneNode(true);
                clone.setAttribute('xmlns', 'elephas_index');
                branch.appendChild(clone);
            }
        }

	    var labels = select('lv:label', newBranch);
            for (var j = 0; j < labels.length; j++) {
                var clone = labels[j].cloneNode(true);
                clone.setAttribute('xmlns', 'elephas_index');
                branch.appendChild(clone);
            }
            preindexDom.appendChild(branch);
	}

	// var indexXml =  XMLSerializer.serializeToString(preindexDom);

    $.ajax({
        url: 'xsl/akhawunti.xsl',
        dataType: "xml"
    }).done(function(indexXsl) {
        var xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(indexXsl);
        cranach.attr['indexDoc'] = xsltProcessor.transformToFragment(preindexDom, document);
        cranach.render(document.getElementById('output'));
    });

}
