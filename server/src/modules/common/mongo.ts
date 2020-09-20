export const convertDocId = <T>(doc: T & {_id?: string}) => {
  const {_id, ...rest} = doc
  return {...rest, id: _id || ''}
}
