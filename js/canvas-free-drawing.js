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

const CanvasFreeDrawing = (function () {
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
		this.output = params.output;
		this.width = width;
		this.height = height;
		this.maxSnapshots = maxSnapshots;
		this.snapshots = [];
		this.undos = [];
		this.positions = [];
		this.isDrawing = false;
		this.isDrawingModeEnabled = true;
		this.isErasing = false;
		this.eraseScale = 10;
		this.forceMultiplier = 6;
		this.mouseForce = 0.15;
		this.imageRestored = false;
		this.lineWidth = lineWidth;
		this.strokeColor = this.toValidColor(strokeColor);
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
		this.bindings = {
			mouseDown: this.mouseDown.bind(this),
			mouseMove: this.mouseMove.bind(this),
			mouseUp: this.mouseUp.bind(this),
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
		this.isDrawing = true;
		this.drawLine(event.offsetX, event.offsetY);
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
			var y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.output.scrollTop;
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
			var y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.output.scrollTop;
			this.drawLine(x, y, event.touches[0].force);
		}
	};

	CanvasFreeDrawing.prototype.touchEnd = function () {
		this.handleEndDrawing();
	};

	CanvasFreeDrawing.prototype.mouseUp = function () {
		if (this.positions.length == 1) {
			this.drawPoint(event.offsetX, event.offsetY);
		}
		this.handleEndDrawing();
	};

	CanvasFreeDrawing.prototype.handleEndDrawing = function () {
		// console.log('handleEndDrawing');
		this.isDrawing = false;
		this.storeSnapshot();
	};

	CanvasFreeDrawing.prototype.drawPoint = function (x, y, force = this.mouseForce) {
		this.isDrawing = true;
		this.positions = [];
		this.storeDrawing(x, y, false, force);
		this.handleDrawing();
	};

	CanvasFreeDrawing.prototype.drawLine = function (x, y, force = this.mouseForce) {
		event.preventDefault();

		if (this.isDrawing) {
			this.storeDrawing(x, y, true, force);
			this.handleDrawing();
		}
	};

	CanvasFreeDrawing.prototype.handleDrawing = function () {
		this.draw(this.positions);
		this.undos = [];
	};

	CanvasFreeDrawing.prototype.draw = function (positions) {
		const position = positions[positions.length - 1];
		const color = position.strokeColor.slice();

		let widthScale;
		let temperedForce = this.forceMultiplier*position.force;

		const x = position.x,
		y = position.y,
		l = positions.length - 1,
		moving = l > 0,
		dx = x - positions[l > 0 ? l - 1 : 0].x,
		dy = y - positions[l > 0 ? l - 1 : 0].y;

		this.context.lineCap = 'butt';
		this.context.lineJoin = 'butt';
		// temperedForce = 7*temperedForce/Math.max(1, (Math.abs(dx) + Math.abs(dy)) );
		color[3] = Math.min( 1, temperedForce ); // basic
		// color[3] = Math.max(0.25, 2*temperedForce);
		// color[3] = 0.5/(10*temperedForce);
		this.context.strokeStyle = this.rgbaFromArray(color);

		widthScale = Math.min( 1.8, 2*temperedForce ); // basic
		// widthScale = Math.min( 10, 1/temperedForce );
		this.context.lineWidth = widthScale*position.lineWidth;

		if (!this.isErasing ) {
			if ( moving ) { // % 2 == 0 && i > 3
				if ( this.pointerType == 'mouse' ) {
					if ( l % 4 == 1 && l > 1) {
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
				}
			} else {
				this.context.lineCap = 'round';
				this.context.beginPath();
				this.context.moveTo(x, y);
				this.context.lineTo(
					x,
					y,
				);
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

	CanvasFreeDrawing.prototype.toValidColor = function (color) {
		if (Array.isArray(color) && color.length === 4)
		return color;
		if (Array.isArray(color) && color.length === 3) {
			var validColor = color;
			validColor.push(255);
			return validColor;
		}
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
			force: force,
		});
	};
	CanvasFreeDrawing.prototype.storeSnapshot = function () {
		// console.log('storeSnapshot');
		var imageData = this.getCanvasSnapshot();
		this.snapshots.push(imageData);
		if (this.snapshots.length > this.maxSnapshots) {
			this.snapshots = this.snapshots.splice(-Math.abs(this.maxSnapshots));
		}
		this.positions = [];
	};
	CanvasFreeDrawing.prototype.getCanvasSnapshot = function () {
		return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	};
	CanvasFreeDrawing.prototype.restoreCanvasSnapshot = function (imageData) {
		this.context.putImageData(imageData, 0, 0);
	};
	// Public APIs
	CanvasFreeDrawing.prototype.on = function (params, callback) {
		var event = params.event;
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
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
	};
	CanvasFreeDrawing.prototype.setDrawingColor = function (color) {
		this.setStrokeColor(color);
	};
	CanvasFreeDrawing.prototype.setStrokeColor = function (color) {
		this.strokeColor = this.toValidColor(color);
	};

	CanvasFreeDrawing.prototype.toggleDrawingMode = function () {
		return this.isDrawingModeEnabled
		? ( this.isErasing ? this.enableDrawingMode() : this.disableDrawingMode() )
		: this.enableDrawingMode();
	};
	CanvasFreeDrawing.prototype.clear = function () {
		this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.positions = [];
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
		var lastSnapshot = this.snapshots[this.snapshots.length - 1];
		var goToSnapshot = this.snapshots[this.snapshots.length - 2];
		this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
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
