import { calculateHoroscope } from "../utils/horoscope.js";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    // Calculate both birth charts
    const person1Chart = calculateHoroscope(
        body.person1.year,
        body.person1.month,
        body.person1.day,
        body.person1.hour,
        body.person1.minute,
        body.person1.latitude,
        body.person1.longitude
    );

    const person2Chart = calculateHoroscope(
        body.person2.year,
        body.person2.month,
        body.person2.day,
        body.person2.hour,
        body.person2.minute,
        body.person2.latitude,
        body.person2.longitude
    );

    // Calculate synastry aspects
    const synastryAspects = calculateSynastryAspects(
        person1Chart.planetaryPositions,
        person2Chart.planetaryPositions
    );

    // Calculate compatibility scores
    const compatibilityScore = calculateCompatibilityScore(synastryAspects);

    return {
        person1Chart,
        person2Chart,
        synastryAspects,
        compatibilityScore
    };
});

// Calculate aspects between two people's planets
const calculateSynastryAspects = (person1Planets, person2Planets) => {
    const aspects = [];
    const aspectAngles = {
        conjunction: 0,
        sextile: 60,
        square: 90,
        trine: 120,
        opposition: 180,
    };

    // Very tight orbs for synastry
    const orbs = {
        conjunction: 3,
        sextile: 2,
        square: 3,
        trine: 3,
        opposition: 3,
    };

    for (const p1Planet of person1Planets) {
        for (const p2Planet of person2Planets) {
            const angle = Math.abs(p1Planet.longitude - p2Planet.longitude);
            const normalizedAngle = angle > 180 ? 360 - angle : angle;

            for (const [aspectName, aspectDegree] of Object.entries(aspectAngles)) {
                const orb = orbs[aspectName];
                if (Math.abs(normalizedAngle - aspectDegree) <= orb) {
                    const aspectScore = calculateAspectScore(p1Planet.name, p2Planet.name, aspectName);

                    aspects.push({
                        person1Planet: p1Planet.name,
                        person2Planet: p2Planet.name,
                        aspect: aspectName,
                        exactAngle: normalizedAngle,
                        orb: Math.abs(normalizedAngle - aspectDegree),
                        person1PlanetSign: p1Planet.zodiacSign,
                        person2PlanetSign: p2Planet.zodiacSign,
                        score: aspectScore.score,
                        category: aspectScore.category,
                        importance: aspectScore.importance
                    });
                }
            }
        }
    }

    // Sort by importance and then by orb
    aspects.sort((a, b) => {
        if (b.importance !== a.importance) {
            return b.importance - a.importance;
        }
        return a.orb - b.orb;
    });

    return aspects;
};

// Calculate score for individual aspect based on planets and aspect type
const calculateAspectScore = (planet1, planet2, aspect) => {
    // Planet importance weights (higher = more important in relationships)
    const planetWeights = {
        'Sun': 10,
        'Moon': 10,
        'Venus': 9,
        'Mars': 8,
        'Mercury': 7,
        'Jupiter': 6,
        'Saturn': 6,
        'Uranus': 4,
        'Neptune': 4,
        'Pluto': 4,
        'Chiron': 3,
        'NNode': 5,
        'Lilith': 3
    };

    // Aspect quality scores
    const aspectScores = {
        conjunction: 0, // Can be good or challenging depending on planets
        sextile: 8,
        square: -5,
        trine: 10,
        opposition: -3
    };

    // Special combinations that are particularly good or challenging
    const specialCombinations = {
        // Very positive combinations
        'Sun-Moon': { bonus: 15, category: 'emotional' },
        'Moon-Sun': { bonus: 15, category: 'emotional' },
        'Venus-Mars': { bonus: 12, category: 'romance' },
        'Mars-Venus': { bonus: 12, category: 'romance' },
        'Sun-Venus': { bonus: 10, category: 'romance' },
        'Venus-Sun': { bonus: 10, category: 'romance' },
        'Moon-Venus': { bonus: 10, category: 'emotional' },
        'Venus-Moon': { bonus: 10, category: 'emotional' },

        // Communication
        'Mercury-Mercury': { bonus: 8, category: 'communication' },
        'Sun-Mercury': { bonus: 7, category: 'communication' },
        'Mercury-Sun': { bonus: 7, category: 'communication' },

        // Long-term compatibility
        'Moon-Saturn': { bonus: 5, category: 'stability' },
        'Saturn-Moon': { bonus: 5, category: 'stability' },
        'Sun-Jupiter': { bonus: 8, category: 'growth' },
        'Jupiter-Sun': { bonus: 8, category: 'growth' },
        'Venus-Jupiter': { bonus: 9, category: 'romance' },
        'Jupiter-Venus': { bonus: 9, category: 'romance' },
    };

    const comboKey = `${planet1}-${planet2}`;
    const specialCombo = specialCombinations[comboKey] || { bonus: 0, category: 'other' };

    // Base score calculation
    const weight1 = planetWeights[planet1] || 2;
    const weight2 = planetWeights[planet2] || 2;
    const avgWeight = (weight1 + weight2) / 2;

    let baseScore = aspectScores[aspect];

    // Conjunction special handling
    if (aspect === 'conjunction') {
        if (specialCombo.bonus > 0) {
            baseScore = 12; // Good conjunction
        } else if (planet1 === 'Mars' || planet2 === 'Mars' || planet1 === 'Saturn' || planet2 === 'Saturn') {
            baseScore = -2; // Challenging conjunction
        } else {
            baseScore = 5; // Neutral conjunction
        }
    }

    // Apply weights and bonuses
    let finalScore = (baseScore * avgWeight / 10) + (specialCombo.bonus * 0.5);

    // Importance for sorting (0-100)
    const importance = avgWeight * 10 + specialCombo.bonus;

    return {
        score: Math.round(finalScore * 10) / 10,
        category: specialCombo.category,
        importance: importance
    };
};

// Calculate overall compatibility score
const calculateCompatibilityScore = (aspects) => {
    const categories = {
        emotional: { score: 0, count: 0, maxPossible: 0 },
        romance: { score: 0, count: 0, maxPossible: 0 },
        communication: { score: 0, count: 0, maxPossible: 0 },
        stability: { score: 0, count: 0, maxPossible: 0 },
        growth: { score: 0, count: 0, maxPossible: 0 },
        other: { score: 0, count: 0, maxPossible: 0 }
    };

    let totalScore = 0;
    let positiveScore = 0;
    let negativeScore = 0;
    let maxPossibleTotal = 0;

    for (const aspect of aspects) {
        const category = aspect.category;
        const score = aspect.score;

        categories[category].score += score;
        categories[category].count++;

        // Calculate max possible (if all aspects were perfect trines)
        const maxForAspect = 10 * (aspect.importance / 100);
        categories[category].maxPossible += maxForAspect;
        maxPossibleTotal += maxForAspect;

        totalScore += score;

        if (score > 0) {
            positiveScore += score;
        } else {
            negativeScore += Math.abs(score);
        }
    }

    // Normalize scores to 0-100 scale
    const normalizedTotal = Math.max(0, Math.min(100, ((totalScore / maxPossibleTotal) * 100) + 50));

    // Calculate category percentages
    const categoryScores = {};
    for (const [cat, data] of Object.entries(categories)) {
        if (data.count > 0) {
            categoryScores[cat] = {
                score: Math.round(data.score * 10) / 10,
                count: data.count,
                percentage: Math.max(0, Math.min(100, ((data.score / data.maxPossible) * 100) + 50))
            };
        }
    }

    return {
        total: Math.round(normalizedTotal),
        categories: categoryScores,
        aspectCount: aspects.length,
        positiveAspects: aspects.filter(a => a.score > 0).length,
        challengingAspects: aspects.filter(a => a.score < 0).length,
        rawScores: {
            positive: Math.round(positiveScore * 10) / 10,
            negative: Math.round(negativeScore * 10) / 10,
            total: Math.round(totalScore * 10) / 10
        }
    };
};
