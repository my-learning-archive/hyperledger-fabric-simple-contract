'use strict';

const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');

const networkRoot = path.resolve(__dirname, '../../test-network');

async function main() {

    try {

        let args = process.argv.slice(2);

        // first arg is the label of the user to be enrolled (this user must be registered first)
        const identityLabel = args[0];
        const orgName = identityLabel.split('@')[1];
        const orgNameWithoutDomain = orgName.split('.')[0];
        const orgNameCapitalized = orgNameWithoutDomain.charAt(0).toUpperCase() + orgNameWithoutDomain.slice(1);

        // second and third args are the user and password of the registered user
        const enrollmentID = args[1];
        const enrollmentSecret = args[2];

        // fourth arg are optional custom attributes that can be set for the enrolled user
        let enrollmentAttributes = [];
        if (args.length > 3) {
            enrollmentAttributes = JSON.parse(args[3]);
        }

        // verify if the identity of the enrolled user already exists in the wallet
        const wallet = await Wallets.newFileSystemWallet('./wallet');
        let identity = await wallet.get(identityLabel);
        if (identity) {
            console.log(`An identity for the ${identityLabel} user alread exists in the wallet`);
            return;
        }

        // this is the path where the connection profile of the organization of the enrolling user is
        let connectionProfile = JSON.parse(
            fs.readFileSync(path.join(
                networkRoot, 'organizations/peerOrganizations', orgName, `/connection-${orgNameWithoutDomain}.json`), 'utf8'
            )
        )

        // connecting to the ca provider
        const ca = new FabricCAServices(connectionProfile['certificateAuthorities'][`ca.${orgName}`].url);
    
        // creating an enrollment object
        let enrollmentRequest = {
            enrollmentID: enrollmentID,
            enrollmentSecret: enrollmentSecret,
            attr_reqs: enrollmentAttributes
        };
        const enrollment = await ca.enroll(enrollmentRequest);

        // creating an identity for the wallet
        identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${orgNameCapitalized}MSP`,
            type: 'X.509',
        };

        // adding identity to wallet
        await wallet.put(identityLabel, identity);

    } catch (error) {
        console.error(`Failed to enroll user: ${error}`);
        process.exit(1);
    }

}

main();