import { tool } from "ai";
import type { Exchange } from "ccxt";
import z from "zod";

type Param = {
  bracket_stop_loss_price?: number;
  bracket_take_profit_price?: number;
  bracket_stop_trigger_method?: string;
}
export function getCryptoTools({ exchange }: { exchange: Exchange }) {
  return {
    createBuyOrder: tool({
      description: "Tool to create an order.stop_loss and take_profit are optional and they take percentage as input (e.g. 0.01 for 1%).",
      inputSchema: z.object({
        symbol: z.string(),
        side: z.string(),
        amount: z.number(),
        price: z.number().optional(),
        stop_loss: z.number().optional(),
        take_profit: z.number().optional(),
      }),
      execute: async ({ symbol, side, amount, price, stop_loss, take_profit }) => {
        try {
          console.log("createOrder called with params:", { symbol, side, amount, price, stop_loss, take_profit });
          const params: Param = {};
          if (stop_loss && take_profit) {
            
          await exchange.loadMarkets();
    
          const ticker = await exchange.fetchTicker(symbol);
          const last_price = ticker?.last;
    
          let stop_loss_trigger_price = 0;
          let take_profit_trigger_price = 0;
    
          if (last_price !== undefined) {
            stop_loss_trigger_price = last_price * 0.99;
            take_profit_trigger_price = last_price * 1.01;
          }
    
          params.bracket_stop_loss_price = stop_loss_trigger_price;
          params.bracket_take_profit_price = take_profit_trigger_price;
          params.bracket_stop_trigger_method = "mark_price";
          }
    
          const order = await exchange.createMarketOrder(
            symbol,
            side,
            amount,
            price,
            params,
          );
    
          console.log("order:", order);
    
          return {
            success: true,
            data: order,
            message: `Order created successfully`,
          };
    
        } catch (error: any) {
          console.error("createOrder error:", error);
    
          // Extract meaningful info from CCXT error
          const parsedError = {
            message: error.message || "Unknown error",
            code: error.code || "UNKNOWN_ERROR",
            type: error.name || "ExchangeError",
          };
    
          return {
            success: false,
            error: parsedError,
          };
        }
      },
    }),
    setLeverage: tool({
      description: "Tool to set leverage for a symbol.",
      inputSchema: z.object({
        symbol: z.string(),
        leverage: z.number(),
      }),
      execute: async ({ symbol, leverage }) => {
        try {
          await exchange.setLeverage(leverage, symbol);
          return {
            success: true,
            message: `Leverage set successfully for ${symbol}`,
          };
        } catch (error: any) {
          console.error("setLeverage error:", error);
          const parsedError = {
            message: error.message || "Unknown error",
            code: error.code || "UNKNOWN_ERROR",
            type: error.name || "ExchangeError",
          };
          return {
            success: false,
            error: parsedError,
          };
        }
      },
    }),
    fetchLeverage: tool({
      description: "Tool to fetch leverage for a symbol.",
      inputSchema: z.object({
        symbol: z.string(),
      }),
      execute: async ({ symbol }) => {
        try {
          const leverage = await exchange.fetchLeverage(symbol);
          return {
            success: true,
            data: leverage,
            message: `Leverage fetched successfully for ${symbol}`,
          };
        } catch (error: any) {
          console.error("fetchLeverage error:", error);
          const parsedError = {
            message: error.message || "Unknown error",
            code: error.code || "UNKNOWN_ERROR",
            type: error.name || "ExchangeError",
          };
          return {
            success: false,
            error: parsedError,
          };
        }
      },
    }),
    fetchTrades: tool({
      description: "Tool to fetch trades.Use limit to fetch a limited number of trades to save on tokens.Default is 10",
      inputSchema: z.object({
        limit: z.number().optional().default(10),
      }),
      execute: async ({ limit }) => {
        try {
          const trades = await exchange.fetchMyTrades(undefined, undefined,limit);
          console.log("fetch Trades: ", trades)
          return {
            success: true,
            data: trades,
            message: `${limit} Trades fetched successfully`,
          };
        } catch (error: any) {
          console.error("fetchTrades error:", error);
    
          const parsedError = {
            message: error.message || "Unknown error",
            code: error.code || "UNKNOWN_ERROR",
            type: error.name || "ExchangeError",
          };
    
          return {
            success: false,
            error: parsedError,
          };
        }
      },
    }),
    fetchPositions: tool({
      description: "Tool to fetch positions.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const positions = await exchange.fetchPositions();
          console.log("fetch Positions: ", positions)
          return {
            success: true,
            data: positions,
            message: `Positions fetched successfully`,
          }; 
        } catch (error: any) {
          console.error("fetchPositions error:", error);
    
          const parsedError = {
            message: error.message || "Unknown error",
            code: error.code || "UNKNOWN_ERROR",
            type: error.name || "ExchangeError",
          };
    
          return {
            success: false,
            error: parsedError,
          };
        }
      },
    }),
    closePosition: tool({
      description: "Tool to close a position.it uses market sell order with reduce_only flag.",
      inputSchema: z.object({
        symbol: z.string(),
        amount: z.number()
      }),
      execute: async ({ symbol, amount }) => {
        try {
          const closedPosition = await exchange.createMarketSellOrder(symbol, amount, { reduce_only: true });
          console.log("close Position: ", closedPosition)
          return {
            success: true,
            data: closedPosition,
            message: `Position closed successfully`,
          };
        } catch (error: any) {
          console.error("closePosition error:", error);
    
          const parsedError = {
            message: error.message || "Unknown error",
            code: error.code || "UNKNOWN_ERROR",
            type: error.name || "ExchangeError",
          };
    
          return {
            success: false,
            error: parsedError,
          };
        }
      },
    }),
    closeAllPositions: tool({
      description: "Tool to close all positions.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const closedPositions = await exchange.closeAllPositions();
          console.log("close All Positions: ", closedPositions)
          return {
            success: true,
            data: closedPositions,
            message: `All positions closed successfully`,
          };
        } catch (error: any) {
          console.error("closeAllPositions error:", error);
    
          const parsedError = {
            message: error.message || "Unknown error",
            code: error.code || "UNKNOWN_ERROR",
            type: error.name || "ExchangeError",
          };
    
          return {
            success: false,
            error: parsedError,
          };
        }
      },
    }),
    checkAccountBalance: tool({
      description: "Tool to check account balance.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const balance = await exchange.fetchBalance();
          console.log("Account Balance: ", balance)
          return {
            success: true,
            data: balance,
            message: `Account balance fetched successfully`,
          };
        } catch (error: any) {
          console.error("checkAccountBalance error:", error);
    
          const parsedError = {
            message: error.message || "Unknown error",
            code: error.code || "UNKNOWN_ERROR",
            type: error.name || "ExchangeError",
          };
    
          return {
            success: false,
            error: parsedError,
          };
        }
      },
    }),
  }
}