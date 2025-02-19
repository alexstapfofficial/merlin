<template>
    <div class="flex gap-8">
        <div>
            <label for="birthdate" class="block text-sm font-medium leading-6 text-gray-900">Geburtstag</label>
            <div class="mt-2">
                <input id="birthdate" @change="emit('newDate', birthdateSplitted)" v-model="birthdate" name="birthdate" type="date" required=""
                    class="block text-center w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
        </div>
        <div>
            <div>
                <label for="birthtime" class="block text-sm font-medium leading-6 text-gray-900">Geburtszeit</label>
            </div>
            <div class="mt-2 flex gap-2">
                <input id="birthtime" @change="emit('newTime', birthtimeSplitted)" v-model="birthtime" name="birthtime" type="time" required=""
                    class="block text-center w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
        </div>
    </div>
</template>

<script setup>
const birthdate = ref('')
const birthtime = ref('')

const emit = defineEmits(['newTime', 'newDate'])

const birthday = computed(()=>{
    const day = new Date(birthdate.value).getDate();
    console.log(day) 
    return day
})

const birthmonth = computed(()=>{
    const month = new Date(birthdate.value).getMonth();
   
    return month 
})

const birthyear = computed(()=>{
    const year = new Date(birthdate.value).getFullYear();
   
    return year
})

const birthhour = computed(()=>{
    return parseInt(birthtime.value.split(':')[0])
})

const birthminute = computed(()=>{
    return parseInt(birthtime.value.split(':')[1])
})


const birthdateSplitted = computed (()=>{
    const date = {
        birthday: birthday,
        birthmonth: birthmonth,
        birthyear: birthyear,
    }
    return date;
})

const birthtimeSplitted = computed (()=>{
    const time = {
        birthhour: birthhour,
        birthminute: birthminute,
    }
    return time;
})
</script>