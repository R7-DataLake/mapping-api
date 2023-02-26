import S from 'fluent-json-schema'

const schema = S.object()
  .prop('code', S.string().maxLength(15).required())
  .prop('name', S.string().maxLength(255).required())

export default {
  body: schema
}