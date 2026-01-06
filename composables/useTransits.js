export const useTransits = () => {
  const calculateTransits = async (birthData, transitDate = new Date()) => {
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
      const transitHour = 12; // Use noon for daily transits
      const transitMinute = 0;

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
