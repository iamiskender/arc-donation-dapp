function updateGasPrices() {
    const baseGwei = (Math.random() * (0.015 - 0.005) + 0.005);
    const low = baseGwei * 0.9;
    const market = baseGwei;
    const fast = baseGwei * 1.3;

    document.getElementById('low-gas').innerText = low.toFixed(4) + ' Gwei';
    document.getElementById('market-gas').innerText = market.toFixed(4) + ' Gwei';
    document.getElementById('fast-gas').innerText = fast.toFixed(4) + ' Gwei';

    calculateCost(market);
}

function calculateCost(currentGwei) {
    const txType = document.getElementById('tx-type').value;
    let gasUsed = 21000;

    if (txType === 'swap') {
        gasUsed = 150000;
    } else if (txType === 'nft') {
        gasUsed = 80000;
    }

    const ethPrice = 3000;
    const costInUsd = (gasUsed * currentGwei) / 1000000000 * ethPrice;

    document.getElementById('calc-result').innerText = '$' + costInUsd.toFixed(5);
}

document.getElementById('tx-type').addEventListener('change', () => {
    const marketText = document.getElementById('market-gas').innerText;
    const currentGwei = parseFloat(marketText);
    calculateCost(currentGwei);
});

updateGasPrices();
setInterval(updateGasPrices, 5000);
