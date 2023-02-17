'use strict';

const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');

const networkRoot = path.resolve(__dirname, '../../test-network');

async function main() {

    try {

        const wallet = await Wallets.newFileSystemWallet('./wallet');

        let args = process.argv.slice(2);

        // first arg is the label of the registrar that will allow the new user to be registered
        const registrarLabel = args[0];
        const orgName = registrarLabel.split('@')[1];
        const orgNameWithoutDomain = orgName.split('.')[0];

        // second arg is the enrollmentID of the user to be registered
        const enrollmentID = args[1];

        // third arg are optional custom attributes that can be set for the registered user (including a password) in JSON format
        let optional = {};
        if (args.length > 2) {
            optional = JSON.parse(args[2]);
        }        
        
        // getting the wallet identity of the registrar
        let registrarIdentity = await wallet.get(registrarLabel);
        if (!registrarIdentity) {
            console.log(`An identity for the registrar user ${registrarLabel} does not exist in the wallet`);
            console.log('Run the enrollUser.js application before retrying');
            return;
        }

        // this is the path where the connection profile of the organization of the registrar is
        let connectionProfile = JSON.parse(
            fs.readFileSync(path.join(
                networkRoot, 'organizations/peerOrganizations', orgName, `/connection-${orgNameWithoutDomain}.json`), 'utf8')
        )

        // connecting to the ca provider and getting context of registrar user
        const ca = new FabricCAServices(connectionProfile['certificateAuthorities'][`ca.${orgName}`].url);
        const provider = wallet.getProviderRegistry().getProvider(registrarIdentity.type);
        const registrarUser = await provider.getUserContext(registrarIdentity, registrarLabel);

        // formalizing a register request to the ca
        let registerRequest = {
            enrollmentID: enrollmentID,
            enrollmentSecret: optional.secret || "",
            role: 'client',
            attrs: optional.attrs || []
        };

        // registering user
        const secret = await ca.register(registerRequest, registrarUser);
        console.log(`Successfully registered the user with the ${enrollmentID} enrollment ID and ${secret} enrollment secret.`);

    } catch (error) {
        console.error(`Failed to register user: ${error}`);
        process.exit(1);
    }

}

main();