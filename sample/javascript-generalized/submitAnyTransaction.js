'use strict'

const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');

const networkRoot = path.resolve(__dirname, '../../test-network');

async function main() {

    const gateway = new Gateway();
    const wallet = await Wallets.newFileSystemWallet('./wallet');

    try {
        
        let args = process.argv.slice(2);

        // first arg is the label of the creator of the transaction
        const identityLabel = args[0];
        const orgName = identityLabel.split('@')[1];
        const orgNameWithoutDomain = orgName.split('.')[0];

        // second arg is the name of the transaction
        const functionName = args[1];

        // third arg are the arguments of the transaction + any other optional args, in JSON format
        let optional = {};
        if (args.length > 2) {
            optional = JSON.parse(args[2]);
        }
        let chaincodeArgs = optional.args || [];

        // this is the path where the connection profile of the organization of the transaction creator is
        let connectionProfile = JSON.parse(
            fs.readFileSync(path.join(
                networkRoot, 'organizations/peerOrganizations', orgName, `/connection-${orgNameWithoutDomain}.json`), 'utf8'
            )
        )

        // setting the connection options
        let connectionOptions = {
            identity: identityLabel,
            wallet: wallet,
            discovery: {enabled: true, asLocalhost: true}
        };

        // connecting to the Hyperledger Fabric gateway, using channel "mycnannel" and contract "sample"
        await gateway.connect(connectionProfile, connectionOptions);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('sample');

        // submitting transaction
        const response = await contract.submitTransaction(functionName, ...chaincodeArgs);
        if (`${response}` != '') {
            console.log(`Response from ${functionName}: ${response}`);
        }

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
    } finally {
        console.log('Disconnect from the gateway.');
        gateway.disconnect();
    }
}

main();