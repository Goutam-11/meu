import { tool } from "ai";
import type { Exchange } from "ccxt";
import z from "zod";

export function getCryptoTools({ exchange }: { exchange: Exchange }) {
  return {
    createOrder: tool({
      description: "Tool to create an order.",
      inputSchema: z.object({
        symbol: z.string(),
        side: z.string(),
        amount: z.number(),
        price: z.number().optional(),
      }),
      execute: async ({ symbol, side, amount, price }) => {
        try {
          console.log("createOrder called with params:", { symbol, side, amount, price });
    
          await exchange.loadMarkets();
    
          const ticker = await exchange.fetchTicker(symbol);
          const last_price = ticker?.last;
    
          let stop_loss_trigger_price = 0;
          let take_profit_trigger_price = 0;
    
          if (last_price !== undefined) {
            stop_loss_trigger_price = last_price * 0.99;
            take_profit_trigger_price = last_price * 1.01;
          }
    
          const params = {
            bracket_stop_loss_price: stop_loss_trigger_price,
            bracket_take_profit_price: take_profit_trigger_price,
            bracket_stop_trigger_method: "mark_price",
          };
    
          const order = await exchange.createMarketOrder(
            symbol,
            side,
            amount,
            price,
            params
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
    fetchTrades: tool({
      description: "Tool to fetch trades.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const trades = await exchange.fetchMyTrades();
          console.log("fetch Trades: ", trades)
          return {
            success: true,
            data: trades,
            message: `Trades fetched successfully`,
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