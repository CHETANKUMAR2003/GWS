const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');

// Ensure directories exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to get the most recent file data
function getRecentData() {
    const files = fs.readdirSync(dataDir);
    const recentFile = files.sort((a, b) => fs.statSync(path.join(dataDir, b)).mtime - fs.statSync(path.join(dataDir, a)).mtime)[0];
    const recentFilePath = path.join(dataDir, recentFile);

    if (!recentFile) return null;

    return JSON.parse(fs.readFileSync(recentFilePath));
}

app.post('/upload', (req, res) => {
    const { videoLink, observations, feedback, email } = req.body;
    const timestamp = Date.now();
    const dataFile = path.join(dataDir, `${timestamp}.json`);
    const data = { videoLink, observations, feedback, email };

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    console.log('Data saved successfully:', data);
    res.redirect('/teacher.html');
});

app.get('/parent-data', (req, res) => {
    const data = getRecentData();
    if (data) {
        console.log('Sending data to parent:', data);
        res.json(data);
    } else {
        res.status(404).send('No data found.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
