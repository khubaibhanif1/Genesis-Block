var sha256=require('sha256')
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
    constructor(){
        this.chain=[this.cretaeGenesisBlock()];
    }

    cretaeGenesisBlock(){
        var time=Date.now().toString()
        var nonce=block.proofOfWork(time,this.mempool,"0",1)
        var newblock=new block(time,this.mempool,nonce,"0",1)
        console.log('we !create genesis')
        this.mempool=[]
        return newblock
    }

    mineNewBlock(){
        var time=Date.now().toString()
        var prevhx=this.chain[this.chain.length-1].hash
        var nonce=block.proofOfWork(time,this.mempool,prevhx,this.chain.length+1)
        var newblock=new block(time,this.mempool,nonce,prevhx,this.chain.length+1)
        this.chain.push(newblock)
        console.log("hi! we got new blocknumber # "+(this.chain.length-1))
        this.mempool=[]
    }

    createTx(fromAddress, toAddress,value){
        var tx={"from":fromAddress, "to":toAddress,"amount":value}
        this.mempool.push(tx)
    }
    isChainValid(){
        var valid=true
        if(this.chain[0].prevHash !="0" || this.chain[0].height!=1){

            return false;
            
        }
        for (var i=0; i<this.chain.length; i++){
            if(this.chain[i].height != i+1){
                console.log("324 324 324 32 4 324 324 324 32 432 432 4 32 43");
                return false;
            }
            if(this.chain[i-1]?.hash!= this.chain[i]?.prevHash && i !== 0){
                console.log(" MDS SAD SAD AS D SAD SA DSADSA DSA DSA");
                console.log("this.chain[i-1]?.hash");
                console.log(this.chain[i-1]?.hash);
                console.log("this.chain[i]?.prevHash");
                console.log(this.chain[i]?.prevHash);
                console.log(i);
                return false;
            }
            if(this.chain[i].hash != sha256(this.chain[i].timestamp+JSON.stringify(this.chain[i].transactions)+this.chain[i].nonce+this.chain[i].prevHash+this.chain[i].height)){
                console.log(' dgfer dds c dsc ds vfd vfd bfd b fd');
                return false;
			}
        }
        return valid
    }

}

var xyzNetwork= new blockchain();

xyzNetwork.mineNewBlock()
xyzNetwork.mineNewBlock()
console.log(xyzNetwork)

xyzNetwork.createTx("address1","address2",123)
xyzNetwork.createTx("address2","address3",543)


//xyzNetwork.chain[2].transactions[0].from = "affan"
console.log("Is chain Valid--->>  "+xyzNetwork.isChainValid())
