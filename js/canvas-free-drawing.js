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
		event.preventDefault();
		this.pointerType = 'mouse';
		if (event.button !== 0)
		return;

		this.isDrawing = true;
		this.context.beginPath();
		this.context.moveTo(event.offsetX, event.offsetY);
	};

	CanvasFreeDrawing.prototype.touchStart = function (event) {
		event.preventDefault();
		if (typeof event.touches[0].touchType != 'undefined' && event.touches[0].touchType == 'direct' ) {
			this.pointerType = 'direct';
			return 0; // no finger drawing;
		} else if (event.targetTouches.length > 0 ) {
			this.pointerType = 'stylus';
			this.isDrawing = true;
			var _a = event.targetTouches[0], pageX = _a.pageX, pageY = _a.pageY;
			var x = pageX - this.canvas.offsetLeft;
			var y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.output.scrollTop;
			this.context.beginPath();
			this.context.moveTo(x, y);
		}
	};

    CanvasFreeDrawing.prototype.mouseMove = function (event) {
		event.preventDefault();
        this.pointerType = 'mouse';
        clearTimeout(this.timer);

        this.timer = setTimeout(this.curveSmoothing.bind(this), 250);
		this.handleDrawing(event.offsetX, event.offsetY);
	};

	CanvasFreeDrawing.prototype.touchMove = function (event) {
		event.preventDefault();
		if (typeof event.touches[0].touchType != 'undefined' && event.touches[0].touchType == 'direct' ) {
			return 0; // no finger drawing;
		} else if (event.targetTouches.length == 1 && event.changedTouches.length == 1 ) {
			this.pointerType = 'stylus';

			var _a = event.changedTouches[0], pageX = _a.pageX, pageY = _a.pageY;
			var x = pageX - this.canvas.offsetLeft;
			var y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.output.scrollTop;

			clearTimeout(this.timer);
			this.timer = setTimeout(this.curveSmoothing.bind(this), 250);
			this.handleDrawing(x, y, event.touches[0].force);
		}
	};

	CanvasFreeDrawing.prototype.curveSmoothing = function() {
		if (this.positions.length > 1) {
			// console.log(this.positions);
			const positions = this.positions.slice();
			setTimeout(() => {
				this.storeSnapshot();
				this.undo();
				canvasUndos.pop();

				const firstDerivatives = this.differentiate(positions);

				if (firstDerivatives.length == 0) { return; }

				// const secondDerivatives = this.differentiate(firstDerivatives, 1, true, true);
				//
				// if (secondDerivatives.length == 0) { return; }

				// console.log(firstDerivatives);
				// // console.log(secondDerivatives);
				//
				// console.log('stationaryPoints');
				// console.log(this.stationaryPoints(firstDerivatives));

				const stationaryPoints = [ positions[0] ];
				stationaryPoints[0].isSpline = true;
				this.stationaryPoints(firstDerivatives).forEach( index => {
					stationaryPoints.push( positions[index] );
				});
				stationaryPoints.push( positions[positions.length - 1] );

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
				// console.log('steps: ' + steps);

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
						if ( index % smoothFactor == 0 && index + smoothFactor > positions.length - 1) {
							position.x = positions[positions.length - 1].x;
							position.y = positions[positions.length - 1].y;
							position.endPoint = true;
						}
					});
					this.positions = positions;
				}
				this.handleStroke(this.positions);
			});
		}
	};

    CanvasFreeDrawing.prototype.mouseUp = function (event) {
        event.preventDefault();
        clearTimeout(this.timer);
        if (this.positions.length == 0) {
            this.handleDrawing(event.offsetX, event.offsetY, 10);
		}
		this.handleEndDrawing();
	};


	CanvasFreeDrawing.prototype.touchEnd = function (event) {
		event.preventDefault();
		clearTimeout(this.timer);
		if (this.positions.length == 0) {
			const _a = event.changedTouches[0], pageX = _a.pageX, pageY = _a.pageY;
			const x = pageX - this.canvas.offsetLeft;
			const y = pageY - this.canvas.offsetTop - this.canvasNode.offsetTop + this.output.scrollTop;
            this.handleDrawing(x, y, 10);
		}
		this.handleEndDrawing();
	};

	CanvasFreeDrawing.prototype.handleEndDrawing = function () {
		// console.log('handleEndDrawing');
		this.isDrawing = false;
		this.storeSnapshot();
		this.positions = [];
	};

	CanvasFreeDrawing.prototype.handleDrawing = function (x, y, force = this.mouseForce) {
        if (this.isDrawing) {
			this.storeDrawing(x, y, true, force, this.isErasing);
			this.draw(this.positions);
			canvasUndos = [];
		}
	};

	CanvasFreeDrawing.prototype.handleStroke = function (positions) {
		if (this.isDrawing) {
			if (!positions[0].isSpline) {
				this.draw(positions, positions.length - 1);
			} else {
				this.pseudoSpline(positions);
			}
		}
	};


	CanvasFreeDrawing.prototype.draw = function (positions, offset = 0) {
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

			if ( positions.length > 1 && index > 0) { // % 2 == 0 && i > 3
				if ( index % smoothFactor == 0 && index >= smoothFactor ) {
					let endX, endY;
					endX = position.endPoint ? x : ( x + positions[index - smoothFactor].x )/2;
					endY = position.endPoint ? y : ( y + positions[index - smoothFactor].y )/2;
					this.context.quadraticCurveTo(positions[index - smoothFactor].x, positions[index - smoothFactor].y,
						endX,
						endY
					);
					this.context.stroke();
					this.context.beginPath();
					this.context.moveTo(endX, endY);
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
	CanvasFreeDrawing.prototype.storeDrawing = function (x, y, moving, force = 0, isErasing = false) {
		this.positions.push({
			x: x,
			y: y,
			moving: moving,
			lineWidth: this.lineWidth,
			strokeColor: this.strokeColor,
			force: force,
			endPoint: false,
			smoothFactor: this.pointerType == 'mouse' ? 4 : 1,
			isErasing: isErasing,
			isSpline: false,
		});
	};

	CanvasFreeDrawing.prototype.storeSnapshotImage = function () {
		console.log('storeSnapshotImage');
		this.snapshotImage = this.getCanvasSnapshot();
		// console.log(this.snapshotImage);
	};

	CanvasFreeDrawing.prototype.storeSnapshot = function () {
		// console.log('storeSnapshot');
		canvasSnapshots.push(this.positions);
		// console.log(canvasSnapshots);
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
	        this.restoreCanvasSnapshot(this.snapshotImage);
			canvasUndos.push( canvasSnapshots.pop() );
			// canvasUndos = canvasUndos.splice(-Math.abs(this.maxSnapshots));

			canvasSnapshots.forEach(positions => {
				this.context.beginPath();
				if (positions.length) {
					if (!positions[0].isSpline) {
						this.draw(positions, positions.length - 1);
					} else {
						this.pseudoSpline(positions);
					}
				} else {
					this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
				}
			});
			this.imageRestored = true;
		}
	};
	CanvasFreeDrawing.prototype.redo = function () {
		if (canvasUndos.length > 0) {
			let positions = canvasUndos.pop();
			if (positions.length) {
				if (!positions[0].isSpline) {
					this.draw(positions, positions.length - 1);
				} else {
					this.pseudoSpline(positions);
				}
				canvasSnapshots.push(positions);
				// canvasSnapshots = canvasSnapshots.splice(-Math.abs(this.maxSnapshots));
			}
		}
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
					x: normalized ? ( length > 0 ? dx/length : 0 ) : dx,
					y: normalized ? ( length > 0 ? dy/length : 0 ) : dy,
					length: length,
                    position: i,
				});
			}
		}
		return derivatives;
	}

    CanvasFreeDrawing.prototype.stationaryPoints = function(firstDerivatives) {
		let stationaryPoints = [];
        const fullLength = firstDerivatives.reduce( (sum, entry) => {
            return sum + entry.length;
        }, 0);
        let candidate = 0;
        let prev = 0;
        let localLength = 0;
        let dy = 0;
        for (let i = 0; i < firstDerivatives.length; i++ ) {
            dy += firstDerivatives[i].y * firstDerivatives[i].length;
            if ( firstDerivatives[i].y == 0 && firstDerivatives[i].x != 0 ) {
				if (localLength == 0 && (Math.abs(dy) > fullLength*0.05)) {
                    candidate = firstDerivatives[i].position;
                    // console.log(candidate);
                }
                localLength += firstDerivatives[i].length;
            } else {
                // console.log(candidate);
                if ( localLength > 2 && candidate != prev) {
                    stationaryPoints.push(candidate);
                    // console.log(stationaryPoints);
                    prev = candidate;
                    dy = 0;
                }
                localLength = 0;
            }
        }
        return stationaryPoints;
	}

	return CanvasFreeDrawing;
}());
