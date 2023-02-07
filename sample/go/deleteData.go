/*
Copyright 2020 IBM All Rights Reserved.

SPDX-License-Identifier: Apache-2.0

Adapted by duartegithub
*/

package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/hyperledger/fabric-sdk-go/pkg/core/config"
	"github.com/hyperledger/fabric-sdk-go/pkg/gateway"
)

func main() {

	// parsing arguments
	args := os.Args
	if len(args) != 2 {
		fmt.Printf("Incorrect number of arguments! Try <key>")
		os.Exit(1)
	}
	key := args[1]

	os.Setenv("DISCOVERY_AS_LOCALHOST", "true")

	// Create a new file system based wallet for managing identities.
	wallet, err := gateway.NewFileSystemWallet("wallet")
	if err != nil {
		fmt.Printf("Failed to create wallet: %s\n", err)
		os.Exit(1)
	}

	// Check to see if we've already enrolled the user.
	if !wallet.Exists("appUser") {
		fmt.Printf("An identity for the user 'appUser' does not exist in the wallet")
		fmt.Printf("Run the registerUser.go application before retrying")
		os.Exit(1)
	}

	// load the network configuration
	ccpPath := filepath.Join(
		"..",
		"..",
		"test-network",
		"organizations",
		"peerOrganizations",
		"org1.example.com",
		"connection-org1.yaml",
	)

	// Create a new gateway for connecting to our peer node.
	gw, err := gateway.Connect(
		gateway.WithConfig(config.FromFile(filepath.Clean(ccpPath))),
		gateway.WithIdentity(wallet, "appUser"),
	)
	if err != nil {
		fmt.Printf("Failed to connect to gateway: %s\n", err)
		os.Exit(1)
	}
	defer gw.Close()

	// Get the network (channel) our contract is deployed to.
	network, err := gw.GetNetwork("mychannel")
	if err != nil {
		fmt.Printf("Failed to get network: %s\n", err)
		os.Exit(1)
	}

	// Get the contract from the network.
	contract := network.GetContract("sample")

	// Submit the specified transaction (submitTransaction logs transaction in the blockchain).
	result, err := contract.SubmitTransaction("DeleteData", key)
	if err != nil {
		fmt.Printf("Failed to submit transaction: %s\n", err)
		os.Exit(1)
	}
	_ = result
	fmt.Println(`Transaction has been submitted!`)
}
