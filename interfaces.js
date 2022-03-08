function saveText(text, renderer, ext) {
	let dummyLink = document.createElement('a');
	uriContent = "data:application/octet-stream," + encodeURIComponent(text);
	dummyLink.setAttribute('href', uriContent);

	let filename = renderer.attr['localName'];
	console.log(filename);
	dummyLink.setAttribute('download', filename.replace(/\.[^\.]+$/, '') + '.' + ext);
	dummyLink.click();
}

function saveWb(editor, renderer) {
	saveText(editor.session.getValue(), renderer, 'wb');
}

function collectNewcommands(str) {
	let commandsStr = '';
	let obj = new Object();
	let commands = str.match(/(\\(re)?newcommand{.*?}(?:\[\d+\])*{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+})/g);

	if (commands == null || typeof commands == typeof undefined) {
		return '';
	}
	for (let i = 0; i < commands.length; i++) {
		let matches = commands[i].match(
			/\\(?:re)?newcommand{(.*?)}((?:\[\d+\])*{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+})/
		);
		obj[matches[1]] = matches[2];
	}

	for (const property in obj) {
		commandsStr += '\\newcommand{' + property + '}' + obj[property] + "\n";
	}
	return commandsStr;
}

function showLatex(el, mode = 'report') {
	const textModal = document.getElementById('text_modal');

	textModal.querySelector('.modal-footer').classList.add('latex');

	textModal.querySelector('button.save').setAttribute('ext', 'tex');
	textModal.querySelector('.modal-title').textContent = 'LaTeX';

	const docCranach = el.cranachDoc;
	const contentURLDir = el.attr['contentURLDir'];
	const contentURL = el.attr['contentURL'];

	const xslFile = mode == 'report' ?  'xsl/cranach2latex.xsl' : 'xsl/cranach2beamer.xsl';

	fetch(xslFile + '?version=' + Math.random())
    .then(response => response.text())
    .then(xsl => {
        let xml = new XMLSerializer().serializeToString(docCranach);
		xml = xml.replace(/&lt;(div|table|thead|tr|td|th|a)\s*.*?&gt;/g, '<$1>');
		xml = xml.replace(/&lt;\/(div|table|thead|tr|td|th|a)\s*&gt;/g, '</$1>');
		xml = xml.replace(/#/g, '\#');

		let xmlDOM = domparser.parseFromString(xml, "application/xml");
        let xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(domparser.parseFromString(xsl, "text/xml"));
		xsltProcessor.setParameter('', 'contenturldir', contentURLDir);
		xsltProcessor.setParameter('', 'contenturl', contentURL);

		let fragment = xsltProcessor.transformToFragment(xmlDOM, document);
		report(fragment);
		fragmentStr = new XMLSerializer().serializeToString(fragment);

		let latex = fragmentStr.replace(/\n\n\n*/g, "\n\n")
		.replace(/\n(\ )*/g, "\n")
		.replace(/\<!--.*?--\>/g, '')
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
		.replace(/\\class{.*?}/g, '')
		.replace(/\\cssId{.*?}/g, '')
		.replace(/&ocirc/g, '\\^o')
		.replace(/\\href{([^}]+)}{([^}]+)}/g, (match) => {
			return match.replace(/_/g, '\\_');
		});

		let tmp = el.macrosString + "\n" +  latex;

		latex = collectNewcommands(tmp) + latex.replace(
			/(\\newcommand{.*?}(?:\[\d+\])*{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+})/g, '')
		.replace(/section{\s*(.*?)\s*}/g, "section{$1}");

		document.getElementById('source_text').value = latex;
	});
}

function showXML(el) {
	const textModal = document.getElementById('text_modal');

	textModal.querySelector('.modal-footer').classList.add('xml');

	textModal.querySelector('button.save').setAttribute('ext', 'xml');
	textModal.querySelector('.modal-title').textContent = 'Cranach XML';

	document.getElementById('source_text').value =
	new XMLSerializer().serializeToString(el.cranachDoc);
}

function initGhDialog(editor) {

	const ghModal = document.getElementById('gh_modal');
	ghModal.querySelector('.feedback .message').innerHTML = '';

	const contentURL = window.location.href;
	const params = window.location.href.match(/\?(.*?)(#|$)/);

	const urlParams = new URLSearchParams(params[1]);
	const pathname =
	urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');
	const localFilenameRoot = pathname.match(/(local|([^\/]+))\.(?:wb|xml)$/)[1];

	let ghRepoUsername;
	let ghRepo;

	let gh_match = contentURL.match(/raw\.githubusercontent.com\/(.*?)\/(.*?)\//);
	if (gh_match) {
		ghRepoUsername = gh_match[1];
		ghRepo = gh_match[2];
	} else {
		gh_match = contentURL.match(/([^\/]+)\/([^\/]+)\.(xml|wb)/);
		ghRepoUsername = 'ENTER USERNAME';
		ghRepo = gh_match ? gh_match[1] : '';
	}

	document.getElementById('ghRepo').value = ghRepo;
	document.getElementById('ghRepoUsername').value = ghRepoUsername;
	document.getElementById('localFilenameRoot').textContent =
	localFilenameRoot;

	ghModal.querySelector('button.commit').classList.add('hidden');


	let wbMsg = document.createElement('div');
	wbMsg.innerHTML = '<code></code>';
	ghModal.querySelector('.feedback .message').appendChild(wbMsg);
	let message = "Updating .wb";
	ghModal.querySelector('.feedback .message code').innerHTML = message;

	commitWb(editor);

	message += "&nbsp; &#x2713;";
	ghModal.querySelector('.feedback .message code').innerHTML = message;

	message += "<br/>Updating .xml";
	ghModal.querySelector('.feedback .message code').innerHTML = message;

	let baseRenderer = new Cranach(window.location.href).setup({'query':''}).then(cranach => {
		console.log(cranach);
		MathJax.typesetClear();
		return cranach.setOutput(document.getElementById('output')).renderWb(editor.getValue());
	}).then(cranach => {
		postprocess(cranach);

		const cranach_text =
		new XMLSerializer().serializeToString(cranach.cranachDoc);
		const index_text =
		new XMLSerializer().serializeToString(cranach.indexDoc);

		document.getElementById('cranach_text').value = cranach_text;
		document.getElementById('index_text').value = index_text;

		message += "&nbsp; &#x2713;";
		ghModal.querySelector('.feedback .message code').innerHTML = message;
		ghModal.querySelector('button.commit').classList.remove('hidden');
	});

}

function openWb(filePath) {

	let file    = filePath.files[0];
	let reader  = new FileReader();

	console.log('READER');
	console.log(file);

	reader.addEventListener("load", function () {
		console.log('READER RESULT');
		console.log(reader.result);
		editor.setValue(reader.result, 1);
	}, false);

	if (file) {
		// https://stackoverflow.com/questions/857618/javascript-how-to-extract-filename-from-a-file-input-control
		let fullPath = filePath.value;
		if (fullPath) {
			let startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
			let filename = fullPath.substring(startIndex);
			if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
				filename = filename.substring(1);
			}
		}
		reader.readAsText(file);
	}
}


function openXML(renderer, filePath) {
	let file = filePath.files[0];
	let filename = '';
	let dir = '';

	let reader  = new FileReader();

	const progressBar = document.querySelector('.progress-bar');
	progressBar.style.width = '20%';
	progressBar.setAttribute('aria-valuenow', '20');

	document.getElementById('loading_icon').classList.remove('hidden');

	if (file) {
		// https://stackoverflow.com/questions/857618/javascript-how-to-extract-filename-from-a-file-input-control
		let fullPath = filePath.value;
		if (fullPath) {
			let startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
			filename = fullPath.substring(startIndex);
			if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
				filename = filename.substring(1);
			}
			let match;
			if (match = fullPath.match(/^(.*?)\/[^\/]+\.(?:wb|xml)/)) {
				dir = match[1];
			}
		}
	}

	console.log(filename);
	reader.addEventListener("load", function () {
		progressBar.style.width = '50%';
		progressBar.setAttribute('aria-valuenow', '50');

		let cranachDoc = new DOMParser().parseFromString(reader.result, "application/xml");
		baseRenderer = renderer.then(cranach => {
			progressBar.style.width = '75%';
			progressBar.setAttribute('aria-valuenow', '75');

			cranach.attr['localName'] = filename;
			cranach.attr['dir'] = dir;
			cranach.cranachDoc = cranachDoc;

			MathJax.startup.document.state(0);
			MathJax.texReset();
			MathJax.typesetClear();

			return cranach.displayCranachDocToHtml();
		}).then(cranach => {
			postprocess(cranach);
            document.getElementById('loading_icon').classList.add('hidden');
			return cranach;
		});
	}, false);

	reader.readAsText(file);

}

document.addEventListener('DOMContentLoaded', () => {
	baseRenderer.then(cranach => {
		document.querySelectorAll('.modal .btn.save').forEach(el =>
			el.addEventListener('click', function(event) {
				saveText(document.getElementById('source_text').value, cranach, event.target.getAttribute('ext'));
			})
		);
	});
});
