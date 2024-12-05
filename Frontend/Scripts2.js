// Récupération des données toutes les 0.9 secondes (900 ms)
setInterval(() => {
    const chartsContainer = document.getElementById("chartsContainer");
    chartsContainer.innerHTML = ''; // Effacer les anciens graphiques à chaque cycle

    // Appeler l'API pour récupérer les données
    fetch('/get-data')
        .then(response => response.json())
        .then(data => {
            const modbusData = data.data;

            // Organiser les données par variable
            const groupedData = {};
            modbusData.forEach(entry => {
                if (!groupedData[entry.variable_address]) {
                    groupedData[entry.variable_address] = [];
                }
                groupedData[entry.variable_address].push(entry);
            });

            // Créer un graphique pour chaque variable
            Object.keys(groupedData).forEach(variable => {
                const chartDiv = document.createElement("div");
                chartDiv.className = "col-md-6 col-lg-4 mt-4";
                chartDiv.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Variable %M${variable}</h5>
                            <canvas id="chart-${variable}"></canvas>
                        </div>
                    </div>
                `;
                chartsContainer.appendChild(chartDiv);

                const ctx = document.getElementById(`chart-${variable}`).getContext("2d");
                const chart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: [],
                        datasets: [{
                            label: `Variable %M${variable}`,
                            data: [],
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });

                // Mettre à jour les données du graphique
                groupedData[variable].forEach(entry => {
                    chart.data.labels.push(new Date(entry.timestamp).toLocaleTimeString());
                    chart.data.datasets[0].data.push(entry.value);
                });
                chart.update();
            });
        })
        .catch(err => {
            console.error("Erreur lors de la récupération des données :", err);
        });
}, 900);  // Récupération toutes les 900 ms (0.9 seconde)
