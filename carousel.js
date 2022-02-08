const indicatorButton = document.createElement('button');
indicatorButton.setAttribute('type', 'button');
indicatorButton.dataset['bsTarget'] = "#right_half";
indicatorButton.dataset['bsToggle'] = "tooltip";
indicatorButton.dataset['bsPlacement'] = "bottom";

function updateCarousel(slideNum) {
	// console.log('updateCarousel');

    let slides = document.querySelectorAll('#output > div.slide');

    if (slides === null) {
        return 0;
    }
	bootstrap.Carousel.getOrCreateInstance(document.querySelector('#right_half'), {
		dispose: true
	});

	// $('.tooltip').remove();
	// $('.carousel-indicators div.tooltip').remove();
	document.querySelector(".carousel-indicators").innerHTML = '';
	document.querySelector('.carousel-indicators').outerHTML = document.querySelector('.carousel-indicators').outerHTML;
	document.querySelector('.controls_container').outerHTML = document.querySelector('.controls_container').outerHTML;

    if (slides.length > 50) {
		carouselThreeSlides(slideNum, slides);
    } else {
		document.querySelectorAll('#output > div.slide').forEach(e => {
            e.classList.add('carousel-item');
            e.classList.remove('hidden');
        });
		let activeIndex = 0;
        slides.forEach((e, index) => {
            let button = indicatorButton.cloneNode(true);
            button.setAttribute('aria-label', `Slide ${e.getAttribute('slide')}`);
            button.setAttribute('title', `Slide ${e.getAttribute('slide')}`);
            button.dataset['bsSlideTo'] = `${index}`;

			// $(".carousel-indicators").append(`<button type="button" data-bs-target="#right_half" data-bs-slide-to="${index}" aria-label="Slide ${this.getAttribute('slide')}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Slide ${this.getAttribute('slide')}"/>`);
			if (e.getAttribute('slide') == slideNum) {
				activeIndex = index;
                button.classList.add('active');
                button.setAttribute('aria-current', 'true');
			}
            document.querySelector(".carousel-indicators").appendChild(button);
		});
		document.querySelectorAll(".carousel-indicators button").forEach(e => {
	        bootstrap.Tooltip.getOrCreateInstance(e, {
	            delay: { "show": 0, "hide": 0 }
	        });
	    });
    }

    // tooltip({'delay': { show: 0, hide: 0 }});

	document.querySelector('#output > div.slide.carousel-item[slide="' + slideNum + '"]').classList.add('active');
    document.querySelector('#right_half .slide_number button').textContent = 'Slide ' + slideNum;
    document.querySelector('#right_half .slide_number button').setAttribute('slide', slideNum);

	new bootstrap.Carousel(document.querySelector('#right_half'));
	document.getElementById('right_half').classList.add('carousel', 'slide');
	document.querySelector('.carousel').removeEventListener('slid.bs.carousel', carouselSlideHandler);
    document.querySelector('.carousel').addEventListener('slid.bs.carousel', carouselSlideHandler);
}

function carouselThreeSlides(slideNum, slides) {

	let prevNum = ((slideNum - 2 + slides.length) % slides.length) + 1;
	// let prevNum = slideNum - 1;
    let nextNum = slideNum == slides.length - 1 ? slides.length : (slideNum + 1) % slides.length;
	// let nextNum = slideNum + 1;

	document.querySelector(".carousel-indicators").innerHTML = '';

	document.querySelectorAll('#output > div.slide:not([slide="' + slideNum + '"]').forEach(e => {
		e.classList.remove('carousel-item');
		e.classList.add('hidden');
	});
	document.querySelectorAll(`#output > div.slide[slide="${prevNum}"], #output > div.slide[slide="${slideNum}"], #output > div.slide[slide="${nextNum}"]`).forEach(e => {
		e.classList.add('carousel-item');
		e.classList.remove('hidden');
	});

	if (prevNum < slideNum) {
	// if (prevNum > 0) {
		let button = indicatorButton.cloneNode(true);
		button.setAttribute('aria-label', `Slide ${prevNum}`);
		button.setAttribute('title', `Slide ${prevNum}`);
		button.dataset['bsSlideTo'] = `0`;
		button.dataset['bsSlideTo'] = nextNum > slideNum ? `0` : `1`;
		document.querySelector(".carousel-indicators").appendChild(button);
	}
	let button = indicatorButton.cloneNode(true);
	button.setAttribute('aria-label', `Slide ${slideNum}`);
	button.setAttribute('title', `Slide ${slideNum}`);
	// button.dataset['bsSlideTo'] = prevNum < slideNum ? `1` : `0`;
	button.classList.add('active');
	button.setAttribute('aria-current', "true");
	document.querySelector(".carousel-indicators").appendChild(button);
	if (nextNum > slideNum) {
	// if (nextNum <= slides.length) {
		let button = indicatorButton.cloneNode(true);
		button.setAttribute('aria-label', `Slide ${nextNum}`);
		button.setAttribute('title', `Slide ${nextNum}`);
		button.dataset['bsSlideTo'] = prevNum < slideNum ? `2` : `1`;
		// button.dataset['bsSlideTo'] = prevNum > 0 ? `2` : `1`;
		document.querySelector(".carousel-indicators").appendChild(button);
	}
	document.querySelectorAll(".carousel-indicators button").forEach(e => {
		bootstrap.Tooltip.getOrCreateInstance(e, {
			delay: { "show": 0, "hide": 0 }
		});
	});
}

function carouselSlideHandler() {
	// console.log('carousel slide event');

	document.querySelectorAll('.tooltip').forEach(e => e.remove());

	document.querySelector('#right_half .slide_number button').textContent = 'Slide ' + document.querySelector('.carousel-item.active').getAttribute('slide');
	document.querySelector('#right_half .slide_number button').setAttribute('slide', document.querySelector('.carousel-item.active').getAttribute('slide'));

	let slide = document.querySelector('#output > div.carousel-item.active');
	let slideNum = parseInt(slide.getAttribute('slide'));
	document.querySelector('#output > div.slide[slide="' + slideNum + '"]').classList.add('selected');

	let slides = document.querySelectorAll('#output > div.slide');
	let prevNum = ((slideNum - 2 + slides.length) % slides.length) + 1;
	let nextNum = slideNum == slides.length - 1 ? slides.length : (slideNum + 1) % slides.length;

	if (slides.length > 50) {
		carouselThreeSlides(slideNum, slides);
	}
	document.getElementById('output').dataset.selectedSlide = slideNum;

	if (typeof canvasSnapshots != 'undefined') {
		canvasSnapshots = [];
	}
	if (typeof canvasUndos != 'undefined') {
		canvasUndos = [];
	}
}

function updateCarouselSlide(slide, content = null) {
	// console.log('updateCarouselSlide');
	if (document.querySelector('.carousel-item') === null) {
		return 1;
	}

	let outerContent = slide.querySelector(':scope > .slide_container > .slide_content');

	// outerContent.style['padding-bottom'] = '';

	let bufferedWidth = 0;
	MathJax.startup.promise.then(() => {
		let mathJaxContentList = content == null ? outerContent.querySelectorAll('.MathJax') : content.querySelectorAll('.MathJax');

		if (mathJaxContentList.length > 0) {
			mathJaxContentList.forEach(e => {
				if (e.hasAttribute('style')) {
					if (!e.style.fontSize.match(/em$/)) {
						e.style.fontSize = "1.2em";
					}
				} else {
					e.style.fontSize = "1.2em";
				}
			});
			while (outerContent.scrollWidth > outerContent.clientWidth
				&& outerContent.scrollWidth != bufferedWidth
				&& parseFloat(mathJaxContentList[0].style.fontSize.replace(/em$/, '')) > 0.8) {
					console.log('adjusting width');
					bufferedWidth = outerContent.scrollWidth;
					mathJaxContentList.forEach(e => {
						e.style.fontSize = (parseFloat(e.style.fontSize.replace(/em$/, '')) - 0.1).toString() + 'em';
					});
			}
		}
		adjustHeight();
	});

}

function showSlide(slide, cranach) {
	console.log('showSlide');
	if (slide == null) {
        if (document.querySelector('div.slide.selected, div.slide.active') !== null) {
            slide = document.querySelector('div.slide.selected, div.slide.active');
        } else {
            slide = document.querySelector('#output > div.slide');
			slide.classList.add('selected');
        }
    }
    document.querySelector('#container').classList.remove('info', 'overview', 'compose');
	document.querySelector('#container').classList.add('present');

    let slideNum = parseInt(slide.getAttribute('slide'));

	updateCarousel(slideNum);
	updateCarouselSlide(slide);

    // cranach.then(renderer => {
    //     updateModal(renderer);
    // });
}

function hideCarousel() {
    if (document.getElementById('right_half').classList.contains('annotate')) {
        hideAnnotate();
    }

    document.getElementById('container').classList.remove('wide');
    document.getElementById('container').classList.remove('present', 'overview');
	document.getElementById('container').classList.add(document.getElementById('left_half').getAttribute('mode'));

	document.querySelectorAll('#output > div.slide').forEach(e => {
		e.classList.remove('carousel-item', 'active', 'hidden');
		e.classList.add('tex2jax_ignore');
	});

    if (document.querySelector('#output > div.slide.selected') !== null) {
		document.querySelector('#output > div.slide.selected').scrollIntoView( {block: "center", behavior: "smooth"} );
	}

}

function adjustHeight() {
	// console.log('adjustHeight');
	let output = document.getElementById('output');
	if (document.querySelector('.carousel-item') === null) {
		 return 1;
	}
	let selectedSlideNum = output.dataset.selectedSlide;
	let slide = document.querySelector(`#output > div.slide[slide="${selectedSlideNum}"]`);
	if (slide.scrollHeight >  0.9*output.clientHeight || document.querySelector('#right_half').classList.contains('annotate')) {
		output.classList.add('long');
		expandCanvas(slide);
	} else {
		output.classList.remove('long');
	}
}

function hideAnnotate() {
	document.querySelectorAll('canvas').forEach(e => e.classList.add('hidden'));
	canvasControlsDisableEvent(document.querySelector('div.slide.active'));
	document.querySelector('#right_half').classList.remove('annotate');
}

function showAnnotate() {
	document.querySelector('#right_half').classList.add('annotate');
	document.getElementById('output').classList.add('long');
	document.querySelector('.carousel').dataset.bsTouch = "false";
}

function annotate() {
	if (document.getElementById('right_half').classList.contains('annotate')) {
		hideAnnotate();
	} else {
		showAnnotate();
	}
	updateCanvas(document.querySelector('.present #output > div.slide.active'));
}

function expandCanvas(slide, scale = 1, padding = 0) {
	if (!document.querySelector('#right_half').classList.contains('annotate')) {
		return 0;
	}
    let output = document.getElementById('output');

    const wasDrawing = slide.cfd.isDrawingModeEnabled;

	canvasControlsDisableEvent(slide);

	let bodyRect = document.body.getBoundingClientRect();
	let slideRect = slide.getBoundingClientRect();
	slide.cfd.canvas.width = output.scrollWidth;
	slide.cfd.canvas.height = output.scrollHeight*scale + padding;
	let voffset = slideRect.top + document.getElementById('output').scrollTop;
	// slide.querySelector('canvas').style.top = -voffset;
	slide.cfd.canvas.style.top = -voffset;

	if ( canvasSnapshots.length > 0 ) {
		console.log(canvasSnapshots);
		let ctx = slide.cfd.context;
		slide.cfd.reconstruct(canvasSnapshots);
		// canvasSnapshots.forEach(positions => {
		// 	if (positions == null) {
		// 		console.log('clearing canvas');
		// 		ctx.beginPath();
		// 		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// 	} else if (positions.length) {
		// 		console.log('redoing paths');
		// 		ctx.beginPath();
		// 		if (!positions[0].isSpline) {
		// 			slide.cfd.draw(positions, positions.length - 1);
		// 		} else {
		// 			slide.cfd.pseudoSpline(positions);
		// 		}
		// 	}
		// });
		if (wasDrawing) {
			canvasControlsEnableEvent(slide)
		}
	} else {
		slide.cfd.restoreCanvasSnapshot(slide.cfd.snapshotImage);
	}
}

function updateCanvas(slide) {
	if (document.querySelector('.carousel-item') === null) {
		return 0;
	}
	if (document.querySelector('#right_half').classList.contains('annotate')) {
		if (slide.querySelector('canvas') === null) {
			addCanvas(slide);
		}
		slide.querySelector('canvas').classList.remove('hidden');
	} else {
		if (slide.querySelector('canvas') !== null) {
			slide.querySelector('canvas').classList.add('hidden');
		}
	}
	document.querySelector('#colorDropdown').style.color = '';
	canvasControlsDisableEvent(slide);
}

function canvasControlsEnableEvent(slide) {
	slide.cfd.enableDrawingMode();
	slide.cfd.canvas.classList.remove('hidden');
	slide.cfd.setDraw();
	document.querySelectorAll('.canvas-controls .nav-link').forEach(e => e.classList.remove('disabled'));
	document.querySelector('.annotate.enable .brush').classList.remove('hidden');
	document.querySelector('.annotate.enable .cursor').classList.add('hidden');
	slide.cfd.canvas.classList.remove('disabled');
	document.querySelector('#colorDropdown').style.color = `rgb(${slide.cfd.strokeColor})`;
}

function canvasControlsDisableEvent(slide) {
    // console.log('canvasControlDisableEvent');
	if (typeof slide.cfd != 'undefined') {
		slide.cfd.disableDrawingMode();
		slide.cfd.canvas.classList.add('disabled');
	}
	document.querySelectorAll('.canvas-controls .nav-link:not(.enable)').forEach(e => e.classList.add('disabled'));
	document.querySelector('.canvas-controls .enable').classList.remove('disabled');
    document.querySelector('.annotate.enable .brush').classList.add('hidden');
    document.querySelector('.annotate.enable .cursor').classList.remove('hidden');
	document.querySelector('#colorDropdown').style.color = '';
}

function clearAllCanvas() {
	if (window.confirm("Are you sure?")) {
		hideAnnotate();
		document.querySelectorAll('canvas').forEach(e => e.remove());
	}
}

function addCanvas(slide, output = document.getElementById('output')) {
	if (slide.querySelector('canvas') !== null || document.querySelector('.carousel-item') === null) {
		return 0;
	}
	let width = output.scrollWidth;
	let height = output.scrollHeight - 5;

	slide.cfd = new CanvasFreeDrawing({
		elementId: slide.id,
		width: width,
		height: height,
		showWarnings: true,
		output: output,
	});
	slide.cfd.setLineWidth(2);
	let bodyRect = document.body.getBoundingClientRect();
	let slideRect = slide.getBoundingClientRect()
	let voffset = slideRect.top + output.scrollTop;
	slide.querySelector('canvas').style.top = -voffset;
}

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.canvas-controls .clear').forEach(
		el => el.addEventListener('click', function() {
			let slide = document.querySelector('#output > div.slide.active');
			if (slide === null) { return 0; }
			if (slide.cfd.isDrawingModeEnabled) {
				slide.cfd.clear();
			}
		})
	);
	document.querySelectorAll('.canvas-controls .expand').forEach(el => el.addEventListener('click', function() {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		expandCanvas(slide, 1, 300);
	}));
	document.querySelectorAll('.canvas-controls .disable').forEach(el => el.addEventListener('click', function() {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		canvasControlsDisableEvent(slide);
	}));
	document.querySelectorAll('.canvas-controls .erase').forEach(el => el.addEventListener('click', function(evt) {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		slide.cfd.setErase();
		document.querySelectorAll('.canvas-controls .nav-link').forEach(el => el.classList.remove('disabled'));
		evt.currentTarget.classList.add('disabled');
        document.querySelector('.annotate.enable .brush').classList.remove('hidden');
        document.querySelector('.annotate.enable .cursor').classList.add('hidden');
	}));
	// $('.canvas-controls .enable').off();
	document.querySelectorAll('.canvas-controls .enable').forEach(el => el.addEventListener('click', function(evt) {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }

        slide.cfd.toggleDrawingMode();
        if (slide.cfd.isDrawingModeEnabled) {
            canvasControlsEnableEvent(slide);
        } else {
            let slide = document.querySelector('#output > div.slide.active');
    		if (slide === null) { return 0; }
    		canvasControlsDisableEvent(slide);
		}
	}));
	document.querySelectorAll('.canvas-controls .undo').forEach(el => el.addEventListener('click', () => {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		slide.cfd.undo()
	}));
	document.querySelectorAll('.canvas-controls .redo').forEach(el => el.addEventListener('click', () => {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		slide.cfd.redo()
	}));
	document.querySelectorAll('.canvas-controls .red').forEach(el => el.addEventListener('click', () => {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		let color = [180, 80, 80];
		slide.cfd.setDrawingColor(color)
		document.querySelector('#colorDropdown').style.color = `rgb(${color.join(',')})`;
	}));
	document.querySelectorAll('.canvas-controls .green').forEach(el => el.addEventListener('click', () => {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		let color = [0, 139, 69];
		slide.cfd.setDrawingColor(color);
		document.querySelector('#colorDropdown').style.color = `rgb(${color.join(',')})`;
	}));
	document.querySelectorAll('.canvas-controls .blue').forEach(el => el.addEventListener('click', () => {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		let color = [40, 122, 181];
		slide.cfd.setDrawingColor(color);
		document.querySelector('#colorDropdown').style.color = `rgb(${color.join(',')})`;
	}));
	document.querySelectorAll('.canvas-controls .orange').forEach(el => el.addEventListener('click', () => {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		let color = [240, 110, 0];
		slide.cfd.setDrawingColor(color);
		document.querySelector('#colorDropdown').style.color = `rgb(${color.join(',')})`;
	}));
	document.querySelectorAll('.canvas-controls .black').forEach(el => el.addEventListener('click', () => {
		let slide = document.querySelector('#output > div.slide.active');
		if (slide === null) { return 0; }
		let color = [100, 100, 100];
		slide.cfd.setDrawingColor(color);
		document.querySelector('#colorDropdown').style.color = `rgb(${color.join(',')})`;
	}));
});
