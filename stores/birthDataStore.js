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
      // Send the RAW local birth time (the clock time at the birthplace).
      // circular-natal-horoscope-js derives the timezone from the coordinates
      // and converts to UTC itself — so we must NOT pre-shift the time here
      // (the old utcDate math used the browser's timezone and shifted twice,
      // which threw the Ascendant off by ~1 sign).
      const data = await $fetch('/api/birthchart', {
        method: 'POST',
        body: {
          birthdate: {
            birthyear: this.birthdate.birthyear,
            birthmonth: this.birthdate.birthmonth, // 0-based; the API adds +1
            birthday: this.birthdate.birthday,
          },
          birthtime: {
            birthhour: this.birthtime.birthhour,
            birthminute: this.birthtime.birthminute,
          },
          birthlocation: this.coordinates,
        },
      });
      this.horoscope = data.horoscope;
    }
  },
});
