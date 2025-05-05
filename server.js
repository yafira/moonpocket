const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

app.post('/moonpocket', (req, res) => {
	const data = req.body
	console.log('📩 Data received:', data)

	fs.writeFileSync(
		path.join(__dirname, 'public', 'moonpocket-data.json'),
		JSON.stringify(data, null, 2)
	)
	res.send('✅ Data saved')
})

app.listen(PORT, () => {
	console.log(`🚀 Server running at http://localhost:${PORT}`)
})
