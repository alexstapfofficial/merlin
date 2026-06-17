<template>
    <div>
    <label for="birthlocation" class="block text-sm font-medium leading-6 text-beige-950">Geburtsort</label>
      <Combobox v-model="selected" class="z-10" required>
        <div class="relative mt-1">
          <div
            class="relative w-full cursor-default overflow-hidden rounded-lg border border-beige-400 bg-beige-50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-beige-600 focus-visible:ring-offset-2 sm:text-sm"
          >
            <ComboboxInput
              class="w-full bg-transparent border-none py-2 pl-3 pr-10 text-sm leading-5 text-beige-950 placeholder-beige-700 focus:ring-0"
              :placeholder="selected.name || 'Stadt eingeben...'"
              @change="handleInputChange"
            />
            <ComboboxButton
              class="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <ChevronUpDownIcon
                class="h-5 w-5 text-beige-700"
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
              class="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-beige-50 py-1 text-base shadow-lg border border-beige-400 focus:outline-none sm:text-sm"
            >
              <div
                v-if="locations.length === 0 && query !== '' && !loading"
                class="relative cursor-default select-none px-4 py-2 text-beige-700"
              >
                Keine Ergebnisse gefunden.
              </div>

              <div
                v-if="loading"
                class="relative cursor-default select-none px-4 py-2 text-beige-700"
              >
                Suche läuft...
              </div>

              <ComboboxOption
              v-for="location in locations"
              :key="location.placeId"
              :value="location"
                as="template"
                v-slot="{ selected, active }"
              >
                <li
                  class="relative cursor-default select-none py-2 pl-10 pr-4"
                  :class="{
                    'bg-beige-400 text-beige-950': active,
                    'text-beige-950': !active,
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
                    :class="{ 'text-beige-950': active, 'text-beige-700': !active }"
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
  import { ref, watch, onMounted } from 'vue'
  import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot,
  } from '@headlessui/vue'
  import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

  const props = defineProps({
    initialCoordinates: {
      type: Array,
      default: null
    }
  });

  const emit = defineEmits(['newCoordinates'])

  const selected = ref({ name: '', placeId: '', coordinates: null })
  const query = ref('')
  const locations = ref([])
  const loading = ref(false)

  // Initialize with existing coordinates if provided
  onMounted(() => {
    if (props.initialCoordinates && props.initialCoordinates.length === 2) {
      // Display coordinates as placeholder text
      const [lng, lat] = props.initialCoordinates;
      selected.value = {
        name: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        placeId: '',
        coordinates: props.initialCoordinates
      };
    }
  });

  // Coordinates are delivered directly with each suggestion from the places table.
  watch(selected, (newSelected) => {
    if (newSelected?.coordinates) {
      emit('newCoordinates', newSelected.coordinates)
    }
  })

  // Debounce timer
  let debounceTimer = null

  // Handle input change with debouncing
  const handleInputChange = (event) => {
    query.value = event.target.value

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (!query.value || query.value.length < 2) {
      locations.value = []
      return
    }

    debounceTimer = setTimeout(async () => {
      await fetchLocationPredictions()
    }, 300)
  }

  // Fetch location predictions from Google API
  const fetchLocationPredictions = async () => {
    if (!query.value || query.value.length < 2) {
      locations.value = []
      return
    }

    loading.value = true

    try {
      const data = await $fetch(`/api/geocoding?text=${encodeURIComponent(query.value)}`)

      locations.value = data.predictions.map((prediction) => ({
        name: prediction.description,
        placeId: prediction.place_id,
        // Coordinates come straight from the places table, no extra lookup needed.
        coordinates: prediction.coordinates ?? null
      }))
    } catch (error) {
      console.error('Error fetching geocoding data:', error)
      locations.value = []
    } finally {
      loading.value = false
    }
  }
  </script>
