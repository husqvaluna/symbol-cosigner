import { PrivateKey, utils, Hash256 } from "symbol-sdk";
import { SymbolFacade, Network, descriptors, models } from "symbol-sdk/symbol";
import fs from "fs";

const facade = new SymbolFacade(Network.TESTNET);

const privateKey1 = new PrivateKey("26DAA8B623D9B5C19A0754A5FA607285E18962BDE291A5699FE9745C05B66CCC");
const account1 = facade.createAccount(privateKey1);

// ---- アグリゲート署名Tx ------------------------------------------------------

const aggregateTransactionHash = new Hash256(utils.hexToUint8("02959444B4C4A2A3F924E298640264DDF3D93C2E1D3625373782F776282B97A4"));

const coSign1 = account1.cosignTransactionHash(aggregateTransactionHash, true);
const account1CosignJsonPayload = JSON.stringify(coSign1.toJson());
fs.writeFileSync("payload-cosign.json", account1CosignJsonPayload, "utf8");

/**
 * curl -X PUT -H "Content-Type: application/json" -d @payload-cosign.json https://sym-test-01.opening-line.jp:3001/transactions/cosignature
 */
