function removeTypeset(el) { // i.e. Show LaTeX source

        // let jax = MathJax.startup.document.getMathItemsWithin($('#output')[0]);
		let jax = MathJax.startup.document.getMathItemsWithin(el);
        showTexFrom(jax);
        MathJax.typesetClear([el]);
        // MathJax.typesetClear();
}

function renderTexSource(slide) {
    let oldElems = slide.getElementsByClassName("latexSource");

    for(let i = oldElems.length - 1; i >= 0; i--) {
        let oldElem = oldElems.item(i);
        let parentElem = oldElem.parentNode;
        let innerElem;

        let textNode = document.createTextNode(oldElem.textContent);
        parentElem.insertBefore(textNode, oldElem);
        parentElem.removeChild(oldElem);
    }

    $(slide).find('.latexSource').remove();
}

function inlineEdit(enableEdit, editor) {
	let slide;
    let $outputSlide = $('#output div.slide.selected').length > 0 ? $('#output div.slide.selected').first() : $('#output div.slide').first();
	let $carouselSlide = $('#carousel div.slide.active').length > 0 ? $('#carousel div.slide.active').first() : $('#carousel div.slide').first();

	if ($('.carousel-item').length == 0) {
		$slide = $outputSlide;
	} else {
		$slide = $carouselSlide;
	}

    $slide.attr('contentEditable', enableEdit);
    $slide.find('.slide_content *, .paragraphs').css('border', '').css('padding', '');
    $slide.find('.paragraphs').css('color', '').css('font-family', '');

    if (!enableEdit) {

		$('#output').css('display', '');
		$('#output div.slide').css('display', '');
		$('#carousel').css('display', '');

        MathJax.startup.document.state(0);
        MathJax.texReset();
        // MathJax.typesetClear();
        // renderTexSource($slide[0]);
        // $('#output div.slide').addClass('tex2jax_ignore');

		// $slide.addClass('tex2jax_ignore');

        if ($('.carousel-item').length > 0) {
			// $('#carousel div.slide.selected').html($slide.html());
			$outputSlide.html($carouselSlide.html());
		}
		renderSlide($slide[0]);

        editor.container.style.pointerEvents="auto";
        editor.container.style.opacity = 1; // or use svg filter to make it gray
        editor.renderer.setStyle("disabled", false);
        editor.focus();

    } else {
		// renderSlide($slide[0]);
        // if ($('.carousel-item').length) {
		// 	let $carouselSlide = $('#carousel div.slide.active').length > 0 ? $('#carousel div.slide.active').first() : $('#carousel div.slide').first();
		// 	// $('#output div.slide').hide();
        //     // $('#output div.slide').removeClass('tex2jax_ignore');
		// 	// collapseToggle($slide.attr('slide'), 'show');
		// 	// $('#output').show();
		// 	// $slide.show();
        //     $('#carousel').hide();
		// 	// duplicateCollapse($carouselSlide[0], $slide[0]);
        // } else {
		// 	$slide.each(function() {
		// 		$(this).find('.slide_content *:not([wbtag=ignore]):not([wbtag=skip]):not([wbtag=transparent]):not([class=paragraphs])').css('border', '1px solid grey').css('padding', '1px');
		// 		$(this).find('.paragraphs').css('color', 'grey').css('font-family', 'monospace');
		// 		removeTypeset(this);
		// 		$(this).addClass('edit').removeClass('tex2jax_ignore');
		// 	});
		// }
		console.log($slide);

		$slide.each(function() {
			$(this).find('.slide_content *:not([wbtag=ignore]):not([wbtag=skip]):not([wbtag=transparent]):not([class=paragraphs])').css('border', '1px solid grey').css('padding', '1px');
			$(this).find('.paragraphs').css('color', 'grey').css('font-family', 'monospace');
			removeTypeset(this);
			$(this).addClass('edit').removeClass('tex2jax_ignore');
		});

        editor.container.style.pointerEvents="none";
        editor.container.style.opacity=0.5; // or use svg filter to make it gray
        editor.renderer.setStyle("disabled", true);
        editor.blur();
    }

}

function showTexFrom(jax) {
    for (let i = jax.length - 1, m = -1; i > m; i--) {
        let jaxNode = jax[i].start.node, tex = jax[i].math;

        if (jax[i].display) {
            if (!tex.match(/^\s*\\(begin{equation|(begin{align(\*)?})|begin{multline|begin{eqnarray)/)) {
                tex = "\\["+tex+"\\]";
            }
        } else {tex = "$"+tex+"$"}

        let $preview = $('<span class="latexSource tex2jax_ignore"></span>');
        $preview.html(tex);
        if (jax[i].display) {
            $preview.css('display', 'block');
        }

        jaxNode.parentNode.insertBefore($preview[0], jaxNode);
        jaxNode.remove();
    }
}

function showJaxSource(outputId) {

    let jax = MathJax.startup.document.getMathItemsWithin(document.getElementById(outputId));

    showTexFrom(jax);

    let clone = document.getElementById(outputId).cloneNode(true);

    let oldElems = clone.getElementsByClassName("latexSource");

    for(let i = oldElems.length - 1; i >= 0; i--) {
        let oldElem = oldElems.item(i);
        let parentElem = oldElem.parentNode;
        let innerElem;

        while (innerElem = oldElem.firstChild)
        {
            // insert all our children before ourselves.
            parentElem.insertBefore(innerElem, oldElem);
        }
        parentElem.removeChild(oldElem);
    }

    let editedContent = clone.innerHTML;

    let body = new DOMParser().parseFromString(editedContent, 'text/html');

    let bodyString = new XMLSerializer().serializeToString(body);
    body = new DOMParser().parseFromString(bodyString, "application/xml");
    return body;
}

function renderSlide(slide) {

    $(slide).find('a.collapsea').attr('data-bs-toggle', 'collapse');
    $(slide).find('.hidden_collapse').removeClass('hidden_collapse').addClass('collapse');

    $(slide).find('img:not([src])').each(function() {
        imagePostprocess(this);
    });

    baseRenderer.then(cranach => {
        updateRefs(slide, cranach)
    });

    // $(slide).find('iframe:not([src])').not(".webwork").each(function() {
    //     $(this).attr('src', $(this).attr('data-src')).show();
    //     let $iframe = $(this);
    //     $(this).css('background', 'none');
    //     $(this).iFrameResize({checkOrigin:false});
    // });

    renderTexSource(slide);
    $(slide).find('.latexSource').remove();
    if ($(slide).hasClass("tex2jax_ignore")) {
        $(slide).removeClass("tex2jax_ignore");
	}
	typeset([slide]).then(() => {
		// renderScriptMath(slide);
		adjustHeight(slide);
	});
}

function batchRender(slide) {
    $(slide).nextAll('div.slide.tex2jax_ignore:lt(1)').each(function() {
        renderSlide(this);
    });
    $(slide).prevAll('div.slide.tex2jax_ignore:lt(1)').each(function() {
        renderSlide(this);
    });
    renderSlide(slide);
}

function adjustHeight(slide) {
    // let $output = $('.output.present:visible');
    let $output = $('#carousel');
    if (!$output.length) {
        return 0;
    }

    $(slide).find('.slide_content').css('padding-bottom', '');
    if ($output[0].scrollHeight >  $output.innerHeight() || $output.hasClass('annotate')) {
        $output.css('display', 'block');
        $(slide).find('.slide_content').css('padding-bottom', '15em');
    } else {
        $output.css('display', '');
    }
}

function updateSlideContent(slide, carousel = 'false') {
    // if ( $(slide).hasClass('tex2jax_ignore') ) {
    //     batchRender(slide);
    // }
	batchRender(slide);
    $(slide).find('iframe:not([src])').each(function() {
        $(this).attr('src', $(this).attr('data-src')).show();
        $(this).iFrameResize({checkOrigin:false});
        // iFrameResize({ log: true }, slide);
    });

    if ($(slide).find('a.collapsea[aria-expanded="false"]').length) {
		$('#uncollapse_button').text('Uncollapse');
	} else {
		$('#uncollapse_button').text('Collapse');
	}
	$('#uncollapse_button').off();
	$('#uncollapse_button').click(function() {
		collapseToggle($(slide).attr('slide'));
	});
    $(slide).find('.loading_icon').hide();

    adjustHeight(slide);

    $('*[text]').removeClass('highlighted');
    $('button').removeClass('highlighted');
    $('.item_button').css('background-color', '');

    $('.separator').css('font-weight', 'normal');
    $('.separator').find('a').css('color', 'pink');

    $(slide).find('.separator').css('font-weight', 'bold');
    $(slide).find('.separator').find('a').css('color', 'red');

    if (carousel) {
        updateCanvas(slide);
    }
}

function showStep(el) {
    let $parent = $(el).closest('div[wbtag="steps"]');
    let $stepsClass = $parent.find('.steps');

    if (typeof $parent.attr('stepId') == 'undefined' || $parent.attr('stepId') == null) {
        $parent.attr('stepId', 0);
    }
    let whichStep = $parent.attr('stepId');

    if (whichStep < $stepsClass.length) {
        $parent.find('#step' + whichStep).css('visibility', 'visible');
        whichStep++;
    }

    if ($parent.find('#step' + whichStep).length == 0) {
        $parent.find('button.next').attr('disabled', true).removeClass('btn-outline-info').addClass('btn-outline-secondary');
    }

    $parent.find('button.reset').attr('disabled', false);

    $parent.attr('stepId', whichStep);

}
//
//  Enable the step button and disable the reset button.
//  Hide the steps.
//
function resetSteps(el) {
    let $parent = $(el).closest('div[wbtag="steps"]');
    $parent.find('button.next').attr('disabled', false).addClass('btn-outline-info').removeClass('btn-outline-secondary');
    $parent.find('button.reset').attr('disabled', true);
    $parent.find('.steps').css('visibility', 'hidden');
    $parent.attr('stepId', 0);
}

function collapseToggle(slideNum, forced = '') {

    let $slides = $('.output div.slide[slide="' + slideNum + '"]');

    $slides.each(function() {
        let $slide = $(this);
        renderSlide(this);
        if (forced == '') {
            if ($slide.hasClass('collapsed')) {
                $slide.removeClass('collapsed');
                $slide.find('.collapse').collapse('show');
                // $slide.find('.collapse').show();
                $slide.find('a.collapsea').attr('aria-expanded', 'true');
                $('#uncollapse_button').text('Collapse');
            } else {
                $slide.addClass('collapsed');
                $slide.find('.collapse').collapse('hide');
                // $slide.find('.collapse').hide();
                $slide.find('a.collapsea').attr('aria-expanded', 'false');
                $('#uncollapse_button').text('Uncollapse');
            }
        } else {
            $slide.find('.collapse').collapse(forced);
            $slide.find('a.collapsea').attr('aria-expanded', forced == 'show' ? 'true' : 'false');
            $('#uncollapse_button').text(forced == 'show' ? 'Collapse' : 'Uncollapse');
            if (forced == 'show') {
                $slide.removeClass('collapsed');
            } else {
                $slide.addClass('collapsed');
            }
        }
    });
}

function focusOn($item, text = '') {
    if ($item.closest('div.slide').length == 0) {
        return 0;
    }
    let $slide = $item.closest('div.slide').first();
    let slideNum = $slide.attr('slide');
    renderSlide($slide[0]);

    $item[0].scrollIntoView();
    if (text != '') {
        let sanitizedText = text.replace(/\r/ig, 'r').toLowerCase().replace(/[^a-z0-9]/ig, '');
        console.log(sanitizedText);
        // let $textItem = $item.find('*[text="' + text.replace(/[^a-zÀ-ÿ0-9\s\-\']/ig, '') + '"]').addClass('highlighted');
        let $textItem = $item.find('*[text="' + sanitizedText + '"]').addClass('highlighted');
        if ($textItem.length) {
            $textItem[0].scrollIntoView();
            if ($textItem.first().closest('.collapse, .hidden_collapse').length > 0) {
                collapseToggle(slideNum, 'show');
                $slide.on('shown.bs.collapse', 'div.collapse', function() {
                    $textItem[0].scrollIntoView();
                });
            }
        }
    } else {
        if ($item.closest('.collapse, .hidden_collapse').length > 0) {
            collapseToggle(slideNum, 'show');
            $slide.on('shown.bs.collapse', 'div.collapse', function() {
                $item[0].scrollIntoView();
            });
        }
        $item.addClass('highlighted');
    }

    if($('#right_half').hasClass('present')) {
        baseRenderer.then(cranach => {
            showSlide($slide[0], cranach);
        });
    }
}

function jumpToSlide($output, $slide) {
    // $output.scrollTo($slide);
    $slide[0].scrollIntoView();
    if($('#right_half').hasClass('present')) {
        baseRenderer.then(cranach => {
            showSlide($slide[0], cranach);
        });
    }
}

function highlight(item) {
    $('.item_button').css('background-color', '');
    $('div[item="' + item + '"]').find("button").first().css('background-color', '#ff0');

}
function imagePostprocess(image) {

    $(image).attr('src', $(image).attr('data-src'));
    $(image).on('load', function() {
        $(image).closest('.image').find('.loading_icon').hide();
		$(image).removeClass('loading');
        if ($(image).hasClass('exempt') || Math.max($(image).get(0).naturalWidth, $(image).get(0).naturalHeight) < 450) {
            console.log($(image).attr('src') + ' OK');
            return 1;
        }

        let image_width = $(image).closest('.image').css('width');

        $(image).closest('.image').css('height', '');
        $(image).closest('.dual-left').css('height', '');
        $(image).closest('.dual-right').css('height', '');

        let override = ($(image).closest('.image').css('width') !== null && typeof $(image).closest('.image').css('width') !== 'undefined' && Number.parseInt($(image).closest('.image').css('width').replace(/px$/, '') < 600))
        // let override = false;

        if(/svg/.test($(image).attr('src'))) {
            if (($(image).closest('.dual-left').length > 0) || ($(image).closest('.dual-right').length > 0)) {
                let width = 300;
                let height = 300;
                $(image).attr('width', width);
            } else if (!override) {
                let width = 450;
                let height = 450;
                $(image).closest('.image').css('width', '450');
                $(image).attr('width', width);
            } else {
                $(image).css('width', '100%');
            }
        } else if (!override) {
            // console.log('Adjusting ' + $(image).attr('src') + ' ' + width + ' ' + height);
            $(image).removeAttr('style');
            $(image).removeAttr('width');
            $(image).removeAttr('height');

            let width = $(image).get(0).naturalWidth;
            let height = $(image).get(0).naturalHeight;

            if (width > height) {
                if (width > 600) {
                    $(image).css('width', '100%');
                    $(image).css('max-height', '100%');
                } else {
                    $(image).css('max-width', '100%');
                    $(image).css('height', 'auto');
                }
            } else {
                if (height > 560) {
                    if (($(image).closest('.dual-left').length > 0) || ($(image).closest('.dual-right').length > 0)) {
                        $(image).css('width', '100%');
                        $(image).css('max-height', '100%');
                    } else {
                        if((typeof $(image).closest('.image').css('width') === 'undefined')|| ($(image).closest('.image').css('width') === false) || ($(image).closest('.image').css('width') === '0px') || (image_width == '600px')){
                            $(image).css('height', '560px');
                            $(image).css('width', 'auto');
                        } else {
                            $(image).css('height', 'auto');
                            $(image).css('max-width', '100%');
                        }
                    }
                } else {
                    if((typeof $(image).closest('.image').css('width') === 'undefined')|| ($(image).closest('.image').css('width') === false) || ($(image).closest('.image').css('width') === '0px')) {
                        $(image).css('max-width', '100%');
                        $(image).css('height', 'auto');
                    } else {
                        $(image).css('max-width', '100%');
                        $(image).css('height', 'auto');
                    }
                }
            }
        } else {
            if ($(image).css('width') == '' || typeof $(image).css('width') === 'undefined' || $(image).css('width') === false) {
                $(image).css('width', '100%');
            }
        }

        $(image).css('background', 'none');
        $(image).show();
    });
}


// https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
function isElementInViewport (el) {

    let rect = el.getBoundingClientRect();

    return (
        (
            rect.top >= 0  &&
            rect.top <= $(window).height()
        )
        ||
        (
            rect.bottom >= 0  &&
            rect.bottom <= $(window).height()
        )

    );
}

function updateRefs(slide, cranach) {

    $(slide).find('a.lcref').each(function() {
        $(this).attr('lcref', "");

        let label = $(this).attr('label');
        let md5 = $(this).attr('md5');
        let contentDir = cranach.attr['dir'];
        let rootURL = cranach.attr['rootURL'];


        if (cranach.hasXML) {
            contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
        } else if (cranach.hasWb) {
            contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
        }

        let statementType = 'statement';
        if ($(this).attr('type').match(/proof|solution|answer/i)) {
            statementType = 'substatement';
        }
        if ($(this).attr('type').match(/figure/i)) {
            statementType = 'figure';
        }

        let lcref = '';
        if ($(this).attr('filename') == 'self') {
            if (cranach.hasXML) {
                lcref = rootURL + "?xml=" + cranach.attr['xmlPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
            } else {
                lcref = rootURL + "?wb=" + cranach.attr['wbPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
            }
        } else if ($(this).attr('src-filename')) {
            if ($(this).attr('src-filename').match(/\.xml$/)) {
                lcref = rootURL + "?xml=" + contentDir + '/' + $(this).attr('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
            } else {
                lcref = rootURL + "?wb=" + contentDir + '/' + $(this).attr('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
            }
        }

        $(this).attr('lcref', lcref + '&version=' +Math.random());

    });

    $(slide).find('a.href').each(function() {

        let label = $(this).attr('label');
        let serial = $(this).attr('serial');
        let md5 = $(this).attr('md5');
        let contentDir = ''

        let rootURL = cranach.attr['rootURL'];
        if (cranach.hasXML) {
            contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
        } else if (cranach.hasWb) {
            contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
        }

        let href = '';
        if ($(this).attr('filename') == 'self') {
            if (cranach.hasXML) {
                let href = rootURL + "?xml=" + cranach.attr['xmlPath'] + '&section=' + serial;
            } else {
                let href = rootURL + "?wb=" + cranach.attr['wbPath'] + '&section=' + serial;
            }
        } else {
            if (cranach.hasXML) {
                let href = rootURL + "?xml=" + contentDir + '/' + $(this).attr('src-filename') + '&section=' + serial;
            } else {
                let href = rootURL + "?wb=" + contentDir + '/' + $(this).attr('src-filename') + '&section=' + serial;
            }
        }

        $(this).attr('target', '_blank');
        $(this).attr('href', href);

    });

}

function updateSlideClickEvent() {
    $('.output div.slide').off();
    $('.output div.slide').click(function() {
        let slideNum = $(this).attr('slide');
        let slide = this;
        if (slideNum != $('#output').attr('data-selected-slide') || !$('#output').is("[data-selected-slide]")) {
            $('#output').attr('data-selected-slide', slideNum);
            // updateSlideContent(this);
            // updateSlideInfo(this, cranach);
        }
    });
}

let timer = null;
function updateScrollEvent() {
    $('#output').off();

    // https://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling
    $('.output:visible').on('scroll', function() {
        if(timer !== null) {
            clearTimeout(timer);
        }
        timer = window.setTimeout(function() {
            $('.output:visible .slide.tex2jax_ignore').each(function() {
                if (isElementInViewport(this)) {
                    batchRender(this);
                };
            });
        }, 15*100);
    });
}

$(function() {
    let slideObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == "attributes") {
                if (mutation.attributeName == 'data-selected-slide') {
                    let $slide = $('.output:visible div.slide[slide="' + $('#output').attr('data-selected-slide') + '"]');
                    updateSlideContent($slide[0], $('.carousel-item').length > 0);
                }
            }
        });
    });
    slideObserver.observe(document.getElementById('output'), {
        attributes: true,
    });
});
