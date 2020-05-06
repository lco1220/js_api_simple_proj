let mapboxTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
       tileSize: 512,
       zoomOffset: -1
});

let mymap = L.map('map')
  .addLayer(mapboxTiles)
  .setView([20, 0], 2)
  .setMinZoom(2);

let markers = new L.FeatureGroup();

const search = document.getElementById('search');
const matchList = document.getElementById('match-list');
const matchResult = document.getElementById('match-result');
let matchValues = document.querySelectorAll('.match_value');
const buttons = document.querySelectorAll('.button__filter');
const tableBody = document.getElementById('table__body');
let filteredData = [];
let filteredCountry = [];
search.value = ''

async function showData() {

    const response = await fetch('/countries');
    const show_countries = await response.json();

    const jhucsse_res = await fetch('/jhucsse');
    const show_jhucsse = await jhucsse_res.json();

    const all_res = await fetch('/all');
    const show_all = await all_res.json();
  // console.log(show_conti);
  // console.log(filteredData);

    document.getElementById('infoCases').textContent = show_all.cases.toLocaleString();
    document.getElementById('infoActive').textContent = show_all.active.toLocaleString();
    document.getElementById('infoRecov').textContent = show_all.recovered.toLocaleString();
    document.getElementById('infoDeaths').textContent = show_all.deaths.toLocaleString();

    show_countries.forEach(country_a => {
      filteredData.push(country_a);
    });

    filteredData.forEach(data => {
      filteredCountry.push(data.country);
    })

    show_jhucsse.forEach(country => {
      if(country.province != null && !(filteredCountry.includes(country.province))) {
        filteredData.push(country);
      }
    });

    // Searching..
    search.addEventListener('input', () => {
      let searchText = search.value;
      let matches = filteredData.filter(location => {
        // console.log(location)
        const regex = new RegExp(`^${searchText}`, 'gi');
        matchList.classList.remove(`hidden`)
        if(location.province == undefined) {
          return location.country.match(regex)
        } else {
          return location.country.match(regex) || location.province.match(regex)
        }
      });

      if(searchText.length == 0) {
        matches = [];
        matchList.innerHTML = '';
        matchList.classList.add(`hidden`);
        matchResult.classList.add(`hidden`);
      }

      outputMatchList(matches)
    });

    // Selected Country
    const searchCountry = selectedCountry => {

      matchResult.classList.remove('hidden');
      matchResult.classList.add('block')
      search.value = selectedCountry

      filteredData.forEach(data => {

        if(data.province == null && data.country == selectedCountry) {
          mymap.flyTo([data.countryInfo.lat, data.countryInfo.long], 7)

          matchResult.innerHTML = 
          `<h2 class="text-xl text-center tracking-widest md:text-3xl">${data.country}</h2>
            <ul class="md:flex md:flex-col md:justify-center md:content-center">
              <li class="my-5 text-lg tracking-wider text-red-300 md:text-xl md:flex-auto md:my-2 md:w-auto">Coronavirus Cases: <span class="text-xl md:text-2xl tracking-wider">${data.cases}</span> <small class="text-sm align-top tracking-wider">${data.todayCases}</small> </li>
              <li class="my-5 text-lg tracking-wider text-red-400 md:flex-auto md:my-2 md:w-auto">Active Cases: <span class="text-xl md:text-2xl tracking-wider">${data.active}</span></li>
              <li class="my-5 text-lg tracking-wider text-green-400 md:text-xl md:flex-auto md:my-2 md:w-auto">Recovered Cases: <span class="text-xl md:text-2xl tracking-wider">${data.recovered}</span></li>
              <li class="my-5 text-lg tracking-wider text-gray-400 md:text-xl md:flex-auto md:my-2 md:w-auto">Deaths: <span class="text-xl md:text-2xl tracking-wider">${data.deaths}</span> <small class="text-sm align-top tracking-wider">${data.todayDeaths}</small> </li>
            </ul>`;

        } else if(data.province == selectedCountry){
          mymap.flyTo([data.coordinates.latitude, data.coordinates.longitude], 7)
          matchResult.innerHTML = 
          `<h2 class="text-3xl text-center tracking-widest">${data.province} <span class="text-sm">${data.country}</span></h2>
          <ul class="md:flex md:flex-col md:justify-center md:content-center">
            <li class=" md:flex-auto md:my-2 md:w-auto my-5 text-lg md:text-xl tracking-wider text-red-300">Coronavirus Cases: <span class="text-xl md:text-2xl tracking-wider ">${data.stats.confirmed}</span></li>
            <li class=" md:flex-auto md:my-2 md:w-auto my-5 text-lg md:text-xl tracking-wider text-green-400">Recovered Cases: <span class="text-xl md:text-2xl tracking-wider">${data.stats.recovered}</span></li>
            <li class=" md:flex-auto md:my-2 md:w-auto my-5 text-lg md:text-xl tracking-wider text-gray-400">Deaths: <span class="text-xl md:text-2xl tracking-wider ">${data.stats.deaths}</span></li>
          </ul>`;

        }

      })

    }

    // Output Match
    const outputMatchList = matches => {
      if(matches.length > 0) {
        let output = `<ul class="list-none">`
        matches.forEach(match => {
          if(match.province == undefined) {
            output += `<li class="transition duration-700 ease-in-out py-2 px-4 leading-snug cursor-pointer font-sans text-md antialiased tracking-wider hover:bg-gray-300 match_value">${match.country}</li>`
          } else {
            output += `<li class="transition duration-700 ease-in-out py-2 px-4 leading-snug cursor-pointer font-sans text-md antialiased tracking-wider hover:bg-gray-300 match_value">${match.province}<small class="text-xs uppercase ml-1">${match.country}</small></li>`
          }
        });
        matchList.innerHTML = output;
    
        document.querySelectorAll('.match_value').forEach(matchValue => {


          matchValue.addEventListener('click', (e)=> {
            if(e.target.lastElementChild == null) {
              // console.log(e.target.textContent)
              searchCountry(e.target.textContent);
              matchList.classList.add('hidden');
              matchResult.classList.remove('hidden')
            } else {
              // console.log(e.target.lastElementChild.previousSibling.textContent)
              searchCountry(e.target.lastElementChild.previousSibling.textContent)
              
              matchList.classList.add('hidden');
              matchResult.classList.remove('hidden');
            }
          })
        
        })
    
      }
    }

    const checkForRadius = statNumber => {

      if(statNumber == 0 || statNumber == null) {
        return 2
      } else if(statNumber < 1000 && statNumber >= 1) {
        return 4
      } else if(statNumber >= 1000 && statNumber < 5000) {
        return 6
      } else if(statNumber >= 5000 && statNumber < 10000) {
        return 8
      } else if(statNumber >= 10000 && statNumber < 25000) {
        return 10
      } else if(statNumber >= 25000 && statNumber < 50000) {
        return 12
      } else if(statNumber >= 50000 && statNumber < 75000) {
        return 14
      } else if(statNumber >= 75000 && statNumber < 100000) {
        return 16
      } else if(statNumber >= 1000000 && statNumber < 150000){
        return 18
      } else {
        return 20
      }

    }

    const mapData = (selectedBtn,selectedColor) => {

      let confirmedCtry;
      let casesCtry;

      if(selectedBtn == 'cases') {
        confirmedCtry = 'confirmed';
        casesCtry = 'cases'
      } else if(selectedBtn == 'recovered'){
        confirmedCtry = 'recovered';
        casesCtry = 'recovered'
      } else {
        confirmedCtry = 'deaths';
        casesCtry = 'deaths'
      }

      filteredData.forEach(country => {
        
        if(country.province == undefined) {
          let marker_1 = L.circleMarker([country.countryInfo.lat, country.countryInfo.long],
            {
              color: selectedColor,
              fillColor: selectedColor,
              fillOpacity: 0.7,
              radius: checkForRadius(country[casesCtry])
            }
          );
          marker_1.on('mouseover', (e) => {
                    L.popup()
                      .setLatLng(e.latlng) 
                      .setContent(`${country.country} <span style="color:${selectedColor};">${country[casesCtry].toLocaleString()}</span>`)
                      .openOn(mymap);
                    })
                  .on('click', () => searchCountry(country.country));

          markers.addLayer(marker_1);
        } else {
          let marker_2 = L.circleMarker([country.coordinates.latitude, country.coordinates.longitude],
          {            
            color: selectedColor,
            fillColor: selectedColor,
            fillOpacity: 0.7,
            radius: checkForRadius(country.stats[confirmedCtry])
          })
          marker_2.on('mouseover', (e) => {
                    L.popup()
                      .setLatLng(e.latlng) 
                      .setContent(`${country.province} <span style="color:${selectedColor};">${country.stats[confirmedCtry].toLocaleString()}</span>`)
                      .openOn(mymap);
                    })
                  .on('click', () => searchCountry(country.province));
          markers.addLayer(marker_2);
        }

      })
    }
    // Button
    buttons.forEach(btn => {

      btn.addEventListener('click', (e)=> {
        
        if(e.target.textContent === "Cases") {
          if( e.target.nextElementSibling.classList.contains('bg-green-400') || e.target.nextElementSibling.nextElementSibling.classList.contains('bg-gray-400')) {
            e.target.nextElementSibling.nextElementSibling.classList.remove('bg-gray-400')
            e.target.nextElementSibling.classList.remove('bg-green-400');
          }
          e.target.classList.add('bg-red-400');
          markers.clearLayers();
          mapData('cases','#fc8181')
          
        } else if(e.target.textContent === 'Recoveries') {
          if(e.target.previousElementSibling.classList.contains('bg-red-400') || e.target.nextElementSibling.classList.contains('bg-gray-400')) {
            e.target.previousElementSibling.classList.remove('bg-red-400');
            e.target.nextElementSibling.classList.remove('bg-gray-400');
          }
          e.target.classList.add('bg-green-400');
          markers.clearLayers();
          mapData('recovered','#68d391')
          
        } else {
          if(e.target.previousElementSibling.classList.contains('bg-green-400') || e.target.previousElementSibling.previousElementSibling.classList.contains('bg-red-400')) {
            e.target.previousElementSibling.previousElementSibling.classList.remove('bg-red-400')
            e.target.previousElementSibling.classList.remove('bg-green-400');
          }
          e.target.classList.add('bg-gray-400');
          markers.clearLayers();
          mapData('deaths','#1a202c')
        }
        // console.log()
      })

    })


    // console.log(sortCountries)

mymap.addLayer(markers)

}

showData();