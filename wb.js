function commitWb(editor) {
    var body = showJaxSource('output').getElementsByTagName('body')[0];

    $.ajax({url: 'xsl/html2juengere.xsl'}).done(function(xsl) {
        let xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsl);
        console.log(body);
        let preCranachDoc = xsltProcessor.transformToDocument(body,document);        

        $('#source_text').val('');
        // // DEBUG
        // preCranachStr = new XMLSerializer().serializeToString(preCranachDoc);
        // console.log(preCranachStr);
        // preCranachDoc = new DOMParser().parseFromString(preCranachStr, 'text/xml');
        $.ajax({url: 'xsl/cranach.xsl'}).done(function(xsl) {
            let xsltProcessor2 = new XSLTProcessor();
            xsltProcessor2.importStylesheet(xsl);
            console.log('HTML2PRELOVU');
            console.log(preCranachDoc);
            let cranachDoc = xsltProcessor2.transformToDocument(preCranachDoc, document);
            console.log(cranachDoc);
            convertCranachDocToWb(cranachDoc, editor);
        });
    });

}

function convertCranachDocToWb(cranachDoc, editor) {
    console.log('convertCranachDocToWb');

    // let nested = /((?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+)/;
    $.ajax({
        url: 'xsl/cranach2wb.xsl',
        dataType: "xml"
    })
    .done(function(xsl) {
        var xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsl);
        fragment = xsltProcessor.transformToFragment(cranachDoc, document);
        fragmentStr = new XMLSerializer().serializeToString(fragment);
        // console.log(fragmentStr);
        editor.setValue(fragmentStr
            .replace(/@slide(?:\s|\n)*@((course|lecture|week|chapter|section|subsection|subsubsection|topic){(?:.|\n)*?})/g, "@$1")
            .replace(/&lt;/g, '< ')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&apos;/g, "'")
            .replace(/\\class{steps}{\\cssId{step\d+}{((?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+)}}/g, '@nstep{$1}')
            .replace(/\n\s*/g, "\n")
            .replace(/(\s*@newline\s*)+/g, "\n\n")
            .replace(/{\n+/g, '{')
            .replace(/\n+}/g, '}')
            .replace(/^\n/, '')
            .replace(/ *\n/g, "\n")
        , 1);
        $('#output div.slide').addClass('tex2jax_ignore');
        inlineEdit(false, editor);
    });
}
