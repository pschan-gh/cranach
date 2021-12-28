function updateSlideSelector() {
	if (document.querySelector("#slide_sel") == null) {
		return 0;
	}
	let numOfSlides = 0;
	try {
		numOfSlides = document.querySelectorAll('#output div.slide').length;
	} catch(error) {
		return 0;
	}
	document.querySelector("#slide_sel").innerHTML = '';
	for (let i = 1; i <= numOfSlides; i++) {
		let o = new Option(i.toString(), i);
		document.querySelector("#slide_sel").appendChild(o);
	}
	document.querySelector('#slide_sel').addEventListener('change', event => {
		console.log('JUMPING TO SLIDE: ' + event.target.value);
		jumpToSlide(document.querySelector('#output'), document.getElementById(`s${event.target.value}`));
	});
}

function hide() {
	document.querySelector('#cover_half').style.display = 'block';
	document.querySelector('#container').style['height'] =  '50%';
	document.querySelectorAll('.slide_button').forEach(e => e.classList.add('hide'));

}

function unhide() {
	document.querySelector('#cover_half').style.display = 'none';
	document.querySelector('#container').style['position'] =  '';
	document.querySelector('#container').style['height'] =  '';
	document.querySelector('.slide_button').classList.remove('hide');

}

function dim() {
	if (document.querySelector('#right_half').classList.contains('dimmed')) {
		// document.querySelectorAll(' #right_half, #right_half *, .output *').forEach(e => e.style['background-color'] = '');
		// document.querySelectorAll(' #right_half, #right_half *, .output *').forEach(e => e.style['color'] = '');
		// document.querySelector('#right_half').classList.remove('dim');
		document.querySelector('#right_half').classList.remove('dimmed');
		document.querySelector('#right_half').classList.add('carousel-dark');
	} else {
		// document.querySelectorAll('#right_half, .output').forEach(e => e.style['background-color'] = '#222');
		// document.querySelectorAll('#right_half, .output').forEach(e => e.style['color'] =  '#bbb');
		// document.querySelector('#right_half').classList.add('dim');
		document.querySelector('#right_half').classList.add('dimmed');
		document.querySelector('#right_half').classList.remove('carousel-dark');
	}
}

function resizeFont(multiplier, element = document.querySelectorAll('.output:visible')[0]) {

	if (element.style.fontSize == "") {
		element.style.fontSize = "1.0em";
	}
	element.style.fontSize = parseFloat(element.style.fontSize) + 0.2*(multiplier) + "em";

}

// function print(promise) {
//
//     document.querySelectorAll('html').style['position'] =  'relative';
//
//     if(document.querySelectorAll('#right_half')..classList.contains('overview') || document.querySelectorAll('#right_half')..classList.contains('compose') || document.querySelectorAll('#right_half')..classList.contains('info') ) {
//         document.querySelectorAll('#print_content').html('');
//         document.querySelectorAll('#print_content').append(document.querySelectorAll('#output').clone());
//         promise.then(el => {
//             document.querySelectorAll('#print_content').find('.slide.tex2jax_ignore').each(function() {
//                 document.querySelectorAll(this).classList.remove('tex2jax_ignore');
//             });
//             MathJax.typesetPromise().then(el => {
//                 document.querySelectorAll('#print_content').find('.steps').style['visibility'] =  'visible';
//             });
//         });
//     } else if(document.querySelectorAll('#right_half')..classList.contains('present')){
//         document.querySelectorAll('.title_box')[0].clone().appendTo(document.querySelectorAll('#print_content'));
//         document.querySelectorAll('#print_content').find('.title_box').style['font-size'] =  '0.5em';
//         document.querySelectorAll('#print_content').find('.title_box').style['padding-bottom'] =  '1em';
//         document.querySelectorAll('#print_content').find('.title_box').find('h3').style['color'] =  '#888';
//         document.querySelectorAll('#print_content').append(document.querySelectorAll('.output:visible div.slide.selected').html());
//     }
//
//     document.querySelectorAll('#print').show();
//
//     document.querySelectorAll('#container').style.display = 'none';
//
//     document.querySelectorAll('#print_content').classList.remove('text');
//     document.querySelectorAll('#print_content').classList.add('output_dual');
//     document.querySelectorAll('#print_content').find('.slide').style['display'] =  'block';
//     document.querySelectorAll('#print_content').find('.slide').style['height'] =  'auto';
//     document.querySelectorAll('#print_content').find('img:not([src])').each(function() {
//         imagePostprocess(this);
//     });
//     document.querySelectorAll('#print_content').find('.slide').show();
//
//     document.querySelectorAll('#print_content').find('.statement').after('<hr/>');
//     document.querySelectorAll('#print_content').find('.substatement').after('<hr/>');
//
//     document.querySelectorAll('#print_content').find('.separator').html(".&nbsp&nbsp&nbsp&nbsp.&nbsp&nbsp&nbsp&nbsp.&nbsp&nbsp&nbsp&nbsp.");
//     document.querySelectorAll('#print_content').find('blockquote').each(function() {
//         document.querySelectorAll(this).after(document.querySelectorAll(this).html());
//         document.querySelectorAll(this).remove();
//     });
//     document.querySelectorAll('#print_content').find('.collapsea').style.display = 'none';
//     document.querySelectorAll('#print_content').find('.collapse').show();
//     document.querySelectorAll('#print_content').find('.hidden_collapse').show();
// }

document.addEventListener('DOMContentLoaded', () => {
	let menuObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == "attributes") {
				if ( mutation.attributeName == 'data-content-url' ) {
					updateSlideSelector();
				}
			}
		});
	});

	menuObserver.observe(document.getElementById('output'), {
		attributes: true,
	});

	// https://stackoverflow.com/questions/4305726/hide-div-element-with-jquery-when-mouse-isnt-moving-for-a-period-of-time
	// let menu_timer = null;
	// document.querySelectorAll('#right_half')[0].each(function() {
	// 	document.querySelectorAll('#right_half').off();
	// 	document.querySelectorAll('#right_half').mousemove(function() {
	// 		clearTimeout(menu_timer);
	// 		document.querySelectorAll(".present .menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
	// 		document.querySelectorAll('.present .controls.carousel-indicators').style['display'] =  'flex';
	// 		menu_timer = setTimeout(function () {
	// 			document.querySelectorAll(".present .menu_container.fadeout .navbar-nav, .controls, .present .active .slide_number").not('.hidden').fadeOut();
	// 			document.querySelectorAll(".controls, .present .active .slide_number").not('.hidden').fadeOut();
	// 		}, 1000);
	// 	})
	// });

	// document.querySelectorAll('.present #menu_container')[0].each(function() {
	// 	document.querySelectorAll(this).find(".navbar-nav, .present .slide_number").not('.hidden').off();
	// 	document.querySelectorAll(this).find(".navbar-nav, .present .slide_number").not('.hidden').mouseover(function() {
	// 		document.querySelectorAll('#right_half').off('mousemove');
	// 		clearTimeout(menu_timer);
	// 		document.querySelectorAll(this).show();
	// 	});
	// 	document.querySelectorAll(this).find(".navbar-nav, .present .slide_number").not('.hidden').mouseout(function() {
	// 		clearTimeout(menu_timer);
	// 		document.querySelectorAll('#right_half').off('mousemove');
	// 		document.querySelectorAll('#right_half').mousemove(function() {
	// 			clearTimeout(menu_timer);
	// 			document.querySelectorAll(".present .menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
	// 			document.querySelectorAll('.present .controls.carousel-indicators').style['display'] =  'flex';
	// 			menu_timer = setTimeout(function () {
	// 				document.querySelectorAll(".present .menu_container.fadeout .navbar-nav, .present .slide_number").not('.hidden').fadeOut();
	// 				document.querySelectorAll(".controls").style.display = 'none';
	// 			}, 1000);
	// 		})
	// 	});
	// });

	let menu_timer = null;
	// document.querySelectorAll('.controls').off();
	document.querySelectorAll('.controls').forEach(e => {
		e.addEventListener('mouseover', function( event ) {
			// document.querySelectorAll('#right_half').off('mousemove');
			clearTimeout(menu_timer);
			e.classList.remove('hidden');
		});
		e.addEventListener('mouseout', function( event ) {
			clearTimeout(menu_timer);
			// document.querySelectorAll('#right_half').off('mousemove');
		});
	});

	document.querySelector('#right_half').addEventListener('mousemove', function() {
		clearTimeout(menu_timer);
		// document.querySelectorAll(".present .menu_container .navbar-nav, .present .controls, .present .slide_number:not(.hidden)").fadeIn();
		document.querySelectorAll(".present .menu_container .navbar-nav, .controls, .present .slide_number").forEach(e => e.classList.remove('hidden'));
		menu_timer = setTimeout(function () {
			// document.querySelectorAll(".present .menu_container.fadeout .navbar-nav, .present .slide_number").fadeOut();
			document.querySelectorAll(".present .menu_container .navbar-nav, .present .slide_number").forEach(e => {
				e.classList.add('hidden');
			});
			document.querySelectorAll(".controls").forEach(e => e.classList.add('hidden'));
		}, 1000);
	})

	document.querySelector('input.lecture_mode').addEventListener('change', function() {
		if (this.checked) {
			document.querySelectorAll('[data-lecture-skip="true"]').classList.add('lecture_skip');
		} else {
			document.querySelectorAll('[data-lecture-skip="true"]').classList.remove('lecture_skip');
		}
	});

	document.querySelector('#latex_icon').addEventListener('click', function() {
		baseRenderer.then(cranach => {
			bootstrap.Modal.getOrCreateInstance(document.querySelector('#text_modal')).toggle();
			showLatex(cranach);
		});
	});
	document.querySelector('#beamer_icon').addEventListener('click', function() {
		baseRenderer.then(cranach => {
			bootstrap.Modal.getOrCreateInstance(document.querySelector('#text_modal')).toggle();
			showLatex(cranach, 'beamer');
		});
	});
	document.querySelector('#xml_icon').addEventListener('click', function() {
		baseRenderer.then(cranach => {
			bootstrap.Modal.getOrCreateInstance(document.querySelector('#text_modal')).toggle();
			showXML(cranach);
		});
	});

	document.querySelector('#xmlInput').addEventListener('change', function() {
		baseRenderer = openXML(baseRenderer, this);
	});

});
