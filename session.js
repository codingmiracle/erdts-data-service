const { SerialPort, PacketLengthParser } = require("serialport");
const crypto = require("crypto");

class Session {

    constructor(config) {
        this.port = new SerialPort({
            path: config.interface, baudRate: config.baudRate, autoOpen: false
        });

        this.parser = this.port.pipe(new PacketLengthParser({
            delimiter: 0xaa,
            packetOverhead: 3,
            lengthBytes: 2,
            lengthOffset: 1,
            maxLen: 1024
        }));

        this.data = new Array();
    }

    start(token) {

        const original_iv = [0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00];

        const aes_ctx = {
            algorithm: 'aes-256-cbc',
            key: crypto.createHash('sha256').update(token).digest(),
            iv: Buffer.from(original_iv),
            sessionKey: null
        };

        console.log(aes_ctx);
        this.port.on('error', console.log);
        this.port.open();

        this.parser.on('data', data => {
            let plaintext = data.slice(3, data.length);
            console.log("plaintext:", plaintext);

            if (aes_ctx.sessionKey == null) {
                console.log("initializing Session:");
                let decipher = crypto.createDecipheriv(aes_ctx.algorithm, aes_ctx.key, aes_ctx.iv);
                decipher.setAutoPadding(false);
                let sessionIv = decipher.update(plaintext);
                sessionIv += decipher.final();
                console.log("sessionIv:", sessionIv);

                //generate Sessionkey
                let b = Buffer.concat([aes_ctx.key, Buffer.from(sessionIv)]);
                aes_ctx.sessionKey = crypto.createHash('sha256').update(b).digest();
                console.log("SessionKey:", aes_ctx.sessionKey);

                //send OK Flag
                let cipher = crypto.createCipheriv(aes_ctx.algorithm, aes_ctx.sessionKey, aes_ctx.iv);
                let cipherText = cipher.update("OK");
                cipherText = Buffer.from(cipherText + cipher.final());
                console.log("encryptedMessage:", cipherText);
                this.port.write(cipherText);
            } else {
                let decipher = crypto.createDecipheriv(aes_ctx.algorithm, aes_ctx.sessionKey, aes_ctx.iv);
                decipher.setAutoPadding(false);
                let decryptedMessage = decipher.update(plaintext);
                decryptedMessage += decipher.final();
                console.log("decryptedMessage:", decryptedMessage);

                this.data.push(decryptedMessage);
            }
        });
        
    }

    close() {
        if(this.port.isOpen) {
            // send close Flag
            this.port.close();
            this.parser.removeAllListeners();
        }
    }

}

module.exports = {
    Session: Session
}
