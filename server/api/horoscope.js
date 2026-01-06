import { calculateHoroscope } from "../utils/horoscope.js";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const birthYear = body.birthdate.birthyear;
    const birthMonth = body.birthdate.birthmonth === 12 ? 1 : body.birthdate.birthmonth + 1;
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