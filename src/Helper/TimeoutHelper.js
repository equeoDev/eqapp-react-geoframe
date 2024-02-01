/**
 * This method can be called in ES7 style as replacement for setTimeout <b>if you do not need to invalidate the timer</b>.<br/>
 * If you need an invalidatable timer use InvalidatableTimer instead!
 *
 * Comparison:
 *
 * Old code <pre>
 *    let a = 42;
 *    setTimeout(() => {
 *      a += 1;
 *    }, 1000); </pre>
 *
 * With Promise: <pre>
 *    let a = 42;
 *    await timeout(1000);
 *    a += 1; </pre>
 *
 * @param ms The duration to wait in milliseconds
 * @returns {Promise}
 */
export const timeout = async (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}