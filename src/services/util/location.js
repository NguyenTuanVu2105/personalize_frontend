import * as qs from 'query-string'

export const getQueryParams = (queryString) => {
    return qs.parse(queryString)
}
