function getCurrentFormattedTime() {
	const now = new Date()
	const options = {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
	}
	return now.toLocaleString(undefined, options)
}

function updateTimeElement() {
	const timeEl = document.getElementById('time')
	if (timeEl) {
		timeEl.innerHTML = `<p>${icon(
			'clock'
		)}Last updated: ${getCurrentFormattedTime()}</p>`
	}
}

function getTideCountdown(tideTimeStr) {
	const now = new Date()
	const tideTime = new Date(tideTimeStr)
	const diffMs = tideTime - now

	if (diffMs <= 0) return 'right now'

	const diffMin = Math.floor(diffMs / 60000)
	const hours = Math.floor(diffMin / 60)
	const minutes = diffMin % 60

	if (hours === 0) return `${minutes} minutes`
	if (minutes === 0) return `${hours} hours`
	return `${hours}h ${minutes}m`
}

function icon(name, size = 20) {
	return `<iconify-icon icon="ph:${name}" style="font-size: ${size}px; vertical-align: -3px; margin-right: 6px;"></iconify-icon>`
}

fetch('moonpocket-data.json')
	.then((res) => res.json())
	.then((data) => {
		// Moon Info
		let moonHTML = `
		  <h2>${icon('moon')}Moon Info</h2>
		  <p><strong>${data.moon_phase.replace(
				'_',
				' '
			)}</strong> (${data.illumination?.toFixed(1)}% illuminated)</p>
		  ${data.moon_age ? `<p>${icon('calendar')}Age: ${data.moon_age} days</p>` : ''}
		  <p>${icon('thermometer')}Distance: ${data.distance_km} km</p>
		  <div id="moon-svg" style="display: flex; justify-content: center; margin-top: 16px;"></div>
		`
		document.getElementById('moon').innerHTML = moonHTML
		drawMoonIcon(data.illumination)

		// Tide Info
		const tideFeet = (data.tide.height_m * 3.28084).toFixed(2)
		let tideHTML = `
		  <h2>${icon('wave-sine')}Next Tide</h2>
		  <p><strong>${data.tide.next_type}</strong> at ${data.tide.next_time}</p>
		  <p>${icon('hourglass')}Next tide in: ${getTideCountdown(
			data.tide.next_time
		)}</p>
		  <p>${icon('ruler')}Height: ${data.tide.height_m.toFixed(
			2
		)} m / ${tideFeet} ft</p>
		  <p>${icon('arrows-clockwise')}State: ${data.tide.state} ${
			data.tide.state === 'Rising'
				? '🔼'
				: data.tide.state === 'Falling'
				? '🔽'
				: ''
		}</p>
		`

		if (data.tide.water_temp !== undefined) {
			tideHTML += `<p>${icon('thermometer')}Water Temp: ${
				data.tide.water_temp
			} °C</p>`
		}
		if (data.tide.air_temp !== undefined) {
			tideHTML += `<p>${icon('wind')}Air Temp: ${data.tide.air_temp} °C</p>`
		}
		if (data.tide.station) {
			tideHTML += `<p>${icon('map-pin')}Station: ${data.tide.station}</p>`
		}

		if (Array.isArray(data.tide.upcoming) && data.tide.upcoming.length > 0) {
			tideHTML += `<h3>${icon('calendar-check')}Upcoming Tides</h3>`
			data.tide.upcoming.forEach((tide) => {
				const feet = (tide.height_m * 3.28084).toFixed(2)
				const label = tide.type === 'high' ? 'High' : 'Low'
				const className = tide.type === 'high' ? 'tide-high' : 'tide-low'
				tideHTML += `<p>${icon(
					'wave-sine'
				)}<span class="${className}">${label}</span> @ ${
					tide.time
				} – ${tide.height_m.toFixed(2)} m / ${feet} ft</p>`
			})
		}

		document.getElementById('tide').innerHTML = tideHTML

		// Location Info
		if (data.city && data.state) {
			document.getElementById('time').innerHTML += `
			  <p>${icon('map-pin')}Location: ${data.city}, ${data.state}</p>
			  <p>${icon('globe')}Lat: ${data.latitude}, Lon: ${data.longitude}</p>
			`
		}

		updateTimeElement()
		setInterval(updateTimeElement, 60000)
		document
			.querySelectorAll('.section')
			.forEach((el) => el.classList.add('loaded'))

		// Facts & Quotes
		const moonFacts = [
			'There are more than 200 moons in our solar system.',
			'Jupiter has the most moons — over 90 confirmed!',
			'Ganymede is the largest moon in the solar system — even bigger than Mercury.',
			'Our Moon is slowly drifting away from Earth at 3.8 cm per year.',
			"The Moon has no atmosphere, so there's no weather or sound.",
			'Titan, Saturn’s largest moon, has lakes of methane and a hazy sky.',
			'The far side of the Moon looks very different from the side we see.',
			'Moondust smells like spent gunpowder, according to Apollo astronauts.',
			"Triton orbits Neptune in reverse — it's likely a captured object.",
			'The Moon’s gravity causes Earth’s ocean tides.',
			'A day on the Moon lasts about 29.5 Earth days.',
		]

		const moonQuotes = [
			'“The Moon is a friend for the lonesome to talk to.” — Carl Sandburg',
			'“Everyone is a moon, and has a dark side which he never shows to anybody.” — Mark Twain',
			"“Shoot for the Moon. Even if you miss, you'll land among the stars.” — Norman Vincent Peale",
			'“With freedom, books, flowers, and the moon, who could not be happy?” — Oscar Wilde',
			'“The Moon will guide you through the night with her brightness...” — Shannon L. Alder',
			'“She used to tell me that a full moon was when wishes come true.” — Shannon A. Thompson',
			'“We ran as if to meet the moon.” — Robert Frost',
			'“The Moon rested above the rooftops, a lamp for the dreamers.” — Unknown',
			'“The Moon is a loyal companion. It never leaves...” — Tahereh Mafi',
			'“Do not swear by the moon, for she changes constantly.” — Shakespeare',
		]

		const factText = document.getElementById('fact-text')

		function getRandom(arr) {
			return arr[Math.floor(Math.random() * arr.length)]
		}

		function typeText(text, targetEl, speed = 25) {
			let i = 0
			targetEl.textContent = ''
			const interval = setInterval(() => {
				targetEl.textContent += text.charAt(i)
				i++
				if (i >= text.length) clearInterval(interval)
			}, speed)
		}

		function showRandomQuoteOrFact() {
			const isQuote = Math.random() < 0.5
			const content = isQuote ? getRandom(moonQuotes) : getRandom(moonFacts)
			typeText(content, factText)
		}

		showRandomQuoteOrFact()
		setInterval(showRandomQuoteOrFact, 30000)
	})
	.catch((err) => {
		console.error('❌ Error loading moonpocket-data.json:', err)
		const fallback = `<p style="color: #ff6e6e;">⚠️ Failed to load moon or tide data.</p>`
		document.getElementById('moon').innerHTML = fallback
		document.getElementById('tide').innerHTML = fallback
		document.getElementById('time').innerHTML = fallback
	})

function drawMoonIcon(illumination) {
	const phase = illumination / 100
	const isWaning = phase > 0.5
	const arcOffset = 50 * (1 - Math.abs(0.5 - phase) * 2)

	const svg = `
    <svg viewBox="0 0 100 100" style="width: 100%; max-width: 200px; height: auto;">
      <defs>
        <mask id="moon-mask">
          <rect width="100" height="100" fill="white"/>
          <ellipse cx="${
						isWaning ? 50 + arcOffset : 50 - arcOffset
					}" cy="50" rx="50" ry="50" fill="black"/>
        </mask>
      </defs>
      <circle cx="50" cy="50" r="50" fill="#fdfdfd" />
      <circle cx="50" cy="50" r="50" fill="#0a0a23" mask="url(#moon-mask)" />
    </svg>
  `
	document.getElementById('moon-svg').innerHTML = svg
}
