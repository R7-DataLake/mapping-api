import S from 'fluent-json-schema'

const schema = S.object()
  .prop('query', S.string().maxLength(20))
  .prop('limit', S.number().maximum(100))
  .prop('offset', S.number().minimum(0))

export default {
  querystring: schema
}