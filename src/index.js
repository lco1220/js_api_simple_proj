const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.listen(3000, console.log('Listening'));
app.use(express.static('public'));

app.get('/countries', async (request, response) => {

  const countries_url = `https://corona.lmao.ninja/v2/countries`;
  const countries_res = await fetch(countries_url);
  const countries_data = await countries_res.json();

  response.json(countries_data);

});

app.get('/jhucsse', async (request, response) => {

  const jhucsse_url = `https://corona.lmao.ninja/v2/jhucsse`;
  const jhucsse_res = await fetch(jhucsse_url);``
  const jhucsse_data = await jhucsse_res.json();

  response.json(jhucsse_data);

});

app.get('/all', async (request, response) => {

  const all_url = `https://corona.lmao.ninja/v2/all`;
  const all_res = await fetch(all_url);``
  const all_data = await all_res.json();

  response.json(all_data);

});