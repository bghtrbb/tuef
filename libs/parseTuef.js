import { isType } from './isType'

export const parseFixedLengthSegment = (spec, str) => {
  const obj = {}
  let parsedChar = 0

  spec.fieldSpecs.forEach(fieldSpec => {
    const fieldVal = str.substr(parsedChar, fieldSpec.length)
    if (isType(fieldSpec.type, fieldVal)) {
      obj[fieldSpec.name] =
        fieldSpec.type === 'N' ? parseInt(fieldVal, 10) : fieldVal.trim()
      parsedChar += fieldSpec.length
    } else {
      throw Error(
        `Expect ${fieldSpec.name} to be ${fieldSpec.type} but got ${fieldVal}`
      )
    }
  })

  return { obj, parsedChar }
}
export const parseVaryLengthSegment = (spec, str) => {
  const obj = {}
  let parsedChar = 0

  spec.fieldSpecs.forEach(fieldSpec => {
    // Tag must be 2 characters
    const tag = str.substr(parsedChar, 2)
    // This is not this tag fieldSpec dont process
    if (fieldSpec.tag !== tag) {
      return
    }
    parsedChar += 2

    // Length must be 2 character
    const length = parseInt(str.substr(parsedChar, 2), 10)
    parsedChar += 2

    // Extract field value
    const fieldVal = str.substr(parsedChar, length)
    parsedChar += length

    if (isType(fieldSpec.type, fieldVal)) {
      obj[fieldSpec.name] =
        fieldSpec.type === 'N' ? parseInt(fieldVal, 10) : fieldVal.trim()
    } else {
      throw Error(
        `Expect ${fieldSpec.name} to be ${fieldSpec.type} but got ${fieldVal}`
      )
    }
  })

  return { obj, parsedChar }
}
export const parseTuefSegment = (spec, str) => {
  return spec.lengthType === 'fixed'
    ? parseFixedLengthSegment(spec, str)
    : parseVaryLengthSegment(spec, str)
}
export const parseTuef = (spec, str) => {
  let parsedChar = 0
  const segmentNames = Object.keys(spec)
  return Object.values(spec)
    .map(segmentSpec => {
      const parsed = parseTuefSegment(segmentSpec, str.substr(parsedChar))
      parsedChar += parsed.parsedChar
      return parsed.obj
    })
    .reduce((response, parsedSpec, idx) => {
      response[segmentNames[idx]] = parsedSpec
      return response
    }, {})
}