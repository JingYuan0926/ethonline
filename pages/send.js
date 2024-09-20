import { useState, useEffect } from 'react';
import { Web3 } from "web3";
import { bytesToHex } from '@ethereumjs/util';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { Common } from '@ethereumjs/common';
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { base_decode } from 'near-api-js/lib/utils/serialize';
import { ec as EC } from 'elliptic';
import { keccak256 } from "viem";
import { sha3_256 } from 'js-sha3';
import { connect, keyStores, utils } from 'near-api-js';
import { useWalletSelector } from "../components/WalletSelectorContext";

const rootPublicKey = 'secp256k1:4NfTiv3UsGahebgTaHyD9vF8KYKMBnfd6kh94mK6xv8fGBiJB8TBtFMP5WWXz6B89Ac1fbpzPwAvoyQebemHFwx3';

function najPublicKeyStrToUncompressedHexPoint() {
  const res = '04' + Buffer.from(base_decode(rootPublicKey.split(':')[1])).toString('hex');
  return res;
}

async function deriveChildPublicKey(parentUncompressedPublicKeyHex, signerId, path = '') {
  const ec = new EC("secp256k1");
  const scalarHex = sha3_256(`near-mpc-recovery v0.1.0 epsilon derivation:${signerId},${path}`);

  const x = parentUncompressedPublicKeyHex.substring(2, 66);
  const y = parentUncompressedPublicKeyHex.substring(66);

  const oldPublicKeyPoint = ec.curve.point(x, y);
  const scalarTimesG = ec.g.mul(scalarHex);
  const newPublicKeyPoint = oldPublicKeyPoint.add(scalarTimesG);
  const newX = newPublicKeyPoint.getX().toString("hex").padStart(64, "0");
  const newY = newPublicKeyPoint.getY().toString("hex").padStart(64, "0");
  return "04" + newX + newY;
}

function uncompressedHexPointToEvmAddress(uncompressedHexPoint) {
  const addressHash = keccak256(`0x${uncompressedHexPoint.slice(2)}`);
  return ("0x" + addressHash.substring(addressHash.length - 40));
}

class Ethereum {
  constructor(rpcUrl, chainId) {
    this.web3 = new Web3(rpcUrl);
    this.chainId = chainId;
  }

  async deriveAddress(nearAccountId, derivationPath) {
    const parentPublicKey = najPublicKeyStrToUncompressedHexPoint();
    const childPublicKey = await deriveChildPublicKey(parentPublicKey, nearAccountId, derivationPath);
    const address = uncompressedHexPointToEvmAddress(childPublicKey);
    return { publicKey: Buffer.from(childPublicKey, 'hex'), address };
  }

  async getBalance(address) {
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, "ether");
  }

  async createPayload(sender, receiver, amount, data = '0x') {
    const nonce = await this.web3.eth.getTransactionCount(sender);
    const gasPrice = await this.web3.eth.getGasPrice();
    
    const transactionData = {
      nonce: this.web3.utils.toHex(nonce),
      gasLimit: this.web3.utils.toHex(21000),
      maxFeePerGas: this.web3.utils.toHex(gasPrice),
      maxPriorityFeePerGas: this.web3.utils.toHex(gasPrice),
      to: receiver,
      value: this.web3.utils.toHex(this.web3.utils.toWei(amount.toString(), "ether")),
      data: data,
      chainId: this.chainId,
    };
  
    const common = Common.custom({ chainId: this.chainId });
    const transaction = FeeMarketEIP1559Transaction.fromTxData(transactionData, { common });
    const payload = transaction.getMessageToSign(false);
  
    return { transaction, payload };
  }

  async requestSignatureToMPC(wallet, contractId, path, payload) {
    const args = { 
      request: { 
        payload: Array.from(payload), 
        path, 
        key_version: 0 
      } 
    };
    
    const result = await wallet.account.functionCall({
      contractId,
      methodName: 'sign',
      args,
      gas: '250000000000000',
      attachedDeposit: utils.format.parseNearAmount('0.25')
    });

    return result.status.SuccessValue;
  }

  reconstructSignature(big_r, s, recovery_id, transaction) {
    const r = Buffer.from(big_r.affine_point.substring(2), 'hex');
    const sBuffer = Buffer.from(s.scalar, 'hex');
    const v = recovery_id;

    const signature = transaction.addSignature(v, r, sBuffer);

    if (signature.getValidationErrors().length > 0) {
      throw new Error("Transaction validation errors");
    }
    if (!signature.verifySignature()) {
      throw new Error("Signature is not valid");
    }
    return signature;
  }

  async relayTransaction(signedTransaction) {
    const serializedTx = bytesToHex(signedTransaction.serialize());
    const receipt = await this.web3.eth.sendSignedTransaction(serializedTx);
    return receipt.transactionHash;
  }
}

export default function EthereumTransfer() {
  const { selector, accountId } = useWalletSelector();
  const [derivationPath, setDerivationPath] = useState('ethereum-1');
  const [senderAddress, setSenderAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const eth = new Ethereum(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL, 11155111);

  useEffect(() => {
    if (accountId) {
      deriveAddress();
    }
  }, [derivationPath, accountId]);

  async function deriveAddress() {
    try {
      const { address } = await eth.deriveAddress(accountId, derivationPath);
      setSenderAddress(address);
      const balance = await eth.getBalance(address);
      setBalance(balance);
    } catch (err) {
      setError('Error deriving address: ' + err.message);
    }
  }

  async function handleTransfer() {
    try {
      setError('');
      setTxHash('');

      if (!senderAddress) {
        throw new Error('Sender address not derived yet');
      }

      if (!receiverAddress || !amount) {
        throw new Error('Receiver address and amount are required');
      }

      console.log('Creating payload...');
      const { transaction, payload } = await eth.createPayload(senderAddress, receiverAddress, amount);
      console.log('Payload created:', payload);

      const wallet = await selector.wallet();
      
      console.log('Requesting signature from MPC...');
      const result = await eth.requestSignatureToMPC(wallet, process.env.NEXT_PUBLIC_MPC_CONTRACT_ID, derivationPath, payload);
      console.log('MPC signature result:', result);

      const parsedResult = JSON.parse(Buffer.from(result, 'base64').toString());
      console.log('Parsed MPC result:', parsedResult);
      const { big_r, s, recovery_id } = parsedResult;

      console.log('Reconstructing signature...');
      const signedTransaction = eth.reconstructSignature(big_r, s, recovery_id, transaction);
      console.log('Signature reconstructed');

      console.log('Relaying transaction...');
      const hash = await eth.relayTransaction(signedTransaction);
      setTxHash(hash);
      console.log('Transaction relayed, hash:', hash);
    } catch (err) {
      console.error('Error in handleTransfer:', err);
      setError('Error: ' + err.message);
    }
  }

  return (
    <div>
      <h1>Ethereum Transfer from NEAR Account</h1>
      <div>
        <label>Derivation Path: </label>
        <input
          type="text"
          value={derivationPath}
          onChange={(e) => setDerivationPath(e.target.value)}
        />
      </div>
      <p>Sender Address: {senderAddress}</p>
      <p>Balance: {balance} ETH</p>
      <input
        type="text"
        placeholder="Receiver Address"
        value={receiverAddress}
        onChange={(e) => setReceiverAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleTransfer}>Transfer</button>
      {txHash && <p>Transaction Hash: {txHash}</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}