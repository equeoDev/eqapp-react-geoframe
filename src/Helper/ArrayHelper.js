/**
 *  IndexArray
 *
 *  This is syntactic sugar only. You can create an array by giving a count and use this array for convenient
 *  ES6 array operation which you can't by simply calling `new Array(n)`
 *
 *  Ex:
 *      const result = IndexArray(3).map(i => `value ${i}`))
 *
 *      => result = ["value 0", "value 1", "value 2"]
 */
export const IndexArray = (n) => {
  return [...new Array(n)].map((_, index) => index)
}

export const flattenArray = list => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flattenArray(b) : b), []
)

export const removeElementFromCopy = (array, element) => {
  return array.filter(elem => elem !== element)
}

export const removeElementsFromCopy = (array, elements) => {
  return array.filter(elem => elements.indexOf(elem) < 0)
}

export const removeElement = (array, element) => {
  const index = array.indexOf(element)
  if (index >= 0) {
    array.splice(index, 1)
  }
}

export const removeElements = (array, elements) => {
  elements.forEach(element => {
    removeElement(array, element)
  })
}

export const removeElementWithFindFunction = (array, findMethod) => {
  const l = array.length
  let index = -1
  for (let i = 0; i < l; i++) {
    if (findMethod(array[i], i, array)) {
      index = i
      break
    }
  }
  if (index !== -1) {
    array.splice(index, 1)
  }
}

export const removeElementAtPosition = (array, index) => {
  if (index >= 0) {
    array.splice(index, 1)
  }
}

export const getArrayWithoutLastElement = (array) => {
  return array.slice(0, array.length - 1)
}

export const getLastElement = (array) => {
  if (array && array.length > 0) {
    return array[array.length - 1]
  }
  return null
}

export const getSecondLastElement = (array) => {
  if (array && array.length > 1) {
    return array[array.length - 2]
  }
  return null
}

export const removeLastElement = (array) => {
  if (array && array.length > 0) {
    removeElementAtPosition(array, array.length - 1)
  }
}

export const prefilledArray = (length, value) => {
  return Array.apply(null, Array(length)).map(() => value)
}

/**
 *
 * @param arr1 {Array}  The first array
 * @param arr2 {Array}  The second array
 * @param numberOfElementsToCheck {int}   The first n elements will be compared, all others will be ignored
 * @return {boolean}
 */
export const shallowEqual = (arr1, arr2, numberOfElementsToCheck = null) => {
  const arr1ToCheck = numberOfElementsToCheck ? arr1.slice(0, numberOfElementsToCheck) : arr1
  const arr2ToCheck = numberOfElementsToCheck ? arr2.slice(0, numberOfElementsToCheck) : arr2

  return JSON.stringify(arr1ToCheck) === JSON.stringify(arr2ToCheck)
}

// also works for objects
export const deepEqual = (val1, val2, numberOfElementsToCheck = null) => {
  const arrayType = '[object Array]'
  const objectType = '[object Object]'

  const type1 = Object.prototype.toString.call(val1)
  const type2 = Object.prototype.toString.call(val2)

  if (type1 !== type2) {
    return false
  }

  if ([arrayType, objectType].indexOf(type1) < 0) {
    return false
  }

  const keyLen1 = type1 === arrayType ? val1.length : Object.keys(val1).length
  const keyLen2 = type2 === arrayType ? val2.length : Object.keys(val2).length

  if (keyLen1 !== keyLen2) {
    return false
  }

  const toCheck = numberOfElementsToCheck || keyLen1

  if (type1 === arrayType) {
    for (let i = 0; i < toCheck; i++) {
      if (!compare(val1[i], val2[i])) {
        return false
      }
    }
  }
  else {
    const keys = Object.keys(val1).slice(0, toCheck)
    for (const key of keys) {
      if (!val2.hasOwnProperty(key) || !compare(val1[key], val2[key])) {
        return false
      }
    }
  }

  return true
}

function compare (val1, val2) {
  const type1 = Object.prototype.toString.call(val1)
  const type2 = Object.prototype.toString.call(val2)

  const arrayType = '[object Array]'
  const objectType = '[object Object]'
  const functionType = '[object Function]'

  if ([arrayType, objectType].indexOf(type1) >= 0) {
    return deepEqual(val1, val2)
  }
  else {
    if (type1 !== type2) {
      return false
    }

    if (type1 === functionType) {
      return val1.toString() === val2.toString()
    }
    else {
      return val1 === val2
    }
  }
}

/*
export const deepEqual = (arr1, arr2, numberOfElementsToCheck = null) => {
  throw new Error('Deep equal not yet implemented, use shallowEqual as fallback or implement')
}
*/

export const waitForTurn = (orderArray) => {
  return new Promise(resolve => {
    const onReady = () => {
      resolve(() => {
        // this is the release callback function

        removeElementAtPosition(orderArray, 0)

        if (orderArray.length > 0) {
          // trigger next waiting thread in line
          orderArray[0]()
        }
      })
    }

    orderArray.push(() => {
      onReady()
    })
    if (orderArray.length === 1) {
      // then it's me
      onReady()
    }
  })
}

export const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
