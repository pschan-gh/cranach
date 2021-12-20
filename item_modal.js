function updateModalProofs(md5String, cranach) {
	let contentURLDir = cranach.attr['contentURLDir'];

	let indexDoc = cranach.indexDoc;
	let queryString = '//idx:branch[@type="Proof" and @ofmd5="' + md5String + '"]|//lv:branch[@type="Proof" and @ofmd5="' + md5String + '"]';
	console.log(queryString);
	let iterator = indexDoc.evaluate(queryString, indexDoc, nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );
	console.log(iterator);
	try {
		let thisNode = iterator.iterateNext();

		let html = '';
		let index = 1;
		while (thisNode) {
			if (html != '') {
				html += ', ';
			}
			html += '<a target="_blank" href="' + contentURLDir + '/' + thisNode.getAttribute('filename') + '&item=' + thisNode.getAttribute('md5') + '">' + index + '</a>';
			index++;
			thisNode = iterator.iterateNext();
		}
		if (html != '') {
			$('.modal_proofs').html('<br/><strong>Proofs</strong>: ' + html).show();
		} else {
			$('.modal_proofs').html(html).hide();
		}
	}
	catch (e) {
		alert( 'Error: Document tree modified during iteration ' + e );
	}

}
function updateModalProofOf(button, cranach) {
	let contentURLDir = cranach.attr['contentURLDir'];
	if (typeof $(button).attr('of') == 'undefined' || $(button).attr('of') == null) {
		$('.modal_proof_of').hide();
		return 0;
	}
	let rootURL = cranach.attr['rootURL'];
	// let href = rootURL + "?xml=" + cranach.attr['xmlPath'] + "&query=(//lv:statement[@md5='" + $(button).attr('of') + "'])[1]";
	let href = contentURLDir + '/' + $(button).attr('of-src-filename') + "&item=" + $(button).attr('of');

	$('.modal_proof_of a').attr('href', href);
	if ($(button).find('.of-title').length) {
		$('.modal_proof_of a').html($(button).find('.of-title').html());
	} else {
		$('.modal_proof_of a').html($(button).attr('of-type') + ' ' + $(button).attr('of-item'));
	}
	$('.modal_proof_of').show();
}

function updateModalRefby(md5String, cranach) {
	let contentURLDir = cranach.attr['contentURLDir'];
	let contentURL = cranach.attr['contentURL'];
	let index = cranach.indexDoc;
	fetch('xsl/refby2html.xsl')
	.then(function(response) {
		if (!response.ok) {
			throw Error(response.statusText);
		}
		console.log('MACROS FILE FOUND');
		return response.text();
	})
	.then(function(xsltext) {
		xsltProcessor.importStylesheet(domparser.parseFromString(xsltext, "text/xml"));
		xsltProcessor.setParameter('', 'md5', md5String);
		xsltProcessor.setParameter('', 'contenturldir', contentURLDir);
		xsltProcessor.setParameter('', 'contenturl', contentURL);
		// console.log('REFBY2HTML PRETRANSFORM');
		fragment = xsltProcessor.transformToFragment(index,document);
		// console.log('REFBY2HTML');
		fragmentStr = new XMLSerializer().serializeToString(fragment);
		// console.log(fragmentStr);
		$('.modal_refby').html(fragmentStr).show();
	});
}

function updateModal(cranach) {
	$('.slide_button').off();
	$('.slide_button').on('click', function() {
		let $slide = $('div.slide[slide="' + $(this).attr('slide') + '"');
		let slide = $slide.attr('slide');
		let course = $slide.attr('course');
		let chapterType = $slide.attr('chapter_type');
		let chapter = $slide.attr('chapter');

		$('.modal-title > span').hide();
		$('.md5.share_text').text('');
		$('.modal_refby').hide();
		$('.modal_proofs').hide();
		$('.modal_proof_of').hide();

		$('.current_course').text(course).show();
		$('.current_chapter').text(chapter).show();
		$('.current_chapter').text(chapterType + ' ' + chapter).show();
		$('.current_slide').text('Slide ' + slide).show();

		let url = cranach.attr['contentURL'];

		let $labels = $slide.find('> .label');

		let slideLabel = $labels.length ? $labels.first().attr('name') : slide;

		if (cranach.attr['query']) {
			url += '&query=' + cranach.attr['query'] + '&slide=' + slideLabel;
		} else {
			url += '&slide=' + slideLabel;
		}

		$('#item_modal').find('#modal_keywords').html('');
		$('#item_modal').modal('toggle');

		$('#item_modal').find('#modal_keywords').html('<hr><b class="notkw">Keywords:</b>').append($('#slide_keywords').clone(true));

		$('#item_modal').find('#item_modal_link').attr('href', url);

	});

	$('.item_button, .section_button').off();
	$('.item_button, .section_button').on('click', function() {
		let course = $(this).attr('course');
		let md5String = $(this).attr('md5');
		let item_type = $(this).attr('type');
		let chapterType = $(this).attr('chapter_type');
		let chapter = $(this).attr('chapter');
		let item = $(this).attr('item') ? $(this).attr('item') : $(this).attr('md5');
		let serial = $(this).attr('serial');
		let slide = $(this).closest('div.slide').attr('slide');

		$('#item_modal').find('#modal_keywords').html('');
		$('#item_modal').modal('toggle');


		console.log('ITEM CLICKED COURSE: ' + course);

		$('#share_item span').hide();

		$('.current_course').text(course);
		$('.current_chapter').text(chapterType + ' ' + chapter);
		$('.current_item_type').text(item_type);
		$('.current_item').text(serial);
		$('#share_item span.current_course, #share_item span.current_chapter, #share_item span.current_item_type, #share_item span.current_item').show();

		let url = cranach.attr['contentURL'];
		let lcref = '';
		let argName = item_type.match(/Course|Chapter|Section/i) ? 'section' : 'item';

		// let $labels = $(this).closest('div').find('.label');
		let $labels = $(this).find('> .label');

		if ($labels.length) {
			url += '&' + argName + '=' + $labels.first().attr('name');
			if (argName == 'item') {
				lcref = cranach.attr['contentURL'] + '&query='
				+ `(//lv:*[./lv:label/@name="${$labels.first().attr('name')}"])[1]`;
			}
		} else {
			url +=  '&' + argName + '=' + serial;
			if (argName == 'item') {
				lcref = cranach.attr['contentURL'] + '&query='
				+ `(//lv:*[@md5="${md5String}"])[1]`;
			}
		}
		$('#item_modal').find('#item_modal_link').attr('href', url);
		$('#item_modal').find('#share_url').val(url);

		let title = '';

		let titles = $(this).find('*[wbtag="title"]');
		if (titles.length) {
			title = titles.first().text();
		} else {
			title = $(this).attr('item') ? item_type + ' ' + item : item_type;
		}

		$('#item_modal #share_hyperlink').val('<a href="' + url + '" target="_blank" title="Course:' + course + '">' + title + '</a>');
		if (argName == 'item') {
			// $('#item_modal #share_lcref').val('<a lcref="' + lcref + '" title="Course:' + course + '">' + title + '</a>');
			$('#item_modal #share_lcref').val(`{\\href{${lcref}}{\\mathrm{${title.replace(/ /g, '\\;')}}}}`);
		} else {
			$('#item_modal #share_lcref').val('');
		}
		$('#item_modal #share_hyperref').val('{\\href{' + url.replace('#', '\\#') + '}{' + title + '}}');
		$('#item_modal .md5').val(md5String);

		updateModalRefby(md5String, cranach);
		updateModalProofs(md5String, cranach);
		updateModalProofOf(this, cranach);
	});
}

$(function() {
	let infoObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == "attributes") {
				if (mutation.attributeName == 'data-content-url' || mutation.attributeName == 'data-query' || mutation.attributeName == 'data-selected-slide') {
					baseRenderer.then(cranach => {
						updateModal(cranach);
					});
				}
			}
		});
	});
	infoObserver.observe(document.getElementById('output'), {
		attributes: true,
	});
});
