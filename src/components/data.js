export default {
  tableDefault: {
    url: null,
    get serverPagination() {
      return this.url;
    },
    set serverPagination(val) {
      this.serverPagination = val; 
    }
  }
  columnDefault: {
    name: null,
    text: null,
    colRender: null,
    rowRender: null,
    filterType: null,
    sort: true,
    sortOrder: null,

  }
}
