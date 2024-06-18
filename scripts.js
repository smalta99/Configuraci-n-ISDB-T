document.getElementById('config-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const guardInterval = document.getElementById('guardInterval').value;
    const layers = [];
    for (let i = 1; i <= 3; i++) {
        layers.push({
            segments: document.getElementById(`segments${i}`).value,
            modulation: document.getElementById(`modulation${i}`).value,
            codeRate: document.getElementById(`codeRate${i}`).value
        });
    }

    const config = {
        guardInterval: guardInterval,
        layers: layers
    };

    localStorage.setItem('isdbtConfig', JSON.stringify(config));
    
    displayConfig(config);
    alert('Configuración guardada con éxito!');
});

document.addEventListener('DOMContentLoaded', function() {
    const savedConfig = localStorage.getItem('isdbtConfig');
    if (savedConfig) {
        const config = JSON.parse(savedConfig);
        document.getElementById('guardInterval').value = config.guardInterval;
        config.layers.forEach((layer, index) => {
            const i = index + 1;
            document.getElementById(`segments${i}`).value = layer.segments;
            document.getElementById(`modulation${i}`).value = layer.modulation;
            document.getElementById(`codeRate${i}`).value = layer.codeRate;
        });
        displayConfig(config);
    }
});

function displayConfig(config) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    config.layers.forEach((layer, index) => {
        const dataRate = calculateDataRate(layer.segments, layer.modulation, config.guardInterval, layer.codeRate);
        resultDiv.innerHTML += `
            <h3>Capa ${index + 1}</h3>
            <p>Número de Segmentos: ${layer.segments}</p>
            <p>Modulación: ${layer.modulation}</p>
            <p>Tasa de Código: ${layer.codeRate}</p>
            <p>Tasa de Datos: ${dataRate.toFixed(2)} Mbps</p>
        `;
    });
}

function calculateDataRate(segments, modulation, guardInterval, codeRate) {
    //const segmentBandwidth = 0.42857; // MHz per segment
    const modulationEfficiency = {
        'qpsk': 2, // 2 bit per symbol
        '16qam': 4, // 4 bits per symbol
        '64qam': 6 // 6 bits per symbol
    };

    const guardIntervalRatio = {
        '1/4': 0.25,
        '1/8': 0.125,
        '1/16': 0.0625,
        '1/32': 0.03125
    };

    const codeRateRatio = {
        '1/2': 0.5,
        '2/3': 0.6667,
        '3/4': 0.75,
        '5/6': 0.8333,
        '7/8': 0.875
    };
    const rsCodeRate = 188 / 204;
    const tasaCodigoconv =codeRateRatio[codeRate] ;
    const log2M = modulationEfficiency[modulation];
    const tiempoGuarda = guardIntervalRatio[guardInterval];
    const tasaCodigoRS = rsCodeRate;
    const numerator = 8 * log2M * tasaCodigoconv * tasaCodigoRS *segments;
    const denominator = 21 * (1 + tiempoGuarda);

    return numerator / denominator;
}


