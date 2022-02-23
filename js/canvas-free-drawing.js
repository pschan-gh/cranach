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

// let canvasSnapshots = [];
// let canvasUndos = [];



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
		this.container = params.container;
		this.width = width;
		this.height = height;
		this.snapshowImage = null;
		this.maxSnapshots = maxSnapshots;
		this.snapshots = [];
		this.undos = [];
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
        this.shakyThreshold = 2.5;
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

		this.undos = [];

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

			this.undos = [];

			this.isDrawing = true;
			let _a = event.targetTouches[0], pageX = _a.pageX, pageY = _a.pageY;
			// let x = pageX - this.canvas.offsetLeft;
			// let y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.container.scrollTop;
			const viewportOffset = this.canvas.getBoundingClientRect();
			const x = pageX - viewportOffset.x; // + this.container.scrollLeft;
			const y = pageY - viewportOffset.y; // + this.container.scrollTop;
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
			this.x = x;
			this.y = y;
		} else if (this.positions.length > 0) {
            // console.log('correcting');
			this.timer = setTimeout(() => {
				if (typeof this.positions[0].radiusX == 'undefined') {
					this.positions[this.positions.length - 1].x = x;
					this.positions[this.positions.length - 1].y = y;
				} else {
					let dx = x - this.x;
					let dy = y - this.y
					this.positions[0].x += dx;
					this.positions[0].y += dy;
					this.x = x;
					this.y = y;
				}
				this.storeSnapshot();
				this.undo();
				this.undos.pop();
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
			// var x = pageX - this.canvas.offsetLeft;
			// var y = pageY - this.canvas.offsetTop;
			const viewportOffset = this.canvas.getBoundingClientRect();
			const x = pageX - viewportOffset.x; // + this.container.scrollLeft;
			const y = pageY - viewportOffset.y; // + this.container.scrollTop;

			if (this.isDrawing) {
				this.handleDrawing(x, y, {force: event.touches[0].force});
			} else if (this.positions.length > 0) {
				this.timer = setTimeout(() => {
					if (typeof this.positions[0].radiusX == 'undefined') {
						this.positions[this.positions.length - 1].x = x;
						this.positions[this.positions.length - 1].y = y;
					} else {
						let dx = x - this.x;
						let dy = y - this.y
						this.positions[0].x += dx;
						this.positions[0].y += dy;
						this.x = x;
						this.y = y;
					}
					this.storeSnapshot();
					this.undo();
					this.undos.pop();
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
			this.handleDrawing(this.x, this.y, {force: 10, smoothFactor: 0});
		}
		this.handleEndDrawing();
	};

	CanvasFreeDrawing.prototype.handleDrawing = function (x, y, customParams = null) {
		let params = {
			force: this.mouseForce,
			isErasing: this.isErasing,
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
			// this.undos = [];
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
			let position = positions[0];

			const smoothFactor = position.smoothFactor;
			const color = position.strokeColor.slice();
			let widthScale;
			let temperedForce = this.forceMultiplier*position.force;

			color[3] = Math.min( 1, temperedForce ); // basic
			this.context.strokeStyle = this.rgbaFromArray(color);

			widthScale = Math.min( 1.8, 2*temperedForce ); // basic
			this.context.lineWidth = widthScale*position.lineWidth;

			this.context.lineCap = 'butt';
			this.context.lineJoin = 'butt';
			this.context.beginPath();

			if (typeof position.radiusX != 'undefined') {

				this.context.beginPath();
				this.context.ellipse(
					position.x,
					position.y,
					position.radiusX,
					position.radiusY,
					position.angle,
					0,
					2 * Math.PI
				);
				this.context.stroke();
			} else if (!position.isSpline) {
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
				const positions = this.positions;
				this.storeSnapshot();
				this.undo();
				setTimeout(function() {
					this.curveSmooth(this.positions);
				}.bind(this));
			}
		}.bind(this), 250);
	};



	CanvasFreeDrawing.prototype.curveSmooth = function(positions) {

		setTimeout(() => {
			const firstDerivatives = this.differentiate(positions);

			if (firstDerivatives.length == 0) { return; }

			const stationaryPoints = this.stationaryPoints(firstDerivatives, positions);
            // console.log(stationaryPoints);

			let fullLength = firstDerivatives.reduce( (sum, entry) => {
				return sum + entry.length;
			}, 0);
			// console.log(fullLength);

			const displacement = {
				x: positions[positions.length - 1].x - positions[0].x,
				y: positions[positions.length - 1].y - positions[0].y,
			}
			const displacementLength = Math.sqrt( displacement.x**2 + displacement.y**2 );

			const meanFirst = {
				x: displacement.x / displacementLength,
				y: displacement.y / displacementLength,
			}

			let varFirst = 0;

			firstDerivatives.forEach( entry => {
				varFirst +=  (
					( 1 - ( entry.x * meanFirst.x ) - ( entry.y * meanFirst.y ) )**2
				) * (entry.length);
                // varFirst +=
				// 	Math.abs( this.orientation(entry, meanFirst, 10 * entry.length / fullLength ) ) * entry.length ;
			});

			const sdFirst = Math.sqrt(varFirst / fullLength );
			// console.log(sdFirst * 25);

			// const inflectionPoints = this.getInflectionPoints( firstDerivatives.slice(), positions.slice() );
	        // console.log(inflectionPoints);
	        // if (inflectionPoints.length > 0) {
	        //     return null;
	        // }

			const steps = Math.ceil( sdFirst * 20 );
			// console.log(steps);

			const smoothFactor = Math.min(
				positions.length - 1,
				Math.ceil(positions.length / steps)
			);
			// console.log('smoothFactor: ' + smoothFactor);

			const ellipse = this.getEllipse(firstDerivatives, positions);
			// console.log(ellipse);
			if (ellipse !== null) {
				let point = positions[ Math.floor( (positions.length - 1) / 2 ) ];
				for (param in ellipse) {
					point[param] = ellipse[param];
				}
				this.positions = [ point ];
			} else if (stationaryPoints.length > 2 && sdFirst > 0.1) {
				this.positions = stationaryPoints;
			} else {
				positions.forEach( ( position, index ) => {
					position.smoothFactor = smoothFactor;
                });
                positions[positions.length - 1].smoothFactor = 0;

                if (steps == 1 && meanFirst.y * meanFirst.x != 0) {
                    if ( Math.abs( meanFirst.y / meanFirst.x ) < 0.15 ) {
                        positions[positions.length - 1].y = positions[0].y;
                        // positions[positions.length - 1].x = meanFirst.x > 0 ?
                        // positions[0].x + fullLength :
                        // positions[0].x - fullLength;
                    } else if ( Math.abs( meanFirst.x / meanFirst.y ) < 0.15 ) {
                        positions[positions.length - 1].x = positions[0].x;
                        // positions[positions.length - 1].y = meanFirst.y > 0 ? positions[0].y + fullLength :
                        // positions[0].y - fullLength;
                    }
                }

				this.positions = positions;
			}

			this.handleStroke(this.positions);
			if (this.positions === null || this.positions.length) {
				this.storeSnapshot();
			}
			this.isDrawing = false;
		});
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
	};

	CanvasFreeDrawing.prototype.storeSnapshot = function () {
		this.snapshots.push(this.positions);
		// this.storeSnapshotImage();
	};

	CanvasFreeDrawing.prototype.getCanvasSnapshot = function () {
		return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	};

	CanvasFreeDrawing.prototype.restoreCanvasSnapshot = function (imageData) {
		this.context.putImageData(imageData, 0, 0);
	};

	CanvasFreeDrawing.prototype.undo = function () {
		if (this.snapshots.length > 0) {
			this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.undos.push( this.snapshots.pop() );
			// this.undos = this.undos.splice(-Math.abs(this.maxSnapshots));

			this.reconstruct(this.snapshots);
			this.imageRestored = true;
		}
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
			// this.snapshots.forEach(positions => {
			this.handleStroke(positions);
		}
	}

	CanvasFreeDrawing.prototype.redo = function () {
		if (this.undos.length > 0) {
			let positions = this.undos.pop();
			this.handleStroke(positions);
			this.snapshots.push(positions);
			// this.snapshots = this.snapshots.splice(-Math.abs(this.maxSnapshots));
			// this.storeSnapshotImage();
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

	CanvasFreeDrawing.prototype.differentiate = function(positions, threshold = this.shakyThreshold, normalized = true, allowZero = false) {
		const derivatives = [];
		let dx, dy;
        let prevPosition = positions[0];
        let length;
		for (let i = 1; i < positions.length - 1; i++) {
			dx = positions[i].x - prevPosition.x;
			dy = positions[i].y - prevPosition.y;
			length = typeof positions[i].length !== 'undefined' ?
			positions[i].length : Math.sqrt( dx**2 + dy**2 );
			if (length > threshold || allowZero) {
				derivatives.push({
					positionX : positions[i].x,
					positionY : positions[i].y,
					x: normalized ? ( length > 0 ? dx/length : 0 ) : dx,
					y: normalized ? ( length > 0 ? dy/length : 0 ) : dy,
					length: length,
                    positionIndex: i,
				});
                prevPosition = positions[ i ];
			}
		}
		return derivatives;
	}

	CanvasFreeDrawing.prototype.stationaryPoints = function(firstDerivatives, positions) {
		let stationaryPoints = [];
        const fullLength = firstDerivatives.reduce( (sum, entry) => {
            return sum + entry.length;
        }, 0);
        let candidate = 0;
        let prev = 0;
        let localLength = 0;
        let dy = 0;
		let point = { ...positions[0] };
        point.isSpline = true;
		stationaryPoints.push(point);
        for (let i = 0; i < firstDerivatives.length; i++ ) {
            if (firstDerivatives[i].x < 0 && i / firstDerivatives.length > 0.1 && i / firstDerivatives.length < 0.9) {
                return [ { ...positions[0] } ]; // We sketch from left to right.
                break;
            }
            dy += firstDerivatives[i].y * firstDerivatives[i].length;
            if ( firstDerivatives[i].y == 0 && firstDerivatives[i].x != 0 ) {
				if (localLength == 0 && (Math.abs(dy) > fullLength*0.05)) {
                    candidate = firstDerivatives[i].positionIndex;
				}
                localLength += firstDerivatives[i].length;
            } else {
                if ( localLength > this.shakyThreshold && candidate != prev) {
					let midpoint = Math.floor( (candidate + firstDerivatives[i].positionIndex)/2 );
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

	// CanvasFreeDrawing.prototype.getPosition = function(firstDerivatives, arclength) {
	// 	let i;
	// 	let length = 0;
	// 	for( i = 0; i < firstDerivatives.length - 1; i++ ) {
	// 		length += firstDerivatives[i].length;
	// 		if (length > arclength) {
	// 			return firstDerivatives[i > 0 ? i - 1 : 0 ].positionIndex;
	// 		}
	// 	}
	// 	return null;
	// };

	CanvasFreeDrawing.prototype.getEllipse = function(firstDerivatives, positions) {
		const initialPoint = positions[0];
		const endPoint = positions[positions.length - 1];

		let left = null, right = null, up = null, down = null;

		for ( let i = 0; i < firstDerivatives.length; i++ ) {
			if (left == null && firstDerivatives[i].x < 0) {
				left = true;
			}
			if (right == null && firstDerivatives[i].x > 0) {
				right = true;
			}
			if (up == null && firstDerivatives[i].y < 0) {
				up = true;
			}
			if (down == null && firstDerivatives[i].y > 0) {
				down = true;
			}
		}

		if ( !( left && right && up && down ) ) {
			return null;
		}

		const xValues = positions.map( position => position.x );
		const yValues = positions.map( position => position.y );

		const centre = {
			x: ( Math.max( ...xValues ) + Math.min( ...xValues ) ) / 2,
			y: ( Math.max( ...yValues ) + Math.min( ...yValues ) ) / 2,
		};

        const testVector1 = this.displacement( centre, positions[ Math.round( positions.length / 8 )] );
		const testVector2 = this.displacement( centre, positions[ Math.round( positions.length / 4 )] );
		const testVector3 = this.displacement( centre, positions[ Math.round( positions.length / 2 )] );
        const vectorStart = this.displacement(centre, initialPoint);
        const vectorEnd = this.displacement(centre, endPoint);

		const orientation1 = this.orientation( vectorStart, testVector1 );
		const orientation2 = this.orientation( testVector1, testVector2 );
		if (orientation2 != orientation1) {
			return null;
		}
		const orientation3 = this.orientation( testVector2, testVector3 );
		if (orientation3 != orientation1) {
			return null;
		}

        if ( this.orientation( vectorStart, vectorEnd ) != orientation1 && (initialPoint.x - endPoint.x)**2 + (initialPoint.y - endPoint.y)**2 > 1000 ) {
            return null;
        }

		let radiusXSquared = (positions[0].x - centre.x)**2 + (positions[0].y - centre.y)**2;
		let radiusYSquared = radiusXSquared;
		let vertex = { x: positions[0].x - centre.x, y: positions[0].y - centre.y };

		for (let i = 0; i < positions.length; i++) {
			if ( positions[i].x > centre.x ) {
				let dSquared = (positions[i].x - centre.x)**2 + (positions[i].y - centre.y)**2;
				if (  dSquared > radiusXSquared ) {
					radiusXSquared = dSquared;
					vertex = { x: positions[i].x - centre.x, y: positions[i].y - centre.y };
				}
				radiusYSquared = Math.min( radiusYSquared, dSquared );
			}
		}

		const preRadiusX = Math.sqrt(radiusXSquared);
		const preRadiusY = Math.sqrt(radiusYSquared);

		let radiusX, radiusY;

		let radius = preRadiusX;
		if ( preRadiusX / preRadiusY < 1.45 ) {
			radius = ( preRadiusX + preRadiusY ) / 2;
			radiusX = radius;
			radiusY = radius;
		} else {
			radiusX = preRadiusX;
			radiusY = preRadiusY;
		}
		// console.log(vertex);
		const angle = Math.round( Math.atan2( vertex.y, vertex.x ) / (Math.PI / 12) ) * (Math.PI / 12);

		return {
			x: centre.x,
			y: centre.y,
			radiusX: radiusX,
			radiusY: radiusY,
			angle: angle,
		}
	};


	CanvasFreeDrawing.prototype.expandCanvas = function(scale = 1, padding = 0) {

	    let bodyRect = document.body.getBoundingClientRect();
		let slideRect = this.canvasNode.getBoundingClientRect();

		this.storeSnapshotImage();

		this.canvas.width = this.container.scrollWidth;
		this.canvas.height = this.container.scrollHeight*scale + padding;

		let voffset = slideRect.top + this.container.scrollTop;
		this.canvas.style.top = -voffset;

		this.restoreCanvasSnapshot(this.snapshotImage);

	}

    CanvasFreeDrawing.prototype.displacement = function(vectorA, vectorB) {
		let x = vectorB.x - vectorA.x;
		let y = vectorB.y - vectorA.y;
        return {
            x: x,
            y: y,
			length: Math.sqrt(x**2 + y**2),
        }
    }

    CanvasFreeDrawing.prototype.vectorLength = function(vector) {
        return Math.sqrt( (vector.x)**2 + (vector.y)**2 );
    }

    CanvasFreeDrawing.prototype.orientation = function(vectorA, vectorB, weight = 1) {
        const zComponent = vectorA.x * vectorB.y - vectorA.y * vectorB.x;

		// console.log( zComponent );
		// console.log( weight );
		// console.log( zComponent * weight );
        if ( Math.abs( zComponent ) * weight < 0.0001 ) {
            return 0;
        } else {
			// console.log( zComponent * weight );
            return Math.sign( zComponent );
        }
    }

    // CanvasFreeDrawing.prototype.getInflectionPoints = function(vectors, positions) {
    //     let inflectionPoints = [];
    //     let orientations = [];
    //     let prevOrientation = 0;
    //     let orientation;
	// 	const fullLength = vectors.reduce( (sum, entry) => {
	// 		return sum + entry.length;
	// 	}, 0);
	// 	console.log(fullLength);
    //     // for ( let i = 20; i < positions.length; i++ ) {
	// 	for ( let i = 1; i < vectors.length; i++ ) {
	// 		let vectorA = vectors[i];
    //         let vectorB = vectors[i - 1];
    //         // let vectorA = this.displacement(positions[i], positions[i - 10]);
    //         // let vectorB = this.displacement(positions[i - 10], positions[i - 20]);
    //         // console.log(vectorA);
    //         // console.log(vectorB);
    //         orientation = this.orientation( vectorA, vectorB, vectorA.length / fullLength );
    //         if ( orientation != 0 &&  orientation != prevOrientation ) {
    //             orientations.push( orientation );
	// 			// console.log(i + ' ' + vectors.length);
    //             // console.log(orientation);
    //             // inflectionPoints.push( positions[ vectors[i].positionIndex ] );
    //             inflectionPoints.push( positions[ i ] );
    //             prevOrientation = orientation;
    //         }
    //     }
    //     console.log( orientations );
    //     return inflectionPoints;
    // }

	return CanvasFreeDrawing;
}());
