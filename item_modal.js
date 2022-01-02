function updateModalProofs(md5String, cranach) {
	const contentURLDir = cranach.attr['contentURLDir'];

	const indexDoc = cranach.indexDoc;
	const queryString = `//idx:branch[@type="Proof" and @ofmd5="${md5String}"]|`
	+ `//lv:branch[@type="Proof" and @ofmd5="${md5String}"]`;

	const iterator = indexDoc.evaluate(queryString, indexDoc, nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );

	try {
		let thisNode = iterator.iterateNext();
		let html = '';
		let index = 1;
		while (thisNode) {
			if (html != '') {
				html += ', ';
			}
			html += `<a`
			+ ` target="_blank" `
			+ ` href="${contentURLDir}/${thisNode.getAttribute('filename')}&item=${thisNode.getAttribute('md5')}">`
			+ index
			+ `</a>`;
			index++;
			thisNode = iterator.iterateNext();
		}
		document.querySelectorAll('.modal_proofs').forEach(el => {
			if (html != '') {
				el.innerHTML = `<br/><strong>Proofs</strong>: ${html}`;
				el.classList.remove('hidden');
			} else {
				el.classList.add('hidden');
			}
		});
	} catch (e) {
		alert( 'Error: Document tree modified during iteration ' + e );
	}

}
function updateModalProofOf(button, cranach) {
	const contentURLDir = cranach.attr['contentURLDir'];
	const rootURL = cranach.attr['rootURL'];
	
	if (!button.hasAttribute('of')) {
		document.querySelectorAll('.modal_proof_of').forEach(el => el.classList.add('hidden'));
		return 0;
	}	

	const href = 
		`${contentURLDir}/${button.getAttribute('of-src-filename')}&item=${button.getAttribute('of')}`;

	document.querySelectorAll('.modal_proof_of').forEach(modal => {
		modal.querySelector('a').setAttribute('href', href);
        
        modal.querySelector('a').innerHTML = button.querySelector('.of-title') !== null ? 
        button.querySelector('.of-title').innerHTML :
        `button.querySelector.getAttribute('of-type') ${button.getAttribute('of-item')}`;
        
        modal.classList.remove('hidden');
	});
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
		// fragmentStr = new XMLSerializer().serializeToString(fragment);
		// console.log(fragmentStr);
		// $('.modal_refby').html(fragmentStr).show();
        document.querySelectorAll('.modal_refby').forEach(modal => {
            modal.innerHTML = new XMLSerializer().serializeToString(fragment);
        });
	});
}

function slideButtonClickHandler(cranach) {
    const itemModal = document.getElementById('item_modal');
    const modalKeywords = itemModal.querySelector('#modal_keywords');
    
    const slide = document.querySelector('#output > div.slide.selected');
    const slideNum = slide.getAttribute('slide');
    const course = slide.getAttribute('course');
    const chapterType = slide.getAttribute('chapter_type');
    const chapter = slide.getAttribute('chapter');
    
    document.querySelectorAll('.modal-title > span, .modal_refby, .modal_proofs, .modal_proof_of')
    .forEach(el => {
        el.classList.add('hidden');
    });
    document.querySelectorAll('.md5.share_text').forEach(el => el.textContent = '');
    
    document.querySelectorAll('.current_course').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.current_chapter').forEach(el => {
        el.textContent = `${chapterType} ${chapter}`;
        el.classList.remove('hidden');
    });
    document.querySelectorAll('.current_slide').forEach(el => {
        el.textContent = `Slide ${slideNum}`;
        el.classList.remove('hidden');
    });
    
    
    const label = slide.querySelector(':scope > .label');            
    slideLabel = label !== null ? label.getAttribute('name') : slideNum;
    
    
    let url = cranach.attr['contentURL'];
    if (cranach.attr['query']) {                
        url += `&query=${cranach.attr['query']}&slide=${slideLabel}`;
    } else {
        url += `&slide=${slideLabel}`;
    }
    
    itemModal.querySelector('#item_modal_link').setAttribute('href', url);
                
    modalKeywords.innerHTML = '';
    modalKeywords.innerHTML = '<hr><b class="notkw">Keywords:</b>';
    modalKeywords.appendChild(document.getElementById('slide_keywords').cloneNode(true));
    
    bootstrap.Modal.getOrCreateInstance(itemModal).toggle();
}

function itemSectionButtonClickHandler(el, cranach) {
    const itemModal = document.getElementById('item_modal');
    const modalKeywords = itemModal.querySelector('#modal_keywords');
    const metadata = {};
    
    ['course', 'md5', 'type', 'chapter_type', 'chapter', 'item_type', 'item', 'serial', 'slide']
    .forEach(key => {
        if (key == 'item') {
            metadata[key] = 
            el.hasAttribute('item') ? el.getAttribute('item') : el.getAttribute('md5');
        } else if (key == 'slide') {
            metadata[key] = el.closest('div.slide').getAttribute('slide');
        } else {
            metadata[key] = el.hasAttribute(key) ? el.getAttribute(key) : '';
        }
    });
    console.log(metadata);
    
    modalKeywords.innerHTML = '';
    document.querySelector('#share_item span').classList.add('hidden');
    
    ['course', 'chapter'].forEach(key => {
        document.querySelector(`.current_${key}`).textContent = metadata[key];
    });
    document.querySelector(`.current_item_type`).textContent = metadata.type;
    document.querySelector(`.current_item`).textContent = metadata['type'].match(/Course|Chapter|Section/i) ? metadata.serial : metadata.item;
    
    document.querySelectorAll('#share_item span.current_course, #share_item span.current_chapter, #share_item span.current_item_type, #share_item span.current_item').forEach(el => el.classList.remove('hidden'));
    
    let url = cranach.attr['contentURL'];
    let lcref = '';
    let argName = metadata['type'].match(/Course|Chapter|Section/i) ? 'section' : 'item';
    
    let label = el.querySelector(':scope > .label');            
    if (label !== null) {
        url +=  `&${argName}=${label.getAttribute('name')}`;
        if (argName == 'item') {
            lcref = `${url}&query=(//lv:*[./lv:label@name="${label.getAttribute('name')}"])[1]`;
        }
    } else {
        url += `&${argName}=${metadata.serial}`;
        if (argName == 'item') {
            lcref = `${url}&query=(//lv:*[@md5="${metadata.md5}"])[1]`;
        }
    }
    itemModal.querySelector('#item_modal_link').setAttribute('href', url);
    itemModal.querySelector('#share_url').value = url;
    
    const titleElement = el.querySelector('*[wbtag="title"]');
    let title = titleElement !== null ? 
    titleElement.innerHTML : 
    metadata.item ? `${metadata['item_type']} ${metadata.item}` : metadata['item_type'];
    
    document.querySelector('#item_modal #share_hyperlink').value = 
    `<a href="${url}" target="_blank" title="Course:${course}">${title}</a>`;
    document.querySelector('#item_modal #share_lcref').value = argName == 'item' ?  `{\\href{${lcref}}{\\mathrm{${title.replace(/ /g, '\\;')}}}}` : '';
    
    document.querySelector('#item_modal #share_hyperref').value = `{\\href{${url.replace('#', '\\#')}}{${title}}}`;
    document.querySelector('#item_modal .md5').value = metadata.md5;
    
    updateModalRefby(metadata.md5, cranach);
    updateModalProofs(metadata.md5, cranach);
    updateModalProofOf(el, cranach);
    bootstrap.Modal.getOrCreateInstance(itemModal).toggle();
}

function updateModal(cranach) {    
    
	document.querySelectorAll('.slide_button').forEach(button => {
        button.addEventListener('click', () => slideButtonClickHandler(cranach));
    });
    
	document.querySelectorAll('.item_button, .section_button').forEach(el => {
        el.addEventListener('click', () => itemSectionButtonClickHandler(el, cranach));
    });
}

// document.addEventListener('DOMContentLoaded', () => {
// 	let infoObserver = new MutationObserver(function(mutations) {
// 		mutations.forEach(function(mutation) {
// 			if (mutation.type == "attributes") {
// 				if (mutation.attributeName == 'data-content-url' || mutation.attributeName == 'data-query' || mutation.attributeName == 'data-selected-slide') {
// 					// baseRenderer.then(cranach => {
// 					// 	updateModal(cranach);
// 					// });
// 				}
// 			}
// 		});
// 	});
// 	infoObserver.observe(document.getElementById('output'), {
// 		attributes: true,
// 	});
// });
