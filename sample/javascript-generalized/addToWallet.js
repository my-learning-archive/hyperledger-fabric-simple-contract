'use strict';

const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

const networkRoot = path.resolve(__dirname, '../../test-network');

async function main() {

    try {

        const wallet = await Wallets.newFileSystemWallet('./wallet');

        // these orgs and users are created together with the test-network
        const existingOrgs = [
            {
                name: 'org1.example.com',
                mspId: 'Org1MSP',
                users: ['Admin', 'User1']
            }, {
                name: 'org2.example.com',
                mspId: 'Org2MSP',
                users: ['Admin', 'User1']
            }
        ]

        // for each user in each organization, extract their credentials and add them to the wallet
        for (const org of existingOrgs) {
            const credPath = path.join(networkRoot, '/organizations/peerOrganizations/', org.name, '/users');

            for (const user of org.users) {
                const msp = path.join(credPath, `${user}@${org.name}`, '/msp');
                
                const certFile = path.join(msp, '/signcerts/', fs.readdirSync(path.join(msp, '/signcerts'))[0]);
                const cert = fs.readFileSync(certFile).toString();
                
                const keyFile = path.join(msp, '/keystore/', fs.readdirSync(path.join(msp, '/keystore'))[0]);
                const key = fs.readFileSync(keyFile).toString();
            
                const identity = {
                    credentials: {
                        certificate: cert,
                        privateKey: key,
                       
                    },
                    mspId: org.mspId,
                    type: 'X.509',
                };

                const identityLabel = `${user}@${org.name}`;
                await wallet.put(identityLabel, identity);
            }
        }

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }

}

main();