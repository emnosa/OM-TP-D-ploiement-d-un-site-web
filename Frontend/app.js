document.getElementById('fetchData').addEventListener('click', async () => {
    // Appeler l'API pour lire et stocker les données
    await fetch('http://localhost:5000/read-data');

    // Appeler l'API pour récupérer les données
    const response = await fetch('http://localhost:5000/get-data');
    const data = await response.json();

    // Insérer les données dans le tableau
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; // Vider le tableau avant de l'actualiser

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.variable_name}</td>
            <td>${row.value}</td>
            <td>${row.timestamp}</td>
        `;
        tableBody.appendChild(tr);
    });
});
