'use client';

import { FC, useState, useEffect } from 'react';
import { Connection, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";

interface PhantomTransactionButtonProps {
    senderAddress: string;      // 发送方钱包地址
    recipientAddress: string;   // 接收方钱包地址
    amount: number;             // 转账金额（以 lamports 为单位）
}

export const PhantomTransactionButton: FC<PhantomTransactionButtonProps> = ({
    senderAddress,
    recipientAddress,
    amount
}) => {
    const [phantom, setPhantom] = useState<any>(null);
    const [connected, setConnected] = useState(false);

    // 检测 Phantom 钱包
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const provider = (window as any).solana;
            if (provider?.isPhantom) {
                setPhantom(provider);
                // 检查是否已连接
                if (provider.isConnected) {
                    setConnected(true);
                }
            }
        }
    }, []);

    // 连接钱包
    const connectWallet = async () => {
        try {
            if (phantom) {
                const { publicKey } = await phantom.connect();
                console.log('Connected to wallet:', publicKey.toString());
                setConnected(true);
            } else {
                window.open('https://phantom.app/', '_blank');
            }
        } catch (error) {
            console.error('连接钱包失败:', error);
        }
    };

    // 发送交易
    const sendTransaction = async () => {
        try {
            if (!phantom || !connected) {
                alert('请先连接 Phantom 钱包');
                return;
            }

            // 连接 Solana 网络
            const connection = new Connection("https://api.devnet.solana.com", "confirmed");

            // 构建交易
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(senderAddress),
                    toPubkey: new PublicKey(recipientAddress),
                    lamports: amount,
                })
            );

            // 获取最新的 blockhash
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.feePayer = new PublicKey(senderAddress);

            // 发送交易到钱包签名
            try {
                const signedTransaction = await phantom.signTransaction(transaction);
                console.log("交易已签名");

                // 发送签名后的交易
                const signature = await connection.sendRawTransaction(signedTransaction.serialize());
                console.log("交易已发送，签名:", signature);

                // 等待交易确认
                await connection.confirmTransaction(signature);
                console.log("交易已确认");
                alert('交易成功！');
            } catch (err) {
                console.error("交易失败:", err);
                alert('交易失败，请查看控制台了解详情');
            }
        } catch (error) {
            console.error('发送交易失败:', error);
            alert('发送交易失败，请确保钱包已连接且地址正确');
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="text-sm text-gray-600 mb-2">
                <div>发送方: {senderAddress}</div>
                <div>接收方: {recipientAddress}</div>
                <div>金额: {amount / 1000000000} SOL ({amount} lamports)</div>
            </div>
            {!phantom ? (
                <button
                    onClick={() => window.open('https://phantom.app/', '_blank')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    安装 Phantom 钱包
                </button>
            ) : !connected ? (
                <button
                    onClick={connectWallet}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    连接钱包
                </button>
            ) : (
                <button
                    onClick={sendTransaction}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    发送交易
                </button>
            )}
        </div>
    );
}; 