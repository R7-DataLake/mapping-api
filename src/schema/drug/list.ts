import S from 'fluent-json-schema'

const schema = S.object()
  .prop('limit', S.number().maximum(100))

export default {
  querystring: schema
}