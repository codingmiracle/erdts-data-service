const { SerialPort, PacketLengthParser } = require("serialport");
const crypto = require("crypto");

class Session {
    okFlag = "sessionOk"
    endFlag = "sessionEND"

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

        const original_iv = [0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00];
        this.aes_ctx = {
            algorithm: 'aes-256-cbc',
            key: null,
            iv: Buffer.from(original_iv),
            sessionKey: null
        };

        this.onData = null;
    }

    decrypt(data) {
        let decipher = crypto.createDecipheriv(this.aes_ctx.algorithm, this.aes_ctx.key, this.aes_ctx.iv);
        decipher.setAutoPadding(false);
        let decryptedMessage = decipher.update(data);
        decryptedMessage += decipher.final();
        return decryptedMessage
    }

    encrypt(data) {
        let cipher = crypto.createCipheriv(this.aes_ctx.algorithm, this.aes_ctx.key, this.aes_ctx.ivv);
        let cipherText = cipher.update(this.okFlag);
        cipherText = Buffer.concat([data, cipher.final()]);
        return cipherText
    }

    start(token) {
        this.aes_ctx.key = crypto.createHash('sha256').update(token).digest()
        console.log(this.aes_ctx);
        this.port.on('error', console.log);
        this.port.open();

        this.parser.on('data', data => {
            let plaintext = data.slice(3, data.length);
            if (this.aes_ctx.sessionKey == null) {
                console.log("initializing Session:");
                let sessionIv = this.decrypt(plaintext);
                console.log("sessionIv:", sessionIv);
                //generate Sessionkey
                let b = Buffer.concat([this.aes_ctx.key, Buffer.from(sessionIv)]);
                this.aes_ctx.sessionKey = crypto.createHash('sha256').update(b).digest();
                console.log("SessionKey:", this.aes_ctx.sessionKey);
                this.port.write(this.encrypt(this.okFlag));
            } else {
                decryptedMessage = this.decrypt(plaintext);
                if (decryptedMessage == this.endFlag) {
                    this.aes_ctx.sessionKey = null;
                    console.log("quit Session");
                } else {
                    if (this.onData != null) {
                        this.onData(decryptedMessage);
                    } else {
                        console.log(decryptedMessage);
                    }
                }
            }
        });

    }

    close() {
        if (this.port.isOpen) {
            this.port.write(this.encrypt(this.endFlag));
            this.aes_ctx.sessionKey = null;
            this.port.close();
            for (listener in this.parser.listeners('data')) {
                this.parser.removeListener('data');
            }
        }
    }

}

module.exports = {
    Session: Session
}
