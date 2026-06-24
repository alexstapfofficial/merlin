import { useBirthDataStore } from "~/stores/birthDataStore";

/**
 * Composable for profile management and horoscope generation
 * @returns {Object} Profile management functions
 */
export const useProfile = () => {
  const birthDataStore = useBirthDataStore();
  const router = useRouter();

  /**
   * Generate horoscope for a profile
   */
  const generateHoroscope = async (profile) => {
    if (!profile) {
      throw new Error('Profile is required');
    }

    if (!profile.name || !profile.birthdate || !profile.birthtime || !profile.coordinates) {
      throw new Error('Profile is missing required fields');
    }

    // Set birth data in store
    birthDataStore.setName(profile.name);
    birthDataStore.setBirthdata(
      profile.birthdate,
      profile.birthtime,
      profile.coordinates
    );

    // Fetch horoscope from API
    await birthDataStore.fetchHoroscope();

    // Navigate to the chart overview
    await router.push('/himmel');
  };

  /**
   * Generate horoscope with loading state
   */
  const generateHoroscopeWithLoading = async (profile, loadingRef) => {
    if (loadingRef) {
      loadingRef.value = true;
    }

    try {
      await generateHoroscope(profile);
    } catch (error) {
      console.error('Error generating horoscope:', error);
      throw error;
    } finally {
      if (loadingRef) {
        loadingRef.value = false;
      }
    }
  };

  /**
   * Validate profile data
   */
  const validateProfile = (profile) => {
    const errors = [];

    if (!profile.name || profile.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!profile.birthdate) {
      errors.push('Birth date is required');
    } else {
      if (!profile.birthdate.birthday || profile.birthdate.birthday < 1 || profile.birthdate.birthday > 31) {
        errors.push('Invalid birth day');
      }
      if (!profile.birthdate.birthmonth || profile.birthdate.birthmonth < 1 || profile.birthdate.birthmonth > 12) {
        errors.push('Invalid birth month');
      }
      if (!profile.birthdate.birthyear || profile.birthdate.birthyear < 1900 || profile.birthdate.birthyear > new Date().getFullYear()) {
        errors.push('Invalid birth year');
      }
    }

    if (!profile.birthtime) {
      errors.push('Birth time is required');
    } else {
      if (profile.birthtime.birthhour < 0 || profile.birthtime.birthhour > 23) {
        errors.push('Invalid birth hour');
      }
      if (profile.birthtime.birthminute < 0 || profile.birthtime.birthminute > 59) {
        errors.push('Invalid birth minute');
      }
    }

    if (!profile.coordinates || !Array.isArray(profile.coordinates) || profile.coordinates.length !== 2) {
      errors.push('Invalid coordinates');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Format birth date for display
   */
  const formatBirthDate = (birthdate) => {
    if (!birthdate) return '';
    const { birthday, birthmonth, birthyear } = birthdate;
    // birthmonth ist 0-basiert (0=Januar, 11=Dezember), daher +1 für Anzeige
    const displayMonth = birthmonth + 1;
    return `${birthday}.${displayMonth}.${birthyear}`;
  };

  /**
   * Format birth time for display
   */
  const formatBirthTime = (birthtime) => {
    if (!birthtime) return '';
    const { birthhour, birthminute } = birthtime;
    const hour = String(birthhour).padStart(2, '0');
    const minute = String(birthminute).padStart(2, '0');
    return `${hour}:${minute}`;
  };

  /**
   * Format coordinates for display
   */
  const formatCoordinates = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) return '';
    const [longitude, latitude] = coordinates;
    return `${longitude.toFixed(2)}°, ${latitude.toFixed(2)}°`;
  };

  return {
    generateHoroscope,
    generateHoroscopeWithLoading,
    validateProfile,
    formatBirthDate,
    formatBirthTime,
    formatCoordinates
  };
};
