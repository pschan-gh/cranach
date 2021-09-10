function updateTitle(slide) {

	let index = $(slide).attr('slide');

	let course = $(slide).attr('course') ? $(slide).attr('course') : '';
	let chapterType = $(slide).attr('chapter_type') ? $(slide).attr('chapter_type'):'';
	let chapter = $(slide).attr('chapter') ? $(slide).attr('chapter') : '';
	let section = $(slide).attr('section') ? $(slide).attr('section') : '';
	let subsection = $(slide).attr('subsection') ? $(slide).attr('subsection') : '';
	let subsubsection = $(slide).attr('subsubsection') ? $(slide).attr('subsubsection') : '';

	let topics = '';

	$('#toc a').removeClass('highlighted');
	$('#toc a.chapter[chapter="' + chapter + '"]').addClass('highlighted');
	$('#toc a.section[chapter="' + chapter + '"][section="' + section + '"]').addClass('highlighted');
	$('#toc a.subsection[chapter="' + chapter + '"][section="' + section + '"][subsection="' + subsection + '"]').addClass('highlighted');
	$('#toc a.subsubsection[chapter="' + chapter + '"][section="' + section + '"][subsection="' + subsection + '"][subsubsection="' + subsubsection + '"]').addClass('highlighted');

	$('.topic[chapter="' + chapter + '"]').each(function(index, element) {
		if (index > 0) {
			topics += ', ';
		}
		topics += $(this).html();
	});

	let chapterTitle = $(slide).attr('chapter_title') ? $(slide).attr('chapter_title') : $(slide).prevAll('[chapter_title!=""]:first').attr('chapter_title');

	chapterTitle = chapterTitle ? chapterTitle : '';

	section = $(slide).attr('section') ?  chapter + '.' + $(slide).attr('section') : '';

	let sectionTitle = $('a.section.highlighted').find('span.title').html();

	sectionTitle = sectionTitle ? sectionTitle : '';

	$('.current_course').html(course);
	$('.current_chapter').html(chapterType + ' ' + chapter);
	$('.current_chapter_title').html(chapterTitle);
	$('.current_topics').html(topics);

	if (section != '') {
		$('.current_section').html('Section ' + section + '<br/>' + sectionTitle);
	} else {
		$('.current_section').html('');
	}
	$('.current_slide').html('Slide ' + index);
	if (course != '' || chapter != '' || topics != '') {
		$('title').text(course);
	}

	$('#info_half div.keywords[environ="course"], div.keywords[environ="root"]').show();
	$('#info_half div.keywords[environ="chapter"][chapter="' + chapter + '"][slide="all"]').show();

	$('#info_half div.keywords[slide!="all"]').hide();
	$('#info_half div.keywords[chapter="' + chapter + '"][slide="' + index + '"]').show();

}

function updateToc(cranach) {
	console.log('UPDATING TOC');
	let url = cranach.attr['contentURL'];

	if ($('.toc').length == 0) {
		return 0;
	}

	$('.toc').each(function() {
		$('#toc').html('').append($('#output').find('.toc_src').first());
	});
	$('#output').find('.toc_src').hide();

	$('.toc').find('a').find('span.serial').each(function() {
		let string = $(this).text();
		$(this).text(string.charAt(0).toUpperCase() + string.slice(1));
	});

	$('#info_statements').html('');
	$('.toc').find('a.chapter').each(function() {
		let chapter = $(this).attr('chapter');
		let statements = new Array();
		$("#output div[wbname='statement'][chapter='" + chapter + "']").each(function() {
			if (!($(this).attr('type') in statements)) {
				statements[$(this).attr('type')] = '';
			}

			let serial = $(this).attr('item');
			let $item = $('div[serial="' + $(this).attr('item') + '"]').closest('div.statement').first();
			let slide = $item.closest('.slide').attr('slide');

			statements[$(this).attr('type')] += "<a style='margin:1px 10px 1px 10px;' class='info_statements_num' serial='" + serial + "' href='javascript:void(0)'>" + serial + "</a>";
		});
		let html = '';
		for (let key in statements) {
			html += '<br/><a class="info_statements" target="_blank" href="' + url + '&query=//lv:statement[@chapter=' + chapter + ' and @type=%27' + key + '%27]">' + key + '</a><em> ' + statements[key] + '</em>';
		}

		$('#info_statements').append('<div class="statements chapter" chapter="' + chapter + '" style="display:none">' + html + '</div>');
		let $item;
		$('#info_statements').find('.info_statements_num').click(function() {
			$item = $('.item_title[serial="' + $(this).attr('serial') + '"]').first();
			focusOn($item, '');
			highlight($(this).attr('serial'));
		});

		let $slide = $('.output:visible .slide[chapter="' + $(this).attr('chapter') + '"]').first();
		$(this).off();
		$(this).click(function() {
			console.log($slide);
			jumpToSlide($('.output:visible').first(), $slide);
		});
	});

	$('.toc').find('a.section').each(function() {
		let $slide = $('.slide[section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
		$(this).click(function() {
			jumpToSlide($('#output'), $slide);
			$slide.click();
		});
	});
	$('.toc a.subsection').each(function() {
		let $slide = $('.slide[subsection="' + $(this).attr('subsection') + '"][section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
		$(this).click(function() {
			jumpToSlide($('#output'), $slide);
			$slide.click();
		});
	});
	MathJax.startup.promise = typeset([document.getElementById('toc')]);
}

function updateKeywords() {

	if ($('.info').length == 0) {
		return 0;
	}

	$('#info_keywords_course').html('');
	$('div.keywords[slide="all"][environ="course"]').each(function() {
		if ($('#info_keywords_course')) {
			$('#info_keywords_course').append($(this));
		} else {
			$(this).hide();
		}
	});
	$('div.keywords[slide="all"][environ="root"]').each(function() {
		if ($('#info_keywords_course')) {
			$('#info_keywords_course').append($(this));
		} else {
			$(this).hide();
		}
	});
	$('#info_keywords_chapter').html('');
	$('div.keywords[slide="all"][environ="chapter"]').each(function() {
		if ($('#info_keywords_chapter')) {
			$('#info_keywords_chapter').append($(this));
		} else {
			$(this).hide();
		}
	});
	if ($('#slide_keywords')) {
		$('#slide_keywords').html('').append($('div.keywords[slide!="all"]'));
	}
}

function updateSlideInfo(slide) {

	updateTitle(slide);

	let slideNum = +$(slide).attr('slide');

	let course = $(slide).attr('course');
	let chapterType = $(slide).attr('chapter_type');
	let chapter = $(slide).attr('chapter');
	let statements = new Array();
	let url = $('#output').attr('data-content-url');
	let urlSlide = $('#output').attr('data-content-url') +  '&query=' + $('#output').attr('query') + '&slide=' + slideNum;

	$('#url_open').attr('href', urlSlide);
	$('.url.share_text').val(urlSlide);
	$('.hyperlink.share_text').val('<a href="' + urlSlide + '" target="_blank" title="Course:' + course + '">' + 'Chapter ' + chapter + ' Slide ' + slideNum + '</a>');

	$('.hyperref.share_text').val('\\href{' + urlSlide.replace('#', '\\#') + '}{Chapter ' + chapter + ' Slide ' + slideNum + '}');

	$('#slide_info').show();

	if ($('.current_chapter').first().text() != $(slide).attr('chapter')) {
		$('#info_statements .chapter').hide();
		$('#info_statements .chapter[chapter="' + $(slide).attr('chapter') + '"]').show();
	}

	$('#output div.slide').removeClass('selected');
	$(slide).addClass('selected');
}

$(function() {
	let infoObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == "attributes") {
				if (mutation.attributeName == 'data-selected-slide') {
					let $slide = $('#output div.slide[slide="' + $('#output').attr('data-selected-slide') + '"]');
					updateSlideInfo($slide[0]);
				}
				if (mutation.attributeName == 'data-content-url') {
					baseRenderer.then(cranach => {
						updateToc(cranach);
					});
				}
			}
		});
	});
	infoObserver.observe(document.getElementById('output'), {
		attributes: true,
	});
});
