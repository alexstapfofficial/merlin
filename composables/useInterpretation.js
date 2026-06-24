// Frontend access to the LLM interpretation endpoints. Results are cached in
// Postgres server-side, so repeated calls are cheap/instant.
export const useInterpretation = () => {
  // Holistic per-profile reading (e.g. section 'core').
  const fetchReading = async (profileId, chart, section = 'core') => {
    const data = await $fetch('/api/interpret-chart', {
      method: 'POST',
      body: { profileId, section, chart },
    });
    return data.markdown;
  };

  // Personal daily horoscope for `date` (YYYY-MM-DD), split into life areas
  // (each tagged harmonisch/herausfordernd/ausgeglichen). Cached per profile + day.
  const fetchDaily = async (profileId, date, transits, sky) => {
    const data = await $fetch('/api/interpret-daily', {
      method: 'POST',
      body: { profileId, date, transits, sky },
    });
    return { intro: data.intro, areas: data.areas || [] };
  };

  return { fetchReading, fetchDaily };
};
