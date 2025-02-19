<template>
    <div>
    <label for="birthlocation" class="block text-sm font-medium leading-6 text-gray-900">Geburtsort</label>
      <Combobox v-model="selected" required>
        <div class="relative mt-1">
          <div
            class="relative w-full cursor-default overflow-hidden rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
          >
            <ComboboxInput
              class="w-full placeholder-black border-none py-2 pl-3 pr-10 text-xs leading-5 text-gray-900 focus:ring-0"
              :placeholder="selected.name"
              @change="query = $event.target.value"
            />
            <ComboboxButton
              class="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <ChevronUpDownIcon
                class="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>
          <TransitionRoot
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ComboboxOptions
              class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            >
              <div
                v-if="LocationPredictions.length === 0 && query !== ''"
                class="relative cursor-default select-none px-4 py-2 text-gray-700"
              >
                Nothing found.
              </div>
  
              <ComboboxOption
              v-for="(location, i) in locations"
              :key = "i"
              :value="location"
                as="template"
                v-slot="{ selected, active }"
              >
                <li
                  class="relative cursor-default select-none py-2 pl-10 pr-4"
                  :class="{
                    'bg-gray-600 text-white': active,
                    'text-gray-900': !active,
                  }"
                >
                  <span
                    class="block truncate"
                    :class="{ 'font-medium': selected, 'font-normal': !selected }"
                  >
                    {{ location.name }}
                  </span>
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3"
                    :class="{ 'text-white': active, 'text-teal-600': !active }"
                  >
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
      </Combobox>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot,
  } from '@headlessui/vue'
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
  
  const emit = defineEmits(['newCoordinates'])

    const selected = ref('')
    const query = ref('')
    const locations = ref([])


    watch(selected,()=>{
        emit('newCoordinates', selected.value.coordinates)
    })

    const LocationPredictions = computed(async()=>{
      const data = await $fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${query.value}&apiKey=d71d73e8ae544f629a808ca1be6a2138`, {method: 'GET'});
      locations.value = data.features;
      locations.value = locations.value.map((location)=>({
        name: LocationName(location),
        coordinates: location.geometry.coordinates
      }));
    })
  
    //Hilfsfunktion der 
    const LocationName = (location)=> {
        return `${location.properties.address_line1}, ${location.properties.address_line2}`
    }
  </script>