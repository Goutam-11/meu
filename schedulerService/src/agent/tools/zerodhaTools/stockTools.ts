import { KiteConnect,type Exchanges,type TransactionType,type Product,type OrderType,type Validity } from "kiteconnect";

const apiKey = process.env.KITE_API_KEY ?? "";
const apiSecret = process.env.KITE_API_SECRET ?? "";
const requestToken = process.env.KITE_REQUEST_TOKEN ?? "";

const kc = new KiteConnect({ api_key: apiKey });
await generateSession();

async function generateSession() {
  try {
    const response = await kc.generateSession(requestToken, apiSecret);
    kc.setAccessToken(response.access_token);
    console.log("Session generated:", response);
  } catch (err) {
    console.error("Error generating session:", err);
  }
}

const variety = "regular";
const params = {
  exchange: "BSE" as Exchanges,
  tradingsymbol: "UCOBANK",
  transaction_type: "SELL" as TransactionType,
  quantity: 1,
  validity: "DAY" as Validity,
  product: "CNC" as Product,
  order_type: "MARKET" as OrderType,
  tag: "MyOrder"
}

const orders = await kc.placeOrder(variety, params);
console.log("order response:", orders);