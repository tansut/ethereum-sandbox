import * as mocha from "mocha";
import { EtherClient } from "../lib/etherclient";
import SolidityCompiler from "../lib/soliditycompiler";

export default async (client: EtherClient) => {
    let sol = new SolidityCompiler("ethereum/contracts", "ethereum/build");        
    await sol.compile();
    let date = new Date(2021, 8, 31, 14).getTime();
    let acc = client.generateAccount("4a0c5bb099b688176daec36c4df1f01ca00e8b6dff5439b6715b6268ebb64c8f");

    let contracts = await client.deployContracts(acc, "ethereum/build", 
    { 
        Lottery: [client.fromAscii("NewYear"), 240000000, date/1000],
        Bid: [client.fromAscii("Bid1"), date/1000, 240000000, [client.fromAscii('Besiktas'), client.fromAscii('Fenerbahce')]]
    })

    return contracts;
}