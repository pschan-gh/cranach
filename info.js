const dataKeys = ['course', 'chapter_type', 'chapter', 'section', 'subsection', 'subsubsection'];

function updateTitle(slide) {
	// console.log(slide);
	const slideNum = slide.hasAttribute(`slide`) ? slide.getAttribute(`slide`) : 1;
	const metadata = {};

	dataKeys.forEach(key => {
		metadata[key] = slide.getAttribute(key) ? slide.getAttribute(key) : '';
	});

	document.querySelectorAll(`#toc a`).forEach(el => el.classList.remove(`highlighted`));

	document.querySelectorAll(`#toc a.chapter[chapter="${metadata.chapter}"]`).forEach(el => el.classList.add(`highlighted`));

	document.querySelectorAll(`#toc a.section[chapter="${metadata.chapter}"][section="${metadata.section}"]`).forEach(el => el.classList.add(`highlighted`));

	document.querySelectorAll(`#toc a.subsection[chapter="${metadata.chapter}"][section="${metadata.section}"][subsection="${metadata.subsection}"]`)
	.forEach(el => {
		el.classList.add(`highlighted`);
	});
	document.querySelectorAll(`#toc a.subsection[chapter="${metadata.chapter}"]
	[section="${metadata.section}"]
	[subsection="${metadata.subsection}"]
	[subsubsection="${metadata.subsubsection}"]`)
	.forEach(el => {
		el.classList.add(`highlighted`);
	});

	let topics = ``;
	document.querySelectorAll(`.topic[chapter="${metadata.chapter}"]`).forEach(( el, index ) => {
		if (index > 0) {
			topics += `, `;
		}
		topics += el.innerHTML;
	});

	// let chapterTitle = slide.getAttribute(`chapter_title`) ? slide.getAttribute(`chapter_title`) : $(slide).prevAll(`[chapter_title!=""]:first`).getAttribute(`chapter_title`);
	// const chapterTitleSlide = document.querySelector('#output div.slide[chapter_title!=""][chapter=${metadata.chapter}]');
	let chapterTitleSpan = document.querySelector(`a.chapter.highlighted span.title`);
	let sectionTitleSpan = document.querySelector(`a.section.highlighted span.title`);

	chapterTitle = chapterTitleSpan ? chapterTitleSpan.innerHTML : ``;
	sectionTitle = sectionTitleSpan ? sectionTitleSpan.innerHTML : ``;

	document.querySelectorAll(`.current_course`).forEach(el => el.innerHTML = metadata.course);
	document.querySelectorAll(`.current_chapter`).forEach(el => el.innerHTML = `${metadata.chapter_type} ${metadata.chapter}`);
	document.querySelectorAll(`.current_chapter_title`).forEach(el => el.innerHTML = chapterTitle);
	document.querySelectorAll(`.current_topics`).forEach(el => el.innerHTML = topics);

	if (metadata.section != ``) {
		document.querySelectorAll(`.current_section`).forEach(el => el.innerHTML = `Section ${metadata.section}<br/>${sectionTitle}`);
	} else {
		document.querySelectorAll(`.current_section`).forEach(el => el.innerHTML = ``);
	}
	document.querySelectorAll(`.current_slide`).forEach(el => el.innerHTML = `Slide ${slideNum}`);
	if (metadata.course != `` || metadata.chapter != `` || topics != ``) {
		document.querySelectorAll(`title`).forEach(el => el.innerHTML = course);
	}

	document.querySelectorAll(`#info_half div.keywords[environ="course"], div.keywords[environ="root"]`).forEach(el => el.classList.remove('hidden'));
	document.querySelectorAll(`#info_half div.keywords[environ="chapter"][chapter="${metadata.chapter}"][slide="all"]`).forEach(el => el.classList.remove('hidden'));

	document.querySelectorAll(`#info_half div.keywords:not([slide="all"])`).forEach(el => el.classList.add('hidden'));
	document.querySelectorAll(`#info_half div.keywords[chapter="${metadata.chapter}"][slide="${slideNum}"]`).forEach(el => el.classList.remove('hidden'));

}

function updateToc(cranach) {
	console.log(`UPDATING TOC`);
	const output = document.getElementById('output');

	let url = cranach.attr[`contentURL`];

	if (document.querySelector(`.toc`) === null) {
		return 0;
	}
	document.querySelectorAll(`.toc`).forEach(el => {
		el.innerHTML = '';
		if (document.querySelector(`#output .toc_src`) !== null) {
			el.appendChild(document.querySelector(`#output .toc_src`));
		}
	});
	// document.querySelector(`#output .toc_src`).classList.add('hidden');

	document.querySelectorAll(`.toc a span.serial`).forEach(el => {
		const string = el.textContent;
		el.textContent = string.charAt(0).toUpperCase() + string.slice(1);
	});

	document.querySelectorAll(`#info_statements`).forEach(el => el.innerHTML = ``);
	document.querySelectorAll(`.toc a.chapter`).forEach(el => {
		let chapter = el.getAttribute(`chapter`);
		let statements = new Array();
		document.querySelectorAll(`#output div[wbname="statement"][chapter="${chapter}"]`).forEach( div => {
			if (!(div.getAttribute(`type`) in statements)) {
				statements[div.getAttribute(`type`)] = ``;
			}

			let serial = div.getAttribute(`item`);
			let item = document.querySelector(`div[serial="${serial}"]`).closest(`div.statement`);
			// let slide = item.closest(`.slide`).getAttribute(`slide`);

			statements[div.getAttribute(`type`)] += `<a style="margin:1px 10px 1px 10px;" class="info_statements_num" serial="${serial}" href="javascript:void(0)">${serial}</a>`;
		});
		let html = ``;
		for (let key in statements) {
			html += `<br/><a class="info_statements" target="_blank" href="${url}&query=//lv:statement[@chapter=${chapter} and @type=%27${key}%27]">${key}</a><em>${statements[key]}</em>`;
		}

		const div = document.createElement('div');
		div.classList.add('statements', 'chapter', 'hidden');
		div.setAttribute('chapter', chapter);
		div.innerHTML = html;

		// document.querySelector(`#info_statements`).append(`<div class="statements chapter" chapter="${chapter}" style="display:none">${html}</div>`);
		document.querySelector(`#info_statements`).appendChild(div);


		el.addEventListener('click', () => {
			jumpToSlide(
				document.querySelector(`.output`),
				document.querySelector(`.output .slide[chapter="${el.getAttribute('chapter')}"]`)
			);
		});
	});

	document.querySelectorAll(`.toc a.section`).forEach(a => {
		let slide = document.querySelector(`.slide[section="${a.getAttribute('section')}"][chapter="${a.getAttribute('chapter')}"]`);
		a.addEventListener('click', () => {
			jumpToSlide(document.getElementById(`output`), slide);
			output.dataset.selectedSlide = slide.getAttribute('slide');
		});
	});
	document.querySelectorAll(`.toc a.subsection`).forEach(a => {
		let slide = document.querySelector(`.slide[subsection="${a.getAttribute('subsection')}"][section="${a.getAttribute('section')}"][chapter="${a.getAttribute('chapter')}"]`);
		a.addEventListener('click', event => {
			jumpToSlide(document.getElementById(`output`), slide);
			output.dataset.selectedSlide = slide.getAttribute('slide');
		});
	});

	document.querySelectorAll(`#info_statements .info_statements_num`).forEach(el => {
		el.addEventListener('click', event => {
			const serial = event.target.getAttribute('serial');
			const item = document.querySelector(`.item_title[serial="${serial}"]`);
			console.log(`jumping to ${serial}`);
			focusOn(item, ``);
			highlight(el.getAttribute(`serial`));
		});
	});


	MathJax.startup.promise = typeset([document.getElementById(`toc`)]);
}

function updateKeywords() {
	if (document.querySelector(`.info`) === null) {
		return 0;
	}

	document.querySelectorAll(`div.keywords[slide="all"][environ="course"], div.keywords[slide="all"][environ="root"]`)
	.forEach(div => {
		if (document.getElementById(`info_keywords_course`)) {
			document.querySelector(`#info_keywords_course`).innerHTML = ``;
			document.getElementById(`info_keywords_course`).appendChild(div);
		} else {
			div.classList.add('hidden');
		}
	});

	document.querySelectorAll(`div.keywords[slide="all"][environ="chapter"]`).forEach(div => {
		if (document.getElementById(`info_keywords_chapter`)) {
			document.querySelector(`#info_keywords_chapter`).innerHTML = ``;
			document.querySelector(`#info_keywords_chapter`).appendChild(div);
		} else {
			div.classList.add('hidden');
		}
	});

	document.querySelectorAll(`div.keywords:not([slide="all"])`).forEach(div => {
		if (document.querySelector(`#slide_keywords`) !== null) {
			document.querySelector(`#slide_keywords`).innerHTML = '';
			document.querySelector(`#slide_keywords`).appendChild(div);
		} else {
			div.classList.add('hidden');
		}
	});
}

function updateSlideInfo(slide) {

	updateTitle(slide);

	let slideNum = +(slide.getAttribute(`slide`));

	const metadata = {};

	dataKeys.forEach(key => {
		metadata[key] = slide.getAttribute(key) ? slide.getAttribute(key) : '';
	});

	const statements = new Array();
	const url = document.querySelector(`#output`).dataset.contentUrl;
	const query = document.querySelector('#output').getAttribute('query') !== null ?
	`&query=${document.querySelector('#output').getAttribute('query')}` : ``;
	const urlSlide = `${document.querySelector('#output').dataset.contentUrl}${query}&slide=${slideNum}`;

	if (document.querySelector(`#url_open`) !== null) {
		document.querySelector(`#url_open`).setAttribute(`href`, urlSlide);
	}
	document.querySelectorAll(`.url.share_text`).forEach(el => el.value = urlSlide);
	document.querySelectorAll(`.hyperlink.share_text`).forEach(el => el.value = `<a href="${urlSlide}" target="_blank" title="Course:${metadata.course}">Chapter ${metadata.chapter} Slide ${slideNum}</a>`);

	document.querySelectorAll(`.hyperref.share_text`).forEach(el => el.value = `\\href{${urlSlide.replace(`#`, `\\#`)}}{Chapter ${metadata.chapter} Slide ${slideNum}}`);

	document.querySelectorAll(`#slide_info`).forEach(el => el.classList.remove('hidden'));

	if (document.querySelector(`.current_chapter`).textContent != slide.getAttribute(`chapter`)) {
		document.querySelectorAll(`#info_statements .chapter`).forEach(el => el.classList.add('hidden'));
		document.querySelectorAll(`#info_statements .chapter[chapter="${slide.getAttribute('chapter')}"]`).forEach( chapter => {
			chapter.classList.remove('hidden');
		});
	}
}

document.addEventListener('DOMContentLoaded', function () {
	const output = document.querySelector(`#output`);
	let infoObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == "attributes") {
				if (mutation.attributeName == `data-selected-slide`) {
					let slide = output.querySelector(`:scope > div.slide[slide="${output.dataset.selectedSlide}"]`);
					updateSlideInfo(slide);
				}
			}
		});
	});
	infoObserver.observe(output, {
		attributes: true,
	});
});
