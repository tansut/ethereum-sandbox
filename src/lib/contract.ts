const fs = require('fs');
import * as path from "path";
import { Account, TransactionConfig, TransactionReceipt } from "web3-core";
import Web3 from "web3";

export class ContractDefinition {    
    readonly name: string;
    readonly compiled: any;

    constructor(public fileName: string) {
        this.compiled = JSON.parse(fs.readFileSync(fileName));
        this.name = path.basename(fileName).replace(path.extname(fileName), '');        
    }

    static fromDir(dir: string): ContractDefinition [] {
        const result = [];
        const contractsFiles: string[] = fs.readdirSync(dir);
        for (let i = 0; i < contractsFiles.length; i++) {            
            let contract = new ContractDefinition(path.resolve(dir, contractsFiles[i]));
            result.push(contract)
        }        
        return result;
    }
}

export class Contract {
    public deployResult?: TransactionReceipt;
    public address?: string;
    public from?: string;
 
    constructor(public definition: ContractDefinition, address?: string) {
        this.address = address;
    }

    setDeployed(receipt: TransactionReceipt) {
        this.deployResult = receipt;
        this.address = receipt.contractAddress;
        this.from = receipt.from;
    }
}

