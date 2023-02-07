package main

import (
	"bytes"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Result struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	valueAsBytes := []byte("hello-world")
	err := ctx.GetStub().PutState("test", valueAsBytes)
	if err != nil {
		return err
	}
	return nil
}

func (s *SmartContract) WriteData(ctx contractapi.TransactionContextInterface, key string, value string) error {
	valueAsBytes := []byte(value)
	err := ctx.GetStub().PutState(key, valueAsBytes)
	if err != nil {
		return err
	}
	return nil
}

func (s *SmartContract) ReadData(ctx contractapi.TransactionContextInterface, key string) (string, error) {
	valueAsBytes, err := ctx.GetStub().GetState(key)
	if err != nil {
		return "", err
	}
	value := bytes.NewBuffer(valueAsBytes).String()
	return value, nil
}

func (s *SmartContract) DeleteData(ctx contractapi.TransactionContextInterface, key string) error {
	err := ctx.GetStub().DelState(key)
	if err != nil {
		return err
	}
	return nil
}

func (s *SmartContract) ReadDataByRange(ctx contractapi.TransactionContextInterface, keyFrom string, keyTo string) ([]Result, error) {
	iterator, err := ctx.GetStub().GetStateByRange(keyFrom, keyTo)
	if err != nil {
		return nil, err
	}
	results := []Result{}
	for iterator.HasNext() {
		queryResponse, err := iterator.Next()
		if err != nil {
			return nil, err
		}
		value := bytes.NewBuffer(queryResponse.Value).String()
		result := Result{Key: queryResponse.Key, Value: value}
		results = append(results, result)
	}
	return results, nil
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create sample chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting sample chaincode: %s", err.Error())
	}
}
