package main

import (
	"bytes"
	"errors"
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

type ResultWithType struct {
	ObjType string `json:"objType"`
	Key     string `json:"key"`
	Value   string `json:"value"`
}

type AssetStatus struct {
	TransactionId string `json:"transactionId"`
	Timestamp     string `json:"timestamp"`
	Value         string `json:"value"`
	IsDelete      bool   `json:"isDelete"`
}

type HistoryResult struct {
	ObjType     string        `json:"objType"`
	Key         string        `json:"key"`
	AssetStatus []AssetStatus `json:"assetStatus"`
}

func _CreateCompositeKey(ctx contractapi.TransactionContextInterface, objType string, key string) (string, error) {
	if key == "" {
		err := errors.New("A key should be a non-empty string")
		return "", err
	}
	if objType == "" {
		return key, nil
	}
	return ctx.GetStub().CreateCompositeKey(objType, []string{key})
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	valueAsBytes := []byte("hello-world")
	err := ctx.GetStub().PutState("test", valueAsBytes)
	if err != nil {
		return err
	}
	return nil
}

func (s *SmartContract) WriteData(ctx contractapi.TransactionContextInterface, objType string, key string, value string) error {
	compositeKey, err := _CreateCompositeKey(ctx, objType, key)
	if err != nil {
		return err
	}
	valueAsBytes := []byte(value)
	err = ctx.GetStub().PutState(compositeKey, valueAsBytes)
	if err != nil {
		return err
	}
	return nil
}

func (s *SmartContract) ReadData(ctx contractapi.TransactionContextInterface, objType string, key string) (string, error) {
	compositeKey, err := _CreateCompositeKey(ctx, objType, key)
	if err != nil {
		return "", err
	}
	valueAsBytes, err := ctx.GetStub().GetState(compositeKey)
	if err != nil {
		return "", err
	}
	value := bytes.NewBuffer(valueAsBytes).String()
	return value, nil
}

func (s *SmartContract) DeleteData(ctx contractapi.TransactionContextInterface, objType string, key string) error {
	compositeKey, err := _CreateCompositeKey(ctx, objType, key)
	if err != nil {
		return err
	}
	err = ctx.GetStub().DelState(compositeKey)
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

func (s *SmartContract) ReadDataByType(ctx contractapi.TransactionContextInterface, objType string) ([]ResultWithType, error) {
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(objType, []string{})
	if err != nil {
		return nil, err
	}
	results := []ResultWithType{}
	for iterator.HasNext() {
		res, err := iterator.Next()
		if err != nil {
			return nil, err
		}
		result := ResultWithType{
			ObjType: objType,
			Key:     res.Key,
			Value:   bytes.NewBuffer(res.Value).String()}
		results = append(results, result)
	}
	return results, nil
}

func (s *SmartContract) GetDataHistory(ctx contractapi.TransactionContextInterface, objType string, key string) (HistoryResult, error) {
	compositeKey, err := _CreateCompositeKey(ctx, objType, key)
	if err != nil {
		return HistoryResult{"", "", nil}, err
	}
	iterator, err := ctx.GetStub().GetHistoryForKey(compositeKey)
	if err != nil {
		return HistoryResult{"", "", nil}, err
	}
	results := []AssetStatus{}
	for iterator.HasNext() {
		res, err := iterator.Next()
		if err != nil {
			return HistoryResult{"", "", nil}, err
		}
		result := AssetStatus{
			TransactionId: res.TxId,
			Timestamp:     res.Timestamp.String(),
			Value:         bytes.NewBuffer(res.Value).String(),
			IsDelete:      res.IsDelete}
		results = append(results, result)
	}
	history := HistoryResult{
		ObjType:     objType,
		Key:         key,
		AssetStatus: results}
	return history, nil
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
