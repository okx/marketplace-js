<h1>@okxweb3/marketplace-library</h1>
  <p>
    @okxweb3/marketplace-library is an SDK that provides general utility capabilities, equipping developers with versatile tools to build and enhance applications effectively.
  </p>

## Installation

```js
npm i @okxweb3/marketplace-library
```

## Usage

### Service

Used to quickly create axios instances, help developers make requests easier, support the get post method, and customize the request header, demo:

```js
import { Service } from '@okxweb3/marketplace-library'
const apiClient = new Service('https://www.okx.com/')

const getSellersPsbt = (options)=> {
    const params = {
      orderIds: options.join()
    }
    const data = await apiClient.get(URL.ORDERS_PSBT, params)
    return data
}
```