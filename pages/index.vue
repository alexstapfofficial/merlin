<template>
    <div class="bg-[#f4ede0]">
    <div class="flex min-h-full flex-1 flex-col justify-center  p-12 bg-hero-background bg-cover">
      <div v-if="!ascendant" class=" bg-gray-100 sm:mx-auto sm:w-full sm:max-w-sm border-gray-300 border rounded-lg">
        <h2 class="mt-10 text-center text-2xl leading-9 tracking-tight font-justcosmic text-gray-600">Deinen Aszedent berechnen</h2>
        <div class="  mt-10 sm:mx-auto sm:w-full sm:max-w-sm flex justify-center p-8">
          <form class="space-y-6" @submit.prevent="submit" method="POST">
            <Birthtime @new-date="(n) => birthdate = n" @new-time="(n) => birthtime = n" />
            <LocationInput @new-coordinates="(n) => coordinates = n" />
  
            <button type="submit" :disabled="coordinates.length == 0 || !birthdate || !birthtime"
              className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 disabled:hidden w-full data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
              Aszedent erfahren
            </button>
          </form>
        </div>
      </div>
      <div v-if="ascendant" class="mt-10 text-gray-800 bg-gray-100 sm:mx-auto sm:w-full sm:max-w-sm flex justify-center flex-col items-center p-8 border-gray-300 border rounded-lg">
        <h2 class="mt-10 text-center font-justcosmic text-2xl leading-9 tracking-tight text-gray-600">
            Du bist Aszendent: 
        </h2>
        <img class="w-48 h-48" :src="zodiacImagePath"/>
        <h2 class="text-center font-justcosmic text-2xl leading-9 tracking-tight text-gray-600">
            {{ ascendant }}
        </h2>
      </div>
    </div>
    <p>Der Aszendent (auch Ascendent oder Rising Sign genannt) ist das Tierkreiszeichen, das zum Zeitpunkt deiner Geburt am östlichen Horizont aufgeht. Er spielt eine zentrale Rolle in deinem Geburtshoroskop und beeinflusst, wie du dich selbst siehst und wie andere dich wahrnehmen. Der Aszendent prägt dein äußeres Erscheinungsbild, deine Persönlichkeit und die Art und Weise, wie du dich der Welt präsentierst. Er ist entscheidend für den ersten Eindruck, den du auf andere machst, und beschreibt deine natürliche Ausstrahlung und dein Verhalten in neuen Situationen.</p>
</div>
  </template>
  
  <script setup>  
  const birthdate = ref({})
  const birthtime = ref({})
  const coordinates = ref([])
  
  
  const horoscope = ref({})
  
  const zodiacImagePath = computed(()=>{
    return '../img/zodiac/' + ascendant.value + '.svg'
  })
  //Draw the chart
  const submit = async () => {
    const data = await $fetch('/api/horoscope', {
      method: 'POST',
      body: { birthdate: birthdate.value, birthtime: birthtime.value, birthlocation: coordinates.value }
    })
    horoscope.value = data.horoscope
  }

  const ascendant = computed(()=>{
    if(horoscope.value.houses) return horoscope.value.houses.Houses[0].zodiacSign
  })
  </script>

  
  
  <style scoped>
  #paper {
    width: 600px;
    height: 600px;
  }

  .logo-img {
  fill: gray;
}
  </style>