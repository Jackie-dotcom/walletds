const projectId = '16d592e3bae18ce928f7b31143439d35';
let core;
let walletKit;

async function initWalletConnect() {
    try {
        console.log('Initializing WalletConnect...');
        
        // Инициализация Core
        core = new Core({ 
            projectId: projectId 
        });

        // Инициализация WalletKit
        walletKit = await WalletKit.init({
            core: core,
            metadata: {
                name: 'Hedera Claim',
                description: 'Hedera Claim dApp',
                url: window.location.origin,
                icons: ['https://docs.hedera.com/guides/images/favicon.png']
            }
        });

        console.log('WalletConnect initialized successfully');
        
        // Слушаем предложения сессии
        walletKit.on('session_proposal', handleSessionProposal);
        
        // Слушаем запросы сессии
        walletKit.on('session_request', handleSessionRequest);

    } catch (error) {
        console.error('Failed to initialize WalletConnect:', error);
        updateStatus('Failed to initialize wallet connection', 'error');
    }
}

async function handleSessionProposal(proposal) {
    try {
        console.log('Session proposal received:', proposal);

        // Создаем сессию с поддержкой Hedera
        const session = await walletKit.approveSession({
            id: proposal.id,
            namespaces: {
                hedera: {
                    accounts: [], // будет заполнено после подключения
                    methods: ['hedera_signTransaction', 'hedera_signMessage'],
                    chains: ['hedera:testnet'],
                    events: ['chainChanged', 'accountsChanged']
                }
            }
        });

        console.log('Session approved:', session);

        // Отвечаем dApp
        const response = { 
            id: proposal.id, 
            result: 'session approved', 
            jsonrpc: '2.0' 
        };

        await walletKit.respondSessionRequest({ 
            topic: session.topic, 
            response 
        });

        // Обновляем UI
        document.getElementById('accountInfo').style.display = 'block';
        document.getElementById('claimButton').style.display = 'block';
        document.getElementById('connectWallet').style.display = 'none';
        
        updateStatus('Wallet connected successfully!', 'success');

    } catch (error) {
        console.error('Session proposal error:', error);
        updateStatus('Failed to approve session', 'error');
    }
}

async function handleSessionRequest(requestEvent) {
    try {
        const { params, id } = requestEvent;
        const { request } = params;

        console.log('Session request received:', request);

        // Здесь будет обработка запросов от dApp
        switch (request.method) {
            case 'hedera_signMessage':
                // Логика подписи сообщения
                break;
            case 'hedera_signTransaction':
                // Логика подписи транзакции
                break;
            default:
                throw new Error('Unsupported method');
        }

    } catch (error) {
        console.error('Session request error:', error);
        updateStatus('Failed to process request', 'error');
    }
}

async function connectWallet() {
    try {
        if (!walletKit) {
            await initWalletConnect();
        }

        // Создаем URI для подключения
        const uri = await walletKit.core.pairing.create();
        console.log('Connection URI:', uri);

        // Показываем QR код или URI пользователю
        // В реальном приложении здесь нужно показать QR код
        updateStatus('Please scan QR code with your wallet', 'info');

    } catch (error) {
        console.error('Connection error:', error);
        updateStatus('Failed to connect wallet: ' + error.message, 'error');
    }
}

function updateStatus(message, type = 'info') {
    console.log(`Status update (${type}):`, message);
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.style.color = type === 'error' ? '#ff4444' : 
                          type === 'success' ? '#00a86b' : 
                          '#ffffff';
}

// Event Listeners
document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('claimButton').addEventListener('click', () => {
    updateStatus('Claim functionality will be implemented here');
});

// Initialize on load
window.addEventListener('load', initWalletConnect);