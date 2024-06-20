document.getElementById('config-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const guardInterval = document.getElementById('guardInterval').value;
    const segments1 = parseInt(document.getElementById('segments1').value);
    const segments2 = parseInt(document.getElementById('segments2').value);
    const segments3 = parseInt(document.getElementById('segments3').value);

    // Verificar que la suma de los segmentos no supere 13
    if (segments1 + segments2 + segments3 > 13) {
        alert('La suma total de los segmentos no debe superar 13.');
        location.reload(); // Refrescar la página para restablecer los valores originales
        return;
    }

    const layers = [
        {
            segments: segments1,
            modulation: document.getElementById('modulation1').value,
            codeRate: document.getElementById('codeRate1').value
        },
        {
            segments: segments2,
            modulation: document.getElementById('modulation2').value,
            codeRate: document.getElementById('codeRate2').value
        },
        {
            segments: segments3,
            modulation: document.getElementById('modulation3').value,
            codeRate: document.getElementById('codeRate3').value
        }
    ];

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

// Función para verificar la suma de los segmentos en tiempo real
function checkSegmentSum() {
    const segments1 = parseInt(document.getElementById('segments1').value) || 0;
    const segments2 = parseInt(document.getElementById('segments2').value) || 0;
    const segments3 = parseInt(document.getElementById('segments3').value) || 0;

    if (segments1 + segments2 + segments3 > 13) {
        alert('La suma total de los segmentos no debe superar 13.');
        location.reload(); // Refrescar la página para restablecer los valores originales
    }
}

// Añadir eventos de cambio a los campos de segmentos para verificar la suma
document.getElementById('segments1').addEventListener('change', checkSegmentSum);
document.getElementById('segments2').addEventListener('change', checkSegmentSum);
document.getElementById('segments3').addEventListener('change', checkSegmentSum);

function displayConfig(config) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    let totalDataRate = 0;
    config.layers.forEach((layer, index) => {
        const dataRate = calculateDataRate(layer.segments, layer.modulation, config.guardInterval, layer.codeRate);
        totalDataRate += dataRate;
        resultDiv.innerHTML += `
            <h3>Capa ${String.fromCharCode(65 + index)}</h3>
            <p>Tasa de Datos: ${dataRate.toFixed(2)} Mbps</p>
        `;
    });

    resultDiv.innerHTML += `<h3>Total de Tasa de Datos: ${totalDataRate.toFixed(2)} Mbps</h3>`;
}

function calculateDataRate(segments, modulation, guardInterval, codeRate) {
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
    const tasaCodigoConv = codeRateRatio[codeRate];
    const log2M = modulationEfficiency[modulation];
    const tiempoGuarda = guardIntervalRatio[guardInterval];
    const numerator = 8 * log2M * tasaCodigoConv * rsCodeRate * segments;
    const denominator = 21 * (1 + tiempoGuarda);

    return numerator / denominator;
}




