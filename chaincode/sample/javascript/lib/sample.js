'use strict';

const { Contract } = require('fabric-contract-api');

class Sample extends Contract {

    async initLedger(ctx) {
        await ctx.stub.putState("test", "hello-world")
        return "test"
    }

    async writeData(ctx, key, value) {
        await ctx.stub.putState(key, value)
    }

    async readData(ctx, key) {
        var result = await ctx.stub.getState(key)
        return result.toString()
    }

    async deleteData(ctx, key) {
        await ctx.stub.deleteData(key)
    }
        
    async readDataByRange(ctx, keyFrom, keyTo) { 
        const iterator = ctx.stub.getStateByRange(keyFrom, keyTo)
        let results = []
        for await (const res of iterator) { 
            results.push({ 
                key: res.key, 
                value: res.value.toString() 
            }); 
        } 
        return JSON.stringify(results)
    }
}

module.exports = Sample;
