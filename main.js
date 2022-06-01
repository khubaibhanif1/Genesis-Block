var sha256=require('sha256')
var { v4:uuidv4}=require('uuid')
class block{
    constructor(timestamp,transactions,nonce,prevHash,height){
        this.timestamp=timestamp
        this.transactions=transactions
        this.nonce=nonce
        this.prevHash=prevHash
        this.height=height
        this.hash=this.createHash(timestamp,transactions,nonce,prevHash,height)

    }

    createHash(timestamp,transactions,nonce,prevHash,height){
        return sha256(timestamp+JSON.stringify(transactions)+nonce+prevHash+height)
    }

    static proofOfWork(timestamp,transactions,prevHash,height){
        var nonce=0;
        var difficulty="001"
        var success=true
        while(success){
            nonce++
            var hash=sha256(timestamp+JSON.stringify(transactions)+nonce+prevHash+height)
            if(hash.slice(0,3)==difficulty){
                success=false;
                console.log("hurray we got correct nonse---->"+nonce)
            }

        }
        return nonce;


    }
    

} 

class blockchain{
    mempool=[];
    chain=[];
    constructor(){
        this.chain=[this.createGenesisBlock()];
    }

    createGenesisBlock(){
        var time=Date.now().toString()
        var nonce=block.proofOfWork(time,[],"0",1)
        var newblock=new block(time,[],nonce,"0",1)
        console.log('we !create genesis')
        this.mempool=[]
        //reward transaction
        this.createTx(0x00000,"khubaib",10)
        return newblock
    }

    mineNewBlock(){
        var time=Date.now().toString()
        var prevhx=this.chain[this.chain.length-1].hash
        var nonce=block.proofOfWork(time,this.mempool,prevhx,this.chain.length+1)
        var newbloc=new block(time,this.mempool,nonce,prevhx,this.chain.length+1)
        
        this.chain.push(newbloc)
        console.log("hi! we got new blocknumber # "+(this.chain.length-1))
        console.log(newbloc)
        this.mempool=[]
        //reward transaction
        this.createTx(0x00000,"khubaib",20)
    }

    createTx(fromAddress, toAddress,value){
        var fromBalance=this.getBalance(fromAddress)
        if(fromBalance>value || fromAddress=="0x00000"){
            var tx={
                "txid":uuidv4().split('-').join(""),
                "from":fromAddress,
                "to":toAddress,
                "amount":value
            }
            this.mempool.push(tx)
        }else{
            console.log("insuffcient Balance")
        }
        
    }

    isChainValid(){
        var valid=true
        if(this.chain[0].prevHash !="0" || this.chain[0].height!=1){

            return false;
            
        }
        for (var i=1; i<this.chain.length; i++){
            if(this.chain[i].height != i+1){
                
                return false;
            }
            if(this.chain[i-1].hash != this.chain[i].prevHash){
            
                return false;
            }
            if(this.chain[i].hash != sha256(this.chain[i].timestamp+JSON.stringify(this.chain[i].transactions)+this.chain[i].nonce+this.chain[i].prevHash+this.chain[i].height)){
                
                return false;
			}
        }
        return valid;
    }

    getTransactions(){
        var txs = [];
        
        for (var i = 0; i < this.chain.length; i++) {
            if(typeof(this.chain[i].transactions) != "undefined" && this.chain[i].transactions.length > 0 ){
                console.log("We have some txs in block height --> "+ this.chain[i].height)
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
getBalance(address){
    
    console.log(address);
    var txs=this.getTransactions();
    var balance=0;
    for(var i=0; i<txs.length;i++){
           
        if(txs[i].from==address){
            
            balance -=txs[i].amount;

        }else if(txs[i].to==address){
            balance +=txs[i].amount
        }
        }
        console.log("My balance => " + balance);  
        return balance;

    }
}

 

var xyzNetwork= new blockchain();
console.log(xyzNetwork)

xyzNetwork.mineNewBlock()
xyzNetwork.mineNewBlock()
//console.log(xyzNetwork.chain);
xyzNetwork.createTx("khubaib","khubaib2",1)
xyzNetwork.createTx("khubaib","khubaib4",3)

// xyzNetwork.mineNewBlock()

//xyzNetwork.mineNewBlock()

console.log(xyzNetwork.getTransactions())
console.log(xyzNetwork.getBalance("khubaib"))
console.log(xyzNetwork.chain[xyzNetwork.chain.length-1].height)


//console.log("Is chain Valid--->>  "+xyzNetwork.isChainValid())