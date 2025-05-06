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

// ✅ NEW: Draw Tide Graph
function drawTideGraph(upcomingTides) {
	const container = document.createElement('div')
	container.style.marginTop = '16px'
	container.style.display = 'flex'
	container.style.justifyContent = 'center'

	const maxHeight = Math.max(...upcomingTides.map((t) => t.height_m))
	const svgWidth = 240
	const svgHeight = 100
	const barWidth = svgWidth / upcomingTides.length

	let bars = ''
	upcomingTides.forEach((tide, i) => {
		const barHeight = (tide.height_m / maxHeight) * (svgHeight - 20)
		const x = i * barWidth
		const y = svgHeight - barHeight
		const color = tide.type === 'high' ? '#4fd1c5' : '#f6ad55'
		bars += `<rect x="${x}" y="${y}" width="${
			barWidth - 4
		}" height="${barHeight}" fill="${color}" />`
	})

	const svg = `
    <svg width="${svgWidth}" height="${svgHeight}">
      ${bars}
    </svg>
  `
	container.innerHTML = svg
	document.getElementById('tide').appendChild(container)
}

// 🟡 Main Data Fetch
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

		// ✅ NEW: Draw tide graph after rendering tide HTML
		if (Array.isArray(data.tide.upcoming) && data.tide.upcoming.length > 0) {
			drawTideGraph(data.tide.upcoming)
		}

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

		// Quotes/Facts
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

function drawTideGraph(upcomingTides) {
	const svgWidth = 300
	const svgHeight = 160 // Extra space for labels
	const padding = 30
	const labelPadding = 40

	const maxHeight = Math.max(...upcomingTides.map((t) => t.height_m))
	const minHeight = Math.min(...upcomingTides.map((t) => t.height_m))
	const heightRange = maxHeight - minHeight || 1

	const points = upcomingTides.map((tide, i) => {
		const x =
			padding + (i / (upcomingTides.length - 1)) * (svgWidth - 2 * padding)
		const y =
			labelPadding +
			(1 - (tide.height_m - minHeight) / heightRange) *
				(svgHeight - labelPadding - 30)
		return { x, y, height: tide.height_m, time: new Date(tide.time) }
	})

	// Create smooth path
	let path = `M ${points[0].x},${points[0].y} `
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i]
		const p1 = points[i + 1]
		const cx = (p0.x + p1.x) / 2
		path += `C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y} `
	}

	// Circles for each tide
	const circles = points
		.map((p, i) => {
			const color = upcomingTides[i].type === 'high' ? '#72ecff' : '#6eff86'
			return `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${color}" />`
		})
		.join('\n')

	// Time labels (X-axis)
	const timeLabels = points
		.map((p) => {
			const timeStr = p.time.toLocaleTimeString([], {
				hour: 'numeric',
				minute: '2-digit',
			})
			return `<text x="${p.x}" y="${
				svgHeight - 5
			}" font-size="10" fill="#aaa" text-anchor="middle">${timeStr}</text>`
		})
		.join('\n')

	// Height labels (Y-axis)
	const labelSteps = 3
	const heightLabels = Array.from({ length: labelSteps + 1 }, (_, i) => {
		const value = maxHeight - (i / labelSteps) * heightRange
		const y = labelPadding + (i / labelSteps) * (svgHeight - labelPadding - 30)
		return `<text x="4" y="${
			y + 4
		}" font-size="10" fill="#aaa" text-anchor="start">${value.toFixed(
			2
		)}m</text>`
	}).join('\n')

	// SVG composition
	const svg = `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      ${heightLabels}
      <path d="${path}" fill="none" stroke="#00c0ff" stroke-width="2" />
      ${circles}
      ${timeLabels}
    </svg>
  `

	const container = document.createElement('div')
	container.style.display = 'flex'
	container.style.justifyContent = 'center'
	container.style.marginTop = '16px'
	container.innerHTML = svg
	document.getElementById('tide').appendChild(container)
}
