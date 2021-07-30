import { Account, TransactionConfig, TransactionReceipt } from "web3-core";
import Web3 from "web3";
import { Transaction } from "ethereumjs-tx";
const fs = require('fs');
import * as path from "path";
import {Contract, ContractDefinition} from "./contract";
import { Logger, LogLevel } from "./log";

export class EtherClient {
    private web3: Web3;
    logger: Logger = new Logger();

    generateAccount(privateKey: string): Account {
        return this.web3.eth.accounts.privateKeyToAccount(privateKey);        
    }

    newAccount(): Account {
        return this.web3.eth.accounts.create()
    }

    fromAscii(source: string) {
        return this.web3.utils.fromAscii(source);
    }

    toAscii(source: string) {
        return this.web3.utils.toAscii(source);
    }    

    async sendPayment(from: Account, to: string, ether: string) {
        let tx: TransactionConfig = {
            from: from.address,
            to: to,
            value: this.web3.utils.toWei(ether, 'ether'),
            gas: 25000,
        };
        let signedTx = await from.signTransaction(tx);
        let result = await this.web3.eth.sendSignedTransaction(<string>signedTx.rawTransaction);
        return result;
    }

    async deployContracts(account: Account, dir: string, args: { [key: string]: any } = {}): Promise<Contract[]> {
        const defs = ContractDefinition.fromDir(dir);
        const result: Contract[] = [];
        for (let i = 0; i < defs.length; i++) {
            const def = defs[i];     
     
            try {                
                let contract = await this.deployContract(account, def, args[def.name] || []);
                result.push(contract);
            } catch (err) {
                console.log(`deploy error: ${def.name}, err:`, err)
            }            
        }

        return result;
    }

    async getAccountBalance(account: Account) {
        return await this.web3.eth.getBalance(account.address);
    }

    async getBalance(address: string) {
        return await this.web3.eth.getBalance(address);
    }


    async deployContract(account: Account,  contractDefinition: ContractDefinition, args = []): Promise<Contract> {
        this.logger.log(LogLevel.debug, 'deploy', `deploying contract ${contractDefinition.name} from ${account.address} `)
        const w3contract = new this.web3.eth.Contract(contractDefinition.compiled.abi);
        const tx = w3contract.deploy({
            arguments: args,
            data: contractDefinition.compiled.evm.bytecode.object
        });

        const signedTx = await account.signTransaction({
            data: tx.encodeABI(),
            gas: await tx.estimateGas()
        });
        let result = await this.web3.eth.sendSignedTransaction(<string>signedTx.rawTransaction);
        let contract = new Contract(contractDefinition)
        contract.setDeployed(result)
        this.logger.log(LogLevel.info, 'deploy', `deployed contract ${contractDefinition.name} from ${account.address} to ${contract.address}`, result)
        return contract;
    }

    async call(contract: Contract, method: string, params: Object[] = [], isProperty = false) {
        const w3contract = new this.web3.eth.Contract(contract.definition.compiled.abi, contract.address);
        let mth: Function = w3contract.methods[method];
        this.logger.log(LogLevel.debug, 'call', `calling ${contract.definition.name}.${method}(${params.join(',')})[${contract.address}]`);
        let result = await mth.apply(null, params).call();
        this.logger.log(LogLevel.info, 'call', `called ${contract.definition.name}.${method}`, result);
        return result;
    }

    async send(account: Account, contract: Contract, method: string, params: Object[] = [], ether: string = '') {
        const w3contract = new this.web3.eth.Contract(contract.definition.compiled.abi, contract.address, {
            from: account.address                    
        });
        let mth: Function = w3contract.methods[method];
        this.logger.log(LogLevel.debug, 'send', `calling ${contract.definition.name}.${method}(${params.join(',')})[${contract.address}] from account ${account.address}`);
        let val = ether ? this.web3.utils.toWei(ether, 'ether'): undefined
        let result = await mth.apply(null, params).send({
            from: account.address,
            value: val,
        });
        this.logger.log(LogLevel.info, 'send', `called ${contract.definition.name}.${method} from ${account.address}`, result);
        return result;
    }    


    constructor(provider: string) {
        this.web3 = new Web3(Web3.givenProvider || provider);
    }
}