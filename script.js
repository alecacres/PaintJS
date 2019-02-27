const canvas = document.getElementById("paint");
const context = canvas.getContext("2d");
let selectedTool = 'rectangle';
let clicked = {
	x: undefined,
	y: undefined
}

function setSelectedTool(changedTool) {
	selectedTool = changedTool;
}

function setColor(color) {
	context.strokeStyle = color;
}

function setCanvasBounds() {
	if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
		let data = context.getImageData(0, 0, canvas.width, canvas.height);
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		context.putImageData(data, 0, 0);
		state.set();
	}
}

function watchMouse(event) {
	clicked.x = event.layerX;
	clicked.y = event.layerY;
	canvas.addEventListener('mousemove', preview);
}

function preview(event) {
	context.putImageData(state[state.options[state.current]], 0, 0);
	let x2 = event.layerX;
	let y2 = event.layerY;
	tool[selectedTool](clicked.x, clicked.y, x2, y2);
}

let tool = {
	rectangle: function (x1, y1, x2, y2) {
		let width = x2 - x1;
		let height = y2 - y1;
		context.strokeRect(x1, y1, width, height);
	},
	square: function (x1, y1, x2, y2) {
		let width = x2 - x1;
		let height = y2 - y1;
		if (Math.abs(width) < Math.abs(height)) {
			height = height - (height / Math.abs(height)) * (Math.abs(height) - Math.abs(width));
		} else if (Math.abs(width) >= Math.abs(height)) {
			width = width - (width / Math.abs(width)) * (Math.abs(width) - Math.abs(height));
		}
		context.strokeRect(x1, y1, width, height);
	},
	ellipse: function (x1, y1, x2, y2) {

	},
	circle: function (x1, y1, x2, y2) {
		let x = x1;
		let y = y1;
		let radius = Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2, true);
		context.stroke();
	},
	line: function (x1, y1, x2, y2) {
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.closePath();
		context.stroke();
	}
}

let state = {
	alpha: undefined,
	beta: undefined,
	gamma: undefined,
	delta: undefined,
	current: 0,
	options: ["alpha", "beta", "gamma", "delta"],
	tick: 0,
	set: function () {
		do {
			this.tick += this.tick < 3 ? 1 : 0;
			this.current < 3 ? this.current += 1 : this.current = 0;
			this[this.options[this.current]] = context.getImageData(0, 0, window.innerWidth, window.innerHeight);
		} while (this.tick < 3)
	},
	redo: function () {
		if (this.tick < 3) {
			this.tick += 1;
			this.current < 3 ? this.current +=1 : this.current = 0;
			context.putImageData(this[this.options[this.current]], 0, 0);
		}
	},
	undo: function () {
		if (this.tick > 0) {
			this.tick -= 1;
			this.current > 0 ? this.current -=1 : this.current = 3;
			context.putImageData(this[this.options[this.current]], 0, 0);
		}
	}
}

function init() {
	state.set();
	canvas.addEventListener('mousedown', watchMouse);
	window.addEventListener('resize', setCanvasBounds);
	canvas.addEventListener('mouseup', () => {
		canvas.removeEventListener('mousemove', preview);
		state.set();
	});
}


window.onload = init();
