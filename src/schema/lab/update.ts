import S from 'fluent-json-schema'

const paramsSchema = S.object()
  .prop('code', S.string().maxLength(10).required())

const bodySchema = S.object()
  .prop('name', S.string().maxLength(50).required())
  .prop('lab_group_code', S.string().maxLength(50).required())

export default {
  params: paramsSchema,
  body: bodySchema
}