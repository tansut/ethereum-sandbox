import Web3 from "web3";
import { Contract, ContractDefinition } from "./lib/contract";
import { EtherClient } from "./lib/etherclient";
import SolidityCompiler from "./lib/soliditycompiler";
const HDWalletProvider = require('truffle-hdwallet-provider');
const path = require('path');
const fs = require('fs-extra');
var Tx = require('ethereumjs-tx');

const provider = new HDWalletProvider(
    'snake curtain ecology input jaguar judge poverty detail cram check suspect skull',
    'http://localhost:7545'
);

//const compiledContract = require('../ethereum/build/Storage.json');

//const web3 = new Web3(provider);

let web3 = new Web3(Web3.givenProvider || "http://localhost:7545");




async function deploy() {
    const compiledContract = require('../ethereum/build/Storage.json');

    const accounts = await web3.eth.getAccounts();

    console.log(`Attempting to deploy from account: ${accounts[0]}`);



    const deployedContract = await new web3.eth.Contract(compiledContract.abi)
        .deploy({
            data: '0x' + compiledContract.evm.bytecode.object,
            arguments: [3, 5]
        })
        .send({
            from: accounts[0],
            gas: 2000000
        });

    console.log(
        `Contract deployed at address: ${deployedContract.options.address}`
    );

    provider.engine.stop();
}


// async function call(abi: string, address: string, method: string, params: Object [] = []) {
//     const contract = new web3.eth.Contract(compiledContract.abi, address, {
//         from: "0x4932BC17567d8be4a7ea4c1204bac0da44E6373d"    
//     });

//         let mth: Function = contract.methods[method];
//         let result = await mth.apply(null, params).call();
//         console.log(result);
//         return result

// }

// async function send(abi: string, address: string, method: string, params: Object [] = []) {
//     const contract = new web3.eth.Contract(compiledContract.abi, address, {
//         from: "0x4932BC17567d8be4a7ea4c1204bac0da44E6373d"    
//     });

//         let mth: Function = contract.methods[method];
//         let result = await mth.apply(null, params).send();
//         console.log(result);
//         return result
// }






async function sendPayment(from: string, to: string, amount: string) {
    let balanceInWei = await web3.eth.getBalance(from);
    const ethBalance = web3.utils.fromWei(balanceInWei, "ether");
    let nonce = await web3.eth.getTransactionCount(from, "pending")
    try {
        let destBalance = await web3.eth.getBalance(to);
        console.log(destBalance)
    } catch (e) {
        console.log(e)
    }

    let details = {
        "to": to,

        gasLimit: web3.utils.toHex(1000000),
        "value": web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
        "nonce": nonce
    }

    let privateKey = "4a0c5bb099b688176daec36c4df1f01ca00e8b6dff5439b6715b6268ebb64c8f";
    var privKey = Buffer.from(privateKey, 'hex');
    var tx = new Tx.Transaction(details);

    tx.sign(privKey);
    var serializedTx = tx.serialize();

    let sentTransaction = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

    console.log(sentTransaction)

    //console.log(sourceBalance, destBalance);
}


// send(compiledContract.abi, "0x40696d065f441c5f2286709cfd326A5EB7f5b2aE", "store", [450]).then(result => {
//     console.log(result)
//      call(compiledContract.abi, "0x40696d065f441c5f2286709cfd326A5EB7f5b2aE", "retrieve").then(result => {
//         process.exit()         
//      });

// });



// sendPayment("0x4932BC17567d8be4a7ea4c1204bac0da44E6373d", "0x40696d065f441c5f2286709cfd326A5EB7f5b2aE", "10").then(r=> {
//     process.exit()
// }).catch(err=> {
//     console.log(err)
// })

//  let acc = web3.eth.accounts.create();

//  console.log(acc);

//  debugger
//compile(getCompilerOptions());

// deploy().then(()=> {
//     console.log('deployed')
// })


// let web3 = new Web3(Web3.givenProvider || "http://localhost:7545");


// async function getAccounts() {
//     let accounts = await web3.eth.getAccounts();
//     return accounts
// }

// async function test() {
//     let accounts = await web3.eth.getGasPrice();
//     return accounts
// }

// test().then(acc => {
//     console.log(acc)
// })   




// let sol = new SolidityCompiler("ethereum/contracts", "ethereum/build");
// sol.compile().then(r=> {
//     console.log(r)
// })

// process.exit(0)



// sol.compile().then(r=> {
//     client.deployContracts(acc, "ethereum/build", {Incrementer: [987] }).then(r=>{
//         console.log(r);

//     }).catch(console.log)
// }).catch(err=>console.log(err))






async function doit() {
    let client = new EtherClient("http://localhost:7545");
    let acc = client.generateAccount("4a0c5bb099b688176daec36c4df1f01ca00e8b6dff5439b6715b6268ebb64c8f");
    let sol = new SolidityCompiler("ethereum/contracts", "ethereum/build");

    await sol.compile();
    let date = new Date(2021, 8, 31, 14).getTime();
    let contracts = await client.deployContracts(acc, "ethereum/build", 
    { 
        Lottery: [client.fromAscii("NewYear"), 240000000, date/1000],
        Bid: [client.fromAscii("Bid1"), date/1000, 240000000, [client.fromAscii('Besiktas'), client.fromAscii('Fenerbahce')]]
    })

    // let def = new ContractDefinition(path.resolve("ethereum/build/Lottery.json"));
    // let contract = new Contract(def, "0x41CBc71FB1b74055D5D92fe0E5E685e5531d8220");

    const contract = <Contract>contracts.find(p=>p.definition.name == 'Bid');

    console.log('Balance of account is', await client.getAccountBalance(acc));
    await client.call(contract, "addVerifier", ["0x745a715e77263efb5F55c09C716BF37f554f18FE"]);
    await client.send(acc, contract, "bid", [1], "0.25");
    await client.send(acc, contract, "bid", [0], "0.00035");
    await client.call(contract, "candidates", [0]);
    await client.send(acc, contract, "setScores", [[9, 3]]);
    await client.call(contract, "candidates", [0]);
    console.log('Balance of account is', await client.getAccountBalance(acc));
    console.log('Balance of contract is', await client.getBalance(<string>contract.address));

    await client.send(acc, contract, "claim");
    
    console.log('Balance of account is', await client.getAccountBalance(acc));
    console.log('Balance of contract is', await client.getBalance(<string>contract.address));
}



doit().then(r => {
    console.log('done');
    process.exit(0)
}).catch(console.log)
