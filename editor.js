const editor = ace.edit("input");
editor.setTheme("ace/theme/cranach");
editor.session.setMode("ace/mode/cranach");
editor.getSession().setUseWrapMode(true);
editor.setShowPrintMargin(false);
editor.commands.addCommand({
	name: 'saveFile',
	bindKey: {
		win: 'Ctrl-S',
		mac: 'Cmd-S',
		sender: 'editor|cli'
	},
	exec: function(env, args, request) {
		let dummyLink = document.createElement('a');
		// uriContent = "data:application/octet-stream," + encodeURIComponent(editor.session.getValue());
		uriContent = "data:application/octet-stream," + encodeURIComponent(editor.getValue());
		dummyLink.setAttribute('href', uriContent);
		dummyLink.setAttribute('download', document.querySelector("base").getAttribute('wb-src').match(/(((?!\/).)*?\.wb)$/)[0]);
		dummyLink.click();
	}
});

function updateEditor(cranach) {
	const renderSel = document.getElementById('render_sel');

	renderSel.addEventListener('mouseover', () => {
		if (!editor.getValue().match(/@slide|@sep|course|week|lecture|chapter|section|subsection|subsubsection/g)) {
			return;
		}
		document.getElementById("render_sel").innerHTML = '<option value="Render">Render</option><option value="all">All</option>';

		const buffer = editor.getValue()
		.replace(/@sep/g, '@slide')
		.replace(/\<!--(.|\n)*?--\>/g, '');
		const numOfSlides = buffer.match(/@slide|@course|@chapter|@week|@lecture|@section|@subsection|@subsubsection/g).length;
		const pastBuffer = editor.getValue().substring(0, editor.session.doc.positionToIndex(editor.selection.getCursor()))
		.replace(/@sep/g, '@slide')
		.replace(/\<!--(.|\n)*?--\>/g, '');

		const currentSlide = pastBuffer === null ? 1 : pastBuffer.match(/(?:^|\n)\s*(?:@slide|@course|@chapter|@week|@lecture|@section|@subsection|@subsubsection)/g).length;

		let o = new Option(currentSlide.toString(), currentSlide);
		renderSel.appendChild(o);
		renderSel.appendChild(document.createElement('hr'));
		for (let i = numOfSlides; i >= 1; i--) {
			let o = new Option(i.toString(), i);
			renderSel.appendChild(o);
		}
	});

	renderSel.addEventListener('change', function(event) {
		const query = event.target.value == 'all' ? '' : `//lv:slide[@slide="${event.target.value}"]`;
		const selectedSlideNum = document.querySelector('.output > div.slide.selected') !== null ?
		document.querySelector('.output > div.slide.selected').getAttribute('slide') : 1;

		renderSel.innerHTML = '<option value="">Render</option><option value="all">All</option>';

		const dir = cranach.attr['dir'];
		baseRenderer = new Cranach(window.location.href).setup({'dir':dir, 'query':query, 'lectureMode':cranach.attr['lectureMode'], 'selectedSlide':selectedSlideNum, 'indexDoc':cranach.indexDoc})
		.then(cranach => {
			console.log(cranach);
			MathJax.typesetClear();
			return cranach.setOutput(document.getElementById('output')).renderWb(editor.getValue());
		})
		.then(cranach => {
			postprocess(cranach);
			if (query != '') {
				document.querySelectorAll('.output > div.slide .collapse').forEach(collapse => {
					bootstrap.Collapse.getOrCreateInstance(collapse).show();
				});
				document.querySelectorAll('.output > div.slide collapsea').forEach(collapsea => {
					collapsea.classList.remove('collapsed');
				});

			}
			return cranach;
		});
	});
	document.getElementById('edit_box').addEventListener('change', function(event) {
		if (event.target.checked) {
			document.getElementById('edit_button').classList.add('editing');
			document.getElementById('edit_icon').src = 'icons/Editting_Icon.svg';
		} else {
			document.getElementById('edit_button').classList.remove('editing');
			document.getElementById('edit_icon').src =
			'icons/Edit_Notepad_Icon.svg';
		}
	});
}

function scrollToLine(editor, slide) {
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

document.addEventListener('DOMContentLoaded', () => {
	baseRenderer.then(cranach => {
		document.getElementById('save_icon').addEventListener('click', () => {
			saveWb(editor, cranach);
		});

		if (document.querySelector('.ace_editor') !== null) {
			updateEditor(cranach);
		}
	});

	let observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type == "attributes") {
				if (mutation.attributeName == 'data-selected-slide') {
					const selectedSlideNum = document.getElementById('output').dataset.selectedSlide;
					const slide = document.querySelector(`#output > div.slide[slide="${selectedSlideNum}"]`);
					scrollToLine(editor, slide.getAttribute('canon_num'));
				}
			}
		});
	});
	observer.observe(document.getElementById('output'), {
		attributes: true,
	});
});
