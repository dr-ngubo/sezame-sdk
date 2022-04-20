import { GenericTxProposal } from '../fees/GenericTxProposal';

export interface IWallet {
  getBalance(): Promise<string>;
  getDecimals(): Promise<number | null>;
  getTxSendProposals(
    destination: string,
    valueToSend: any,
    reason?: string
  ): Promise<any>;
  getAddress(): any;
  postTxSend(transactionProposal: GenericTxProposal): Promise<any>;
}
