export function convertToSecondsUtil(time: string) {
    if (!isNaN(time as any)) {
        return parseInt(time);
    }

    let multiplier = 0;

    switch (time[time.length - 1]) {
        case 's':
            multiplier = 1;
            break;
        case 'm':
            multiplier = 60;
            break;
        case 'h':
            multiplier = 60 * 60;
            break;
        case 'd':
            multiplier = 24 * 60 * 60;
            break;
        case 'M':
            multiplier = 30 * 24 * 60 * 60;
            break;
        case 'y':
            multiplier = 365 * 24 * 60 * 60;
            break;
        default:
            throw new Error('Invalid time string');
    }

    const num = parseInt(time.slice(0, -1));
    return num * multiplier;
}
