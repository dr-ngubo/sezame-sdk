import Web3 from 'web3';
import {
  signTypedData as web3SignTypeData,
  SignTypedDataVersion,
} from '@metamask/eth-sig-util';
import { toBuffer } from 'ethereumjs-util';
export class Web3SigningManager {
  client: Web3;
  privateKey: string;

  constructor(client: any, privateKey: any) {
    this.client = client;
    this.privateKey = privateKey;
    this.client.eth.accounts.wallet.add(privateKey);
    this.client.eth.defaultAccount = client.eth.accounts.wallet[0].address;
  }

  async personalSign(
    dataToSign: any,
    password: string,
    address: string | null = null
  ) {
    if (!address) {
      address = this.client.eth.defaultAccount!;
    }
    return await this.client.eth.personal.sign(dataToSign, address, password);
  }

  async sign(dataToSign: any) {
    return this.client.eth.accounts.sign(dataToSign, this.privateKey).signature;
  }

  async signTypedData(dataToSign: any) {
    let privateKeyBuffer = toBuffer(this.privateKey);
    let sig = web3SignTypeData({
      privateKey: privateKeyBuffer,
      data: dataToSign,
      version: SignTypedDataVersion.V3,
    });
    return sig;
  }

  async signTransaction(transactionObject: any) {
    return (
      await this.client.eth.accounts.signTransaction(
        transactionObject,
        this.privateKey
      )
    ).rawTransaction as string;
  }
}
