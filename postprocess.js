function postprocess(cranach) {
	console.log('POSTPROCESS');

	document.addEventListener('DOMContentLoaded', () => {
		let output = document.getElementById('output');
		output.dataset.contentUrl = cranach.attr['contentURL'];
		output.dataset.query = cranach.attr['query'];
		updateSlideClickEvent();
		updateScrollEvent();
		updateKeywords();
		updateTitle( document.querySelector('.output div.slide.selected') || document.querySelector('.output div.slide:first-child') );

		output.querySelectorAll('b:not([text]), h5:not([text]), h4:not([text]), h3:not([text]), h2:not([text]), h1:not([text])').forEach(e => {
			let text = e.textContent;
			// $(this).attr('text', text.replace(/[^a-z0-9À-ÿ\s\-\']/ig, ''));
			e.setAttribute('text', text.replace(/\r/ig, 'r').toLowerCase().replace(/[^a-z0-9]/ig, ''));
		});

		output.querySelectorAll(':scope > div.slide').forEach(e => {
			if (isElementInViewport(e)) {
				batchRender(e);
			}
		});
		if (cranach.attr['selectedItem']) {
			console.log('SELECTED ITEM: ' + cranach.attr['selectedItem']);

			let item = document.querySelector('.item_title[serial="' + cranach.attr['selectedItem'] + '"], .item_title[md5="' + cranach.attr['selectedItem'] + '"], .label[name="' + cranach.attr['selectedItem'] + '"]').closest('.item_title');
			focusOn(item);
		} else if (cranach.attr['selectedSection']) {
			let section = document.querySelector('.section_title[serial="' + cranach.attr['selectedSection'] + '"], .label[name="' + cranach.attr['selectedSection'] + '"]').closest('.section_title');
			// let selectedSlide = section.closest('.slide');
			focusOn(section);
		} else if (cranach.attr['selectedSlide']) {
			let selectedSlide = document.querySelector(`.output div.slide[slide="${cranach.attr['selectedSlide']}"]`);
			focusOn(selectedSlide);
		}

		// else if ($('.output:visible .slide[slide="' + cranach.attr['selectedSlide']  + '"], .label[name="' + cranach.attr['selectedSlide'] + '"]').length > 0 ){
		//     let $selectedSlide = $('.output:visible .slide[slide="' + cranach.attr['selectedSlide']  + '"], .label[name="' + cranach.attr['selectedSlide'] + '"]').first().closest('.slide');
		//     focusOn($selectedSlide);
		// }

		if (cranach.attr['selectedKeyword']) {
			let selectedSlide = document.querySelector('.output div.slide[slide="' + cranach.attr['selectedSlide']  + '"]');
			focusOn(selectedSlide, cranach.attr['selectedKeyword'].toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
		}

		document.querySelectorAll("[data-bs-toggle=popover]").forEach(e => {
			let html = '<div class="loading">loading...</div>';
			let popover = new bootstrap.Popover(e, {
				html : true,
				content: function() {
					return html;
				}
			});
			e.addEventListener('shown.bs.popover', function() {
				let popoverBody =  document.getElementById(this.getAttribute('aria-describedby'))
				.querySelector('.popover-body');
				if (popoverBody.querySelector('.loading') !== null) {
					popoverBody.querySelector('.loading').remove();
				}
				this.querySelectorAll('a.dropdown-item').forEach(item => {
					item.classList.remove('hidden');
					popoverBody.append(item);
				});
			});
		});

		if (cranach.attr['lectureMode']) {
			console.log('LECTURE MODE');
			document.querySelectorAll('[data-lecture-skip="true"]').forEach(e => {
				e.classList.add('lecture_skip');
			});
		}

		document.getElementById('loading_icon').style.display = 'none';
		document.querySelector('#right_half .navbar').classList.remove('hidden');
		document.querySelector('#right_half .navbar').style.display = 'block';
		if (cranach.attr['present']) {
			console.log('PRESENT MODE');
			showSlide(null, cranach);
		}

		baseRenderer.then(cranach => {
			updateToc(cranach);
		});
		let contentUrlObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type == "attributes") {
					if (mutation.attributeName == `data-content-url`) {
						baseRenderer.then(cranach => {
							updateToc(cranach);
						});
					}
				}
			});
		});
		contentUrlObserver.observe(document.getElementById(`output`), {
			attributes: true,
		});
	});

}
