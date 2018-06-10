/**
 * use with await
 * @param {number} millis
 * @returns {Promise<void>}
 */
export function sleep(millis : number) : Promise<void> {
    return new Promise<void>(r => setTimeout(r(), millis));
}