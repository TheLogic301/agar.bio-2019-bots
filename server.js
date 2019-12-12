/*
Agar.bio bots made in less than 15 minutes by ~ Java ~#1130 and recoded without proxies
*/

const WebSocket = require('ws');
const Colors = require('colors');

var xPos = 0,
yPos = 0,
collectpellets = false; // default

class Node {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.size = 0;
		this.id = 0;
		this.color = null;
		this.flags = 0;
		this.name = null;
	}
}

class Client { //define function ai
	constructor() {
		this.ws = null;
		this.playerNodes = [];
		this.playerNodeIds = [];
		this.allNodes = [];
		this.eatingEvents = [];
	}

	connect(server) { //serevr connection
		this.ws = new WebSocket(server);
		this.ws.binarytype = 'nodebuffer';
		this.ws.onopen = this.onOpen.bind(this);
		this.ws.onerror = this.onError.bind(this);
		this.ws.onmessage = this.onMessage.bind(this);
		this.ws.onclose = this.onClose.bind(this);
	}

	send(msg) { //send buffers function
		if (this.ws && this.ws.readyState == WebSocket.OPEN) this.ws.send(msg);
	}

	agarbio(name) { //send spawn with name function
		let buf = new Buffer(name.length * 2 + 1);
		buf.writeUInt8(0, 0); //spawn opcode 0,0
		buf.write(name, 1, name.length, 'ucs2');

		this.send(buf);
	}

	sendMove(x, y) {
		let buf = new Buffer(21);

		buf.writeUInt8(0x10, 0); //encrypted opcode but is 16, 0
		buf.writeDoubleLE(x, 1);
		buf.writeDoubleLE(y, 9);
		buf.writeUInt32LE(0, 17);

		this.send(buf);
	}

	splitbot() { //split bot in agar.bio is opcode 17
		let buf = new Buffer(1);
		buf.writeUInt8(17, 0);

		this.send(buf);
	}

	ejectbot() { //eject bot in agar.bio is opcode 21
		let buf = new Buffer(1);
		buf.writeUInt8(21, 0);

		this.send(buf);
	}

	onOpen() {
		let buf = new Buffer(5);

		buf.writeUInt8(254, 0);
		buf.writeUInt32LE(5, 1);

		this.send(buf);

		buf.writeUInt8(255, 0);
		buf.writeUInt32LE(1332175218, 1); //i got from their core

		this.send(buf);
		
	setInterval(() => { // major fix
	     this.agarbio('JAVA BOTZ!!'); //xd
          }, 1000);
	}

	onClose() {}

	onError() {}

	handleWorldUpdate(buf) {
		let off = 0;
		if (buf.readUInt8(off++) != 16) return false;

		let eatRecordLength = buf.readUInt16LE(off);
		off += 2;

		this.eatingEvents = [];
		for (let i = 0; i < eatRecordLength; i++) {
			this.eatingEvents.push({
				eater: buf.readUInt32LE(off),
				victim: buf.readUInt32LE(off + 4)
			});

			off += 8;
		}

		while (true) {
			let n = new Node();

			n.id = buf.readUInt32LE(off);
			off += 4;
			if (!n.id) break;

			n.x = buf.readInt16LE(off);
			off += 2;
			n.y = buf.readInt16LE(off);
			off += 2;
			n.size = buf.readInt16LE(off);
			off += 2;

			n.color = {
				r: buf.readUInt8(off++),
				g: buf.readUInt8(off++),
				b: buf.readUInt8(off++)
			};

			n.flags = buf.readUInt8(off++);

			if (n.flags & 2) off += 4;
			if (n.flags & 4) off += 8;
			if (n.flags & 8) off += 16;

			let ch = 0;
			n.name = '';
			do {
				n.name += String.fromCharCode((ch = buf.readUInt16LE(off)));
				off += 2;
			} while (ch != 0);

			if (this.allNodes.hasOwnProperty(n.id)) {
				this.allNodes[n.id] = n;
			} else {
				this.allNodes[n.id] = n;
			}
		}

		let removeQueueLength = buf.readUInt32LE(off);
		off += 4;
		for (let i = 0; i < removeQueueLength; i++) {
			let id = buf.readUInt32LE(off);
			off += 4;

			if (this.allNodes.hasOwnProperty(id)) {
				delete this.allNodes[id];
			}
		}

		if (collectpellets) {
			let xPos = 0,
				yPos = 0,
				count = 0,
				smallestSize = 10000;

			for (let i = 0; i < this.playerNodeIds.length; i++) {
				if (this.allNodes.hasOwnProperty(this.playerNodeIds[i])) {
					let node = this.allNodes[this.playerNodeIds[i]];
					xPos += node.x;
					yPos += node.y;
					if (node.size < smallestSize) smallestSize = node.size;
					count++;
				}
			}

			xPos /= count;
			yPos /= count;

			let followNode = null;

			let bestDistance = 10000.0;

			Object.keys(this.allNodes).forEach(key => {
				let node = this.allNodes[key];
				if (node.size < smallestSize * 0.85) {
					let dist = Math.abs(node.x - xPos) + Math.abs(node.y - yPos);
					if (dist < bestDistance) {
						bestDistance = dist;
						followNode = node;
					}
				}
			});

			if (followNode) {
				this.sendMove(followNode.x, followNode.y);
			}
		} else {
			this.sendMove(xPos, yPos);
		}

		return true;
	}

	onMessage(msg) {
		msg = msg.data;
		let opcode = msg.readUInt8(0);
		switch (opcode) {
			case 16: //opcode 16 for later ezz
				try {
					if (!this.handleWorldUpdate(msg)) this.ws.close();
				} catch (e) {}
				break;
			case 32: //opcode 32 for collect pellet
				this.playerNodeIds.push(msg.readUInt32LE(1));
				break;
		}
	}
}

const wss = new WebSocket.Server({ port: 8083 }); // server port
var javacons = [];

wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		let opcode = message.readUInt8(0);
		console.log(`GOT MOVEMENT PACKET, START BOTS!`.blue); //log if bots can move or not yet
		let off = 1;
		switch (opcode) {
			case 0x10: //encrypted opcode
				xPos = message.readDoubleLE(1);
				yPos = message.readDoubleLE(9);
				break;
			case 0x20: //encrypted opcode
				for (let i = 0; i < javacons.length; i++) {
					javacons[i].splitbot();
				}
				break;
			case 0x21: //encrypted opcode
				for (let i = 0; i < javacons.length; i++) {
					javacons[i].ejectbot();
				}
				break;
			case 0x22: //encrypted opcode
				collectpellets = !collectpellets;
				break;
			case 0xff: //encrypted opcode
				if (javacons.length > 0) {
					break;
				}

				let ip = '',
					ch = 0;
				let amount = 0;

				amount = Math.min(message.readUInt16LE(off), 500);
				off += 2;

				while (true) {
					ch = message.readUInt16LE(off);
					off += 2;
					if (!ch) break;
					ip += String.fromCharCode(ch);
				}

				console.log(ip, amount);

				for (let i = 0; i < amount; i++) {
					let c = new Client();

					c.connect(ip);
					javacons.push(c);
				}
				break;
			case 0xfe: //encrypted opcode
				javacons = [];
				break;
		}
	});
});
