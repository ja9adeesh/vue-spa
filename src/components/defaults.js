export default {
  configs: {
    url: null,
    uniqueId: null,
    perPage: 10,
    startPage: 1,
    sortBy: null,
    columns: [],
    rows: [],
    selectAllFiltered: true,
    selectedIds: [],
    beforeFetch (reqParams) {
      return reqParams
    },
    afterFetch (data) {
      return data
    }
  },
  column: {
    name: null,
    text: null,
    class: null,
    type: 'string',
    sort: true,
    filter: false,
    filterValue: '',
    total: false,
    colRender: null,
    rowRender: null,
    colRendered: null,
    rowRendered: null
  }
}
