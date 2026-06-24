export const useTransits = () => {
  // exactTime=true → rechnet auf die genaue Uhrzeit von transitDate (für „Der
  // Himmel · jetzt", v.a. den Aszendenten). Standard bleibt 12:00 Uhr, damit
  // Tages-Transite stabil/mittig liegen (transits.vue, horoscopes.vue).
  const calculateTransits = async (birthData, transitDate = new Date(), { exactTime = false } = {}) => {
    try {
      // Convert birth data to the format needed for the API
      const birthYear = birthData.birthdate.birthyear;
      const birthMonth = birthData.birthdate.birthmonth === 12 ? 1 : birthData.birthdate.birthmonth + 1;
      const birthDay = birthData.birthdate.birthday;
      const birthHour = birthData.birthtime.birthhour;
      const birthMinute = birthData.birthtime.birthminute;
      const birthLatitude = birthData.coordinates[1];
      const birthLongitude = birthData.coordinates[0];

      // Transit date (today or specified date)
      const transitYear = transitDate.getFullYear();
      const transitMonth = transitDate.getMonth() + 1;
      const transitDay = transitDate.getDate();
      // 12:00 für stabile Tages-Transite; bei exactTime die echte Uhrzeit (für „jetzt")
      const transitHour = exactTime ? transitDate.getHours() : 12;
      const transitMinute = exactTime ? transitDate.getMinutes() : 0;

      const response = await $fetch('/api/transits', {
        method: 'POST',
        body: {
          birth: {
            year: birthYear,
            month: birthMonth,
            day: birthDay,
            hour: birthHour,
            minute: birthMinute,
            latitude: birthLatitude,
            longitude: birthLongitude
          },
          transit: {
            year: transitYear,
            month: transitMonth,
            day: transitDay,
            hour: transitHour,
            minute: transitMinute,
            latitude: birthLatitude,
            longitude: birthLongitude
          }
        }
      });

      return response;
    } catch (error) {
      console.error('Fehler beim Berechnen der Transite:', error);
      throw error;
    }
  };

  const formatTransitAspect = (aspect) => {
    const aspectSymbols = {
      conjunction: '☌',
      sextile: '⚹',
      square: '□',
      trine: '△',
      opposition: '☍'
    };

    return {
      ...aspect,
      symbol: aspectSymbols[aspect.aspect] || aspect.aspect
    };
  };

  return {
    calculateTransits,
    formatTransitAspect
  };
};
