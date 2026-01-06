<template>
    <div class="font-mono">
        <table class="font-mono py-4">
            <tbody>
                <tr>
                    <td class="text-gray-600 px-4"> Dominantes Zeichen:</td>
                    <td>{{ horoscope.overview.dominant_sign }}</td>
                </tr>
                <tr>
                    <td class="text-gray-600 px-4">Dominater Planet:</td>
                    <td>{{ horoscope.overview.dominant_planet }}</td>
                </tr>
            </tbody>
        </table>

        <p class="p-4">
            {{ horoscope.overview.summary }}
        </p>

        <div class="p-4" v-for="house in horoscope.houses">
            <h2 class="font-justcosmic">{{ house.house }}. Haus steht im Zeichen {{ house.sign }}</h2>
            <p>{{ house.interpretation }}</p>
        </div>

        <div class="p-4" v-for="planet in horoscope.planets">
            <h2 class="font-justcosmic">{{ planet.planet }} steht im Zeichen {{ planet.sign }} und im {{ planet.house }}.Haus</h2>
            <p>{{ planet.interpretation }}</p>
        </div>

        <div class="p-4" v-for="aspect in horoscope.aspects">
            <h2 class="font-justcosmic">{{ aspect.planets }} bilden {{ aspect.aspect }}</h2>
            <p>{{ aspect.interpretation }}</p>
        </div>

        <h2 class="font-justcosmic">Empfehlungen:</h2>

        <p  class="p-4" v-for="recommendation in horoscope.recommendations">
            {{ recommendation }}
        </p>
    </div>
</template>

<script setup>
import horoscope from '~/assets/template/Chrissi.json';
</script>