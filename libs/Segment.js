import util from 'util'
import Field from './Field'

export default class Segment {
  constructor(spec, data) {
    if (
      typeof spec === 'undefined' ||
      typeof spec.fieldSpecs === 'undefined' ||
      // Default lengthType for field that does not specified lengthType
      typeof spec.lengthType === 'undefined'
    ) {
      throw new Error(
        `Missing spec, spec.fieldSpecs or spec.lengthType from ${util.inspect(
          spec
        )}`
      )
    }
    this.fieldSpecs = spec.fieldSpecs
    this.lengthType = spec.lengthType
    this.data = data
  }

  getSemicolonSeparatedHeader() {
    return this.fieldSpecs
      .map(fieldSpec => {
        if (!fieldSpec.name) {
          throw new Error(
            `Missing field name, fieldSpec = ${util.inspect(fieldSpec)}`
          )
        }
        return fieldSpec.name
      })
      .reduce((headers, fieldName) => `${headers};${fieldName}`)
  }

  toSemicolonSeparatedString() {
    return this.fieldSpecs
      .map(fieldSpec => {
        let mappedVal = ''
        // If fieldSpec has val property use it first
        if (fieldSpec.val) {
          mappedVal = fieldSpec.val
        } else {
          if (!fieldSpec.mapKey) {
            throw new Error(
              `mapKey is missing from fieldSpec ${util.inspect(fieldSpec)}`
            )
          }
          mappedVal = this.data[fieldSpec.mapKey]
          if (fieldSpec.mapFunc) {
            mappedVal = fieldSpec.mapFunc(mappedVal)
          }
        }
        const field = new Field(fieldSpec, mappedVal)
        return field.toString('fixed')
      })
      .reduce((result, fieldStr) => `${result};${fieldStr}`)
  }

  toString() {
    return this.fieldSpecs
      .map(fieldSpec => {
        let mappedVal = ''
        // If fieldSpec has val property use it first
        if (fieldSpec.val) {
          mappedVal = fieldSpec.val
        } else {
          if (!fieldSpec.mapKey) {
            throw new Error(
              `mapKey is missing from fieldSpec ${util.inspect(fieldSpec)}`
            )
          }
          mappedVal = this.data[fieldSpec.mapKey]
          if (fieldSpec.mapFunc) {
            mappedVal = fieldSpec.mapFunc(mappedVal)
          }
        }
        const field = new Field(fieldSpec, mappedVal)
        // If length type is specified on fieldSpec, use that one instead of the one in spec
        return field.toString(fieldSpec.lengthType || this.lengthType)
      })
      .reduce((result, fieldStr) => `${result}${fieldStr}`)
  }
}
