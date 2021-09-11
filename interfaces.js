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

function showLatex(el) {
	$('.modal-footer').find('.btn').hide();
	$('.modal-footer').find('.btn.save').show();

	let xsltProcessor = new XSLTProcessor();
	$('#text_modal button.save').attr('ext', 'tex');
	$('#text_modal .modal-title').html('LaTeX');

	let docCranach = el.cranachDoc;
	let contentURLDir = el.attr['contentURLDir'];
	let contentURL = el.attr['contentURL'];

	$.ajax({
		url: 'xsl/cranach2latex.xsl?' + 'version=' + Math.random(),
		dataType: 'xml'
	})
	.done(function(xsl) {
		let oParser = new DOMParser();
		let xml = new XMLSerializer().serializeToString(docCranach);
		xml = xml.replace(/&lt;(div|table|thead|tr|td|th|a)\s*.*?&gt;/g, '<$1>');
		xml = xml.replace(/&lt;\/(div|table|thead|tr|td|th|a)\s*&gt;/g, '</$1>');
		xml = xml.replace(/#/g, '\#');
		report(xml);
		let xmlDOM = oParser.parseFromString(xml, "application/xml");
		xsltProcessor.importStylesheet(xsl);
		xsltProcessor.setParameter('', 'contenturldir', contentURLDir);
		xsltProcessor.setParameter('', 'contenturl', contentURL);
		fragment = xsltProcessor.transformToFragment(xmlDOM, document);
		report(fragment);
		fragmentStr = new XMLSerializer().serializeToString(fragment);
		$('#source_text').val('');
		let latex = fragmentStr.replace(/\n\n\n*/g, "\n\n")
		.replace(/\n(\ )*/g, "\n")
		.replace(/\<!--.*?--\>/g, '')
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
		.replace(/\\class{.*?}/g, '')
		.replace(/\\cssId{.*?}/g, '')
		.replace(/&ocirc/g, '\\^o');
		let tmp = el.macrosString + "\n" +  latex;
		latex = collectNewcommands(tmp) + latex.replace(
			/(\\newcommand{.*?}(?:\[\d+\])*{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{(?:([^{}]*)|(?:{[^{}]*}))*}))*}))+})/g, '')
		.replace(/section{\s*(.*?)\s*}/g, "section{$1}");
		$('#source_text').val(latex);
	});
}

function showXML(el) {
	$('.modal-footer').find('.btn').hide();
	$('.modal-footer .github').css('display', 'inline-block')
	$('.modal-footer').find('.btn.commit').show();
	$('.modal-footer').find('.btn.save').show();
	$('.modal-footer').find('.btn.render').show();

	$('#source_text').val('');
	$('#text_modal').find('button.save').attr('ext', 'xml');
	$('#text_modal').find('.modal-title').text('Cranach XML');
	$('#source_text').val(new XMLSerializer().serializeToString(el.cranachDoc));
}

function initGhDialog(editor) {

	$('#gh_modal .feedback .message').html('');

	let contentURL = window.location.href;
	let params = window.location.href.match(/\?(.*?)(#|$)/);

	let urlParams = new URLSearchParams(params[1]);
	let pathname = urlParams.has('wb') ? urlParams.get('wb') : urlParams.get('xml');
	let localFilenameRoot = pathname.match(/(local|([^\/]+))\.(?:wb|xml)$/)[1];

	let ghRepoUsername;
	let ghRepo;

	console.log(contentURL);
	let gh_match = contentURL.match(/raw\.githubusercontent.com\/(.*?)\/(.*?)\//);
	if (gh_match) {
		ghRepoUsername = gh_match[1];
		ghRepo = gh_match[2];
	} else {
		gh_match = contentURL.match(/([^\/]+)\/([^\/]+)\.(xml|wb)/);
		ghRepoUsername = 'ENTER USERNAME';
		ghRepo = gh_match ? gh_match[1] : '';
	}

	console.log(ghRepoUsername + ' ' + ghRepo);

	$('#ghRepo').val(ghRepo);
	$('#ghRepoUsername').val(ghRepoUsername);
	$('#localFilenameRoot').text(localFilenameRoot);
	$('#gh_modal button.commit').hide();


	let message = '';
	message = "Updating .wb";
	let $wb_msg = $('<div><code>' + message + '</code></div>').appendTo( $('#gh_modal .feedback .message') );

	commitWb(editor);

	message += "&nbsp; &#x2713;";
	$wb_msg.find('code').html(message);
	message = "Updating .xml";
	$wb_msg = $('<div><code>' + message + '</code></div>').appendTo( $('#gh_modal .feedback .message') );
	let baseRenderer = new Cranach(window.location.href).setup({'query':''}).then(cranach => {
		console.log(cranach);
		MathJax.typesetClear();
		return cranach.setOutput(document.getElementById('output')).renderWb(editor.getValue());
	}).then(cranach => {
		postprocess(cranach);
		let cranach_text = new XMLSerializer().serializeToString(cranach.cranachDoc);
		let index_text = new XMLSerializer().serializeToString(cranach.indexDoc);
		$('#cranach_text').val(cranach_text);
		$('#index_text').val(index_text);
		message += "&nbsp; &#x2713;";
		$wb_msg.find('code').html(message);
		$('#gh_modal button.commit').show();
	});

}

// function showIndex(promise) {
//     $('.modal-footer').find('.btn').hide();
//     $('.modal-footer').find('.btn.save').show();
//     $('.modal-footer').find('.btn.update-index').show();
//     $('.modal-footer').find('.btn.load-index').show();
//     $('#text_modal').find('button.save').attr('ext', 'xml');
//     $('#text_modal').find('.modal-title').text('Index XML');
//
//     $('#source_text').val('');
//     promise.then(el => {
//         if (el.indexDoc) {
//             $('#source_text').val(new XMLSerializer().serializeToString(el.indexDoc));
//         }
//     });
// }

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

	$('.progress-bar').css('width', '20%').attr('aria-valuenow', '20');
	$('#loading_icon').show();

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
		$('.progress-bar').css('width', '50%').attr('aria-valuenow', '50');
		let cranachDoc = new DOMParser().parseFromString(reader.result, "application/xml");
		baseRenderer = renderer.then(cranach => {
			$('.progress-bar').css('width', '75%').attr('aria-valuenow', '75');
			cranach.attr['localName'] = filename;
			cranach.attr['dir'] = dir;
			cranach.cranachDoc = cranachDoc;
			MathJax.startup.document.state(0);
			MathJax.texReset();
			MathJax.typesetClear();
			return cranach.displayCranachDocToHtml();
		}).then(cranach => {
			postprocess(cranach);
			convertCranachDocToWb(cranach.cranachDoc, editor);
			$('#loading_icon').hide();
			return cranach;
		});
	}, false);

	reader.readAsText(file);

}

$(function() {
	baseRenderer.then(cranach => {
		$('.modal .btn.save').click(function() {
			saveText($('#source_text').val(), cranach, $(this).attr('ext'));
		});
	});
});
