import S from 'fluent-json-schema'

const schema = S.object()
  .prop('code', S.string().maxLength(10).required())
  .prop('loinc', S.string().maxLength(50).required())
  .prop('f43', S.string().maxLength(50).required())
  .prop('nhso', S.string().maxLength(50).required())

export default {
  body: schema
}