fetch('moonpocket-data.json')
	.then((res) => res.json())
	.then((data) => {
		document.getElementById('moon').innerHTML = `
      <h2>Moon Phase: ${data.moon_phase}</h2>
      <p>Illumination: ${data.illumination}%</p>
      <p>Azimuth: ${data.azimuth}°, Altitude: ${data.altitude}°</p>
      <p>Rise: ${data.moonrise}, Set: ${data.moonset}</p>
    `
		document.getElementById('tide').innerHTML = `
      <h2>Next Tide: ${data.tide.next_type}</h2>
      <p>At: ${data.tide.next_time}</p>
      <p>Height: ${data.tide.height_m} m</p>
      <p>State: ${data.tide.state}</p>
    `
		document.getElementById('time').innerText =
			'Last updated: ' + data.timestamp
	})
