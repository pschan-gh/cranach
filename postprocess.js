function scrollToLine(editor, slide) {
    // let slideLine = Array();
    lines = editor.getSession().doc.getAllLines();
    let isComment = false;
    let slideCount = 0;
    for (let i = 0; i < lines.length; i++) {
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



function updateSlideClickEvent(cranach) {
    $('.slide').off();
    $('.slide').click(function() {
        let slideElement = this;
        
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
            $(this).iFrameResize({checkOrigin:false});
            // iFrameResize({ log: true }, this);
        });

        if (!$(this).hasClass('selected') || $(this).hasClass('tex2jax_ignore')) {
            batchRender(slideElement);
            
            let course = $(this).attr('course');
            let chapterType = $(this).attr('chapter_type');
            let chapter = $(this).attr('chapter');
            let slide = +$(this).attr('slide');
            let statements = new Array();

            updateTitle(slideElement);
            
            let url = cranach.attr['contentURL'];
            let urlSlide = cranach.attr['contentURL'] +  '&query=' + cranach.attr['query'] + '&slide=' + slide;

            $('.url.share_text.slide_info').html(urlSlide);

            $('#url_open').attr('href', urlSlide);

            $('.hyperlink.share_text.slide_info').html('<a href="' + urlSlide + '" target="_blank" title="Course:' + course + '">' + 'Chapter ' + chapter + ' Slide ' + slide + '</a>');

            $('.hyperref.share_text.slide_info').html('\\href{' + urlSlide.replace('#', '\\#') + '}{Chapter ' + chapter + ' Slide ' + slide + '}');

            $('#slide_info').show();

            if ($('.current_chapter').first().text() != $(slideElement).attr('chapter')) {
                $('#info_statements .chapter').hide();
                $('#info_statements .chapter[chapter="' + $(slideElement).attr('chapter') + '"]').show();
            }

            if ($(this).find('a.collapsea[aria-expanded="false"]').length) {
                $('#uncollapse_button').text('Uncollapse');
            } else {
                $('#uncollapse_button').text('Collapse');
            }
            $('#output div.slide').removeClass('selected');
            $(this).addClass('selected');
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

function updateToc(cranach) {
    console.log('UPDATING TOC');
    let url = cranach.attr['contentURL'];

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

        let $slide = $('.slide[chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            jumpToSlide($('#output'), $slide);
        });
    });
    // console.log($('#info_statements')[0]);

    $('.toc').find('a.section').each(function() {
        let $slide = $('.slide[section="' + $(this).attr('section') + '"][chapter="' + $(this).attr('chapter') + '"]').first();
        $(this).click(function() {
            // $('#output').scrollTo($slide);
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

function updateSlideSelector(cranach) {

    let numOfSlide = 0;
    try {
        numOfSlides = cranach.attr['cranachDoc'].getElementsByTagName('slide').length;
    } catch(error) {
        return 0;
    }
    $("#slide_sel").html('');
    for (let i = 1; i <= numOfSlides; i++) {
        let o = new Option(i.toString(), i);
        $("#slide_sel").append(o);
    }
    $('#slide_sel').on('change', function() {
        console.log('JUMPING TO SLIDE: ' + $(this).val());
        jumpToSlide($('#output'), $('#s' + $(this).val()));
    });
}

function updateRefs(cranach) {
    
    $('a.lcref').each(function() {
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
                    
    $('a.href').each(function() {
                    
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

function postprocess(cranach) {
    console.log('POSTPROCESS CALLED');
    $('.icon.xml, .icon.latex').show();    

    updateSlideClickEvent(cranach);
    updateRefs(cranach);    
    updateToc(cranach);
    updateSlideSelector(cranach);
    updateKeywords();
    updateScrollEvent();
    
    updateTitle($('.output:visible div.slide.selected')[0] || $('.output:visible div.slide:lt(1)')[0]);    
        
    $(function() {
        MathJax.startup.promise.then(() => {
            MathJax.startup.document.state(0);
            MathJax.texReset();
            return;
        }).then(() => {
            return MathJax.tex2chtmlPromise(cranach.macrosString);
        }).then(() => {
            $('.output:visible .slide').each(function() {
                if (isElementInViewport(this)) {
                    batchRender(this);                    
                }
            });
        });

        $('#output').find('b:not([text]), h5:not([text]), h4:not([text]), h3:not([text]), h2:not([text]), h1:not([text])').each(function() {
            let text = $(this).text();
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
                let popoverBody = this;
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

            $item = $('.item_title[serial="' + cranach.attr['selectedItem'] + '"], .item_title[md5="' + cranach.attr['selectedItem'] + '"], .label[name="' + cranach.attr['selectedItem'] + '"]').first().closest('.item_title');

            $('#output').scrollTo($item);
            $item.addClass('highlighted');
        } else if (cranach.attr['selectedSection']) {
            let $section = $('.section_title[serial="' + cranach.attr['selectedSection'] + '"], .label[name="' + cranach.attr['selectedSection'] + '"]').first().closest('.section_title').first();
            let $selectedSlide = $section.closest('.slide');
            $('#output').scrollTo($section);
            $section.addClass('highlighted');
        } else {
            let $selectedSlide = $('.slide[slide="' + cranach.attr['selectedSlide']  + '"], .label[name="' + cranach.attr['selectedSlide'] + '"]').first().closest('.slide');
            console.log('SCROLLING TO SLIDE ' + cranach.attr['selectedSlide']);
            $('#output').scrollTo($selectedSlide);
            // $selectedSlide.click();
        }        

        if (cranach.attr['selectedKeyword']) {
            console.log('SELECTED KEYWORD: ' + cranach.attr['selectedKeyword']);
            focusOn($selectedSlide, cranach.attr['selectedKeyword'].replace(/\s/g, ''));
        }                
        
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
