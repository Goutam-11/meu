import ccxt from "ccxt";

console.log(process.env.DELTA_API_KEY)
const exchange = new ccxt.delta({
  apiKey: process.env.DELTA_API_KEY,
  secret: process.env.DELTA_API_SECRET,
  urls: {
    api: {
      public: 'https://cdn-ind.testnet.deltaex.org',
      private: 'https://cdn-ind.testnet.deltaex.org'
    }
  }
});
// const coin = "SOLUSD";
// await exchange.loadMarkets ();

// const ticker = await exchange.fetchTicker (coin);

// const last_price = ticker['last'];
// let stop_loss_trigger_price = 0;
// let take_profit_trigger_price = 0;

// if (last_price !== undefined) {
//   stop_loss_trigger_price = last_price * 0.95;
//   take_profit_trigger_price = last_price * 1.05;
// }
// console.log("stop loss trigger price:", stop_loss_trigger_price);
// console.log("take profit trigger price:", take_profit_trigger_price);

// // when symbol's price reaches your predefined "trigger price", stop-loss order would be activated as a "market order". but if you want it to be activated as a "limit order", then set a 'price' parameter for it
// const params = {
//   "bracket_stop_loss_price": stop_loss_trigger_price,
//   "bracket_take_profit_price": take_profit_trigger_price,
//   "bracket_stop_trigger_method": "mark_price"
// };
// const newParams = {
//   "reduce_only": true
// }

// console.log("order: ",await exchange.createMarketBuyOrder("ETHUSD", 1, ));
// console.log("open order:",await exchange.fetchTrades(coin))
// console.log("open orders: ",await exchange.cancelAllOrders("ETHUSD"));
// console.log("positions closed: ",await exchange.cancelOrder("2152114932",coin));
console.log(new Date())
