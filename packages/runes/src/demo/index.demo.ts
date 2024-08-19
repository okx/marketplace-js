// OkxRunesSDK buy use demo
import { OkxRunesSDK, ADDRESS_TYPE,ORDERS_SORT_RULES } from '../index'

const buyTransation = async () => {
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
    const data = await sdk.api.getOrders({
        // want buy runesId
        runesId: '840000:3',
        // orders sort rules
        sortBy: ORDERS_SORT_RULES.LISTED_TIME_ASC
    });

    // console.log(orders)
    const { txHash, networkFee } = await sdk.buy({
        orderIds: [data.items[0].orderId, data.items[1].orderId],
        paymentUtxos: [{
            "txid": "",
            "vout": 2,
            "value": 116904,
        }],
        networkFeeRate: 10,
    });
    console.log(txHash, networkFee)
}
buyTransation();