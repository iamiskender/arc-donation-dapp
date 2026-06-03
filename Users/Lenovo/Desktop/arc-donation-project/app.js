// Akıllı Sözleşme Bilgileri
const contractAddress = "0xBB8B62fD0ab1433709F3092BE2f236c2964D732b";
const contractABI = [
    {
        "inputs": [],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "donationCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalDonations",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider;
let signer;
let contract;

// DOM Elementleri
const connectBtn = document.getElementById("connect-wallet-btn");
const walletAddressText = document.getElementById("wallet-address");
const donateBtn = document.getElementById("donate-btn");
const donationAmountInput = document.getElementById("donation-amount");
const totalDonationsText = document.getElementById("total-donations");
const totalAmountText = document.getElementById("total-amount");
const statusMessage = document.getElementById("status-message");

// Sayfa yüklendiğinde çalıştır
window.addEventListener("load", async () => {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        // Eğer cüzdan zaten bağlıysa otomatik algıla
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            await setupWallet(accounts[0]);
        }
    }
});

// Cüzdan Bağlama Buton Değişimi
connectBtn.addEventListener("click", async () => {
    if (!window.ethereum) {
        statusMessage.innerText = "Lütfen bir Web3 cüzdanı (MetaMask vb.) yükleyin!";
        return;
    }

    try {
        statusMessage.innerText = "Cüzdana bağlanılıyor...";
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        await setupWallet(accounts[0]);
        statusMessage.innerText = "Cüzdan başarıyla bağlandı!";
    } catch (error) {
        console.error(error);
        statusMessage.innerText = "Cüzdan bağlantısı reddedildi.";
    }
});

// Cüzdan Ayarlarını Kurma
async function setupWallet(account) {
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Arayüz güncelleme
    walletAddressText.innerText = `Cüzdan: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    connectBtn.innerText = "Bağlandı";
    donateBtn.disabled = false;

    // Sözleşme verilerini çek
    await updateContractStats();
}

// Sözleşme Verilerini Güncelleme (Canlı İstatistikler)
async function updateContractStats() {
    if (!contract) return;
    try {
        // Toplam bağış sayısını çek
        const count = await contract.donationCount();
        totalDonationsText.innerText = count.toString();

        // Toplam toplanan miktarı çek
        const totalWei = await contract.totalDonations();
        const totalEth = ethers.formatEther(totalWei);
        totalAmountText.innerText = `${parseFloat(totalEth).toFixed(4)} ETH`;
    } catch (error) {
        console.error("Veriler çekilirken hata oluştu:", error);
    }
}

// Bağış Gönderme İşlemi
donateBtn.addEventListener("click", async () => {
    const amount = donationAmountInput.value;
    if (!amount || amount <= 0) {
        statusMessage.innerText = "Lütfen geçerli bir bağış miktarı girin!";
        return;
    }

    try {
        statusMessage.innerText = "İşlem cüzdana gönderildi, onay bekliyor...";
        
        // ETH miktarını Wei birimine çeviriyoruz
        const valueInWei = ethers.parseEther(amount);
        
        // Kontrattaki donate fonksiyonunu tetikliyoruz
        const tx = await contract.donate({ value: valueInWei });
        
        statusMessage.innerText = "İşlem ağa gönderildi. Blok onayı bekleniyor...";
        await tx.wait(); // İşlemin blokta onaylanmasını bekle
        
        statusMessage.innerText = `Teşekkürler! ${amount} ETH bağış başarıyla ulaştı.`;
        donationAmountInput.value = "";
        
        // İstatistikleri canlı olarak yenile
        await updateContractStats();
    } catch (error) {
        console.error(error);
        statusMessage.innerText = "İşlem iptal edildi veya bir hata oluştu.";
    }
});
