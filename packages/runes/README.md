# @okxweb3/marketplace-runes

`@okxweb3/marketplace-runes` is an SDK designed for Runes trading. It provides a comprehensive set of tools and interfaces to facilitate interaction with the OKX Runes marketplace.

## Installation

Install the SDK using npm:

```bash
npm i @okxweb3/marketplace-runes
```

## Usage

### Initialization

import `OkxRunesSDK` from `@okxweb3/marketplace-runes` and new it. Pass in the required parameters as well.

To generate the necessary parameters, please refer to the [OKX Developer Management Platform](https://www.okx.com/zh-hans/web3/build/docs/waas/introduction-to-developer-portal-interface#generate-api-keys). Here's a usage example:

```javascript
import { OkxRunesSDK, ADDRESS_TYPE } from '@okxweb3/marketplace-runes'

const sdk = new OkxRunesSDK({
    privateKey: '',  // Your wallet private key for signing transactions
    apikey: '',      // API Key obtained from your application
    secretKey: '',   // Secret Key obtained from your application
    passphrase: '',  // Passphrase created during key application
    addressType: ADDRESS_TYPE.SEGWIT_TAPROOT,  // Wallet address type for buying runes
    projectId: '',   // Project ID created during project application
    requestBaseUrl: '' // okx other website eg: https://www.ouyicn.com/, default is http://www.okx.com/
})
```

**Parameter Details:**


| Field Name     | Type   | Required | Description                                                                                                                                                                                  |
| -------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apikey         | String | Yes      | API Key from your application. See how to generate it[ here](https://www.okx.com/zh-hans/web3/build/docs/waas/introduction-to-developer-portal-interface#generate-api-keys).                 |
| secretKey      | String | Yes      | Secret Key from your application. See how to generate it[ here](https://www.okx.com/zh-hans/web3/build/docs/waas/introduction-to-developer-portal-interface#generate-api-keys).              |
| passphrase     | String | Yes      | Passphrase created during key application. See how to generate it[ here](https://www.okx.com/zh-hans/web3/build/docs/waas/introduction-to-developer-portal-interface#generate-api-keys).     |
| projectId      | String | Yes      | Project ID created during project application. See how to generate it[ here](https://www.okx.com/zh-hans/web3/build/docs/waas/introduction-to-developer-portal-interface#generate-api-keys). |
| privateKey     | String | Yes      | Your wallet private key used for signing transactions.                                                                                                                                       |
| addressType    | String | Yes      | Wallet address type for buying runes.<br />You can import `ADDRESS_TYPE` from `@okxweb3/marketplace-runes` and use it.                                                                      |
| requestBaseUrl | String | NO       | The domain name used to request the api.<br />okx other website eg: https://www.ouyicn.com/, default is http://www.okx.com/                                                                  |

### Buying Runes

The SDK supports automatic assembly of purchase transactions, allowing you to obtain the transaction hash (`txHash`) and network fee. Here's how you can use it:

```javascript
const buyRunes = async () => {
  const { txHash, networkFee } = await sdk.buy({
     orderIds: [orderId1, orderId2],  // OKX Runes order IDs, you can get orderId by sdk.api.getOrders()
     paymentUtxos: [{                 // UTXOs for transaction assembly
       "txid": "ca79143aea5e22f6cfe8d57c5af6be39fecc7afd5ee931a2060f3fef8754ee15",
       "vout": 3,
       "value": 175136,
     }],
     networkFeeRate: 5,  // Desired network fee rate
   });
}
await buyRunes();
```

**Parameter Details:**


| Field Name     | Type   | Required | Description                                                                                                                                                                                                                                                                           |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orderIds       | Array  | Yes      | Runes order id list                                                                                                                                                                                                        |
| paymentUtxos   | Array  | Yes      | UTXOs used to assemble the purchase transaction. Ensure they contain no other assets and that the total amount covers the order and network fees.<br />You can get your address utxo from[ here](https://docs.unisat.io/dev/unisat-developer-center/general/addresses/get-btc-utxo) |
| networkFeeRate | Number | Yes      | The desired network fee rate.                                                                                                                                                                                                                                                         |

### Cancel Runes Orders

The SDK supports automatic assembly of off-shelf transactions, allowing multiple orders to be canceled at the same time. Here's how you can use it:

```javascript
await sdk.cancelSell({
  orderIds: [orderId1, orderId2],  // OKX Runes order IDs, you can get orderId by sdk.api.getOrders()
});
```

**Parameter Details:**


| Field Name     | Type   | Required | Description                                                                                                                                                                                                                                                                           |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| orderIds       | Array  | Yes      | Runes order id list                                                   |

### API

The SDK provides several APIs to query transaction-related information. For detailed parameter usage, please refer to the [Runes API](https://docs.google.com/document/d/1-1PDayNKPMRO58weA6cEIYO59FxP6gzAVWlXIXSKQLM/edit#heading=h.veb5bcvk3m6o).

#### getOrders

Retrieve orders from the OKX marketplace using this API.
The detailed response interface can be found in [Runes API](https://docs.google.com/document/d/1-1PDayNKPMRO58weA6cEIYO59FxP6gzAVWlXIXSKQLM/edit#heading=h.veb5bcvk3m6o).
Here's demo:

```javascript
import { ORDERS_SORT_RULES } from '@okxweb3/marketplace-runes'

const requestApi = async () => {
  const data = await sdk.api.getOrders({
    runesId: '840000:3',  // Desired Runes ID
    sortBy: ORDERS_SORT_RULES.UNIT_PRICE_ASC  // Sorting rule
  });

  // data structure demo, you can get orderId

  // {
  //     "cursor": "1",
  //     "items": [
  //         {
  //           "amount": "889806",
  //           "orderId": 201268,
  //           "ticker": "DOG•GO•TO•THE•MOON",
  //           "tickerId": "840000:3",
  //           "totalPrice": {
  //               "price": "0.05472306",
  //               "satPrice": "5472306",
  //           },
  //           "unitPrice": {
  //               "price": "0.0000000615",
  //               "satPrice": "6.15",
  //           },
  //         }
  //     ]
  //   }

}
await requestApi();
```

**Parameter Details:**


| Field Name | Type   | Required | Description                                                                                                                                                                                                                                                 |
| ---------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| runesId    | String | Yes      | Unique identifier for the Runes token                                                                                                                                                                                                                       |
| cursor     | String | No       | Cursor for retrieving order sequence numbers (max 1000)                                                                                                                                                                                                     |
| limit      | Number | No       | Page size, default 10, max 100. Specifies the maximum number of orders returned.                                                                                                                                                                            |
| sortBy     | String | No       | Sorting rule, default is ascending by unit price.<br />Options include: unitPriceAsc, unitPriceDesc, totalPriceAsc, totalPriceDesc, listedTimeAsc, listedTimeDesc.  <br />You can import`ORDERS_SORT_RULES` from `@okxweb3/marketplace-runes` and use it. |

#### getSellersPsbt

Use this API to obtain seller PSBTs for OKX marketplace orders. Note that the PSBTs do not include the seller's signature.
The detailed response interface can be found in [Runes API](https://docs.google.com/document/d/1-1PDayNKPMRO58weA6cEIYO59FxP6gzAVWlXIXSKQLM/edit#heading=h.veb5bcvk3m6o).
Here's demo:

```javascript
const requestApi = async () => {
  // you can get orderId by sdk.api.getOrders()
  const data = await sdk.api.getSellersPsbt([orderId1, orderId2]);

  // data structure demo, you can get seller PSBT from sellerPSBT

  // {
  //   "orderInfos":[
  //     {
  //       "orderId": 11111,
  //       "sellerPSBT": "cHNidP8BAPW+W04EtAAAAAA="，
  //       "orderSource": 34,   //34 - OKX  82-Xverse
  //       "makerFeeAddress": "feeAddress", //platform makerFee address
  //       "makerFee": "0.003", // 0.003 BTC
  //       "takerFeeAddress": "feeAddress", //platform takerFee address
  //       "takerFee": "0.003", // 0.003 BTC
  //     }
  //   ],
  // }

}
await requestApi();
```

**Parameter Details:**


| Field Name | Type  | Required | Description |
| ---------- | ----- | -------- | ----------- |
| orderIds   | Array | Yes      | Order IDs   |

#### sendTransactions

Broadcast Runes purchase transactions with this API to obtain the transaction hash (`txHash`).
The detailed response interface can be found in [Runes API](https://docs.google.com/document/d/1-1PDayNKPMRO58weA6cEIYO59FxP6gzAVWlXIXSKQLM/edit#heading=h.veb5bcvk3m6o).
Here's demo:

```javascript
const requestApi = async () => {
  const data = await sdk.api.sendTransations({ 
    buyerPSBT: psbt, 
    fromAddress: address, 
    orderIds 
  });
  // data structure demo, you can get buy transation txHash

  // {
  //   "txHash": "1",
  // }
}
await requestApi();
```

**Parameter Details:**


| Field Name  | Type   | Required | Description                                                                                                 |
| ----------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| fromAddress | String | Yes      | Buyer's payment address                                                                                     |
| orderIds    | Array  | Yes      | IDs of the orders to purchase                                                                               |
| buyerPSBT   | String | Yes      | Signed buyer PSBT, must be in base64 format, and assembled according to the specified transaction structure |

#### getOwnedAsserts

Get the runes assets from the OKX marketplace using this API.
The detailed response interface can be found in [Runes API](https://www.okx.com/zh-hans/web3/build/docs/waas/marketplace-runes-asset).
Here's demo:

```javascript
const requestApi = async () => {
  const data = await sdk.api.getOwnedAsserts({
    runesId: '840000:3',  // Desired Runes ID
  });

  // data structure demo

  // {
  //   "cursor": "1",
  //   "items": [
  //     {
  //       "amount": "500000",
  //       "assetId": "28912795273673038",
  //       "chain": 0,
  //       "confirmations": null,
  //       "inscriptionNum": "",
  //       "listTime": 1714399069,
  //       "name": "DOG•GO•TO•THE•MOON",
  //       "orderId": 201296,
  //       "ownerAddress": "bc1p3fj806enwnmz04444mpm42ykgdcta9p5mvzx46hp8wmg2knpwxpq0k46x9",
  //       "status": 1,
  //       "symbol": "🐕",
  //       "ticker": "DOG•GO•TO•THE•MOON",
  //       "tickerIcon": "https://static.coinall.ltd/cdn/web3/currency/token/1714125941761.png/type=png_350_0",
  //       "tickerId": "840000:3",
  //       "tickerType": 4,
  //       "totalPrice": {
  //       "currency": "BTC",
  //       "currencyUrl": "https://static.coinall.ltd/cdn/nft/4834651a-7c4e-4249-91c1-cf680af39dc0.png",
  //       "price": "0.031895",
  //       "satPrice": "3189500",
  //       "usdPrice": "1979.7003235"
  //     },
  //       "txHash": "",
  //       "unavailable": null,
  //       "unitPrice": {
  //       "currency": "BTC",
  //       "currencyUrl": "https://static.coinall.ltd/cdn/nft/4834651a-7c4e-4249-91c1-cf680af39dc0.png",
  //       "price": "0.00000006379",
  //       "satPrice": "6.379",
  //       "usdPrice": "0.003959400647"
  //     },
  //       "utxoTxHash": "ce302f5c946ff3ef502eade58405d64b545d59de9fcd731314b88ddadf709ca6",
  //       "utxoValue": "546",
  //       "utxoVout": 2
  //     }
  //   ]
  // }

}
await requestApi();
```

**Parameter Details:**


| Field Name | Type   | Required | Description                                                                                                                                                                                                                                                 |
| ---------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| runesId    | String | Yes      | Unique identifier for the Runes token                                                                                                                                                                                                                       |

### Middleware

Middleware allows you to access wallet addresses derived from the private key and public key for transaction assembly. It also provides pre-purchase parameters and post-purchase results, enabling actions throughout the purchase lifecycle.

```javascript
import { OkxRunesSDK } from '@okxweb3/marketplace-runes'

const sdk = new OkxRunesSDK()

// Register middleware
sdk.use(async (ctx, next) => {
  console.log(`Calling ${ctx.type} with params: `, ctx)
  await next()
  console.log(`Result of ${ctx.type}: `, ctx)
})
```
