<template>
<div>
    <p>sample Data Table view</p>
    <data-table :configs="configs"></data-table>
</div>
</template>

<script>
import DataTable from "../components/DataTable";

export default {
  components: {
    DataTable
  },
  data() {
    return {
      configs: {
        url: "https://jsonplaceholder.typicode.com/users",
        uniqueId: 'id',
        perPage: 5,
        startPage: 1,
        sortBy: null,
        columns: [
          { name: "id", text: "ID", type: "checkbox" },
          { name: "id", text: "ID", total: true },
          {
            name: "name",
            text: "Name",
            filter: "input",
            filterValue: "",
            rowRender(h, val, row) {
              return (
                <router-link to={{ name: "product", params: { id: row.id } }}>
                  {val}
                </router-link>
              );
            }
          },
          { name: "username", text: "Username", filter: "select" },
          { name: "email", text: "Email", filter: "input" },
          {
            name: "website",
            text: "URL",
            rowRender(h, val, row) {
              return (
                <a target="_blank" href={`http://${val}`}>
                  {row.website}
                </a>
              );
            }
          }
        ]
      }
    };
  },
  watch: {
    selectedIds(val) {
      console.log(val);
    }
  }
};
</script>
