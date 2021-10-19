import { UploadFunctionSubscriber } from "@kyve/core/dist/src/faces";
import { ethers } from "ethers";
import { Logger } from "tslog";
import { ConfigType } from "./faces";

const uploadFunction = (
  subscriber: UploadFunctionSubscriber,
  config: ConfigType,
  logger: Logger
) => {
  logger = logger.getChildLogger({
    name: "EVM",
  });

  // Connect to the WebSocket endpoint.
  const client = new ethers.providers.WebSocketProvider(config.wss);
  logger.info(`✅ Connection created. Endpoint = ${config.wss}`);

  // Subscribe to new blocks.
  client.on("block", async (height: number) => {
    logger.info(`🆕 Received a new block. Height = ${height}`);

    const block = await client.getBlockWithTransactions(height);
    if (block.transactions.length) {
      block.transactions.forEach(
        // @ts-ignore
        (transaction) => delete transaction.confirmations
      );
    }

    const tags = [
      { name: "Block", value: block.hash },
      { name: "Height", value: block.number.toString() },
    ];
    if (block.transactions.length) {
      block.transactions.forEach((transaction) =>
        tags.push({
          name: "Transaction",
          value: transaction.hash,
        })
      );
    }

    subscriber.next({ data: JSON.stringify(block), tags });
  });
};

export default uploadFunction;
