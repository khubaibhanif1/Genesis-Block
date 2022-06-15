var sha256 = require('sha256')
var { v4: uuidv4 } = require('uuid')
var EC = require('elliptic').ec
var ec = new EC('secp256k1');
class block {
    constructor(timestamp, transactions, nonce, prevHash, height) {
        this.timestamp = timestamp
        this.transactions = transactions
        this.nonce = nonce
        this.prevHash = prevHash
        this.height = height
        this.hash = this.createHash(timestamp, transactions, nonce, prevHash, height)

    }

    createHash(timestamp, transactions, nonce, prevHash, height) {
        return sha256(timestamp + JSON.stringify(transactions) + nonce + prevHash + height)
    }

    static proofOfWork(timestamp, transactions, prevHash, height) {
        var nonce = 0;
        var difficulty = "001"
        var success = true
        while (success) {
            nonce++
            var hash = sha256(timestamp + JSON.stringify(transactions) + nonce + prevHash + height)
            if (hash.slice(0, 3) == difficulty) {
                success = false;
                console.log("hurray we got correct nonse---->" + nonce)
            }

        }
        return nonce;


    }


}

class Transaction {
   // sign = null;
    constructor(fromAddress, toAddress, amount) {
        this.txid = uuidv4().split('-').join("")
        this.from = fromAddress
        this.to = toAddress
        this.amount = amount
        this.sign = null;

    }
}

class blockchain {
    mempool = [];
    chain = [];
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        var time = Date.now().toString()
        var nonce = block.proofOfWork(time, [], "0", 1)
        var newblock = new block(time, [], nonce, "0", 1)
        console.log('we !create genesis')
        this.mempool = []
        //reward transaction
        var rewardTx = new Transaction("0x00000", "khubaib", 10)
        this.createTxAndSign(null, rewardTx)
        return newblock
    }

    mineNewBlock() {
        var time = Date.now().toString()
        var prevhx = this.chain[this.chain.length - 1].hash
        var nonce = block.proofOfWork(time, this.mempool, prevhx, this.chain.length + 1)
        var newbloc = new block(time, this.mempool, nonce, prevhx, this.chain.length + 1)

        this.chain.push(newbloc)
        console.log("hi! we got new blocknumber # " + (this.chain.length - 1))
        console.log(newbloc)
        this.mempool = []
        //reward transaction
        var rewardTx = new Transaction("0x00000", "khubaib", 20)
        this.createTxAndSign(null, rewardTx)
    }

    createTxAndSign(key, txObj) {
        if (txObj.from != "0x00000") {
            var keyFromPriv = ec.keyFromPrivate(key, 'hex')
            var publicKey = keyFromPriv.getPublic().encode('hex');
            // console.log(publicKey)
            if (this.getBalance(publicKey) < txObj.amount) {
                return "insufficent balance"
            }
            if (publicKey == txObj.from) {
                var signTx = keyFromPriv.sign(JSON.stringify(txObj))
                var signatureHash = signTx.toDER();
                txObj.sign = signatureHash
                this.mempool.push(txObj)
            }else {

                return "invalid signature"
            }
        }else{
            this.mempool.push(txObj)
        }


    }

    validateTx(txObj) {
        var fromKey = txObj.from
        var signhash = txObj.sign
        var msg = txObj
        msg.sign = null
        var pubKey = ec.keyFromPublic(fromKey, 'hex')
        return pubKey.verify(JSON.stringify(msg), signhash)
    }

    isChainValid() {
        var valid = true
        if (this.chain[0].prevHash != "0" || this.chain[0].height != 1) {

            return false;

        }
        for (var i = 1; i < this.chain.length; i++) {
            if (this.chain[i].height != i + 1) {

                return false;
            }
            if (this.chain[i - 1].hash != this.chain[i].prevHash) {

                return false;
            }
            if (this.chain[i].hash != sha256(this.chain[i].timestamp + JSON.stringify(this.chain[i].transactions) + this.chain[i].nonce + this.chain[i].prevHash + this.chain[i].height)) {

                return false;
            }
        }
        return valid;
    }

    getTransactions() {
        var txs = [];

        for (var i = 0; i < this.chain.length; i++) {
            if (typeof (this.chain[i].transactions) != "undefined" && this.chain[i].transactions.length > 0) {
                console.log("We have some txs in block height --> " + this.chain[i].height)
                for (var j = 0; j < this.chain[i].transactions.length; j++) {
                    var tempTx = this.chain[i].transactions[j]
                    tempTx.blockHeight = this.chain[i].height;
                    tempTx.confirmations = this.chain.length - i;
                    txs.push(tempTx)
                }
            }
        }
        return txs;

    }
    getBalance(address) {

        //console.log(address)
        var txs = this.getTransactions();
        var balance = 0;
        for (var i = 0; i < txs.length; i++) {

            if (txs[i].from == address) {

                balance -= txs[i].amount;

            } else if (txs[i].to == address) {
                balance += txs[i].amount
            }
        }
        console.log("My balance => " + balance);
        return balance;

    }
}


module.exports = { blockchain, Transaction }

var xyzNetwork = new blockchain();
console.log(xyzNetwork.getBalance("khubaib"))
console.log(xyzNetwork);



// xyzNetwork.mineNewBlock()



xyzNetwork.mineNewBlock()
xyzNetwork.mineNewBlock()

var newTx = new Transaction("045736f6a888c32832ad09683e50919a78fecba5b192b5b1ed4e8413ffca3c3401fc60ed5a795bf88497bf11af903341c9f4a42247f03137aa43af469ae4d5343e", "address2", 15)


xyzNetwork.createTxAndSign("0bcdc02443814b5021f75ce117f732460e268127eac5b13540b9c660a5adcf76",newTx)

console.log("----------------------------------");
console.log(xyzNetwork.getTransactions())



//console.log(xyzNetwork.chain);
// xyzNetwork.createTxAndSign("0x00000", "khubaib2", 10)
// xyzNetwork.createTxAndSign("0x00000","khubaib4",5)

// xyzNetwork.mineNewBlock()



// console.log(xyzNetwork.getTransactions())
console.log(xyzNetwork.getBalance("khubaib"))
// console.log(xyzNetwork.chain[xyzNetwork.chain.length-1].height)


//console.log("Is chain Valid--->>  "+xyzNetwork.isChainValid())