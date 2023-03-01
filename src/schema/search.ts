import S from 'fluent-json-schema'

const schema = S.object()
  .prop('query', S.string().maxLength(20))
  .prop('date_serv', S.string().minLength(10).maxLength(10))
  .prop('datedsc', S.string().minLength(10).maxLength(10))
  .prop('limit', S.number().maximum(100))
  .prop('offset', S.number().minimum(0))

export default {
  querystring: schema
}