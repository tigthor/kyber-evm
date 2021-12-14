import KYVE, { BlockInstructions, formatBundle, logger } from "@kyve/core";
import chalk from "chalk";
import cliProgress from "cli-progress";
import path from "path";
import { loadSync, Type } from "protobufjs";
import { SafeProvider, sleep } from "./provider";
import { version } from "../package.json";

process.env.KYVE_RUNTIME = "@kyve/evm";
process.env.KYVE_VERSION = version;

KYVE.metrics.register.setDefaultLabels({
  app: process.env.KYVE_RUNTIME,
});

class EVM extends KYVE {
  type: Type;

  constructor() {
    super();

    const root = loadSync(path.join(__dirname, "schema.proto"));
    this.type = root.lookupType("Block");
  }

  public async requestWorkerBatch(workerHeight: number): Promise<any[]> {
    const batchSize = 100;
    const rateLimit = 10;

    const provider = new SafeProvider(this.poolState.config.rpc);
    const promises: any[] = [];

    for (
      let height = workerHeight;
      height < workerHeight + batchSize;
      height++
    ) {
      promises.push(
        provider
          .safeGetBlockWithTransactions(height)
          .then((block) => console.log(block.number))
      );
      await sleep(rateLimit);
    }

    const batch = await Promise.all(promises);

    return batch.map((b) => ({
      type: "put",
      key: b.number,
      value: this.type.encode(b).finish(),
    }));
  }

  public async createBundle(
    blockInstructions: BlockInstructions
  ): Promise<any[]> {
    const bundleDataSizeLimit = 20 * 1000 * 1000; // 20 MB
    const bundle: any[] = [];

    const progress = new cliProgress.SingleBar({
      format: `${chalk.gray(
        new Date().toISOString().replace("T", " ").replace("Z", " ")
      )} ${chalk.bold.blueBright(
        "INFO"
      )} [{bar}] {percentage}% | {value}/{total} bytes`,
    });

    progress.start(bundleDataSizeLimit, 0);

    let currentDataSize = 0;
    let currentHeight = blockInstructions.fromHeight;

    while (true) {
      try {
        const block = await this.db.get(currentHeight);
        const tempBundle = bundle.concat(block);
        currentDataSize = formatBundle(tempBundle).byteLength;

        if (currentDataSize <= bundleDataSizeLimit) {
          bundle.push(block);
          currentHeight += 1;
          progress.update(currentDataSize);
        } else {
          progress.stop();
          break;
        }
      } catch {
        await sleep(10 * 1000);
      }
    }

    logger.debug(`Created bundle with length = ${bundle.length}`);
    try {
      logger.debug(`Worker height = ${await this.db.get(-1)}`);
    } catch (err) {
      logger.debug(`Worker height = ${0}`);
    }

    return bundle;
  }
}

new EVM().start();
