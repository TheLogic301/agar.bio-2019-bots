/* 
Agar.bio bots made in less than 15 minutes by ~ Java ~#1130
*/

const WebSocket = require('ws');
const Socks = require('socks');
const Fs = require('fs');
const Colors = require('colors');

let botProxies = Fs.readFileSync("Socks.txt", "utf8").split("\n");
let botIps = 1;
let serverIP = 'ws://37.187.76.129:11025'; // AGAR.BIO FFA7 SERVER IP
let botName = '10 FREE BOTS!!';
let botAmount = 10; //default bot amount
let logWsEvent = false;
let bots = [];
let botCount = botAmount;
let opcode_254 = new Buffer([254, 1, 0, 0, 0]);
let opcode_255 = new Buffer([255, 114, 97, 103, 79]);
//let gameVersion = new Buffer([255, 6, 71, 111, 116, 97, 32, 87, 101, 98, 32, 50, 46, 48, 46, 53, 0]);

function socksAgent(id) {
  let proxy = botProxies[Math.floor(id / botIps)].split(":");
  return new Socks.Agent({
    proxy: {
      ipadress: proxy[0],
      port: parseInt(proxy[1]),
      type: parseInt(proxy[2]) || 5
    }
  });
}

class Bot { //defines each bot
  constructor(id) {
    this.id = id;
    this.ws = null;
    this.botIds = [];
    this.botOptions = { headers: { //headers
      'Origin': 'http://agar.bio',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
    },
    agent: this.agent,
   };
    this.agent = socksAgent(this.id);
    this.nickID = botName;
    this.connect();
  }
  
  connect() {
    //if (this.ws) this.ws.close();
	  
    this.ws = new WebSocket(serverIP, this.botOptions);
    this.ws.binaryType = 'nodebuffer';
    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
  }
  
  send(buf) {
    if (this.ws && this.ws.readyState == 1) this.ws.send(buf);
    console.log(`Send ${new Uint8Array(buf)}`);
  }
  
  agarbio() {
      let buf = new Buffer(1 + ((this.nickID.length + 1) * 2));
      buf.writeUInt8(0, 0);
      for (let i = 0; i < this.nickID.length; i++) buf.writeUInt8(this.nickID.charCodeAt(i), 1 + 2 * i);
     // for (let i = 1;i < this.nickID.length; i++) buf.writeUInt16LE(this.nickID.charCodeAt(i), i * 2);
      this.send(buf);
     // this.send(new Buffer([0, 0, 0]));
  }
  
  sendMove(x, y) { //for later xd opcode 16 ezz
    let buf = new Buffer(5);
    buf.writeUInt8(16, 0);
    buf.writeInt16LE(x, 1);
    buf.writeInt16LE(y, 3);
    this.send(buf);
  }
  
  onOpen() {
    if(!this.ws && this.ws.readyState !== 1) return;
    console.log('connection to bot server is open!'.green + this.id);
    botCount++;
    this.send(opcode_254);
    this.send(opcode_255);
  //  this.send(gameVersion);
   // this.send(new Buffer([71]));
    //setInterval(this.send.bind(this), 3e4, new Buffer([71]));
   // this.sendCaptcha(this.nickID);
	  
     setInterval(() => { // major fix
	this.agarbio();
		// this.sendPing();
		// this.sendSpectate();
     }, 1000); // send every 1ms
  }
  
  onError(e) {
    if(logWsEvent) console.log(`Bot ${this.id}: webSocket errored!`.red);
    this.ws.close();
    setInterval(this.connect.bind(this), 1500);
  }
  
  onClose(e) {
    if(logWsEvent) console.log(`Bot ${this.id}: webSocket closed!`.red);
    botCount--;
    //console.log(botCount);
  }
  
  onMessage(msg) { //client backend
    if (!this.ws) return;
    let buf = new Buffer(msg.data);
    let opcode = buf.readUInt8(0);
    console.log(opcode);
    switch (opcode) {
      case 2:
        break;
        
      case 70:
        this.botIds.push(buf.readUInt32LE(1));
        break;
      
      case 49:
        break;
        
      case 64:
        break;
    }
  }
}

function connectBots() {
    for(let i = 0; i < botAmount;i++) {
        let c = new Bot(i);
        bots.push(c);
    }
}

connectBots();
console.log(`[SERVER] Agar.bio Beta Bots by Java started up! BotsName: ${botName}`.green);
