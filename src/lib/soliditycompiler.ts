import * as path  from "path";
import { Logger, LogLevel } from "./log";
const solc = require('solc');
const fs = require('fs-extra');


export default class SolidityCompiler {
    public options: any;
    logger: Logger = new Logger();

    static defaultOptions =
        {
            language: 'Solidity',
            sources: [],
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode']
                    }
                }
            }
        }

    public async compile() {
        fs.emptyDirSync(this.buildDir);	
        this.options.sources = this.getFiles2Build();
        this.logger.log(LogLevel.debug, 'compile', 'compile started')
        const compiledContracts = JSON.parse(solc.compile(JSON.stringify(this.options))).contracts;
        this.logger.log(LogLevel.debug, 'compile', 'compile finished')
        for (let contract in compiledContracts) {
            for(let contractName in compiledContracts[contract]) {
                fs.outputJsonSync(
                    path.resolve(this.buildDir, `${contractName}.json`),
                    compiledContracts[contract][contractName],
                    {
                        spaces: 2
                    }
                )
            }
        }
    }

    private getFiles2Build() {      
          const sources: any = {};
          const contractsFiles: string[] = fs.readdirSync(this.contractsDir);
          
          contractsFiles.forEach(file =>  {
            const contractFullPath = path.resolve(this.contractsDir, file);
            sources[file] = {
              content:  fs.readFileSync(contractFullPath, 'utf8')
            };
          });
          
          return sources;    
    }    

    constructor(public contractsDir: string, public buildDir: string, options: any = null) {
        this.options = options || Object.assign({}, SolidityCompiler.defaultOptions);

    }
}