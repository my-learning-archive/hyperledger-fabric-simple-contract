# Simple Hyperledger Fabric App

This was a small project to learn the basics of Hyperledger Fabric. 
It derives from the *fabcar* example provided with the [fabric-samples](https://github.com/hyperledger/fabric-samples). 

Also took the chance to learn a little bit of Golang, as I've never used the language before.

**Requirements:**
- Docker 
- Docker Compose v2
- NodeJS + Go
- Hyperledger Fabric (we have used version 2.2.2)

---
Before starting, here is what each directory in this repository contains:
- `./chaincode` - the chaincode implementing the **smart contract** of our application
- `./sample` - our application, which will interact with the Hyperledger Fabric
- `./test-network` - the configuration of a test Hyperledger Fabric network where we will deploy our application - directly borrowed from the [fabric-samples](https://github.com/hyperledger/fabric-samples)

---

To test if Docker is installed, run the hello-world image from Dockerhub:

> `docker run hello-world`

To download the Hyperledger Fabric binaries and necessary Docker images, run the following command in the root directory of the project:

> `curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s -- 2.2.2 1.4.9 -s`

The chaincode implemented in both Javascript and Go. Take a brief look at the [`./chaincode/sample/javascript/lib/sample.js`](./chaincode/sample/javascript/lib/sample.js) (Javascript chaincode) or the [`./chaincode/sample/go/sample.go`](./chaincode/sample/go/sample.go) (Go chaincode) files, before starting the next steps - this is where the **smart contract** is implemented with simple transactions:
1. `initLedger()` - set to automatically execute right after the commit of the smart contract
2. `writeData()` - to **write** an asset to the ledger
3. `readData()` - to **read** an asset from the ledger
4. `deleteData()` - to **delete** an asset from the ledger
5. `readDataByRange()` - to **read** a range of assets from the ledger (does not support composite keys)
6. `readDataByType()` - to **read** all assets of a given type (partial composite key)
7. `getDataHistory()` - to **read** the history of changes to a given asset (as logged in the blockchain)

To deploy the fabric network with your preferred language (Javascript or Go):

> `cd ./sample/` \
> `./startFabric.sh <language>`

When executing this script, be mindful of the CLI logging, as it provides valuable insight! The script will: 
1. Create the Hyperledger Fabric network (as defined in the [`./test-network/`](./test-network/) directory)
2. install and commit the chaincode in the associated peers 
3. Execute the `initLedger()` transaction

The application is chaincode-language-agnostic. This means, if you previously installed the Go chaincode, you can very well submit/evaluate transactions through an application written in Javascript, and vice-versa. 

Let's focus on the generalized CLI application written in javascript - to prepare the environment:

> `cd ./sample/javascript/` \
> `npm install`

Transactions are submited on behalf of users. By default, the test-network already registers some users, but let's ignore those for now. To register a user, one must do so on behalf of a *registrar*. However, the registrar itself also needs to be registered on behalf of another registrar. So, for the network to be started, there must exist an initial registrar for the system - Hyperledger Fabric makes sure this user exists - the default credentials are admin:adminpw. 

Enrolling a user pulls the credentials we need to act on behalf of that user, to our local *wallet*. So, let us enroll our initial registrar, without extra options:

> **`node enrollUser.js <label> <username> <secret> <options>`** \
> `node enrollUser.js 'CAAdmin@org1.example.com' admin adminpw`

Now, we can use our registrar to allow the registration of a new regular user, with the extra option of having a secret - notice that these extra options are specified in JSON format:

> **`node registerUser.js <registrar-label> <new-uname> <options>`** \
> `node registerUser.js 'CAAdmin@org1.example.com' 'User2@org1.example.com' '{"secret": "userpw"}'`

Now that we have registered a user, we can enroll that user - pull its credentials onto our wallet, so we can act on behalf of him:

> `node enrollUser.js 'User2@org1.example.com' 'User2@org1.example.com' userpw`

Let us submit a write and a read transactions, on behalf of `User1@org1.example.com`. Notice that, the arguments to the transaction are specified in JSON format, with the tag "args". To submit transactions to the distributed ledger on behalf of a user:

> **`node submitAnyTransaction.js <user-label> <function-name> <arguments>`** \
> `node submitAnyTransaction.js 'User2@org1.example.com' writeData '{"args":["Trade","trade1","value1"]}'` \
> `node submitAnyTransaction.js 'User2@org1.example.com' readData '{"args":["Trade","trade1"]}'` \
> `...`