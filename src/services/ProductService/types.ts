

/*
b	base asset
q	quote asset
o	open price
h	high price
l	low price
c	latest price
pm	parent market
pn	category of the parent market
"s": "NEOBTC",
"st": "TRADING",
"b": "NEO",
"q": "BTC",
"ba": "",
"qa": "฿",
"i": 0.01,
"ts": 0.000001,
"an": "NEO",
"qn": "Bitcoin",
"o": 0.001017,
"h": 0.00103,
"l": 0.000996,
"c": 0.001012,
"v": 151629.95,
"qv": 153.85206175,
"y": 0,
"as": 151629.95,
"pm": "BTC",
"pn": "BTC",
"cs": 65000000
 */
export type ProductItem = {
    "s": string,
    "st": string,
    "b": string;
    "q": string;
    "ba": string;
    "qa": string;
    "i": number;
    "ts": number;
    "an": string;
    "qn": string;
    "o": number;
    "h": number;
    "l": number;
    "c": number;
    "v": number;
    "qv": number;
    "y": number;
    "as": number;
    "pm": string;
    "pn": string;
    "cs": number;
};

export type ProductResponse = {
    data: ProductItem[];
    success: boolean;
    code?: string;
    message?: string
    messageDetail?: string
};
