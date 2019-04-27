function resetHighlight() {
    lines = editor.getSession().doc.getAllLines();
    slideCount = 0;
    var isComment = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(/\<\!--/)) {
            isComment = true;
        }
        if (lines[i].match(/--\>/)) {
            isComment = false;
        }
        if (lines[i].match(/^@(slide|sep|course|chapter|lecture|week|section|subsection|subsubsection)/) && !lines[i].match(/\<\!--.*?--\>/) && !isComment) {
            slideCount++;
            slideLine[slideCount] = i + 1;
        }
    }
}

function updateModal() {
    $('.slide_button').on('click', function() {
        console.log('SLIDE BUTTON PRESSED');
        var course = $(this).closest('.slide').attr('course');

        var slide = $(this).closest('.slide').attr('slide');
        var chapterType = $(this).closest('.slide').attr('chapter_type');
        var chapter = $(this).closest('.slide').attr('chapter');

	if (cranach.attr['query']) {
            var url = cranach.contentURL +  '&query=' + cranach.attr['query'] + '&present&slide=' + slide;
	} else {
	    var url = cranach.contentURL + '&present&slide=' + slide;
	}
        console.log('SLIDE_BUTTON CLICKED: ' + url);

        $('#item_modal').find('#modal_keywords').html('');
        $('#item_modal').modal('toggle');

        $('#item_modal').find('#modal_keywords').html('<hr><b class="notkw">Keywords:</b>').append($('#slide_keywords').clone(true));

        $('#item_modal').find('#item_modal_link').attr('href', url);
        $('#item_modal').find('#share_url').html(url);
        $('#item_modal').find('#share_hyperlink').html('<a href="' + url + '" target="_blank" title="Course:' + course + '">' + course + ' ' + chapterType + ' ' + chapter + ' Slide ' + slide + '</a>');
        $('#item_modal').find('#share_hyperref').html('\\href{' + url.replace('#', '\\#') + '}{' + course + ' ' + chapterType + ' ' + chapter + ' Slide ' + slide + '}');

    });


    $('.item_button').on('click', function() {
        var course = $(this).attr('course');
        var md5String = $(this).attr('md5');
        var item_type = $(this).attr('type');
        var chapter = $(this).attr('chapter');
        var item = $(this).attr('item');
        var slide = $(this).closest('.slide').attr('slide');

        $('#item_modal').find('#modal_keywords').html('');
        $('#item_modal').modal('toggle');


        console.log('ITEM CLICKED COURSE: ' + course);

        $('#share_item span').hide();

        $('.current_course').text(course);
        $('.current_chapter').text(chapter);
        $('.current_item_type').text(item_type);
        $('.current_item').text(item);
        $('#share_item span.current_course, #share_item span.current_chapter, #share_item span.current_item_type, #share_item span.current_item').show();

        // var slide = $(this).closest('.slide').attr('slide');

        url = cranach.contentURL + '&item=' + item;
        console.log('ITEM CLICK URL: ' + url);

        $('#item_modal').find('#item_modal_link').attr('href', url);

        $('#item_modal').find('#share_url').html(url);
        $('#item_modal').find('#share_hyperlink').html('<a href="' + url + '" target="_blank" title="Course:' + course + '">' + item_type + ' ' + item + '</a>');
        $('#item_modal').find('#share_hyperref').html('\\href{' + url.replace('#', '\\#') + '}{' + item_type + ' ' + item + '}');
        $('#item_modal').find('.md5').first().html(md5String);
    });
}

function updateSlideClickEvent() {
    $('.slide').on('click', function() {

        if ($(this).attr('slide') != slideIndex) {
            if (editMode) {
                $('#edit_button').click();
            }
        }

        var course = $(this).attr('course');
        var chapterType = $(this).attr('chapter_type');
        var chapter = $(this).attr('chapter');
        slideIndex = $(this).attr('slide');
        var slide = slideIndex;
        var statements = new Array();

        $('*[text]').removeClass('highlighted');

        $('[data-toggle="popover"]').popover('hide');

        if ($(this).hasClass('tex2jax_ignore')) {
            console.log("IN VIEW" + $(this).attr('slide'));
            renderSlide(this);
        }
        $(this).nextAll('.slide:lt(2)').each(function() {
            if ($(this).hasClass('tex2jax_ignore')) {
                renderSlide(this);
            }
        });
        $(this).prevAll('.slide:lt(2)').each(function() {
            if ($(this).hasClass('tex2jax_ignore')) {
                renderSlide(this);
            }
        });

        updateTitle(this);

        $('.item_button').css('background-color', '');
        $('#slide_info').show();
        $('.separator').css('font-weight', 'normal');
        $('.separator').find('a').css('color', 'pink');
        $(this).find('.separator').css('font-weight', 'bold');
        $(this).find('.separator').find('a').css('color', 'red');
        var line = slideLine[$(this).attr('slide')];
        editor.gotoLine(line);


        if ($('#s' + slideIndex).hasClass('collapsed')) {
            $('#uncollapse_button').text('Uncollapse');
        } else {
            $('#uncollapse_button').text('Collapse');
        }

        var url = cranach.contentURL;
        var urlSlide = cranach.contentURL +  '&query=' + cranach.attr['query'] + '&present&slide=' + slide;
        // console.log('SLIDE_BUTTON CLICKED: ' + urlSlide);

        $('.url.share_text.slide_info').html(urlSlide);

        $('#url_open').attr('href', urlSlide);

        $('.hyperlink.share_text.slide_info').html('<a href="' + urlSlide + '" target="_blank" title="Course:' + course + '">' + 'Chapter ' + chapter + ' Slide ' + slide + '</a>');

        $('.hyperref.share_text.slide_info').html('\\href{' + urlSlide.replace('#', '\\#') + '}{Chapter ' + chapter + ' Slide ' + slide + '}');
        $(this).find('img').each(function() {
            imagePostprocess(this);
        });

        $("div[wbname='statement'][chapter='" + $(this).attr('chapter') + "']").each(function() {
            if (!($(this).attr('type') in statements)) {
                statements[$(this).attr('type')] = '';
            }

            var item = $(this).attr('item');
            var slide = $('div[item="' + $(this).attr('item') + '"]').closest('.slide').attr('slide');

            statements[$(this).attr('type')] += "<a style='margin:1px 10px 1px 10px;' class='info_statements_num' href='javascript:void(0)' onclick=\"focusOn(" + slide + ", '');highlight('" + item + "')\">" + item + "</a>";
        });
        var html = '';
        for (var key in statements) {
            html += '<br/><a class="info_statements" target="_blank" href="' + url + '&query=//lv:statement[@chapter=' + $(this).attr('chapter') + ' and @type=%27' + key + '%27]">' + key + '</a><em> ' + statements[key] + '</em>';
        }
        $('#info_statements').html('');
        $('#info_statements').html(html);
    });
}

function updateKnowl() {

        $('a.knowl').each(function() {
            $(this).attr('knowl', "");

            var chapter = $(this).attr('chapter');
            var num = $(this).attr('num');
            var num = $(this).attr('item');
            var label = $(this).attr('label');
            var contentDir = ''

            var rootURL = cranach.rootURL;
            if (cranach.hasXML) {
                contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
            } else if (cranach.hasWb) {
                contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
            }

            if ($(this).attr('filename') == 'self') {
                if (cranach.hasXML) {
                    var knowl = rootURL + "cranach_bare.php?xml=" + cranach.attr['xmlPath'] + "&query=//lv:statement[@label='" + label + "']";
                } else {
                    var knowl = rootURL + "cranach_bare.php?wb=" + cranach.attr['wbPath'] + "&query=//lv:statement[@label='" + label + "']";
                }
            } else {
                if (cranach.hasXML) {
                    var knowl = rootURL + "cranach_bare.php?xml=" + contentDir + '/' + $(this).attr('filename') + "&query=//lv:statement[@label='" + label + "']";
                } else {
                    var knowl = rootURL + "cranach_bare.php?wb=" + contentDir + '/' + $(this).attr('filename') + "&query=//lv:statement[@label='" + label + "']";
                }
            }

            $(this).attr('knowl', knowl);

        });

}

function updateScrollEvent() {
    $('#output').on("scroll", function() {
        /* your code go here */
        $('.slide').each(function() {
            if (isElementInViewport(this)) {
                if ($(this).hasClass('tex2jax_ignore')) {
                    console.log("IN VIEW" + $(this).attr('slide'));
                    renderSlide(this);
                }
                $(this).nextAll('.slide:lt(2)').each(function() {
                    if ($(this).hasClass('tex2jax_ignore')) {
                        renderSlide(this);
                    }
                });
                $(this).prevAll('.slide:lt(2)').each(function() {
                    if ($(this).hasClass('tex2jax_ignore')) {
                        renderSlide(this);
                    }
                });
            }
        });
    });

}

function updateToc() {
    console.log('UPDATING TOC');
    $('#toc').html('').append($('#toc_src'));

    $('#toc').find('a').each(function() {
        var string = $(this).text();
        $(this).text(string.charAt(0).toUpperCase() + string.slice(1));
    });

    $('#toc').find('a.chapter').each(function() {
        var $slide = $('.slide[chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            $('#output').scrollTo($slide);
            $slide.click();
        });
    });
    $('#toc').find('a.section').each(function() {
        var $slide = $('.slide[section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            $('#output').scrollTo($slide);
            $slide.click();
        });
    });
    $('#toc').find('a.subsection').each(function() {
        var $slide = $('.slide[subsection="' + $(this).attr('subsection') + '"][section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            $('#output').scrollTo($slide);
            $slide.click();
        });
    });
}

function updateCollapseElements() {
    var colchar = "▽";
    var expchar = "►";

    $('.collapsea').click(function() {
        if ($(this).hasClass('collapsed')) {
            $(this).removeClass('collapsed')
        } else {
            $(this).addClass('collapsed');
        }
        this.text = $(this).hasClass('collapsed') ? expchar : colchar;
    });
}

function updateKeywords() {
    $('#info_keywords_course').html('');
    $('div.keywords[slide="all"][environ="course"]').each(function() {
        $('#info_keywords_course').append($(this));
    });
    $('div.keywords[slide="all"][environ="root"]').each(function() {
        $('#info_keywords_course').append($(this));
    });
    $('#info_keywords_chapter').html('');
    $('div.keywords[slide="all"][environ="chapter"]').each(function() {
        $('#info_keywords_chapter').append($(this));
    });
    $('#slide_keywords').html('').append($('div.keywords[slide!="all"]'));
}

function updateEditor() {
    editor.container.style.pointerEvents="auto";
    editor.container.style.opacity=1; // or use svg filter to make it gray
    editor.renderer.setStyle("disabled", false);
    editor.focus();
    resetHighlight();
}

function postprocess() {
    console.log('POSTPROCESS CALLED');
    $('.icon.xml, .icon.latex').show();

    $('.slide_number').hide();
    $('.slide').find("table:not(.exempt)").addClass("table table-bordered");

    // MathJax.Hub.Queue(
    //     ["resetEquationNumbers", MathJax.InputJax.TeX],
    //     ["PreProcess", MathJax.Hub, document.getElementById('output')],
    //     ["Reprocess", MathJax.Hub, document.getElementById('output')],
    //     ["Typeset", MathJax.Hub, document.getElementById('output')]
    // );

    updateEditor();
    updateSlideClickEvent();
    updateKnowl();
    updateModal();
    updateScrollEvent();
    updateToc();
    updateCollapseElements();
    updateKeywords();
    updateSlideProgress(slideIndex, true);

    $(function() {

	$('.latex_href').each(function() {
	    MathJax.Hub.Queue(
                ["Typeset", MathJax.Hub,this],
            );
	});

        $('#output').find('b:not([text]), h5:not([text]), h4:not([text]), h3:not([text]), h2:not([text]), h1:not([text])').each(function() {
            var text = $(this).text();
            $(this).attr('text', text.replace(/[^a-zA-Z0-9]/g, ''));
        });

        $('.slide').each(function() {

            if (isElementInViewport(this)) {
                if ($(this).hasClass('tex2jax_ignore')) {
                    console.log("IN VIEW" + $(this).attr('slide'));
                    renderSlide(this);
                }
                $(this).nextAll('.slide:lt(2)').each(function() {
                    if ($(this).hasClass('tex2jax_ignore')) {
                        renderSlide(this);
                    }
                });
                $(this).prevAll('.slide:lt(2)').each(function() {
                    if ($(this).hasClass('tex2jax_ignore')) {
                        renderSlide(this);
                    }
                });
            }

        });
        $('[data-toggle="popover"]').on('click', function (e) {
            $('[data-toggle="popover"]').each(function(){
    	    $(this).popover('hide');
    	});
            $(this).popover('show');
        });

        MathJax.Hub.Queue(["resetEquationNumbers", MathJax.InputJax.TeX]);
    });

    if (!cranach.selectedItem) {
        var $selectedSlide = $('.slide[slide="' + cranach.selectedSlide  + '"]');
    } else {
        console.log('SELECTED ITEM: ' + cranach.selectedItem);
        var $selectedSlide = $('.statement[item="' + cranach.selectedItem + '"]').closest('.slide');
    }

    $('#output').scrollTo($selectedSlide);
    $selectedSlide.click();
    if (cranach.selectedItem) {
        $('#output').find('div.statement[item="' + cranach.selectedItem + '"]').find('.item_title').addClass('highlighted');
    }

    if (cranach.present) {
        $('#present_button').click();
    }

    $('#loading_icon').hide();

}
