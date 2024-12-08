const apiBaseUrl = `/api/sensor-data`;


async function fetchAllData() {
    try {
        const response = await fetch(apiBaseUrl);
        const data = await response.json();
        displayData(data);
        populateIdDropdown(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayData(data) {
    const dataList = document.getElementById('data-items');
    if (!dataList) {
        console.error("dataList element not found!");
        return;
    }
    dataList.innerHTML = '';  // Clear the list
    data.forEach(item => {
        dataList.innerHTML += `
            <div class="data-item">
                <strong>ID:</strong> ${item.id}<br>
                <strong>Temperature:</strong> ${item.temperature}°C<br>
                <strong>Humidity:</strong> ${item.humidity}%<br>
                <strong>Pressure:</strong> ${item.pressure}hPa<br>
                <strong>Weather:</strong> ${item.weather}<br>
                <strong>Timestamp:</strong> ${item.timestamp}<br>
                <strong>Sensor:</strong> ${item.sensor}<br>
                <button onclick="confirmDelete(${item.id})">Delete</button>
                <button onclick="updateData(${item.id})">Update</button>
            </div>
        `;
    });
}

function populateIdDropdown(data) {
    const idDropdown = document.getElementById("data-id");
    idDropdown.innerHTML = '<option value="">Select an ID</option>'; // Reset dropdown
    data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.id;
        idDropdown.appendChild(option);
    });
}

async function updateSelectedData() {
    const selectedId = document.getElementById("data-id").value;
    const response = await fetch(`${apiBaseUrl}/${selectedId}`, { method: 'GET'});
    const selectedItem = await response.json();

    if (selectedItem.temperature != null  || selectedItem.humidity != null) {
        document.getElementById("selected-temperature").textContent = `${selectedItem.temperature}°C`;
        document.getElementById("selected-humidity").textContent = `${selectedItem.humidity}%`;
        document.getElementById("selected-timestamp").textContent = selectedItem.timestamp;
    } else {
        document.getElementById("selected-temperature").textContent = '';
        document.getElementById("selected-humidity").textContent = '';
        document.getElementById("selected-timestamp").textContent = '';
    }
    document.getElementById("dew-point-result").innerHTML = '';
}

async function calculateDewPointForSelected() {
    const selectedId = document.getElementById("data-id").value;
    var temperature = document.getElementById("selected-temperature").textContent
    var humidity = document.getElementById("selected-humidity").textContent

    if (!temperature || !humidity) {
        document.getElementById("dew-point-result").innerHTML = "<strong>Please select a valid ID.</strong>";
        return;
    }

    temperature = parseFloat(temperature);
    humidity = parseFloat(humidity);

    if (isNaN(temperature) || isNaN(humidity)) {
        document.getElementById("dew-point-result").innerHTML = `
        <strong>Invalid temperature or humidity for the selected ID.</strong>
        `;
        return;
    }

    // Magnus formula for calculating the dew point
    const b = 17.625;
    const c = 243.04;
    const gamma = (b * temperature) / (c + temperature) + Math.log(humidity / 100);
    const dewPoint = (c * gamma) / (b - gamma);

    document.getElementById("dew-point-result").innerHTML = `<strong>Dew Point:</strong> ${dewPoint.toFixed(2)}°C`;
}

async function fetchSensorData() {
    try {
        const response = await fetch(`${apiBaseUrl}/sensor/`);
        const data = await response.json();
        fillCombo(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }    
}

function fillCombo(data) {
    const sensorList = document.getElementById('sensor');
    const SensorUpdateList = document.getElementById('updateSensor');
    if (!sensorList || !updateSensor) {
        console.error("Cant find sensor combo");
        return;
    }
		
    sensorList.innerHTML = '';

    sensorList.innerHTML += `<option value="">Select sensor</option>`;

    SensorUpdateList.innerHTML += `<option value="">Select sensor</option>`;

    data.forEach(item => {
        sensorList.innerHTML += `
        <option value="${item.id}">${item.name}</option>
        `;
        SensorUpdateList.innerHTML += `
        <option value="${item.id}">${item.name}</option>
        `;
    });

}
 
function confirmDelete(id) {
    const userConfirmed = confirm("Do you really want to delete this entry?");
    if (userConfirmed) {
        deleteData(id);
    }
}

function validateForm(isUpdateForm = false) {
    // Determine which form's values to validate
    const temperature = document.getElementById(isUpdateForm ? 'updateTemperature' : 'temperature').value;
    const humidity = document.getElementById(isUpdateForm ? 'updateHumidity' : 'humidity').value;
    const pressure = document.getElementById(isUpdateForm ? 'updatePressure' : 'pressure').value;
    const weather = document.getElementById(isUpdateForm ? 'updateWeather' : 'weather').value;
    const sensor = document.getElementById(isUpdateForm ? 'updateSensor' : 'sensor').value;

    // Define valid ranges for the sensor values
    const tempMin = -20;
    const tempMax = 50;
    const humMin = 0;
    const humMax = 100;
    const pressMin = 300;
    const pressMax = 1100;

    // Check temperature
    if (temperature === "" || isNaN(temperature) || temperature < tempMin || temperature > tempMax) {
        alert("Please enter a valid temperature between " + tempMin + " and " + tempMax + " degrees.");
        return false;
    }

    // Check humidity
    if (humidity === "" || isNaN(humidity) || humidity < humMin || humidity > humMax) {
        alert("Please enter a valid humidity between " + humMin + " and " + humMax + "%.");
        return false;
    }

    // Check pressure
    if (pressure === "" || isNaN(pressure) || pressure < pressMin || pressure > pressMax) {
        alert("Please enter a valid pressure between " + pressMin + " and " + pressMax + " hPa.");
        return false;
    }

    // Check if weather is selected
    if (weather === "" && ! isUpdateForm) {
        alert("Please select a weather condition.");
        return false;
    }

    if (sensor ===  "" && ! isUpdateForm) {
        alert("Please select a sensor.");
        return false;
    }

    return true;
}

async function createData() {
    if (validateForm()) {
        const newData = {
            temperature: document.getElementById('temperature').value,
            humidity: document.getElementById('humidity').value,
            pressure: document.getElementById('pressure').value,
            weather: document.getElementById('weather').value,
            sensor: document.getElementById('sensor').value
        };

        try {
            const response = await fetch(apiBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (response.ok) {
                fetchAllData();
            } else {
                console.error('Error creating data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

async function deleteData(id) {
    try {
        const response = await fetch(`${apiBaseUrl}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchAllData();
        } else {
            console.error('Error deleting data');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateData(id) {
    const response = await fetch(`${apiBaseUrl}/${id}`, { method: 'GET'});
    const data = await response.json(); 

    document.getElementById("updateTemperature").value = data.temperature;
    document.getElementById("updateHumidity").value = data.humidity;
    document.getElementById("updatePressure").value = data.pressure;
    document.getElementById("updateWeather").value = data.weather;
    document.getElementById("updateSensor").value = data.sensor;

    document.getElementById("updateForm").dataset.entryId = id;

    document.getElementById("updateModal").style.display = "flex";


}

async function submitUpdate() {
    if (validateForm(isUpdateForm = true)) {
    const id = document.getElementById("updateForm").dataset.entryId;
    const updatedData = {
        temperature: document.getElementById("updateTemperature").value,
        humidity: document.getElementById("updateHumidity").value,
        pressure: document.getElementById("updatePressure").value,
        weather: document.getElementById("updateWeather").value,
        sensor: document.getElementById("updateSensor").value
    };


    try {
        // Perform the API call to update the data
        const response = await fetch(`${apiBaseUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (response.ok) {
            console.log(`Entry ID ${id} updated successfully.`);
            fetchAllData(); // Refresh the data list
            closeUpdateModal(); // Close the modal
        } else {
            console.error('Error updating data:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }

    closeUpdateModal();
    }
}

function closeUpdateModal() {
    document.getElementById("updateModal").style.display = "none";
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('The DOM is fully loaded.');
    fetchAllData();
    fetchSensorData();
});
