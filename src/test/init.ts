import * as mocha from "mocha";
import SolidityCompiler from "../lib/soliditycompiler";
import deploycontracts from "./deploycontracts";
import { EtherClient } from "../lib/etherclient";
import { Contract } from "../lib/contract";

export function foo() {
    return "foo";
}
  
mocha.describe('Ethererum Tests', async () => {    
     const client = new EtherClient("http://localhost:7545");  
     let contracts: Contract[]; 

     mocha.before(async ()=> {
        contracts = await deploycontracts(client);
     })

     mocha.describe('Bidding', async () => {          
        mocha.it('should add a verifier', async () => {    
            const contract = <Contract>contracts.find(p=>p.definition.name == 'Bid');
            await client.call(contract, "addVerifier", ["0x745a715e77263efb5F55c09C716BF37f554f18FE"]);
        })    
             

     })

  
    
  });