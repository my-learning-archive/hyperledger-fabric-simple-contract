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

Both the smart contract and application that interacts with the Hyperledger Fabric are equally implemented in both Javascript and Go.

Take a brief look at the [`./chaincode/sample/javascript/lib/sample.js`](./chaincode/sample/javascript/lib/sample.js) (Javascript chaincode) or the [`./chaincode/sample/go/sample.go`](./chaincode/sample/go/sample.go) (Go chaincode) files, before starting the next steps - this is where the **smart contract** is implemented with simple transactions:
1. `initLedger()` - set to automatically execute right after the commit of the smart contract
2. `writeData()` - to **write** an asset to the ledger
3. `readData()` - to **read** an asset from the ledger
4. `deleteData()` - to **delete** an asset from the ledger
5. `readDataByRange()` - to **read** a range of assets from the ledger
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

---
**To use the Javascript application**, prepare the environment as follows:

> `cd ./sample/javascript/` \
> `npm install`

To submit transactions to the distributed ledger, first, one must enroll an admin, and register a user:

> `node enrollAdmin.js` \
> `node registerUser.js`

To submit the `writeData()` and `readData()` transactions to the distributed ledger:

> `node writeData.js <objType> <key> <value>` <---- write data to the ledger \
> `node readData.js <objType> <key>` <---- read data from the ledger

Be mindful that `writeData.js` and `readData.js` implement the API for the ledger, and the file names in this example match the names of the transactions they are requesting. This is a convenience and is not mandatory.

There is also an implementation of a **generalized Javascript application**, available [here](./sample/javascript-generalized/).

---
**To use the Go application**, prepare the environment as follows:

> `cd ./sample/go/` \
> `go mod tidy`

To submit transactions to the distributed ledger, first, one must register a user:

> `go run registerUser.go`

To submit the `writeData()` and `readData()` transactions to the distributed ledger:

> `go run writeData.go <objType> <key> <value>` <---- write data to the ledger \
> `go run readData.go <objType> <key>` <---- read data from the ledger

Once again, `writeData.go` and `readData.go` implement the API for the ledger, and the file names in this example match the names of the transactions for convenience.

---
The couchDB Docker container is accessible at port 5984, so you may access `localhost:5984/_utils` in any web browser, to visualize couchDB. The default admin passwords are used: *admin* - *adminpw*. The database *mychannel_sample* contains the ledger entries of our application.

---
**TODO:**
- Better understand the admin enrollment and user registering, as those were directly borrowed from the *fabcar* example.
- Try different hyperledger fabric network schemes (different number of peers, organizations, etc)

