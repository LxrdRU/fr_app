const express = require('express');


const app = express();

app.get('/', (req, res) => {
	res.send('this is working');
})
console.log('aboba');
app.listen(3000, ()=>{
	console.log('its running');
})