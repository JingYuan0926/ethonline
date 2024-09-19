// services/ethereum.js
import { Web3 } from "web3";
import { bytesToHex } from '@ethereumjs/util';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { Common } from '@ethereumjs/common';
import { parseNearAmount } from "near-api-js/lib/utils/format";

export class Ethereum {
  constructor(chain_rpc, chain_id) {
    this.web3 = new Web3(chain_rpc);
    this.chain_id = chain_id;
  }

  async createPayload(sender, receiver, amount) {
    const common = new Common({ chain: this.chain_id });

    // Get the nonce & gas price
    const nonce = await this.web3.eth.getTransactionCount(sender);
    const maxFeePerGas = await this.web3.eth.getGasPrice();
    const maxPriorityFeePerGas = await this.web3.eth.getMaxPriorityFeePerGas();

    // Construct transaction
    const transactionData = {
      nonce,
      gasLimit: 50_000,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to: receiver,
      value: BigInt(this.web3.utils.toWei(amount, "ether")),
      chain: this.chain_id,
    };

    // Create a transaction
    const transaction = FeeMarketEIP1559Transaction.fromTxData(transactionData, { common });
    const payload = transaction.getHashedMessageToSign();

    // Store in sessionStorage for later
    sessionStorage.setItem('transaction', transaction.serialize());

    return { transaction, payload };
  }

  async requestSignatureToMPC(wallet, contractId, path, ethPayload) {
    const payload = Array.from(ethPayload);
    const { big_r, s, recovery_id } = await wallet.callMethod({
      contractId,
      method: 'sign',
      args: { request: { payload, path, key_version: 0 } },
      gas: '250000000000000',
      deposit: parseNearAmount('0.25')
    });
    return { big_r, s, recovery_id };
  }

  async reconstructSignatureFromLocalSession(big_r, s, recovery_id, fromAddress) {
    const serialized = Uint8Array.from(JSON.parse(`[${sessionStorage.getItem('transaction')}]`));
    const transaction = FeeMarketEIP1559Transaction.fromSerializedTx(serialized);
    
    const r = Buffer.from(big_r.affine_point.substring(2), 'hex');
    const sBuffer = Buffer.from(s.scalar, 'hex');
    const v = recovery_id;

    const signature = transaction.addSignature(v, r, sBuffer);

    if (signature.getValidationErrors().length > 0) throw new Error("Transaction validation errors");
    if (!signature.verifySignature()) throw new Error("Signature is not valid");
    return signature;
  }

  async relayTransaction(signedTransaction) {
    const serializedTx = bytesToHex(signedTransaction.serialize());
    const relayed = await this.web3.eth.sendSignedTransaction(serializedTx);
    return relayed.transactionHash;
  }
}