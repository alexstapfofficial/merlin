import { defineStore } from "pinia";


export const useBirthDataStore = defineStore("birthdata", {
  persist: true,
  state: () => ({
    name: '',
    birthdate: {},
    birthtime: {},
    coordinates: [],
    horoscope: {},
    birthDatetime: {},
  }),
  getters: {
    getUtcDate() { 
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      return this.utcDate.toLocaleTimeString("en-US", options);;
    },
    getBirthDatetime() {
      const options = {
        timeZone: "Europe/Berlin",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      return this.birthDatetime.toLocaleTimeString("de-DE", options);
    }
  },
  actions: {
    setName(name) {
      this.name = name;
    },
    setBirthdata(birthdate, birthtime, coordinates) {
        this.birthdate = birthdate;
        this.birthtime = birthtime;
        this.coordinates = coordinates;
        this.birthDatetime = new Date(birthdate.birthyear, birthdate.birthmonth, birthdate.birthday, birthtime.birthhour, birthtime.birthminute);
        this.utcDate = new Date(this.birthDatetime.getTime() + this.birthDatetime.getTimezoneOffset() * 60000);
    },
    async fetchHoroscope() {
      // Fetch horoscope data here
      const data = await $fetch('/api/horoscope', {
        method: 'POST',
        body: {
          birthdate: {
            birthyear: this.utcDate.getFullYear(),
            birthmonth: this.utcDate.getMonth(),
            birthday: this.utcDate.getDate(),
          },
          birthtime: {
            birthhour: this.utcDate.getHours(),
            birthminute: this.utcDate.getMinutes(),
          },
          birthlocation: this.coordinates
        },
      });
      console.log('Fetched horoscope data:', data);
      this.horoscope = data.horoscope;
      console.log('Store horoscope after set:', this.horoscope);
    }
  },
});
