import { calculateHoroscope } from "../utils/horoscope.js";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const birthYear = body.birthdate.birthyear;
    // birthmonth kommt 0-basiert (0=Januar, 11=Dezember), konvertiere zu 1-12
    const birthMonth = body.birthdate.birthmonth + 1;
    const birthDay = body.birthdate.birthday;
    const birthHour = body.birthtime.birthhour;
    const birthMinute = body.birthtime.birthminute;
    const birthLatitude = body.birthlocation[1];
    const birthLongitude = body.birthlocation[0];

    const horoscope = calculateHoroscope(
        birthYear,
        birthMonth,
        birthDay,
        birthHour,
        birthMinute,
        birthLatitude,
        birthLongitude
    );

    return { horoscope };
})