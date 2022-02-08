// The MIT License (MIT)
// Copyright (c) 2022-present, Ping-Shun Chan

// Heavily modified from https://github.com/federico-moretti/canvas-free-drawing
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

let canvasSnapshots = [];
let canvasUndos = [];

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
		lineWidth = _b === void 0 ? 2 : _b,
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
		this.snapshowImage = null;
		this.maxSnapshots = maxSnapshots;
		canvasSnapshots = [];
		canvasUndos = [];
		this.positions = [];
		this.x = 0;
		this.y = 0;
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
		this.mouseSmoothFactor = 4;
		this.stylusSmoothFactor = 2;
        this.timer = null;
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
		this.showWarnings = showWarnings;
		this.isNodeColorEqualCache = {};
		this.setDimensions();
		this.storeSnapshotImage();
		if (!disabled)
		this.enableDrawingMode();
	}

	CanvasFreeDrawing.prototype.addListeners = function () {
		this.listenersList.forEach(event => {
			this.canvas.addEventListener(event.toLowerCase(), this.bindings[event], {passive: false});
		});
		document.addEventListener('touchcancel', this.bindings.touchEnd);
		// document.addEventListener('mouseup', this.bindings.mouseUpDocument);
	};

	CanvasFreeDrawing.prototype.removeListeners = function () {
		this.listenersList.forEach(event => {
			this.canvas.removeEventListener(event.toLowerCase(), this.bindings[event]);
		});
		document.removeEventListener('touchcancel', this.bindings.touchEnd);
		// document.removeEventListener('mouseup', this.bindings.mouseUpDocument);
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
		event.preventDefault();
		this.pointerType = 'mouse';
		if (event.button !== 0)
		return;

		this.isDrawing = true;
		this.context.beginPath();
		this.context.moveTo(event.offsetX, event.offsetY);
	};

	CanvasFreeDrawing.prototype.touchStart = function (event) {
		// event.preventDefault();
		if (typeof event.touches[0].touchType != 'undefined' && event.touches[0].touchType == 'direct' ) {
			this.pointerType = 'direct';
			return 0; // no finger drawing;
		} else if (event.targetTouches.length > 0 ) {
			event.preventDefault();
			this.pointerType = 'stylus';
			this.isDrawing = true;
			let _a = event.targetTouches[0], pageX = _a.pageX, pageY = _a.pageY;
			let x = pageX - this.canvas.offsetLeft;
			let y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.output.scrollTop;
			this.context.beginPath();
			this.context.moveTo(x, y);
			this.x = x;
			this.y = y;
		}
	};

    CanvasFreeDrawing.prototype.mouseMove = function (event) {
		event.preventDefault();
        this.pointerType = 'mouse';
        clearTimeout(this.timer);
		let x = event.offsetX;
		let y = event.offsetY;
		if (this.isDrawing) {
			this.handleDrawing(x, y);
		} else if (this.positions.length > 0) {
			this.timer = setTimeout(() => {
				this.positions[this.positions.length - 1].x = x;
				this.positions[this.positions.length - 1].y = y;
				this.storeSnapshot();
				this.undo();
				canvasUndos.pop();
				this.handleStroke(this.positions);
			}, 250);
		}
	};

	CanvasFreeDrawing.prototype.touchMove = function (event) {
		// event.preventDefault();
		if (typeof event.touches[0].touchType != 'undefined' && event.touches[0].touchType == 'direct' ) {
			return 0; // no finger drawing;
		} else if (event.targetTouches.length == 1 && event.changedTouches.length == 1 ) {
			event.preventDefault();
			this.pointerType = 'stylus';
			clearTimeout(this.timer);
			var _a = event.changedTouches[0], pageX = _a.pageX, pageY = _a.pageY;
			var x = pageX - this.canvas.offsetLeft;
			var y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.output.scrollTop;

			if (this.isDrawing) {
				this.handleDrawing(x, y, {force: event.touches[0].force});
			} else if (this.positions.length > 0) {
				this.timer = setTimeout(() => {
					if( this.positions[0].isSpline ) {
						this.positions[this.positions.length - 1].x = x;
						this.positions[this.positions.length - 1].y = y;
					} else {
						let smoothFactor = this.positions[0].smoothFactor;
						let n = Math.floor( this.positions.length / smoothFactor );
						let m = n * smoothFactor >= this.positions.length ? this.positions.length - 1 : n * smoothFactor;
						this.positions[m].x = x;
						this.positions[m].y = y;
						this.positions[m].smoothFactor = 0;
					}
					this.storeSnapshot();
					this.undo();
					canvasUndos.pop();
					this.handleStroke(this.positions);
				}, 250);
			}
		}
	};


	CanvasFreeDrawing.prototype.mouseUp = function (event) {
        event.preventDefault();
        clearTimeout(this.timer);
        if (this.positions.length == 0) {
            this.handleDrawing(event.offsetX, event.offsetY, {force: 10, smoothFactor: 0});
		} else {
			this.handleDrawing(event.offsetX, event.offsetY, {smoothFactor: 0});
		}
		this.handleEndDrawing();
	};


	CanvasFreeDrawing.prototype.touchEnd = function (event) {
		event.preventDefault();
		clearTimeout(this.timer);
		if (this.positions.length < 3) {
			// const _a = event.changedTouches[0], pageX = _a.pageX, pageY = _a.pageY;
			// const x = pageX - this.canvas.offsetLeft;
			// const y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.output.scrollTop;
			this.handleDrawing(this.x, this.y, {force: 10, smoothFactor: 0});
		}
		this.handleEndDrawing();
	};

	CanvasFreeDrawing.prototype.handleDrawing = function (x, y, customParams = null) {
		let params = {
			force: this.mouseForce,
			isErasing: this.isErasing,
			// smoothFactor: this.pointerType == 'mouse' ? this.mouseSmoothFactor : this.stylusSmoothFactor,
		};
		if (customParams != null) {
			for (param in customParams) {
				if (customParams[param] != null) {
					params[param] = customParams[param];
				}
			}
		}
        if (this.isDrawing) {
			this.storeDrawing(x, y, params);
			this.draw(this.positions);
			canvasUndos = [];
			this.timer = this.curveSmoothingTimer();
		}
	};

	CanvasFreeDrawing.prototype.handleEndDrawing = function () {
		// console.log('handleEndDrawing');
		if (this.isDrawing || this.positions == null) {
			if (this.positions == null || this.positions.length) {
				this.storeSnapshot();
			}
		}
		this.positions = [];
		this.isDrawing = false;
	};

	CanvasFreeDrawing.prototype.handleStroke = function (positions) {
		if (positions == null) {
			this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
		} else if (positions.length) {
			this.context.beginPath();
			if (!positions[0].isSpline) {
				this.draw(positions, positions.length - 1);
			} else {
				this.pseudoSpline(positions);
			}
		}
	};


	CanvasFreeDrawing.prototype.draw = function (positions, offset = 0) {
		let endX, endY;

		let cpX = null;
		let cpY = null;
		for ( let index = positions.length - 1 - offset; index < positions.length; index++ ) {
			const position = positions[index];
			const x = position.x,
			y = position.y;

			if ( position.isErasing ) {
				this.context.clearRect(
					x - 0.5*this.eraseScale*this.lineWidth,
					y - 0.5*this.eraseScale*this.lineWidth,
					this.eraseScale*this.lineWidth,
					this.eraseScale*this.lineWidth
				);
				continue;
			}

			const smoothFactor = position.smoothFactor;
			const color = position.strokeColor.slice();

			let widthScale;
			let temperedForce = this.forceMultiplier*position.force;

			const dx = x - positions[index > 0 ? index - 1 : 0].x,
			dy = y - positions[index > 0 ? index - 1 : 0].y;

			color[3] = Math.min( 1, temperedForce ); // basic
			this.context.strokeStyle = this.rgbaFromArray(color);

			widthScale = Math.min( 1.8, 2*temperedForce ); // basic
			this.context.lineWidth = widthScale*position.lineWidth;

			this.context.lineCap = 'butt';
			this.context.lineJoin = 'butt';

			// console.log(position);
			if ( positions.length > 1 && index > 0) { // % 2 == 0 && i > 3
				if ( smoothFactor == 0 || ( index % smoothFactor == 0 && index >= smoothFactor )) {
					if (cpX == null) {
						cpX = positions[index - smoothFactor].x;
					}
					if (cpY == null) {
						cpY = positions[index - smoothFactor].y;
					}
					// endX = position.endPoint ? x : ( x + positions[index - smoothFactor].x )/2;
					// endY = position.endPoint ? y : ( y + positions[index - smoothFactor].y )/2;
					endX = ( x + positions[index - smoothFactor].x )/2;
					endY = ( y + positions[index - smoothFactor].y )/2;
					this.context.quadraticCurveTo(cpX, cpY, endX, endY);
					this.context.stroke();
					this.context.beginPath();
					this.context.moveTo(endX, endY);
					cpX = x;
					cpY = y;
				}
			} else {
				color[3] = 1;
				this.context.strokeStyle = this.rgbaFromArray(color);
				this.context.lineCap = 'round';
				this.context.beginPath();
				this.context.moveTo(positions[index > 0 ? index - 1 : 0].x, positions[index > 0 ? index - 1 : 0].y);
				this.context.lineTo(
					x,
					y,
				);
				this.context.stroke();
			}
		}
	};

	CanvasFreeDrawing.prototype.pseudoSpline = function (positions) {
		// console.log(positions);
		this.context.beginPath();
		this.context.moveTo(positions[0].x, positions[0].y);
		for ( let index = 1; index < positions.length; index++ ) {
			const position = positions[index];
			const x = position.x,
			y = position.y;

			const smoothFactor = position.smoothFactor;
			const color = position.strokeColor.slice();

			let widthScale;
			let temperedForce = this.forceMultiplier*position.force;

			const dx = x - positions[index > 0 ? index - 1 : 0].x,
			dy = y - positions[index > 0 ? index - 1 : 0].y;

			color[3] = Math.min( 1, temperedForce ); // basic
			this.context.strokeStyle = this.rgbaFromArray(color);

			widthScale = Math.min( 1.8, 2*temperedForce ); // basic
			this.context.lineWidth = widthScale*position.lineWidth;

			this.context.lineCap = 'butt';
			this.context.lineJoin = 'butt';

			if ( index > 1 && index < positions.length - 1) {
				let
				midX = ( x + positions[index - 1].x )/2,
				midY = ( y + positions[index - 1].y )/2,
				cp1X = ( midX + positions[index - 1].x )/2,
				cp1Y = positions[index - 1].y;

				this.context.quadraticCurveTo(cp1X, cp1Y, midX, midY);

				let
				midmidX = ( x + midX )/2,
				midmidY = ( y + midY )/2,
				cp2X = midmidX,
				cp2Y = y;

				this.context.quadraticCurveTo(cp2X, cp2Y, x, y);
				this.context.stroke();
				this.context.beginPath();
				this.context.moveTo(x, y);
			} else if ( index == 1 ){
				let
				midX = ( x + positions[index - 1].x )/2,
				midY = ( y + positions[index - 1].y )/2,
				cpX = midX,
				cpY = y;

				this.context.quadraticCurveTo(cpX, cpY, x, y);
				this.context.stroke();
				this.context.beginPath();
				this.context.moveTo(x, y);
			} else if ( index == positions.length - 1 ){
				let
				midX = ( x + positions[index - 1].x )/2,
				midY = ( y + positions[index - 1].y )/2,
				cpX = midX,
				cpY = positions[index - 1].y;

				this.context.quadraticCurveTo(cpX, cpY, x, y);
				this.context.stroke();
				this.context.beginPath();
				this.context.moveTo(x, y);
			}
		}
	};

	CanvasFreeDrawing.prototype.curveSmoothingTimer = function() {
		return setTimeout(function() {
			if (this.positions.length > 1) {
				// console.log(this.positions);
				const positions = this.positions.slice();
				setTimeout(function() {
					this.curveSmooth(this.positions);
				}.bind(this));
			}
		}.bind(this), 250);
	};



	CanvasFreeDrawing.prototype.curveSmooth = function(positions) {
		this.storeSnapshot();
		this.undo();
		canvasUndos.pop();

		const firstDerivatives = this.differentiate(positions);

		if (firstDerivatives.length == 0) { return; }

		// const stationaryPoints = [ positions[0] ];
		// stationaryPoints[0].isSpline = true;
		// this.stationaryPoints(firstDerivatives).forEach( index => {
		// 	stationaryPoints.push( positions[index] );
		// });
		// stationaryPoints.push( positions[positions.length - 1] );

		const stationaryPoints = this.stationaryPoints(firstDerivatives, positions);

		// console.log(stationaryPoints);

		let fullLength = firstDerivatives.reduce( (sum, entry) => {
			return sum + entry.length;
		}, 0);
		// console.log(fullLength);

		const meanFirst = {
			x: firstDerivatives.reduce( (sum, entry) => {
				return sum + entry.x * entry.length;
			}, 0) / fullLength,
			y: firstDerivatives.reduce( (sum, entry) => {
				return sum + entry.y * entry.length;
			}, 0) / fullLength,
		}


		let varFirst = 0;

		firstDerivatives.forEach( entry => {
			varFirst +=  (
				( 1 - ( entry.x * meanFirst.x ) - ( entry.y * meanFirst.y ) )**2
			) * (entry.length);
		});

		const sdFirst = Math.sqrt(varFirst / fullLength);
		// console.log(sdFirst);

		const steps = Math.ceil( 25*sdFirst );

		const smoothFactor = Math.min(
			positions.length - 1,
			Math.ceil(positions.length / steps)
		);
		// console.log('smoothFactor: ' + smoothFactor);

		if (stationaryPoints.length > 2 && sdFirst > 0.1) {
			this.positions = stationaryPoints;
		} else {
			positions.forEach( ( position, index ) => {
				position.smoothFactor = smoothFactor;
				position.isSpline = false;
			});
			positions[positions.length - 1].smoothFactor = 0;
			this.positions = positions;
		}
		this.handleStroke(this.positions);
		if (this.positions === null || this.positions.length) {
			this.storeSnapshot();
		}
		this.isDrawing = false;
	}

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
	CanvasFreeDrawing.prototype.storeDrawing = function (x, y, params) { // moving, force = 0, isErasing = false, smoothFactor
		let position = {
			x: x,
			y: y,
			// moving: moving,
			lineWidth: this.lineWidth,
			strokeColor: this.strokeColor,
			force: this.mouseForce,
			// endPoint: false,
			smoothFactor: this.pointerType == 'mouse' ? this.mouseSmoothFactor : this.stylusSmoothFactor,
			isErasing: this.isErasing,
			isSpline: false,
		};
		for (const param in params) {
			if (params[param] != null) {
				position[param] = params[param];
			}
		}
		this.positions.push(position);
	};

	CanvasFreeDrawing.prototype.storeSnapshotImage = function () {
		// console.log('storeSnapshotImage');
		this.snapshotImage = this.getCanvasSnapshot();
		// console.log(this.snapshotImage);
	};

	CanvasFreeDrawing.prototype.storeSnapshot = function () {
		canvasSnapshots.push(this.positions);
		this.storeSnapshotImage();
	};

	CanvasFreeDrawing.prototype.getCanvasSnapshot = function () {
		return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	};

	CanvasFreeDrawing.prototype.restoreCanvasSnapshot = function (imageData) {
		this.context.putImageData(imageData, 0, 0);
	};

	CanvasFreeDrawing.prototype.undo = function () {
		if (canvasSnapshots.length > 0) {
			this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
			canvasUndos.push( canvasSnapshots.pop() );
			// canvasUndos = canvasUndos.splice(-Math.abs(this.maxSnapshots));

			this.reconstruct(canvasSnapshots);
			// canvasSnapshots.forEach(positions => {
			// 	if (positions == null) {
			// 		this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
			// 	} else if (positions.length) {
			// 		this.context.beginPath();
			// 		if (!positions[0].isSpline) {
			// 			this.draw(positions, positions.length - 1);
			// 		} else {
			// 			this.pseudoSpline(positions);
			// 		}
			// 	}
			// });
			this.imageRestored = true;
		} else {
			this.restoreCanvasSnapshot(this.snapshotImage);
		}
		this.storeSnapshotImage();
	};

	CanvasFreeDrawing.prototype.reconstruct = function(snapshots) {
		let offset = 0;
		for (let i = snapshots.length - 1; i >= 0; i--) {
			if (snapshots[i] == null) {
				offset = i;
				break;
			}
		}
		let positions;
		for ( let i = offset; i < snapshots.length; i++ ) {
			positions = snapshots[i];
			// canvasSnapshots.forEach(positions => {
			if (positions == null) {
				this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
			} else if (positions.length) {
				this.context.beginPath();
				if (!positions[0].isSpline) {
					this.draw(positions, positions.length - 1);
				} else {
					this.pseudoSpline(positions);
				}
			}
		}
		// });
		// setTimeout(() => {
		// 	let positions = snapshots.shift();
		// 	this.handleStroke(positions);
		// 	if (snapshots.length) {
		// 		this.reconstruct(snapshots.slice());
		// 	}
		// });
	}

	CanvasFreeDrawing.prototype.redo = function () {
		if (canvasUndos.length > 0) {
			let positions = canvasUndos.pop();
			this.handleStroke(positions);
			canvasSnapshots.push(positions);
			// canvasSnapshots = canvasSnapshots.splice(-Math.abs(this.maxSnapshots));
			this.storeSnapshotImage();
		}
	};
	// Public APIs
	// CanvasFreeDrawing.prototype.on = function (params, callback) {
	// 	var event = params.event;
	// 	this.canvas.addEventListener('cfd_' + event, function () { return callback(); });
	// };
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
		this.positions = null;
		if (this.backgroundColor) {
			this.setBackground(this.backgroundColor);
		}
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

	CanvasFreeDrawing.prototype.differentiate = function(positions, increment = 1, normalized = true, allowZero = false) {
		const derivatives = [];
		let dx, dy, length;
		for (let i = increment; i < positions.length - 1; i++) {
			dx = positions[i].x - positions[ i - increment ].x;
			dy = positions[i].y - positions[ i - increment ].y;
			length =
            typeof positions[i].length !== 'undefined' ?
            positions[i].length : Math.sqrt( dx**2 + dy**2 );
			if (length > 0 || allowZero) {
				derivatives.push({
					positionX : positions[i].x,
					positionY : positions[i].y,
					x: normalized ? ( length > 0 ? dx/length : 0 ) : dx,
					y: normalized ? ( length > 0 ? dy/length : 0 ) : dy,
					length: length,
                    position: i,
				});
			}
		}
		return derivatives;
	}

    // CanvasFreeDrawing.prototype.stationaryPoints = function(firstDerivatives, positions) {
	// 	let stationaryPoints = [];
    //     const fullLength = firstDerivatives.reduce( (sum, entry) => {
    //         return sum + entry.length;
    //     }, 0);
	// 	console.log(fullLength);
    //     let initial = 0;
	// 	let terminal = 0;
    //     let localLength = 0;
    //     let dx = firstDerivatives[0].x;
	// 	let dy = firstDerivatives[0].y;
	// 	let sign;
	// 	let point = positions[0];
	//
	// 	point.isSpline = true;
	// 	stationaryPoints.push(point);
	//
	// 	let ds = firstDerivatives[0].length;
	// 	let prevSign = Math.sign(dx * dy);
	// 	console.log('start');
	// 	console.log(firstDerivatives[0]);
    //     for (let i = 1; i < firstDerivatives.length; i++ ) {
	// 		ds += firstDerivatives[i].length;
	// 		dx = firstDerivatives[i].x;
	// 		dy = firstDerivatives[i].y;
	// 		if ( dy * dx != 0 ) {
	// 			if ( Math.abs( dy / dx ) < 0.1 ) {
	// 				sign = Math.sign( dx * dy );
	// 				if ( sign != prevSign && ds > fullLength*0.3 ) {
	// 					console.log('flat');
	// 					console.log(ds);
	// 					console.log(firstDerivatives[i]);
	//
	// 					initial = firstDerivatives[i - 1].position;
	// 					ds = 0;
	// 					prevSign = sign;
	// 				}
	// 			} else if ( Math.abs( dy / dx ) > 0.1 ) {
	// 				sign = Math.sign( dx * dy );
	// 				if ( sign != prevSign && ds > fullLength*0.3 ) {
	// 					console.log('slope');
	// 					console.log(ds);
	// 					console.log(firstDerivatives[i]);
	//
	// 					terminal = firstDerivatives[i].position;
	// 					ds = 0;
	// 					prevSign = sign;
	// 					let point = positions[ Math.floor( (initial + terminal) / 2 ) ];
	// 					// point.x = ( positions[initial].x + positions[terminal].x ) / 2;
	// 					// point.y = ( positions[initial].y + positions[terminal].y ) / 2;
	// 					console.log(point);
	// 					stationaryPoints.push( point );
	// 				}
	// 			}
	// 		}
    //     }
	// 	stationaryPoints.push(positions[positions.length - 1]);
	// 	console.log(stationaryPoints);
    //     return stationaryPoints;
	// }

	CanvasFreeDrawing.prototype.stationaryPoints = function(firstDerivatives, positions) {
		let stationaryPoints = [];
        const fullLength = firstDerivatives.reduce( (sum, entry) => {
            return sum + entry.length;
        }, 0);
        let candidate = 0;
        let prev = 0;
        let localLength = 0;
        let dy = 0;
		let point = positions[0];
		point.isSpline = true;
		stationaryPoints.push(point);
        for (let i = 0; i < firstDerivatives.length; i++ ) {
            dy += firstDerivatives[i].y * firstDerivatives[i].length;
            if ( firstDerivatives[i].y == 0 && firstDerivatives[i].x != 0 ) {
				if (localLength == 0 && (Math.abs(dy) > fullLength*0.05)) {
                    candidate = firstDerivatives[i].position;
				}
                localLength += firstDerivatives[i].length;
            } else {
                if ( localLength > 2 && candidate != prev) {
					let midpoint = Math.floor( (candidate + firstDerivatives[i].position)/2 );
					let point = positions[ midpoint ];
					stationaryPoints.push( point );
                    prev = midpoint;
                    dy = 0;
                }
                localLength = 0;
            }
        }
		stationaryPoints.push(positions[positions.length - 1]);
        return stationaryPoints;
	};

	return CanvasFreeDrawing;
}());
