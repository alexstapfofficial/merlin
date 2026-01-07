import { Universe } from "../astrochart2/src/index";

/**
 * Composable for birth chart rendering
 * @returns {Object} Chart rendering functions
 */
export const useBirthChart = () => {
  /**
   * Calculate birth chart from profile data using API
   */
  const calculateBirthChart = async (profile) => {
    if (!profile?.birthdate || !profile?.birthtime || !profile?.coordinates) {
      throw new Error('Invalid profile data');
    }

    try {
      // Call the horoscope API with the correct format
      const response = await $fetch('/api/horoscope', {
        method: 'POST',
        body: {
          birthdate: {
            birthday: profile.birthdate.birthday,
            birthmonth: profile.birthdate.birthmonth,
            birthyear: profile.birthdate.birthyear
          },
          birthtime: {
            birthhour: profile.birthtime.birthhour,
            birthminute: profile.birthtime.birthminute
          },
          birthlocation: [
            profile.coordinates[0],
            profile.coordinates[1]
          ]
        }
      });

      // Extract horoscope from response
      const horoscope = response.horoscope;

      // Return the chart data with profile metadata
      return {
        id: `chart-${Date.now()}`,
        profile_id: profile.id,
        year: profile.birthdate.birthyear,
        month: profile.birthdate.birthmonth,
        day: profile.birthdate.birthday,
        hour: profile.birthtime.birthhour,
        minute: profile.birthtime.birthminute,
        latitude: profile.coordinates[1],
        longitude: profile.coordinates[0],
        planetaryPositions: horoscope.planetaryPositions,
        houses: horoscope.houses,
        aspects: horoscope.aspects,
        calculated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating birth chart:', error);
      throw error;
    }
  };
  /**
   * Transform horoscope data to chart format
   */
  const transformToChartData = (horoscope) => {
    if (!horoscope?.planetaryPositions || !horoscope?.houses?.Houses) {
      return null;
    }

    const points = horoscope.planetaryPositions.map((planet) => ({
      name: planet.name,
      angle: planet.angle
    }));

    const cusps = horoscope.houses.Houses.map((house) => ({
      angle: house.angle
    }));

    return {
      points,
      cusps,
      midheaven: horoscope.houses?.Midheaven || 0
    };
  };

  /**
   * Validate chart data
   */
  const validateChartData = (chartData) => {
    if (!chartData) {
      return { isValid: false, message: 'Chart data is null or undefined' };
    }

    if (!Array.isArray(chartData.points)) {
      return { isValid: false, message: 'points is not an array' };
    }

    if (!Array.isArray(chartData.cusps)) {
      return { isValid: false, message: 'cusps is not an array' };
    }

    if (chartData.cusps.length !== 12) {
      return { isValid: false, message: `cusps.length is ${chartData.cusps.length}, expected 12` };
    }

    for (const point of chartData.points) {
      if (typeof point.name !== 'string') {
        return { isValid: false, message: 'point.name is not a string' };
      }
      if (typeof point.angle !== 'number') {
        return { isValid: false, message: 'point.angle is not a number' };
      }
    }

    for (const cusp of chartData.cusps) {
      if (typeof cusp.angle !== 'number') {
        return { isValid: false, message: 'cusp.angle is not a number' };
      }
    }

    return { isValid: true, message: '' };
  };

  /**
   * Render birth chart
   */
  const renderChart = (elementId, horoscope) => {
    const element = document.getElementById(elementId);

    if (!element) {
      console.error(`Element with id '${elementId}' not found`);
      return { success: false, error: 'Element not found' };
    }

    const chartData = transformToChartData(horoscope);

    if (!chartData) {
      console.error('Cannot transform horoscope data to chart format');
      return { success: false, error: 'Invalid horoscope data' };
    }

    const validation = validateChartData(chartData);

    if (!validation.isValid) {
      console.error('Chart data validation failed:', validation.message);
      return { success: false, error: validation.message };
    }

    try {
      // Clear existing chart content
      element.innerHTML = '';

      console.log('Rendering chart with data:', chartData);

      const chart = new Universe(elementId).radix().setData(chartData);

      return { success: true, chart };
    } catch (error) {
      console.error('Chart rendering error:', error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Create chart with auto-update on horoscope changes
   */
  const createReactiveChart = (elementId, horoscopeRef) => {
    const chartRef = ref(null);
    const errorRef = ref(null);

    const updateChart = () => {
      if (!horoscopeRef.value?.planetaryPositions || !horoscopeRef.value?.houses?.Houses) {
        console.log('Horoscope data not ready yet');
        return;
      }

      const result = renderChart(elementId, horoscopeRef.value);

      if (result.success) {
        chartRef.value = result.chart;
        errorRef.value = null;
      } else {
        errorRef.value = result.error;
      }
    };

    // Watch for horoscope changes
    watch(() => horoscopeRef.value, (newVal) => {
      if (newVal?.planetaryPositions && newVal?.houses?.Houses) {
        updateChart();
      }
    }, { deep: true });

    // Initial render on mount
    onMounted(() => {
      updateChart();
    });

    return {
      chart: chartRef,
      error: errorRef,
      updateChart
    };
  };

  return {
    calculateBirthChart,
    transformToChartData,
    validateChartData,
    renderChart,
    createReactiveChart
  };
};
