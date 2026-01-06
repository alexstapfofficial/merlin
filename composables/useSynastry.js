export const useSynastry = () => {
  const calculateSynastry = async (person1Data, person2Data) => {
    try {
      const response = await $fetch('/api/synastry', {
        method: 'POST',
        body: {
          person1: {
            year: person1Data.birthdate.birthyear,
            month: person1Data.birthdate.birthmonth === 12 ? 1 : person1Data.birthdate.birthmonth + 1,
            day: person1Data.birthdate.birthday,
            hour: person1Data.birthtime.birthhour,
            minute: person1Data.birthtime.birthminute,
            latitude: person1Data.coordinates[1],
            longitude: person1Data.coordinates[0]
          },
          person2: {
            year: person2Data.birthdate.birthyear,
            month: person2Data.birthdate.birthmonth === 12 ? 1 : person2Data.birthdate.birthmonth + 1,
            day: person2Data.birthdate.birthday,
            hour: person2Data.birthtime.birthhour,
            minute: person2Data.birthtime.birthminute,
            latitude: person2Data.coordinates[1],
            longitude: person2Data.coordinates[0]
          }
        }
      });

      return response;
    } catch (error) {
      console.error('Fehler beim Berechnen der Synastrie:', error);
      throw error;
    }
  };

  const getCompatibilityLevel = (score) => {
    if (score >= 80) return { level: 'Ausgezeichnet', color: '#4caf50', emoji: '💚' };
    if (score >= 70) return { level: 'Sehr gut', color: '#8bc34a', emoji: '💛' };
    if (score >= 60) return { level: 'Gut', color: '#ffc107', emoji: '💙' };
    if (score >= 50) return { level: 'Durchschnittlich', color: '#ff9800', emoji: '🧡' };
    if (score >= 40) return { level: 'Herausfordernd', color: '#ff5722', emoji: '❤️‍🩹' };
    return { level: 'Sehr herausfordernd', color: '#f44336', emoji: '💔' };
  };

  const getCategoryName = (category) => {
    const names = {
      emotional: 'Emotionale Verbindung',
      romance: 'Romantik',
      communication: 'Kommunikation',
      stability: 'Stabilität',
      growth: 'Wachstum',
      other: 'Sonstiges'
    };
    return names[category] || category;
  };

  const getAspectColor = (aspect) => {
    const colors = {
      conjunction: '#9c27b0',
      sextile: '#4ecdc4',
      square: '#ff9800',
      trine: '#4caf50',
      opposition: '#f44336'
    };
    return colors[aspect] || '#757575';
  };

  return {
    calculateSynastry,
    getCompatibilityLevel,
    getCategoryName,
    getAspectColor
  };
};
