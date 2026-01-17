import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygonMumbai, hardhat } from 'wagmi/chains';
import { http } from 'wagmi';

// Create wagmi config
const wagmiConfig = getDefaultConfig({
    appName: 'MediChain AI',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [sepolia, polygonMumbai, hardhat],
    transports: {
        [sepolia.id]: http(),
        [polygonMumbai.id]: http(),
        [hardhat.id]: http(),
    },
});

const chains = [sepolia, polygonMumbai, hardhat];

export { wagmiConfig, chains };
