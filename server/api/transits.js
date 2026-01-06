import { calculateHoroscope } from "../utils/horoscope.js";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    // Calculate birth chart
    const birthChart = calculateHoroscope(
        body.birth.year,
        body.birth.month,
        body.birth.day,
        body.birth.hour,
        body.birth.minute,
        body.birth.latitude,
        body.birth.longitude
    );

    // Calculate transit chart (current planetary positions)
    const transitChart = calculateHoroscope(
        body.transit.year,
        body.transit.month,
        body.transit.day,
        body.transit.hour,
        body.transit.minute,
        body.transit.latitude,
        body.transit.longitude
    );

    // Calculate aspects between transit planets and natal planets
    const transits = calculateTransitAspects(
        birthChart.planetaryPositions,
        transitChart.planetaryPositions
    );

    return {
        birthChart,
        transitChart,
        transits,
        transitDate: {
            year: body.transit.year,
            month: body.transit.month,
            day: body.transit.day
        }
    };
});

// Calculate aspects between transit planets and natal planets
const calculateTransitAspects = (natalPlanets, transitPlanets) => {
    const aspects = [];
    const aspectAngles = {
        conjunction: 0,
        sextile: 60,
        square: 90,
        trine: 120,
        opposition: 180,
    };

    // Orbs for transits (very tight - only near-exact transits)
    const orbs = {
        conjunction: 3,
        sextile: 2,
        square: 3,
        trine: 3,
        opposition: 3,
    };

    for (const transitPlanet of transitPlanets) {
        for (const natalPlanet of natalPlanets) {
            const angle = Math.abs(transitPlanet.longitude - natalPlanet.longitude);
            const normalizedAngle = angle > 180 ? 360 - angle : angle;

            for (const [aspectName, aspectDegree] of Object.entries(aspectAngles)) {
                const orb = orbs[aspectName];
                if (Math.abs(normalizedAngle - aspectDegree) <= orb) {
                    aspects.push({
                        transitPlanet: transitPlanet.name,
                        natalPlanet: natalPlanet.name,
                        aspect: aspectName,
                        exactAngle: normalizedAngle,
                        orb: Math.abs(normalizedAngle - aspectDegree),
                        transitPlanetLongitude: transitPlanet.longitude,
                        natalPlanetLongitude: natalPlanet.longitude,
                        transitPlanetSign: transitPlanet.zodiacSign,
                        natalPlanetSign: natalPlanet.zodiacSign
                    });
                }
            }
        }
    }

    // Sort by orb (closest aspects first)
    aspects.sort((a, b) => a.orb - b.orb);

    return aspects;
};
