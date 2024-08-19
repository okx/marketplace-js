// api use demo
import { OkxRunesSDK, ADDRESS_TYPE, ORDERS_SORT_RULES } from '../index'

const sdk = new OkxRunesSDK({
    privateKey: '',
    apikey: '',
    secretKey: '',
    passphrase: '',
    addressType: ADDRESS_TYPE.SEGWIT_TAPROOT,
    projectId: '',
    requestBaseUrl: 'https://www.cnouyi.studio/'
})

sdk.use(async (ctx, next) => {
    // before
    console.log(`call ${ctx.type} params: `, JSON.stringify(ctx))
    // execute
    await next()
    // after
    console.log(`call ${ctx.type} result: `, JSON.stringify(ctx))
})

// get okx orders
const getOrders = async () => {
    const data = await sdk.api.getOrders({
        // want buy runesId
        runesId: '840000:3',
        // orders sort rules
        sortBy: ORDERS_SORT_RULES.LISTED_TIME_ASC
    });
    return data
}

// get okx orders seller psbt
const getOrdersSellerPsbt = async () => {
    const orders = await getOrders();
    const psbts = await sdk.api.getSellersPsbt([orders.items[0].orderId, orders.items[1].orderId]);
    return psbts
}
getOrdersSellerPsbt();

// send transatiion demo 
const sendPsbtTransation = async () => { 
    const { txHash } = await sdk.api.sendTransations({
        buyerPSBT: '',
        fromAddress: '',
        orderIds: [12345, 67890]
    })
    return txHash
}
sendPsbtTransation()