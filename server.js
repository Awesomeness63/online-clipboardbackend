const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
require('dotenv').config();

const app = express()
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const clipboardSchema = new mongoose.Schema({
    content: String,
    code: String,
    expiresAt: { type: Date, default: Date.now, index: { expires: '5m' } } 
   });
const Clipboard = mongoose.model('Clipboard',clipboardSchema)

app.use(express.json())
app.use(cors())

const crypto = require('crypto');

function generateUniqueCode(content) {
 return crypto.createHash('sha256').update(content).digest('hex').substring(0, 4); // Generate a 10-character hash
}

app.post('/clipboard', async (req, res) => {
    try {
       const code = generateUniqueCode(req.body.content);
       const clipboard = new Clipboard({ content: req.body.content, code });
       await clipboard.save();
       res.status(201).json({ message: 'Content saved to clipboard.', code });
    } catch (error) {
       res.status(500).send('Server error.');
    }
   });

app.get('/clipboard/:code', async (req, res) => {
    try {
       const clipboard = await Clipboard.findOne({ code: req.params.code });
       if (!clipboard) {
         return res.status(404).send('Clipboard content not found.');
       }
       res.status(200).json(clipboard);
    } catch (error) {
       res.status(500).send('Server error.');
    }
   });

   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));