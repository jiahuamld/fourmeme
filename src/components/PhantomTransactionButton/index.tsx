'use client';

import { FC, useState, useEffect } from 'react';
import { Connection, Transaction, SystemProgram, PublicKey, VersionedTransaction } from "@solana/web3.js";

interface PhantomTransactionButtonProps {
    txId: string;      // 交易ID
}

export const PhantomTransactionButton: FC<PhantomTransactionButtonProps> = ({
    txId
}) => {
    const [phantom, setPhantom] = useState<any>(null);
    const [connected, setConnected] = useState(false);
    const [publicKey, setPublicKey] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // 检查钱包连接状态
    const checkWalletConnection = async (provider: any) => {
        try {
            if (provider?.isConnected && provider.publicKey && provider.publicKey.toString()) {
                setConnected(true);
                setPublicKey(provider.publicKey.toString());
                return true;
            } else {
                setConnected(false);
                setPublicKey('');
                return false;
            }
        } catch (error) {
            console.error('检查钱包状态失败:', error);
            setConnected(false);
            setPublicKey('');
            return false;
        }
    };

    // 检测 Phantom 钱包
    useEffect(() => {
        const checkPhantomWallet = async () => {
            if (typeof window !== 'undefined') {
                try {
                    const provider = (window as any).solana;
                    if (provider?.isPhantom) {
                        setPhantom(provider);
                        await checkWalletConnection(provider);

                        // 监听连接状态变化
                        provider.on('connect', () => checkWalletConnection(provider));
                        provider.on('disconnect', () => {
                            setConnected(false);
                            setPublicKey('');
                        });
                        provider.on('accountChanged', () => checkWalletConnection(provider));
                    }
                } catch (error) {
                    console.error('检测钱包失败:', error);
                }
            }
        };

        checkPhantomWallet();

        // 清理函数
        return () => {
            if (phantom) {
                phantom.removeAllListeners('connect');
                phantom.removeAllListeners('disconnect');
                phantom.removeAllListeners('accountChanged');
            }
        };
    }, []);

    // 连接钱包
    const connectWallet = async () => {
        try {
            setLoading(true);

            if (!phantom) {
                window.open('https://phantom.app/', '_blank');
                return;
            }
            
            // 如果已经连接，只需要检查状态
            if (phantom.isConnected) {
                const isConnected = await checkWalletConnection(phantom);
                if (isConnected) return;
            }

            // 尝试连接钱包
            const { publicKey: walletPublicKey } = await phantom.connect();
            if (walletPublicKey) {
                console.log('Connected to wallet:', walletPublicKey.toString());
                setPublicKey(walletPublicKey.toString());
                setConnected(true);
            } else {
                throw new Error('连接成功但未获取到钱包地址');
            }
        } catch (error) {
            console.error('连接钱包失败:', error);
            setConnected(false);
            setPublicKey('');
        } finally {
            setLoading(false);
        }
    };

    // 从本地接口获取未签名交易并处理
    const handleTransaction = async () => {
        if (!phantom || !connected || !publicKey) {
            alert('请先连接 Phantom 钱包');
            return;
        }

        try {
            setLoading(true);

            // 调用本地接口获取未签名交易
            const response = await fetch('http://localhost:8001/api/v1/transaction/build', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    txId,
                    publicKey
                }),
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error('获取交易失败');
            }

            // 连接 Solana 网络
            const connection = new Connection("https://api.devnet.solana.com", "confirmed");
            
            // 将 Base64 转换回 Transaction
            const transactionBuf = Buffer.from(data.transaction.base64, 'base64');
            let transaction;

            // 根据交易类型使用不同的反序列化方法
            if (data.transaction.type === 'versioned') {
                transaction = VersionedTransaction.deserialize(transactionBuf);
            } else if (data.transaction.type === 'legacy') {
                transaction = Transaction.from(transactionBuf);
            } else {
                throw new Error('未知的交易类型');
            }
            
            try {
                // 使用 Phantom 钱包签名
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
            console.error('处理交易失败:', error);
            alert('处理交易失败，请确保接口正常工作');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div className="text-sm text-gray-600 mb-2">
                <div>交易ID: {txId}</div>
                {publicKey && <div>钱包地址: {publicKey}</div>}
            </div>
            {!phantom ? (
                <button
                    onClick={() => window.open('https://phantom.app/', '_blank')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    disabled={loading}
                >
                    安装 Phantom 钱包
                </button>
            ) : !connected ? (
                <button
                    onClick={connectWallet}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? '连接中...' : '连接钱包'}
                </button>
            ) : (
                <button
                    onClick={handleTransaction}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? '处理中...' : '签名并发送交易'}
                </button>
            )}
        </div>
    );
}; 