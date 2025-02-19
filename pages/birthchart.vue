<template>
    <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 h-screen">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-40 w-auto" src="~/assets/img/CosmicPath.png" />
        <h2 class="mt-10 text-center text-2xl leading-9 tracking-tight text-gray-600">Deinen Aszedent berechnen
        </h2>
        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm flex justify-center p-4 border border-gray-300 rounded-lg">
          <form class="space-y-6" @submit.prevent="submit" method="POST">
            <Birthtime @new-date="(n) => birthdate = n" @new-time="(n) => birthtime = n" />
            <LocationInput @new-coordinates="(n) => coordinates = n" />
  
            <button type="submit" :disabled="coordinates.length == 0 || !birthdate || !birthtime"
              className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 disabled:hidden w-full data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
              Aszedent erfahren
            </button>
            <button @click="downloadSvg"
              className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 disabled:hidden w-full data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
              download
            </button>
            <button @click="writeHoroscope"
              className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 disabled:hidden w-full data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
              chatgpt
            </button>
          </form>
        </div>
      </div>
      <div id="paper"></div>
      <div v-html="prompt"></div>
    </div>
  
  </template>
  
  <script setup>
  import { Universe } from "../astrochart2/src/index"
  
  const birthdate = ref({})
  const birthtime = ref({})
  const coordinates = ref([])
  
  
  const horoscope = ref({})
  
  
  //Draw the chart
  const submit = async () => {
    const data = await $fetch('/api/horoscope', {
      method: 'POST',
      body: { birthdate: birthdate.value, birthtime: birthtime.value, birthlocation: coordinates.value }
    })
    horoscope.value = data.horoscope
  
    const planetaryPositions = horoscope.value.planetaryPositions.map((planet) => ({
      name: planet.name,
      angle: planet.angle
    }))
  
    const houses = horoscope.value.houses.Houses.map((house) => ({
      angle: house.angle
    }))
  
    let ChartData = {
      "points": planetaryPositions,
      "cusps": houses,
      "midheaven": horoscope.value.houses.Midheaven,
    }
  
    const chart = new Universe('paper').radix().setData(ChartData)
  }
  
  const prompt = computed(()=> {
    let promptString = 'Write a birth horoscope for a person with: '
    if(horoscope.value.houses){
      horoscope.value.houses.Houses.forEach(house => { 
      promptString += `${house.houseNumber}.House is in sign ${house.zodiacSign}` + "<br>"
      if (house.planets.length > 0) {
        promptString += "Planets: "
        house.planets.forEach(planet => {
          promptString += planet + " "
        })
        promptString += "<br>"
      }
    })
    }
    return promptString;
  })
  
  
  
  const downloadSvg = async () => {
    // Get the SVG element
    const svgElement = document.getElementById('paper');
  
    // Serialize the SVG as a string
    let svgData = new XMLSerializer().serializeToString(svgElement);
  
    try {
      // Fetch the local font file from the public folder
      const response = await fetch('Astronomicon.ttf');
      const blob = await response.blob();
  
  
      // Convert the font blob to a Base64 string using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Remove metadata
        const fontStyle = `
        <defs>
              <style type="text/css">
                @font-face {
                  font-family: 'Astronomicon';
                  src: url(data:font/ttf;base64,${base64String}) format('truetype');
                }
                text {
                  font-family: 'Astronomicon';
                  font-size: 24px;
                }
              </style>
            </defs>
      `;
  
        // Inject the <style> tag into the <svg>
        svgData = svgData.replace('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 800 800">', `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 800 800"> ${fontStyle}`);
  
  
        // Create a Blob object for the SVG data
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  
        // Create a temporary <a> element to download the blob
        const downloadLink = document.createElement('a');
        const url = URL.createObjectURL(blob);
  
        downloadLink.href = url;
        downloadLink.download = 'natal_chart.svg'; // Specify the name of the downloaded file
        document.body.appendChild(downloadLink);
  
        // Trigger the download
        downloadLink.click();
  
        // Clean up
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
  
      };
  
      reader.readAsDataURL(blob);  // Read the font blob as Base64
    } catch (error) {
      console.error('Error loading the font file:', error);
    }
  }
  
  
  
  const message = ref('Write a birth horoscope for a person with: ');
  const response = ref('');
  
  const writeHoroscope = async () => {
  
    message.value += prompt.value
  
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message.value })
    });
    response.value = await res.text();
    console.log(response.value)
  };
  
  
  </script>
  
  <style scoped>
  #paper {
    width: 600px;
    height: 600px;
  }
  </style>