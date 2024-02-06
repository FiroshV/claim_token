import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import contractABI from "../ABI.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL;

export default function Home() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [claimedTokens, setClaimedTokens] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [showCoin, setShowGif] = useState(false);
    const [showClaimTokens, setShowClaimTokens] = useState(false);

    useEffect(() => {
        const initializeProvider = async () => {
            if (window.ethereum) {
                // Use Web3Provider for the provider connected to window.ethereum
                const tempProvider = new ethers.BrowserProvider(
                    window.ethereum
                );
                setProvider(tempProvider);

                const accounts = await tempProvider.listAccounts();
                if (accounts.length > 0) {
                    setIsWalletConnected(true);
                    await connectWallet();
                }
            } else {
                setProvider(
                    new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL)
                );
            }
        };
        initializeProvider();
    }, []);

    useEffect(() => {
        if (provider && isWalletConnected) {
            getClaimedTokens();
        }
    }, [provider, isWalletConnected]);

    // useEffect for userAddress change
    useEffect(() => {
        if (provider && userAddress) {
            getClaimedTokens();
        }
    }, [userAddress]); // Add userAddress as a dependency

    useEffect(() => {
        if (claimedTokens < 3) {
            setShowGif(true);
        } else {
            setShowGif(false);
        }
    }, [claimedTokens]);

    const connectWallet = async () => {
        try {
            if (!provider && window.ethereum) {
                // Prompt user to connect their wallet if not already connected
                await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                // Instantiate provider after user has connected their wallet
                const tempProvider = new ethers.BrowserProvider(
                    window.ethereum
                );
                setProvider(tempProvider);
                const tempSigner = await tempProvider.getSigner(0);
                const address = await tempSigner.getAddress();

                setSigner(tempSigner);
                setUserAddress(address);
                setIsWalletConnected(true);
                await getClaimedTokens(); // Ensure this is awaited so claimedTokens is updated immediately
            } else {
                const tempSigner = await provider.getSigner(0);
                const address = await tempSigner.getAddress();

                setSigner(tempSigner);
                setUserAddress(address);
                setIsWalletConnected(true);
                await getClaimedTokens(); // Ensure this is awaited so claimedTokens is updated immediately
            }
        } catch (err) {
            // console.error("An error occurred during wallet connection:", err);
            if (window.ethereum) {
                console.log("User rejected wallet connection.");
            } else {
                console.log("Ethereum object not found. Install MetaMask.");
            }
        }
    };

    const getClaimedTokens = async () => {
        if (provider && userAddress) {
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                contractABI,
                provider
            );

            try {
                const claims = await contract.claims(userAddress);
                setClaimedTokens(Number(claims));
            } catch (error) {
                console.error("Error fetching claimed tokens:", error);
            }
        }
    };

    const claimToken = useCallback(async () => {
        if (signer && userAddress && claimedTokens < 3) {
            setIsLoading(true);
            try {
                const contractWithSigner = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    contractABI,
                    signer
                );
                const tx = await contractWithSigner.claimTokens();
                await tx.wait();
                getClaimedTokens(); // Refresh the claimed tokens count
            } catch (error) {
                console.error(
                    "An error occurred while claiming tokens:",
                    error
                );
            } finally {
                setIsLoading(false);
            }
        }
    }, [signer, userAddress, claimedTokens]);

    const toggleClaimTokens = () => {
        setShowClaimTokens(!showClaimTokens);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-xl mx-auto bg-white p-4 rounded-md shadow-md">
                <h1 className="text-center text-2xl font-bold mb-4">
                    {isWalletConnected
                        ? "Claim Rewards"
                        : "Connect Your Wallet"}
                </h1>
                {isLoading && (
                    <span className="inline-block ml-4">
                        <div className="loader w-6 h-6 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
                    </span>
                )}
                {!isWalletConnected ? (
                    <button
                        className="bg-black text-white p-2 rounded-md w-full"
                        onClick={connectWallet}
                    >
                        Connect Wallet
                    </button>
                ) : (
                    <>
                        <button
                            className="bg-black text-white p-2 rounded-md w-full mb-4 disabled"
                            onClick={
                                !showClaimTokens ? toggleClaimTokens : () => {}
                            }
                        >
                            Claim Reward
                        </button>
                        {showClaimTokens && (
                            <div>
                                <h2 className="text-lg mb-4">
                                    Claim your Tokens
                                </h2>
                                <div className="mb-4 grid grid-cols-3 gap-4">
                                    {[1, 2, 3].map((token) => (
                                        <button
                                            key={token}
                                            className={`flex flex-col items-center justify-center bg-white p-2 rounded-md w-full relative overflow-hidden outline ${
                                                claimedTokens >= token
                                                    ? "bg-gray-500 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            onClick={
                                                claimedTokens >= token
                                                    ? null
                                                    : claimToken
                                            }
                                            disabled={claimedTokens >= token}
                                        >
                                            {claimedTokens < token &&
                                                showCoin && (
                                                    <img
                                                        src="/coin.png"
                                                        alt="Coin"
                                                        className="bounce self-center"
                                                    />
                                                )}
                                            <span className="self-center">
                                                {claimedTokens >= token
                                                    ? "Claimed"
                                                    : "Claim Token"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
