// address type
export enum ADDRESS_TYPE {
    SEGWIT_NATIVE = 'segwit_native',
    SEGWIT_NESTED = 'segwit_nested',
    SEGWIT_TAPROOT = 'segwit_taproot',
}

// utxo type
export enum UTXO_SPEND_STATUS {
    SPENDING = 1,
    UNSPEND = 2,
    ALL = 3,
}

// orders sort
export enum ORDERS_SORT_RULES {
    UNIT_PRICE_ASC = 'unitPriceAsc',
    UNIT_PRICE_DESC = 'unitPriceDesc',
    TOTAL_PRICE_ASC = 'totalPriceAsc',
    TOTAL_PRICE_DESC = 'totalPriceDesc',
    LISTED_TIME_ASC = 'listedTimeAsc',
    LISTED_TIME_DESC = 'listedTimeDesc',
}

// cancel sell sign algorithm
export enum SIGN_ALGORITHM {
    ECDSA = 1,
    BIP332 = 2,
}
