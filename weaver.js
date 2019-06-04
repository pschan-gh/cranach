function md5(text) {
    return CryptoJS.MD5(text);
}

function generateXML(source) {
    console.log('IN GENERATEXML');
    secNums = {
        'chapter' : 1,
        'section' : 1,
        'subsection': 1,
        'subsubsection' : 1,
        'statement': 1
    }
    docNode = document.implementation.createDocument("", "", null);

    // LEGACY COMPATIBILITY
    var topicTags = source.match(/(@topic{.*?})/g);

    if (typeof topicTags != typeof undefined && topicTags != null) {
        for (var j = 0; j < topicTags.length; j++) {
            // console.log("TOPIC TAGS: " + topicTags[j]);
            var topics = topicTags[j].match(/@topic{(.*?)}/)[1].split(/\<br\/*\>/);
            var topicString = "";
            if (topics.length > 1) {
                for (var i = 0; i < topics.length; i++) {
                    topicString += "@topic{" + topics[i] + "}\n";
                }
                source = source.replace(topicTags[j], topicString);
            }
        }
    }

    source = source.replace(/@sep/g, '@slide')
    .replace(/@def([^n]|$)/g, '@defn$1')
    .replace(/#(nstep|ref|label)/g, '@$1')
    // .replace(/\<hr>/g, '<hr />')
    // .replace(/\<br\s*\>/g, '<br/>')
    .replace(/\<p\s*\>/g, '<p/>')
    .replace(/\<\/p\>/g, '')
    // .replace(/frameborder=(\d+)/g, "frameborder=\"$1\"")
    // .replace(/ href /g, ' href="" ')
    .replace(/(\n\s*){2,}/g, "\n@newline\n")
    .replace(/@slide\s*@(course|week|lecture|chapter|section|subsection|subsubsection)/g, "@$1")
	.replace(/(@@\w+)/g, '<span class="escaped">$1</span>')
    .replace(/@(section|subsection|subsubsection){((?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+)}/g, "@$1\n@title\n$2\n@endtitle");
    // END LEGACY COMPATIBILITY

    var doc = document.implementation.createDocument('http://www.math.cuhk.edu.hk/~pschan/cranach', "", null);

    var root = new Stack(doc.createElementNS('http://www.math.cuhk.edu.hk/~pschan/cranach', 'root'), doc);
    root.node.setAttribute("xmlns:xh", 'http://www.w3.org/1999/xhtml');
    root.node.setAttribute("xmlns", 'http://www.math.cuhk.edu.hk/~pschan/cranach');

    var child = root;

    console.log('MAINTOKENSRE: ' + mainTokensRe.source);

    child.words = source.match(mainTokensRe);
    // console.log(child.words.toString());

    while (child.words.length) {
        child = child.weave();
    }
    console.log('END REACHED: ' + child.node.nodeName);
    child = child.closeTo(/root/i);

    var xmlDoc = child.node;

    console.log('GENERATEXML');
    console.log(xmlDoc);
    return xmlDoc;
    // return xmlString;
}
