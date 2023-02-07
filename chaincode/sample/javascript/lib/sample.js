'use strict';

const { Contract } = require('fabric-contract-api');

class Sample extends Contract {

    _createCompositeKey(ctx, objType, key) {
        if(!key || key === "") {
            throw new Error(`A key should be a non-empty string`)
        }
        if (objType === ""){
            return key
        }
        return ctx.stub.createCompositeKey(objType, [key])
    }

    async initLedger(ctx) {
        await ctx.stub.putState("test", "hello-world")
        return "test"
    }

    async writeData(ctx, objType, key, value) {
        const compositeKey = this._createCompositeKey(ctx, objType, key)
        await ctx.stub.putState(compositeKey, value)
    }

    async readData(ctx, objType, key) {
        const compositeKey = this._createCompositeKey(ctx, objType, key)
        var result = await ctx.stub.getState(compositeKey)
        return result.toString()
    }

    async deleteData(ctx, objType, key) {
        const compositeKey = this._createCompositeKey(ctx, objType, key)
        await ctx.stub.deleteState(compositeKey)
    }
        
    async readDataByRange(ctx, keyFrom, keyTo) { 
        const iterator = ctx.stub.getStateByRange(keyFrom, keyTo)
        let results = []
        for await (const res of iterator) { 
            results.push({ 
                key: res.key, 
                value: res.value.toString() 
            })
        } 
        return JSON.stringify(results)
    }

    async readDataByType(ctx, objType) {
        const iterator = ctx.stub.getStateByPartialCompositeKey(objType, [])
        let results = []
        for await (const res of iterator) {
            const splitKey = ctx.stub.splitCompositeKey(res.key)
            results.push({ 
                objType: splitKey.objectType, 
                key: splitKey.attributes[0], 
                value: res.value.toString() 
            })
        } 
        return JSON.stringify(results)
    }

    async getDataHistory(ctx, objType, key) {
        const compositeKey = this._createCompositeKey(ctx, objType, key)
        const iterator = ctx.stub.getHistoryForKey(compositeKey)
        let history = []
        for await (const res of iterator) {
            history.push({
                transactionId: res.txId,
                timestamp: res.timestamp,
                value: res.value.toString(),
                isDelete: res.isDelete
            })
        }
        return JSON.stringify({
            objectType: objType,
            key: key,
            values: history
        })
    }
}

module.exports = Sample;
