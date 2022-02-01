// https://github.com/federico-moretti/canvas-free-drawing
//
// The MIT License (MIT)
//
// Copyright (c) 2018-present, Federico Moretti
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// (function (global, factory) {
// 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
// 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
// 	(global = global || self, factory(global.CanvasFreeDrawing = {}));
// }(this, (function (exports) { 'use strict';

// var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
//
// function unwrapExports (x) {
// 	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
// }
//
// function createCommonjsModule(fn, module) {
// 	return module = { exports: {} }, fn(module, module.exports), module.exports;
// }
//
// var dist = createCommonjsModule(function (module, exports) {
// 	var __spreadArrays = (commonjsGlobal && commonjsGlobal.__spreadArrays) || function () {
// 		for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
// 		for (var r = Array(s), k = 0, i = 0; i < il; i++)
// 		for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
// 		r[k] = a[j];
// 		return r;
// 	};
// 	Object.defineProperty(exports, "__esModule", { value: true });

	// exports.AllowedEvents = void 0;
	// var AllowedEvents;
	// (function (AllowedEvents) {
	// 	AllowedEvents["redraw"] = "redraw";
	// 	AllowedEvents["fill"] = "fill";
	// 	AllowedEvents["mouseup"] = "mouseup";
	// 	AllowedEvents["mousedown"] = "mousedown";
	// 	AllowedEvents["mouseenter"] = "mouseenter";
	// 	AllowedEvents["mouseleave"] = "mouseleave";
	// })(AllowedEvents = exports.AllowedEvents || (exports.AllowedEvents = {}));

	var CanvasFreeDrawing = /** @class */ (function () {
		function CanvasFreeDrawing(params) {
			var elementId =
			params.elementId,
			width = params.width,
			height = params.height,
			_a = params.backgroundColor,
			backgroundColor = _a === void 0 ?
			[255, 255, 255] : _a,
			_b = params.lineWidth,
			lineWidth = _b === void 0 ? 5 : _b,
			_c = params.strokeColor,
			strokeColor = _c === void 0 ? [180, 80, 80] : _c,
			disabled = params.disabled,
			_d = params.showWarnings,
			showWarnings = _d === void 0 ? false : _d,
			_e = params.maxSnapshots,
			maxSnapshots = _e === void 0 ? 10 : _e;

			this.elementId = elementId;
			this.canvasNode = document.getElementById(this.elementId);
			if (this.canvasNode instanceof HTMLCanvasElement) {
				this.canvas = this.canvasNode;
			}
			else if (this.canvasNode instanceof HTMLElement) {
				var newCanvas = document.createElement('canvas');
				this.canvasNode.appendChild(newCanvas);
				this.canvas = newCanvas;
			}
			else {
				throw new Error("No element found with following id: " + this.elementId);
			}
			this.context = this.canvas.getContext('2d');
			this.width = width;
			this.height = height;
			this.maxSnapshots = maxSnapshots;
			this.snapshots = [];
			this.undos = [];
			this.positions = [];
			this.leftCanvasDrawing = false; // to check if user left the canvas drawing, on mouseover resume drawing
			this.isDrawing = false;
			// this.inTransition = false;
			this.isDrawingModeEnabled = true;
			this.isErasing = false;
			this.eraseScale = 10;
			this.mouseForce = 0.2;
			this.imageRestored = false;
			this.lineWidth = lineWidth;
			this.strokeColor = this.toValidColor(strokeColor);
			this.bucketToolColor = this.toValidColor(strokeColor);
			this.bucketToolTolerance = 0;
			this.isBucketToolEnabled = false;
			this.pointerType = 'mouse';
			this.listenersList = [
				'mouseDown',
				'mouseMove',
				'mouseLeave',
				'mouseUp',
				'touchStart',
				'touchMove',
				'touchEnd',
			];
			this.redrawCounter = 0;
			this.dispatchEventsOnceEvery = 0; // this may become something like: [{event, counter}]
			// initialize events
			this.events = {
				redrawEvent: new Event('cfd_redraw'),
				fillEvent: new Event('cfd_fill'),
				mouseUpEvent: new Event('cfd_mouseup'),
				mouseDownEvent: new Event('cfd_mousedown'),
				touchStartEvent: new Event('cfd_touchstart'),
				touchEndEvent: new Event('cfd_touchend'),
			};
			this.bindings = {
				mouseDown: this.mouseDown.bind(this),
				mouseMove: this.mouseMove.bind(this),
				mouseUp: this.mouseUp.bind(this),
				mouseUpDocument: this.mouseUp.bind(this),
				touchStart: this.touchStart.bind(this),
				touchMove: this.touchMove.bind(this),
				touchEnd: this.touchEnd.bind(this),
			};
			this.touchIdentifier = undefined;
			this.showWarnings = showWarnings;
			this.isNodeColorEqualCache = {};
			this.setDimensions();
			this.storeSnapshot();
			if (!disabled)
			this.enableDrawingMode();
		}
		CanvasFreeDrawing.prototype.addListeners = function () {
			this.listenersList.forEach(event => {
				this.canvas.addEventListener(event.toLowerCase(), this.bindings[event], {passive: false});
			});
			document.addEventListener('mouseup', this.bindings.mouseUpDocument);
		};
		CanvasFreeDrawing.prototype.removeListeners = function () {
			this.listenersList.forEach(event => {
				this.canvas.removeEventListener(event.toLowerCase(), this.bindings[event]);
			});
			document.removeEventListener('mouseup', this.bindings.mouseUpDocument);
		};
		CanvasFreeDrawing.prototype.enableDrawingMode = function () {
            // console.log('enableDrawingMode');
            this.isDrawingModeEnabled = true;
            this.isErasing = false;
			this.addListeners();
			this.toggleCursor();
			return this.isDrawingModeEnabled;
		};
		CanvasFreeDrawing.prototype.disableDrawingMode = function () {
            // console.log('disableDrawingMode');
            this.isDrawingModeEnabled = false;
			this.removeListeners();
			this.toggleCursor();
			return this.isDrawingModeEnabled;
		};
		CanvasFreeDrawing.prototype.mouseDown = function (event) {
			this.pointerType = 'mouse';
			if (event.button !== 0)
			return;
			this.drawPoint(event.offsetX, event.offsetY);
		};
		CanvasFreeDrawing.prototype.mouseMove = function (event) {
			this.pointerType = 'mouse';
			this.drawLine(event.offsetX, event.offsetY);
		};
		CanvasFreeDrawing.prototype.touchStart = function (event) {
			if (typeof event.touches[0].touchType != 'undefined' && event.touches[0].touchType == 'direct' ) {
				this.pointerType = 'direct';
				return 0; // no finger drawing;
			} else if (event.targetTouches.length == 1 && event.changedTouches.length == 1 ) {
				this.pointerType = 'stylus';
				event.preventDefault();
				var _a = event.changedTouches[0], pageX = _a.pageX, pageY = _a.pageY, identifier = _a.identifier;
				var x = pageX - this.canvas.offsetLeft;
				var y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + document.getElementById('output').scrollTop;
				this.touchIdentifier = identifier;
				this.drawPoint(x, y, event.touches[0].force);
			}
		};
		CanvasFreeDrawing.prototype.touchMove = function (event) {
			if (typeof event.touches[0].touchType != 'undefined' && event.touches[0].touchType == 'direct' ) {
				return 0; // no finger drawing;
			} else if (event.targetTouches.length == 1 && event.changedTouches.length == 1 ) {
				this.pointerType = 'stylus';
				var _a = event.changedTouches[0], pageX = _a.pageX, pageY = _a.pageY, identifier = _a.identifier;
				var x = pageX - this.canvas.offsetLeft;
				var y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + document.getElementById('output').scrollTop;
				this.drawLine(x, y, event.touches[0].force);

				// if (currForce - prevForce > 0.05 || prevForce - currForce > 0.05 ) {
				// this.storeDrawing(x, y, false, prevForce);
				// }

			}
		};
		CanvasFreeDrawing.prototype.touchEnd = function () {
			this.handleEndDrawing();
			// this.canvas.dispatchEvent(this.events.touchEndEvent);
		};
		CanvasFreeDrawing.prototype.mouseUp = function () {
			this.handleEndDrawing();
			// this.canvas.dispatchEvent(this.events.mouseUpEvent);
		};
		CanvasFreeDrawing.prototype.mouseUpDocument = function () {
		};
		// CanvasFreeDrawing.prototype.mouseLeave = function () {
		// 	if (this.isDrawing)
		// 	this.leftCanvasDrawing = true;
		// 	this.isDrawing = false;
		// 	this.canvas.dispatchEvent(this.events.mouseLeaveEvent);
		// };
		//
		// CanvasFreeDrawing.prototype.mouseEnter = function () {
		// 	this.canvas.dispatchEvent(this.events.mouseEnterEvent);
		// };
		CanvasFreeDrawing.prototype.handleEndDrawing = function () {
			this.isDrawing = false;
			this.storeSnapshot();
		};
		CanvasFreeDrawing.prototype.drawPoint = function (x, y, force = this.mouseForce) {
			this.isDrawing = true;
			this.storeDrawing(x, y, false, force);
			this.handleDrawing(this.dispatchEventsOnceEvery);
		};
		CanvasFreeDrawing.prototype.drawLine = function (x, y, force = this.mouseForce) {
			event.preventDefault();

			if (this.isDrawing) {
				this.storeDrawing(x, y, true, force);
				this.handleDrawing(this.dispatchEventsOnceEvery);
			}
		};
		CanvasFreeDrawing.prototype.handleDrawing = function (dispatchEventsOnceEvery) {
			// var positions = [__spreadArrays(this.positions).pop()];
			this.draw(this.positions);

			// if (!dispatchEventsOnceEvery) {
			// 	// this.canvas.dispatchEvent(this.events.redrawEvent);
			// }
			// else if (this.redrawCounter % dispatchEventsOnceEvery === 0) {
			// 	// this.canvas.dispatchEvent(this.events.redrawEvent);
			// }
			this.undos = [];
			this.redrawCounter += 1;
		};
		CanvasFreeDrawing.prototype.draw = function (positions) {
			const position = positions[positions.length - 1];
			const color = position.strokeColor.slice();

			let widthScale;
			let temperedForce = position.force;
			let dx, dy;


			const x = position.x,
			y = position.y,
			l = positions.length - 1;
			moving = l > 1;

			// this.context.lineCap = 'round';
			this.context.lineJoin = 'round';
			color[3] = Math.min( 1, 4*temperedForce ); // basic
			// color[3] = Math.max(0.25, 2*temperedForce);
			// color[3] = 0.5/(10*temperedForce);
			this.context.strokeStyle = this.rgbaFromArray(color);

			widthScale = Math.min( 1.8, 8*temperedForce ); // basic
			// widthScale = Math.min( 3, 5*temperedForce );
			this.context.lineWidth = widthScale*position.lineWidth;

			if (!this.isErasing ) {
				if ( moving ) { // % 2 == 0 && i > 3
					if ( this.pointerType == 'mouse' ) {
						if ( l % 4 == 1 ) {
							let endX = ( x + positions[l - 4].x )/2;
							let endY = ( y + positions[l - 4].y )/2;
							this.context.quadraticCurveTo(positions[l - 4].x, positions[l - 4].y,
								endX,
								endY
							);
							this.context.stroke();
							this.context.beginPath();
							this.context.moveTo(endX, endY);
						}
					} else {
						let endX = ( x + positions[l - 1].x )/2;
						let endY = ( y + positions[l - 1].y )/2;
						this.context.quadraticCurveTo( positions[l - 1].x, positions[l - 1].y,
							endX,
							endY
						);
						this.context.stroke();
						this.context.beginPath();
						this.context.moveTo(endX, endY);
						// this.context.lineTo(
						// 	x,
						// 	y,
						// );
					}
				} else {
					this.context.beginPath();
					this.context.moveTo(x - 0.5, y);
					this.context.lineTo(x + 0.5, y);
					this.context.stroke();
				}
			} else {
				this.context.clearRect(
					x - 0.5*this.eraseScale*this.lineWidth,
					y - 0.5*this.eraseScale*this.lineWidth,
					this.eraseScale*this.lineWidth,
					this.eraseScale*this.lineWidth
				);
			}

		};
		// https://en.wikipedia.org/wiki/Flood_fill
		CanvasFreeDrawing.prototype.fill = function (x, y, newColor, _a) {
			var tolerance = _a.tolerance;
			newColor = this.toValidColor(newColor);
			if (this.positions.length === 0 && !this.imageRestored) {
				this.setBackground(newColor, false);
				// this.canvas.dispatchEvent(this.events.redrawEvent);
				// this.canvas.dispatchEvent(this.events.fillEvent);
				return;
			}
			var pixels = this.width * this.height;
			var imageData = this.context.getImageData(0, 0, this.width, this.height);
			var newData = imageData.data;
			var targetColor = this.getNodeColor(x, y, newData);
			if (this.isNodeColorEqual(targetColor, newColor, tolerance))
			return;
			var queue = [];
			queue.push([x, y]);
			while (queue.length) {
				if (queue.length > pixels)
				break;
				var n = queue.pop();
				var w = n;
				var e = n;
				while (this.isNodeColorEqual(this.getNodeColor(w[0] - 1, w[1], newData), targetColor, tolerance)) {
					w = [w[0] - 1, w[1]];
				}
				while (this.isNodeColorEqual(this.getNodeColor(e[0] + 1, e[1], newData), targetColor, tolerance)) {
					e = [e[0] + 1, e[1]];
				}
				var firstNode = w[0];
				var lastNode = e[0];
				for (var i = firstNode; i <= lastNode; i++) {
					this.setNodeColor(i, w[1], newColor, newData);
					if (this.isNodeColorEqual(this.getNodeColor(i, w[1] + 1, newData), targetColor, tolerance)) {
						queue.push([i, w[1] + 1]);
					}
					if (this.isNodeColorEqual(this.getNodeColor(i, w[1] - 1, newData), targetColor, tolerance)) {
						queue.push([i, w[1] - 1]);
					}
				}
			}
			this.context.putImageData(imageData, 0, 0);
			// this.canvas.dispatchEvent(this.events.redrawEvent);
			// this.canvas.dispatchEvent(this.events.fillEvent);
		};
		CanvasFreeDrawing.prototype.toValidColor = function (color) {
			if (Array.isArray(color) && color.length === 4)
			return color;
			if (Array.isArray(color) && color.length === 3) {
				// var validColor = __spreadArrays(color);
				var validColor = color;
				validColor.push(255);
				return validColor;
			}
		};
		// i = color 1; j = color 2; t = tolerance
		CanvasFreeDrawing.prototype.isNodeColorEqual = function (i, j, t) {
			var color1 = '' + i[0] + i[1] + i[2] + i[3];
			var color2 = '' + j[0] + j[1] + j[2] + j[3];
			var key = color1 + color2 + t;
			t = t || 0;
			if (this.isNodeColorEqualCache.hasOwnProperty(color1 + color2 + t)) {
				return this.isNodeColorEqualCache[key];
			}
			var diffRed = Math.abs(j[0] - i[0]);
			var diffGreen = Math.abs(j[1] - i[1]);
			var diffBlue = Math.abs(j[2] - i[2]);
			var percentDiffRed = diffRed / 255;
			var percentDiffGreen = diffGreen / 255;
			var percentDiffBlue = diffBlue / 255;
			var percentDiff = ((percentDiffRed + percentDiffGreen + percentDiffBlue) / 3) * 100;
			var result = t >= percentDiff;
			this.isNodeColorEqualCache[key] = result;
			return result;
		};
		CanvasFreeDrawing.prototype.getNodeColor = function (x, y, data) {
			var i = (x + y * this.width) * 4;
			return [data[i], data[i + 1], data[i + 2], data[i + 3]];
		};
		CanvasFreeDrawing.prototype.setNodeColor = function (x, y, color, data) {
			var i = (x + y * this.width) * 4;
			data[i] = color[0];
			data[i + 1] = color[1];
			data[i + 2] = color[2];
			data[i + 3] = color[3];
		};
		CanvasFreeDrawing.prototype.rgbaFromArray = function (a) {
			return "rgba(" + a[0] + "," + a[1] + "," + a[2] + "," + a[3] + ")";
		};
		CanvasFreeDrawing.prototype.setDimensions = function () {
			this.canvas.height = this.height;
			this.canvas.width = this.width;
		};
		CanvasFreeDrawing.prototype.toggleCursor = function () {
			this.canvas.style.cursor = this.isDrawingModeEnabled ? 'crosshair' : 'auto';
		};
		CanvasFreeDrawing.prototype.storeDrawing = function (x, y, moving, force = 0) {
			this.positions.push({
				x: x,
				y: y,
				moving: moving,
				lineWidth: this.lineWidth,
				strokeColor: this.strokeColor,
				isBucket: false,
				force: force,
			});
		};
		CanvasFreeDrawing.prototype.storeSnapshot = function () {
			var imageData = this.getCanvasSnapshot();
			this.snapshots.push(imageData);
			if (this.snapshots.length > this.maxSnapshots) {
				this.snapshots = this.snapshots.splice(-Math.abs(this.maxSnapshots));
			}
			this.positions = [];
		};
		CanvasFreeDrawing.prototype.getCanvasSnapshot = function () {
			return this.context.getImageData(0, 0, this.width, this.height);
		};
		CanvasFreeDrawing.prototype.restoreCanvasSnapshot = function (imageData) {
			this.context.putImageData(imageData, 0, 0);
		};
		// Public APIs
		CanvasFreeDrawing.prototype.on = function (params, callback) {
			var event = params.event, counter = params.counter;
			if (event === 'redraw' && counter && Number.isInteger(counter)) {
				this.dispatchEventsOnceEvery = counter;
			}
			this.canvas.addEventListener('cfd_' + event, function () { return callback(); });
		};
		CanvasFreeDrawing.prototype.setLineWidth = function (px) {
			this.lineWidth = px;
		};
		CanvasFreeDrawing.prototype.setErase = function () {
			this.canvas.style.cursor = 'not-allowed';
			this.isErasing = true;
		};
		CanvasFreeDrawing.prototype.setDraw = function () {
			this.isErasing = false;
			this.toggleCursor();
		};
		CanvasFreeDrawing.prototype.setBackground = function (color, save) {
			if (save === void 0) { save = true; }
			var validColor = this.toValidColor(color);
			if (validColor) {
				if (save)
				this.backgroundColor = validColor;
				this.context.fillStyle = this.rgbaFromArray(validColor);
				this.context.fillRect(0, 0, this.width, this.height);
			}
		};
		CanvasFreeDrawing.prototype.setDrawingColor = function (color) {
			this.configBucketTool({ color: color });
			this.setStrokeColor(color);
		};
		CanvasFreeDrawing.prototype.setStrokeColor = function (color) {
			this.strokeColor = this.toValidColor(color);
		};
		CanvasFreeDrawing.prototype.configBucketTool = function (params) {
			var _a = params.color, color = _a === void 0 ? null : _a, _b = params.tolerance, tolerance = _b === void 0 ? null : _b;
			if (color)
			this.bucketToolColor = this.toValidColor(color);
			if (tolerance && tolerance > 0) {
				this.bucketToolTolerance = tolerance > 100 ? 100 : tolerance;
			}
		};
		CanvasFreeDrawing.prototype.toggleBucketTool = function () {
			return (this.isBucketToolEnabled = !this.isBucketToolEnabled);
		};
		CanvasFreeDrawing.prototype.toggleDrawingMode = function () {
			return this.isDrawingModeEnabled
            ? ( this.isErasing ? this.enableDrawingMode() : this.disableDrawingMode() )
			: this.enableDrawingMode();
		};
		CanvasFreeDrawing.prototype.clear = function () {
			// this.context.clearRect(0, 0, this.width, this.height);
			this.canvas.getContext('2d').clearRect(0, 0, this.width, this.height);
			this.positions = [];
			this.imageRestored = false;
			if (this.backgroundColor)
			this.setBackground(this.backgroundColor);
			this.handleEndDrawing();
		};
		CanvasFreeDrawing.prototype.save = function () {
			return this.canvas.toDataURL();
		};
		CanvasFreeDrawing.prototype.restore = function (backup, callback) {
			var _this = this;
			var image = new Image();
			image.src = backup;
			image.onload = function () {
				_this.imageRestored = true;
				_this.context.drawImage(image, 0, 0);
				if (typeof callback === 'function')
				callback();
			};
		};
		CanvasFreeDrawing.prototype.undo = function () {
			console.log(this.snapshots);
			var lastSnapshot = this.snapshots[this.snapshots.length - 1];
			var goToSnapshot = this.snapshots[this.snapshots.length - 2];
			if (goToSnapshot) {
				this.restoreCanvasSnapshot(goToSnapshot);
				this.snapshots.pop();
				this.undos.push(lastSnapshot);
				this.undos = this.undos.splice(-Math.abs(this.maxSnapshots));
				this.imageRestored = true;
			}
		};
		CanvasFreeDrawing.prototype.redo = function () {
			if (this.undos.length > 0) {
				var lastUndo = this.undos.pop();
				if (lastUndo) {
					this.restoreCanvasSnapshot(lastUndo);
					this.snapshots.push(lastUndo);
					this.snapshots = this.snapshots.splice(-Math.abs(this.maxSnapshots));
				}
			}
		};
		return CanvasFreeDrawing;
	}());
	// exports.default = CanvasFreeDrawing;
// });

// var index = unwrapExports(dist);
// var dist_1 = dist.AllowedEvents;
//
// exports.AllowedEvents = dist_1;
// exports.default = index;
//
// Object.defineProperty(exports, '__esModule', { value: true });

// })));
