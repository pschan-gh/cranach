MathJax = {
	startup: {
		typeset: false,
		ready() {
			typeset = function (doms) {
				MathJax.startup.promise = MathJax.startup.promise
				.then(() => {return MathJax.typesetPromise(doms)})
				.catch((err) => console.log('Typeset failed: ' + err.message));
				return MathJax.startup.promise;
			};
			MathJax.getAllJax = function (name) {
				let list = Array.from(MathJax.startup.document.math);
				if (!name) return list;
				let container = document.getElementById(name);
				if (!container) return list;
				let filtered = list.filter((node) => container.contains(node.start.node));
				return filtered;
			};

			const Configuration = MathJax._.input.tex.Configuration.Configuration;
			const CommandMap = MathJax._.input.tex.SymbolMap.CommandMap;
			const Label = MathJax._.input.tex.Tags.Label;
			const BaseMethods = MathJax._.input.tex.base.BaseMethods.default;
			const NodeUtil = MathJax._.input.tex.NodeUtil.default;

			//
			//  Create a command map to override \ref and \eqref
			//
			new CommandMap('knowl', {
				href: ['HandleRef', true]
			}, {
				HandleRef(parser, name) {
					const url = parser.GetArgument(name);
					let arg = parser.ParseArg(name);
					// if (!NodeUtil.isInferred(arg)) {
					// 	return arg;
					// }
					// let children = NodeUtil.getChildren(arg);
					// if (children.length === 1) {
					// 	parser.Push(children[0]);
					// 	return 1;
					// }
					const mrow = parser.create('node', 'mrow');
					NodeUtil.copyChildren(arg, mrow);
					NodeUtil.copyAttributes(arg, mrow);

					NodeUtil.setAttribute(mrow, 'lcref', url);
					parser.Push(mrow);
				}
			});
			//
            //  Create the package for the overridden macros
            //
            Configuration.create('knowl', {
                handler: {macro: ['knowl']}
            });

			$('.icon.latex, .icon.xml').hide();
			baseRenderer.then(cranach => {
				let output = cranach.bare ?  $('body')[0] : document.getElementById('output');
				return cranach.render(output);
			}).then(renderer => {
				if (renderer.bare) {
					return renderer;
				}
				return renderer.displayIndexDocToHtml(document.getElementById('index'));
			}).then(renderer => {
				if (renderer.bare) {
					return renderer;
				} else {
					if ($('.editor.ace_editor').length > 0) {
						convertCranachDocToWb(renderer.cranachDoc, editor);
					}
					// if ($('#item_modal').length > 0) {
					// 	updateModal(renderer);
					// }
					$('#render_sel').prop('disabled', false);
					$('#wb_button').prop('disabled', false);
					return renderer;
				}
			}).then(renderer => {
				MathJax.startup.defaultReady();
				MathJax.startup.promise.then(() => {
					MathJax.startup.document.state(0);
					MathJax.texReset();
					return MathJax.tex2chtmlPromise(renderer.macrosString);
				}).then(() => {
					postprocess(renderer);
				});
			});
		}
	},
	loader: {
		load: ['output/svg', '[tex]/ams', '[tex]/newcommand', '[tex]/html', '[tex]/extpfeil', '[tex]/color', '[tex]/mathtools']
		 // 'ui/lazy'
	},
	tex: {
		inlineMath: [['$','$'], ['\\(','\\)']],
		processEnvironments: true,
		processEscapes: true,
		processRefs: true,
		tags: "ams",
		packages: ['base', 'ams', 'newcommand', 'html', 'extpfeil', 'color', 'mathtools', 'knowl']
	},
	options: {
		ignoreHtmlClass: "tex2jax_ignore",
		skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'annotation', 'annotation-xml'],
	},
	svg: {
		scale: 1,                      // global scaling factor for all expressions
		minScale: .5,                  // smallest scaling factor to use
		mtextInheritFont: false,       // true to make mtext elements use surrounding font
		merrorInheritFont: true,       // true to make merror text use surrounding font
		mathmlSpacing: false,          // true for MathML spacing rules, false for TeX rules
		skipAttributes: {},            // RFDa and other attributes NOT to copy to the output
		exFactor: .5,                  // default size of ex in em units
		displayAlign: 'center',        // default for indentalign when set to 'auto'
		displayIndent: '0',            // default for indentshift when set to 'auto'
		fontCache: 'local',            // or 'global' or 'none'
		localID: null,                 // ID to use for local font cache (for single equation processing)
		internalSpeechTitles: true,    // insert <title> tags with speech content
		titleID: 0                     // initial id number to use for aria-labeledby titles
	}
};

// function renderScriptMath(el) {
// 	let doc = MathJax.startup.document;
// 	for (const node of el.querySelectorAll('script[type^="math/tex"]')) {
// 		const display = !!node.type.match(/; *mode=display/);
// 		const math = new doc.options.MathItem(node.textContent, doc.inputJax[0], display);
// 		const text = document.createTextNode('');
// 		node.parentNode.replaceChild(text, node);
// 		math.start = {node: text, delim: '', n: 0};
// 		math.end = {node: text, delim: '', n: 0};
// 		doc.math.push(math);
// 	}
// }
