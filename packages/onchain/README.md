<h1>@okxweb3/marketplace-onchain</h1>
  <p>
    @okxweb3/marketplace-library is an SDK that provide trading tool methods for each chain to help developers quickly assemble transactions.
  </p>

## Installation

```js
npm i @okxweb3/marketplace-library
```

## Usage

### bitcoin

Includes a tool for generating PSBTs (Partially Signed Bitcoin Transactions) specifically designed for BTC group trading. This feature streamlines the process of assembling, signing, and managing complex transactions, ensuring a secure and efficient trading experience. 

#### `getPsbtPayment`

**Description:**  
Determines the payment details based on the provided Bitcoin address and public key. It identifies the address type and constructs the appropriate script and transaction type.

**Parameters:**

- `address` (string): The Bitcoin address for which payment details are required.
- `publicKey` (string): The public key associated with the address.

**Returns:**  
A `Promise` that resolves to a `PsbtPayment` object.

**Usage Demo:**

```javascript
import { getPsbtPayment } from '@okxweb3/marketplace-onchain'

const paymentDetails = await getPsbtPayment({
  address: 'bc1qexampleaddress',
  publicKey: 'publickeyhexstring'
});
console.log(paymentDetails);
```

#### `getPsbtInput`

**Description:**  
Retrieves input details based on UTXO data and payment information. It constructs the appropriate input configuration for inclusion in a PSBT.

**Parameters:**

- `utxoData` (UtxoData): Data about the unspent transaction output (UTXO).
- `payment` (PsbtPayment): Payment details obtained from `getPsbtPayment`.
- `sighashType` (number, optional): The signature hash type. Defaults to 1.

**Returns:**  
A `Promise` that resolves to a `PsbtInput` object.

**Usage Demo:**

```javascript
import { getPsbtInput } from '@okxweb3/marketplace-onchain'

const inputDetails = await getPsbtInput({
  utxoData: {
    txid: 'transactionid',
    vout: 0,
    rawTransaction: 'rawtransactionhex',
    value: 100000
  },
  payment: paymentDetails
});
console.log(inputDetails);
```

#### `getPsbtSize`

**Description:**  
Calculates the estimated size of a transaction based on the type of Bitcoin address. This helps in estimating the transaction fees.

**Parameters:**

- `walletAddress` (string): The Bitcoin address for which to estimate transaction size.

**Returns:**  
A `number` representing the estimated size of the transaction in bytes.

**Usage Demo:**

```javascript
import { getPsbtSize } from '@okxweb3/marketplace-onchain'

const transactionSize = getPsbtSize('bc1qexampleaddress');
console.log(`Estimated transaction size: ${transactionSize} bytes`);
```

#### `getPsbtOutput`

**Description:**  
Determines the output details based on the specified value and payment information. It constructs the appropriate output configuration for inclusion in a PSBT.

**Parameters:**

- `value` (number): The amount to be transferred in the transaction.
- `payment` (PsbtPayment): Payment details obtained from `getPsbtPayment`.

**Returns:**  
A `Promise` that resolves to a `PsbtOutput` object.

**Usage Demo:**

```javascript
import { getPsbtOutput } from '@okxweb3/marketplace-onchain'

const outputDetails = await getPsbtOutput({
  value: 50000,
  payment: paymentDetails
});
console.log(outputDetails);
```