// ==UserScript==
// @name         Agar.Bio Bots Client
// @namespace    agar.bio bots with ai by java
// @version      0.1
// @description  op agar.bio bots
// @author       ~ Java ~#1130
// @match        http://agar.bio/
// @grant        none
// @run-at document-start
// ==/UserScript==

/*
Agar.bio bots made in less than 15 minutes by ~ Java ~#1130 and recoded without proxies
*/

WebSocket.prototype._send = WebSocket.prototype.send; //websocket hooks
WebSocket.prototype.send = function (data) {
    this._send(data);
    this.send = function (data) {
        this._send(data);
        let dv = new DataView(data);

        if (dv.getUint8(0) == 16 && window.agarbio) {
            window.agarbio.x = dv.getFloat64(1, true);
            window.agarbio.y = dv.getFloat64(9, true);
            window.agarbio.packet = dv;
            window.agarbio.server = this.url;
        }
    };
};

window.eachBot = null;

window.agarbio = {
    x: 0, //x default
    y: 0, //y default
    packet: 0,
    server: null,
    timer: null,
    botAmount: 25, //default amount, max = 500 then server crashes xd
    logWsEvent: false, //logs opcode , no needs xd
    botName: "JAVA BOTZ!!",
    StartBots: function () {
        if (eachBot && this.server) {
            let ab = new ArrayBuffer(5 + this.server.length * 2);
            let dv = new DataView(ab);
            dv.setUint8(0, 0xff); //encrypted opcode
            dv.setUint16(1, this.botAmount, true); //send amount

            for (let i = 0; i < this.server.length; i++) {
                dv.setUint16(3 + i * 2, this.server.charCodeAt(i), true);
            }
            dv.setUint16(3 + this.server.length * 2, 0, true);

            eachBot.send(ab);
        }
    }
};

function connectBots() { // connection to bot server
    eachBot = new WebSocket("ws://localhost:8083"); //dont spawn too much bots on local, i recommend ubuntu vps

    eachBot.onclose = onClose;

    eachBot.onopen = () => {
        window.agarbio.timer = setInterval(() => {
            if (eachBot && window.agarbio.packet)
                eachBot.send(window.agarbio.packet);
            else
                clearInterval(window.agarbio.timer);
        }, 250);
    };
}

function onClose() {
    clearInterval(window.agarbio.timer);

    console.log("Error in bots server, retrying to connect in 3 seconds...");
    setTimeout(connectBots, 3000); //3 sec ms
}

document.addEventListener("keydown", (keyEvent) => {
    let key = String.fromCharCode(keyEvent.keyCode);
    if (key == 'E') { // split each bot
        if (eachBot) {
            let ab = new ArrayBuffer(1);
            let dv = new DataView(ab);
            dv.setUint8(0, 0x20); //encrypted opcode for split = 17
            eachBot.send(ab); //send it
        }
    }
    else if (key == 'R') { // eject each bot
        if (eachBot) {
            let ab = new ArrayBuffer(1);
            let dv = new DataView(ab);
            dv.setUint8(0, 0x21); //encrypted opcode for eject = 21
            eachBot.send(ab); //send it
        }
    }
    else if (key == 'P') { // enable ai mode
        if (eachBot) {
            let ab = new ArrayBuffer(1);
            let dv = new DataView(ab);
            dv.setUint8(0, 0x22); //encrypted opcode
            eachBot.send(ab);
        }
    }
    else if (key == 'S') { // startbots function and resend to server
        if (window.agarbio) {
            window.agarbio.StartBots();
        }
    }
});

connectBots(); // apply connection
