function commitWb(editor) {
	let body = showJaxSource('output').getElementsByTagName('body')[0];
	fetch('xsl/html2juengere.xsl')
	.then(response => response.text())
	.then(xsl => {
        let xsltProcessor = new XSLTProcessor();
		let domparser = new DOMParser();
		xsltProcessor.importStylesheet(domparser.parseFromString(xsl, 'text/xml'));
		let preCranachDoc = xsltProcessor.transformToDocument(body,document);
		fetch('xsl/cranach.xsl')
		.then(response => response.text())
		.then(xsl => {
			document.getElementById('source_text').value = '';
			let domparser = new DOMParser();
			xsltProcessor.importStylesheet(domparser.parseFromString(xsl, 'text/xml'));
			console.log('HTML2PRELOVU');
			// console.log(preCranachDoc);
			let cranachDoc = xsltProcessor.transformToDocument(preCranachDoc, document);
			// console.log(cranachDoc);
			return convertCranachDocToWb(cranachDoc, editor);
		});
	});
}

function convertCranachDocToWb(cranachDoc, editor) {
	console.log('convertCranachDocToWb');
	// let nested = /((?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+)/;
	fetch('xsl/cranach2wb.xsl')
	.then(response => response.text())
	.then(xsl => {
        let xsltProcessor = new XSLTProcessor();
		let domparser = new DOMParser();
		xsltProcessor.importStylesheet(domparser.parseFromString(xsl, 'text/xml'));
		console.log(cranachDoc);
		fragment = xsltProcessor.transformToFragment(cranachDoc, document);
		fragmentStr = new XMLSerializer().serializeToString(fragment);
		// console.log(fragmentStr);
		editor.setValue(fragmentStr
			.replace(/@slide(?:\s|\n)*@((course|lecture|week|chapter|section|subsection|subsubsection|topic){(?:.|\n)*?})/g, "@$1")
			.replace(/&lt;/g, '<')
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
		document.querySelectorAll('#output > div.slide').forEach(e => e.classList.add('tex2jax_ignore'));
		inlineEdit(false, editor);
	});
}
