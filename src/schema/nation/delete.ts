import S from 'fluent-json-schema'

const schema = S.object()
  .prop('code', S.string().maxLength(10).required())

export default {
  params: schema
}