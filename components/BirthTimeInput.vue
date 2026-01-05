<template>
    <div class="flex gap-6 items-center justify-between">
        <label for="birthdate" class="block text-sm font-medium leading-6 text-gray-900">Geburtszeit</label>
            <UInput
                v-model="birthtime"                              
                type="time"
                variant="outline"
            />
    </div>
      
  </template>
  
  <script setup lang="ts">
  const emit = defineEmits(['newTime']);


  const birthtime = ref('')

  const birthhour = computed(()=>{
    return parseInt(birthtime.value.split(':')[0])
 })

 const birthminute = computed(()=>{
        return parseInt(birthtime.value.split(':')[1])
})

const birthtimeSplitted = computed (()=>{
    const time = {
        birthhour: birthhour,
        birthminute: birthminute,
    }
    return time;
})

watch(birthtime,()=>{
    emit('newTime', birthtimeSplitted.value)
})
  </script>
  
  