var editor = ace.edit("input");
editor.setTheme("ace/theme/cranach");
editor.session.setMode("ace/mode/cranach");
editor.getSession().setUseWrapMode(true);
// editor.setValue($('#wb').html(), 1);
editor.setShowPrintMargin(false);
editor.commands.addCommand({
	name: 'saveFile',
	bindKey: {
		win: 'Ctrl-S',
		mac: 'Cmd-S',
		sender: 'editor|cli'
	},
	exec: function(env, args, request) {
		var dummyLink = document.createElement('a');
		// uriContent = "data:application/octet-stream," + encodeURIComponent(editor.session.getValue());
		uriContent = "data:application/octet-stream," + encodeURIComponent(editor.getValue());
		dummyLink.setAttribute('href', uriContent);
		console.log($("base").attr('wb-src'));
		dummyLink.setAttribute('download', $("base").attr('wb-src').match(/(((?!\/).)*?\.wb)$/)[0]);
		dummyLink.click();
	}
});

function updateEditor(cranach) {
    $('#render_sel').mouseover(function() {
        if (!editor.getValue().match(/@slide|@sep|course|week|lecture|chapter|section|subsection|subsubsection/g)) {
            return;
        }
		$("#render_sel").html('<option value="Render">Render</option><option value="all">All</option>');
		var buffer = editor.getValue()
		.replace(/@sep/g, '@slide')
		.replace(/\<!--(.|\n)*?--\>/g, '');
		let numOfSlides = buffer.match(/@slide|@course|@chapter|@week|@lecture|@section|@subsection|@subsubsection/g).length;
		var pastBuffer = editor.getValue().substring(0, editor.session.doc.positionToIndex(editor.selection.getCursor()))
		.replace(/@sep/g, '@slide')
		.replace(/\<!--(.|\n)*?--\>/g, '');
		let currentSlide = pastBuffer.match(/(?:^|\n)\s*(?:@slide|@course|@chapter|@week|@lecture|@section|@subsection|@subsubsection)/g).length;
		var o = new Option(currentSlide.toString(), currentSlide);
		$("#render_sel").append(o);
		$("#render_sel").append('<hr/>');
		for (let i = numOfSlides; i >= 1; i--) {
			var o = new Option(i.toString(), i);
			$("#render_sel").append(o);
		}
	});	
	$('#render_sel').on('change', function() {
		let query = $(this).val() == 'all' ? '' : '//lv:slide[@slide=' + $(this).val() + ']';
		let selectedSlideNum = $('.output:visible div.slide.selected').length > 0 ? $('.output:visible div.slide.selected').attr('slide') : 1;
		console.log(query);
		$("#render_sel").html('<option value="">Render</option><option value="all">All</option>');
        let dir = cranach.attr['dir'];
        baseRenderer = new Cranach(window.location.href).setup({'dir':dir, 'query':query, 'lectureMode':cranach.attr['lectureMode'], 'selectedSlide':selectedSlideNum, 'indexDoc':cranach.attr['indexDoc']});
		baseRenderer.then(cranach => {
			console.log(cranach);
			MathJax.typesetClear();
			return cranach.setOutput(document.getElementById('output')).renderWb(editor.getValue());
		})
		.then(cranach => {
			postprocess(cranach);
			if (query != '') {
				$('#s1').find('.collapse').collapse('show');
				$('#s1').find('.collapsea').removeClass('collapsed');
				// ▽⊟
			}
			return cranach;
		});
	});
	$('#edit_box').change(function() {
		if ($(this).is(':checked')) {
			$('#edit_button').css('background-color', 'red');
			$('#edit_button').css('color', 'white');
			$('#edit_icon').attr('src', 'icons/Editting_Icon.svg');
		} else {
			$('#edit_button').css('background-color', '');
			$('#edit_button').css('color', '');
			$('#edit_icon').attr('src', 'icons/Edit_Notepad_Icon.svg');
		}
	});
}
