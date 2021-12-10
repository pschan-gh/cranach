function postprocess(cranach) {
	console.log('POSTPROCESS CALLED');

	$('.icon.xml, .icon.latex').show();

	$(function() {
		$('#output').attr('data-content-url', cranach.attr['contentURL']);
		$('#output').attr('data-query', cranach.attr['query']);
		updateSlideClickEvent();
		updateScrollEvent();
		updateKeywords();
		// updateToc(cranach);
		// updateSlideSelector();
		// updateRefs(cranach);
		// updateInfo(cranach);
		// updateModal(cranach);
		updateTitle( $('.output:visible div.slide.selected')[0] || $('.output:visible div.slide:lt(1)')[0] );

		$('#output').find('b:not([text]), h5:not([text]), h4:not([text]), h3:not([text]), h2:not([text]), h1:not([text])').each(function() {
			let text = $(this).text();
			// $(this).attr('text', text.replace(/[^a-z0-9À-ÿ\s\-\']/ig, ''));
			$(this).attr('text', text.replace(/\r/ig, 'r').toLowerCase().replace(/[^a-z0-9]/ig, ''));
		});

		$('#output > div.slide:visible').each(function() {
			if (isElementInViewport(this)) {
				batchRender(this);
			}
		});
		if (cranach.attr['selectedItem']) {
			console.log('SELECTED ITEM: ' + cranach.attr['selectedItem']);

			$item = $('.item_title[serial="' + cranach.attr['selectedItem'] + '"], .item_title[md5="' + cranach.attr['selectedItem'] + '"], .label[name="' + cranach.attr['selectedItem'] + '"]').first().closest('.item_title');
			focusOn($item);
		} else if (cranach.attr['selectedSection']) {
			let $section = $('.section_title[serial="' + cranach.attr['selectedSection'] + '"], .label[name="' + cranach.attr['selectedSection'] + '"]').first().closest('.section_title').first();
			let $selectedSlide = $section.closest('.slide');
			focusOn($section);
		} else if (cranach.attr['selectedSlide']) {
			let $selectedSlide = $(`.output:visible div.slide[slide="${cranach.attr['selectedSlide']}"]`);
			focusOn($selectedSlide);
		}

		// else if ($('.output:visible .slide[slide="' + cranach.attr['selectedSlide']  + '"], .label[name="' + cranach.attr['selectedSlide'] + '"]').length > 0 ){
		//     let $selectedSlide = $('.output:visible .slide[slide="' + cranach.attr['selectedSlide']  + '"], .label[name="' + cranach.attr['selectedSlide'] + '"]').first().closest('.slide');
		//     focusOn($selectedSlide);
		// }

		if (cranach.attr['selectedKeyword']) {
			let $selectedSlide = $('.output:visible div.slide[slide="' + cranach.attr['selectedSlide']  + '"]');
			focusOn($selectedSlide, cranach.attr['selectedKeyword'].toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
		}

		// https://stackoverflow.com/questions/13202762/html-inside-twitter-bootstrap-popover
		$("[data-bs-toggle=popover]").popover({
			html : true,
			content: function() {
				html = 'Loading...';
				return html;
			}
		});
		$('[data-bs-toggle="popover"]').on('shown.bs.popover', function() {
			$('.popover-body').each(function() {
				let id = $(this).closest('.popover').attr('id');
				let popoverBody = this;
				$(popoverBody).html('');
				$('[aria-describedby="' + id + '"]').find('a.dropdown-item').each(function() {
					$(popoverBody).append($(this).clone().removeClass('hidden'));
				});
			});
		});

		if (cranach.attr['lectureMode']) {
			console.log('LECTURE MODE');
			$('[data-lecture-skip="true"]').addClass('lecture_skip');
		}

		$('#loading_icon').hide();
		$('#right_half .navbar').show();
		if (cranach.attr['present']) {
			console.log('PRESENT MODE');
			$('#present_button').click();
		}

	});

}
