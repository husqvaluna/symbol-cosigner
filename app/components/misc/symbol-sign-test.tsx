import { PrivateKey } from "symbol-sdk";
import { Network, SymbolFacade, descriptors } from "symbol-sdk/symbol";
const facade = new SymbolFacade(Network.TESTNET);
const account = facade.createAccount(PrivateKey.random());
const descriptor = new descriptors.TransferTransactionV1Descriptor(
  account.address,
);
const transaction = facade.createTransactionFromTypedDescriptor(
  descriptor,
  account.publicKey,
  100,
  2 * 3600,
);
const signature = account.signTransaction(transaction);
const jsonPayload = facade.transactionFactory.static.attachSignature(
  transaction,
  signature,
);

export function SymbolSignTest() {
  return (
    <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
      <code>{jsonPayload}</code>
    </pre>
  );
}
