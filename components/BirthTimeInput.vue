<template>
    <div class="birthtime-picker">
        <UInput
            v-model="birthtime"
            type="time"
            variant="outline"
            size="lg"
            class="birthtime-input"
        />
    </div>

  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    initialTime: {
      type: Object,
      default: null
    }
  });

  const emit = defineEmits(['newTime']);

  const birthtime = ref('');

  // Initialize with existing time if provided
  onMounted(() => {
    if (props.initialTime && props.initialTime.birthhour !== undefined && props.initialTime.birthminute !== undefined) {
      const hour = String(props.initialTime.birthhour).padStart(2, '0');
      const minute = String(props.initialTime.birthminute).padStart(2, '0');
      birthtime.value = `${hour}:${minute}`;
    }
  });

  const birthhour = computed(()=>{
    return parseInt(birthtime.value.split(':')[0] || '0')
 })

 const birthminute = computed(()=>{
        return parseInt(birthtime.value.split(':')[1] || '0')
})

const birthtimeSplitted = computed (()=>{
    const time = {
        birthhour: birthhour.value,
        birthminute: birthminute.value,
    }
    return time;
})

watch(birthtime,()=>{
    emit('newTime', birthtimeSplitted.value)
})
  </script>

  <style scoped>
.birthtime-picker {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.birthtime-picker .birthtime-input,
.birthtime-picker .birthtime-input input {
  background: #F5ECDC;
  color: #1F1D20;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
}

.birthtime-picker .birthtime-input:focus,
.birthtime-picker .birthtime-input input:focus {
  border-color: #1F1D20;
  box-shadow: 0 0 0 3px rgba(31, 29, 32, 0.1);
  outline: none;
}
  </style>
