import S from 'fluent-json-schema'

const schema = S.object()
  .prop('code', S.string().maxLength(15).required())
  .prop('usage1', S.string().maxLength(255).required())
  .prop('usage2', S.string().maxLength(255).required())
  .prop('usage3', S.string().maxLength(255).required())

export default {
  body: schema
}