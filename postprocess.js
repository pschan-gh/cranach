function scrollToLine(editor, slide) {
    // var slideLine = Array();
    lines = editor.getSession().doc.getAllLines();
    var isComment = false;
    var slideCount = 0;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].match(/\<\!\-\-/g)) {
            isComment = true;
        }
        if (lines[i].match(/\-\-\>/g)) {
            isComment = false;
        }

        if (!isComment) {
            if (lines[i].match(/^@(slide|sep|course|chapter|lecture|week|section|subsection|subsubsection)/) && !lines[i].match(/\<\!\-\-.*?\-\-\>/)) {
                slideCount++;
            }
        }
        if (slideCount == slide) {
            editor.gotoLine(i + 1);
            break;
        }
    }

}

function updateModal(cranach) {
    $('.slide_button').off();
    $('.slide_button').on('click', function() {
        console.log('SLIDE BUTTON PRESSED');
        let $slide = $('div.slide[slide="' + $(this).attr('slide') + '"');
        let slide = $slide.attr('slide');
        
        var course = $slide.attr('course');

        var chapterType = $slide.attr('chapter_type');
        var chapter = $slide.attr('chapter');

        $('.modal-title > span').hide();
        $('.md5.share_text').text('');
        $('.modal_refby').hide();

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
        console.log('SLIDE_BUTTON CLICKED: ' + url);

        $('#item_modal').find('#modal_keywords').html('');
        $('#item_modal').modal('toggle');

        $('#item_modal').find('#modal_keywords').html('<hr><b class="notkw">Keywords:</b>').append($('#slide_keywords').clone(true));

        $('#item_modal').find('#item_modal_link').attr('href', url);
        $('#item_modal').find('#share_url').html(url);
        $('#item_modal').find('#share_hyperlink').html('<a href="' + url + '" target="_blank" title="Course:' + course + '">' + course + ' ' + chapterType + ' ' + chapter + ' Slide ' + slide + '</a>');
        $('#item_modal').find('#share_hyperref').html('\\href{' + url.replace('#', '\\#') + '}{' + course + ' ' + chapterType + ' ' + chapter + ' Slide ' + slide + '}');

    });


    $('.item_button, .section_button').off();
    $('.item_button, .section_button').on('click', function() {
        var course = $(this).attr('course');
        var md5String = $(this).attr('md5');
        var item_type = $(this).attr('type');
        var chapterType = $(this).attr('chapter_type');
        var chapter = $(this).attr('chapter');
        var item = $(this).attr('item') ? $(this).attr('item') : $(this).attr('md5');
        var serial = $(this).attr('serial');
        var slide = $(this).closest('.slide').attr('slide');

        $('#item_modal').find('#modal_keywords').html('');
        $('#item_modal').modal('toggle');


        console.log('ITEM CLICKED COURSE: ' + course);

        $('#share_item span').hide();

        $('.current_course').text(course);
        $('.current_chapter').text(chapterType + ' ' + chapter);
        $('.current_item_type').text(item_type);
        $('.current_item').text($(this).attr('item') ? item : '');
        $('#share_item span.current_course, #share_item span.current_chapter, #share_item span.current_item_type, #share_item span.current_item').show();

        // var slide = $(this).closest('.slide').attr('slide');

        let url = cranach.attr['contentURL'];
        let argName = item_type.match(/Course|Chapter|Section/i) ? 'section' : 'item';

        let $labels = $(this).closest('div').find('.label');

        if ($labels.length) {
            url += '&' + argName + '=' + $labels.first().attr('name');
        } else {
            url +=  '&' + argName + '=' + serial;
        }

        $('#item_modal').find('#item_modal_link').attr('href', url);
        $('#item_modal').find('#share_url').text(url);

        let title = '';

        let titles = $(this).find('*[wbtag="title"]');
         if (titles.length) {
             title = titles.first().text();
         } else {
             title = $(this).attr('item') ? item_type + ' ' + item : item_type;
         }

        $('#item_modal').find('#share_hyperlink').text('<a href="' + url + '" target="_blank" title="Course:' + course + '">' + title + '</a>');
        $('#item_modal').find('#share_hyperref').text('\\href{' + url.replace('#', '\\#') + '}{' + title + '}');
        $('#item_modal').find('.md5').first().html(md5String);

        updateModalRefby(md5String, cranach);
        updateModalProofs(md5String, cranach);

    });
}

function updateSlideClickEvent(cranach) {

    $('.slide').hover(function() {
        $('#output_icon_container').show();
    });

    $('.slide').off();
    $('.slide').click(function() {

        console.log('SLIDE CLICKED');

        var slideElement = this;

        if (typeof editor !== typeof undefined) {
            scrollToLine(editor, $(slideElement).attr('canon_num'));
        }

        $('*[text]').removeClass('highlighted');
        $('button').removeClass('highlighted');
        $('.item_button').css('background-color', '');
        $(this).find('.loading_icon').hide();

        $('.separator').css('font-weight', 'normal');
        $('.separator').find('a').css('color', 'pink');

        $(this).find('.separator').css('font-weight', 'bold');
        $(this).find('.separator').find('a').css('color', 'red');

        $(this).find('iframe:not([src])').each(function() {
            $(this).attr('src', $(this).attr('data-src')).show();
            var $iframe = $(this);
            $(this).iFrameResize({checkOrigin:false});
        });

        if ($(this).attr('slide') != slideIndex) {
            if (cranach.attr['editMode']) {
                $('#edit_button').click();
            }
            if (!$(slideElement).hasClass('edit')) {
                batchRender(slideElement);
            }
            var course = $(this).attr('course');
            var chapterType = $(this).attr('chapter_type');
            var chapter = $(this).attr('chapter');
            slideIndex = +$(this).attr('slide');
            var slide = slideIndex;
            var statements = new Array();

            updateTitle(slideElement);

            if ($(this).hasClass('collapsed')) {
                $('#uncollapse_button').text('Uncollapse');
            } else {
                $('#uncollapse_button').text('Collapse');
            }

            var url = cranach.attr['contentURL'];
            var urlSlide = cranach.attr['contentURL'] +  '&query=' + cranach.attr['query'] + '&slide=' + slide;

            $('.url.share_text.slide_info').html(urlSlide);

            $('#url_open').attr('href', urlSlide);

            $('.hyperlink.share_text.slide_info').html('<a href="' + urlSlide + '" target="_blank" title="Course:' + course + '">' + 'Chapter ' + chapter + ' Slide ' + slide + '</a>');

            $('.hyperref.share_text.slide_info').html('\\href{' + urlSlide.replace('#', '\\#') + '}{Chapter ' + chapter + ' Slide ' + slide + '}');

            $('#slide_info').show();

            if ($('.current_chapter').first().text() != $(slideElement).attr('chapter')) {
                $('#info_statements .chapter').hide();
                $('#info_statements .chapter[chapter="' + $(slideElement).attr('chapter') + '"]').show();
            }

            // updateSlideProgress(slideIndex, false);
        }
    });

}

function updateRefs(cranach) {

        $('a.lcref').each(function() {
            $(this).attr('lcref', "");

            var label = $(this).attr('label');
            var md5 = $(this).attr('md5');

            var contentDir = cranach.attr['dir'];
            var rootURL = cranach.attr['rootURL'];
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

            var rootURL = cranach.attr['rootURL'];
            if ($(this).attr('filename') == 'self') {
                if (cranach.hasXML) {
                    var lcref = rootURL + "?xml=" + cranach.attr['xmlPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
                } else {
                    var lcref = rootURL + "?wb=" + cranach.attr['wbPath'] + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
                }
            } else if ($(this).attr('src-filename')) {
                if ($(this).attr('src-filename').match(/\.xml$/)) {
                    var lcref = rootURL + "?xml=" + contentDir + '/' + $(this).attr('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
                } else {
                    var lcref = rootURL + "?wb=" + contentDir + '/' + $(this).attr('src-filename') + "&query=(//lv:" + statementType + "[@md5='" + md5 + "'])[1]";
                }
            }

            $(this).attr('lcref', lcref + '&version=' +Math.random());

        });

        $('a.href').each(function() {

            var label = $(this).attr('label');
            var serial = $(this).attr('serial');
            var md5 = $(this).attr('md5');
            var contentDir = ''

            var rootURL = cranach.attr['rootURL'];
            if (cranach.hasXML) {
                contentDir = cranach.attr['xmlPath'].replace(/[^\/]+\.xml$/, '');
            } else if (cranach.hasWb) {
                contentDir = cranach.attr['wbPath'].replace(/[^\/]+\.wb$/, '');
            }

            if ($(this).attr('filename') == 'self') {
                if (cranach.hasXML) {
                    var href = rootURL + "?xml=" + cranach.attr['xmlPath'] + '&section=' + serial;
                } else {
                    var href = rootURL + "?wb=" + cranach.attr['wbPath'] + '&section=' + serial;
                }
            } else {
                if (cranach.hasXML) {
                    var href = rootURL + "?xml=" + contentDir + '/' + $(this).attr('src-filename') + '&section=' + serial;
                } else {
                    var href = rootURL + "?wb=" + contentDir + '/' + $(this).attr('src-filename') + '&section=' + serial;
                }
            }

            $(this).attr('target', '_blank');
            $(this).attr('href', href);

        });

}

var timer = null;
function updateScrollEvent(cranach) {
    $('#output').off();
    // https://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling

    $('#output').on('scroll', function() {
        if(timer !== null) {
            clearTimeout(timer);
        }
        timer = window.setTimeout(function() {
            console.log('rendering slides');
            $('.slide.tex2jax_ignore').each(function() {
                if (isElementInViewport(this)) {
                    batchRender(this);
                };
            });
        }, 15*100);
    });

    /*
       $('#output').on("scroll", function() {
       $('.slide.tex2jax_ignore').each(function() {
            var slide = this;
            if (isElementInViewport(slide) && ($(this).attr('slide') % 5 == 0)) {
                window.setTimeout(function() {if (isElementInViewport(slide)) {batchRender(slide)}}, 1.5*1000);
            }
        });
    });
    */

}

function updateToc(cranach) {
    console.log('UPDATING TOC');
    var url = cranach.attr['contentURL'];

    $('.toc').each(function() {
        $('#toc').html('').append($('#output').find('.toc_src').first());
    });
    $('#output').find('.toc_src').hide();

    $('.toc').find('a').find('span.serial').each(function() {
        var string = $(this).text();
        $(this).text(string.charAt(0).toUpperCase() + string.slice(1));
    });

    $('.toc').find('a.chapter').each(function() {
        let chapter = $(this).attr('chapter');
        let statements = new Array();
        $("#output div[wbname='statement'][chapter='" + chapter + "']").each(function() {
            if (!($(this).attr('type') in statements)) {
                statements[$(this).attr('type')] = '';
            }

            var serial = $(this).attr('item');
            var $item = $('div[serial="' + $(this).attr('item') + '"]').closest('div.statement').first();
            var slide = $item.closest('.slide').attr('slide');

            // statements[$(this).attr('type')] += "<a style='margin:1px 10px 1px 10px;' class='info_statements_num' href='javascript:void(0)' onclick=\"focusOn(" + slide + ", '');highlight('" + serial + "')\">" + serial + "</a>";
            statements[$(this).attr('type')] += "<a style='margin:1px 10px 1px 10px;' class='info_statements_num' serial='" + serial + "' href='javascript:void(0)'>" + serial + "</a>";
        });
        var html = '';
        for (var key in statements) {
            html += '<br/><a class="info_statements" target="_blank" href="' + url + '&query=//lv:statement[@chapter=' + chapter + ' and @type=%27' + key + '%27]">' + key + '</a><em> ' + statements[key] + '</em>';
        }

        $('#info_statements').append('<div class="statements chapter" chapter="' + chapter + '" style="display:none">' + html + '</div>');
        let $item;
        $('#info_statements').find('.info_statements_num').click(function() {
            $item = $('.item_title[serial="' + $(this).attr('serial') + '"]').first();
            focusOn($item, '');
            highlight($(this).attr('serial'));
        });

        var $slide = $('.slide[chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            // $('#output').scrollTo($slide);
            jumpToSlide($('#output'), $slide);
            // $slide.click();
        });
    });
    console.log($('#info_statements')[0]);

    $('.toc').find('a.section').each(function() {
        var $slide = $('.slide[section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            // $('#output').scrollTo($slide);
            jumpToSlide($('#output'), $slide);
            $slide.click();
        });
    });
    $('.toc').find('a.subsection').each(function() {
        var $slide = $('.slide[subsection="' + $(this).attr('subsection') + '"][section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            // $('#output').scrollTo($slide);
            jumpToSlide($('#output'), $slide);
            $slide.click();
        });
    });
    MathJax.startup.promise = typeset([document.getElementById('toc')]);
}

function updateKeywords() {
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
    } else {
        $(this).hide();
    }
}

function updateEditor() {
    if (editor) {
        editor.container.style.pointerEvents="auto";
        editor.container.style.opacity=1; // or use svg filter to make it gray
        editor.renderer.setStyle("disabled", false);
        editor.focus();
    }
}

function updateSlideSelector(cranach) {

    var numOfSlides = cranach.attr['cranachDoc'].getElementsByTagName('slide').length;
    // $('#slide_sel').attr('max', numOfSlides);
    $("#slide_sel").html('');
    for (let i = 1; i <= numOfSlides; i++) {
        var o = new Option(i.toString(), i);
        $("#slide_sel").append(o);
    }
    $('#slide_sel').on('change', function() {
        console.log('JUMPING TO SLIDE: ' + $(this).val());
        jumpToSlide($('#output'), $('#s' + $(this).val()));
    });
}

function postprocess(cranach) {
    console.log('POSTPROCESS CALLED');
    $('.icon.xml, .icon.latex').show();

    // $('.slide').find("table:not('.exempt'):not('.ltx_eqn_table')").addClass("table table-bordered");

    // updateEditor();
    updateSlideClickEvent(cranach);
    updateRefs(cranach);
    updateModal(cranach);
    updateScrollEvent(cranach);
    updateToc(cranach);
    updateKeywords();
    // updateSlideProgress(cranach.slideIndex, true);
    updateSlideSelector(cranach);
    updateTitle($('#s' + cranach.slideIndex)[0]);
    
    
    $(function() {
        console.log(cranach);
        
        if (cranach.attr['lectureMode']) {
            $('[data-lecture-skip="true"]').css('color', '#ccc');
            $('[data-lecture-skip="true"] *').css('color', 'inherit');
        }

        MathJax.startup.promise.then(() => {
            // MathJax.typesetClear();
            MathJax.startup.document.state(0);
            MathJax.texReset();
            return;
        }).then(() => {
            // console.log(cranach.macrosString);
            return MathJax.tex2chtmlPromise(cranach.macrosString);
            // return MathJax.tex2svgPromise(cranach.macrosString);
        }).then(() => {
            $('.slide').each(function() {
                if (isElementInViewport(this)) {
                    batchRender(this);
                }
            });
        });

        $('#output').find('b:not([text]), h5:not([text]), h4:not([text]), h3:not([text]), h2:not([text]), h1:not([text])').each(function() {
            var text = $(this).text();
            $(this).attr('text', text.replace(/[^a-zA-Z0-9À-ÿ\-]/g, ''));
        });


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
                console.log(id);
                var popoverBody = this;
                $(popoverBody).html('');
                $('[aria-describedby="' + id + '"]').find('a.dropdown-item').each(function() {
                    console.log(this);
                    $(popoverBody).append($(this).clone().removeClass('hidden'));
                    console.log(popoverBody);
                });
            });
        });

        if (cranach.attr['selectedItem']) {
            console.log('SELECTED ITEM: ' + cranach.attr['selectedItem']);

            // $item = $('.statement[item="' + cranach.attr['selectedItem'] + '"], .statement[md5="' + cranach.attr['selectedItem'] + '"], .substatement[item="' + cranach.attr['selectedItem'] + '"], .substatement[md5="' + cranach.attr['selectedItem'] + '"], .label[name="' + cranach.attr['selectedItem'] + '"]').first().closest('.statement, .substatement, ');
            $item = $('.item_title[serial="' + cranach.attr['selectedItem'] + '"], .item_title[md5="' + cranach.attr['selectedItem'] + '"], .label[name="' + cranach.attr['selectedItem'] + '"]').first().closest('.item_title');

            //  var $selectedSlide = $item.closest('.slide');
            $('#output').scrollTo($item);
            // $selectedSlide.click();
            $item.addClass('highlighted');
        } else if (cranach.attr['selectedSection']) {
            var $section = $('.section_title[serial="' + cranach.attr['selectedSection'] + '"], .label[name="' + cranach.attr['selectedSection'] + '"]').first().closest('.section_title').first();
            var $selectedSlide = $section.closest('.slide');
            $('#output').scrollTo($section);
            $section.addClass('highlighted');
            // $selectedSlide.click();
        } else {
            var $selectedSlide = $('.slide[slide="' + cranach.attr['selectedSlide']  + '"], .label[name="' + cranach.attr['selectedSlide'] + '"]').first().closest('.slide');
            console.log('SCROLLING TO SLIDE ' + cranach.attr['selectedSlide']);
            $('#output').scrollTo($selectedSlide);
            $selectedSlide.click();
        }

        if (cranach.attr['selectedKeyword']) {
            console.log('SELECTED KEYWORD: ' + cranach.attr['selectedKeyword']);
            focusOn($selectedSlide, cranach.attr['selectedKeyword'].replace(/\s/g, ''));
        }

        // https://stackoverflow.com/questions/4305726/hide-div-element-with-jquery-when-mouse-isnt-moving-for-a-period-of-time
        var menu_timer = null;
        $('#right_half').off();
        $('#right_half').mousemove(function() {
            clearTimeout(menu_timer);
            $("#menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
            $('.present .controls.carousel-indicators').css('display', 'flex');
            menu_timer = setTimeout(function () {
                $("#menu_container .navbar-nav, .controls, .present .active .slide_number").not('.hidden').fadeOut();
            }, 1000);
        })
        
        $("#menu_container .navbar-nav, .present .slide_number").not('.hidden').off();
        $("#menu_container .navbar-nav, .present .slide_number").not('.hidden').mouseover(function() {
            $('#right_half').off('mousemove');
            clearTimeout(menu_timer);
            $(this).show();
        });
        $("#menu_container .navbar-nav, .present .slide_number").not('.hidden').mouseout(function() {
            clearTimeout(menu_timer);
            $('#right_half').off('mousemove');
            $('#right_half').mousemove(function() {
                clearTimeout(menu_timer);
                $("#menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
                $('.present .controls.carousel-indicators').css('display', 'flex');
                menu_timer = setTimeout(function () {
                    $("#menu_container .navbar-nav, .present .slide_number").not('.hidden').fadeOut();
                    $(".controls").hide();
                }, 1000);
            })
        });

        $('.controls').off();
        $('.controls').on('mouseover', function() {
            // $('#progress_container').show();
            $('#right_half').off('mousemove');
            clearTimeout(menu_timer);
            $(this).show();
        });
        $('.controls').on('mouseout', function() {
            // $('#progress_container').hide();
            clearTimeout(menu_timer);
            $('#right_half').off('mousemove');
            $('#right_half').mousemove(function() {
                clearTimeout(menu_timer);
                $("#menu_container .navbar-nav, .present .controls, .present .slide_number").not('.hidden').fadeIn();
                $('.present .controls.carousel-indicators').css('display', 'flex');
                menu_timer = setTimeout(function () {
                    $("#menu_container .navbar-nav, .present .slide_number").fadeOut();
                    $(".controls").hide();
                }, 1000);
            })
        });
        
        $('.carousel').on('slid.bs.carousel', function () {
            $('#right_half .slide_number button').text('Slide ' + $('.carousel-item.active').attr('slide'));
            $('#right_half .slide_number button').attr('slide', $('.carousel-item.active').attr('slide'));
            $('.carousel').carousel('pause');
            let $slide = $('#output div.slide.active');            
            slideIndex = $slide.attr('slide');
            
            batchRender($slide[0]);
            adjustHeight();            
        })
        $('#output div.collapse').on('shown.bs.collapse', function() {
            adjustHeight(); 
        });
    });

    if (cranach.attr['present']) {
        $('#present_button').click();
    }

    $('#loading_icon').hide();
}
