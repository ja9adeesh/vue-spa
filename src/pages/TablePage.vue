<template>
<div>
    <div v-if="sortBy">Sorted By: "{{sortBy}}"</div>
    <button @click="insertNew">Add</button>
    <button @click="change">Change</button>
    <button @click="getData">Refresh</button>
    <button @click="getPrev">prev</button>
    <button @click="getNext">next</button>
    <table class="checkout-table">
      <thead>
        <tr>
          <dt-th v-for="(col, index) in dtColumns" :key="index" :col="col" :rows="dtRows"></dt-th>
        </tr>
      </thead>
      <tbody>
      <tr v-for="(row, index) in dtRows" :key="index">
        <dt-td v-for="(col, index) in columns" :key="index" :col="col" :row="row"></dt-td>
      </tr>
      <tr class='total'>
        <td v-for="(col, index) in dtColumns" :key="index" v-if="col.total"></td>
      </tr>
      </tbody>
    </table>
</div>
</template>

<script>
import Vue from 'vue'
export default {
  data() {
    return {
      url: 'https://jsonplaceholder.typicode.com/users',
      perPage: 5,
      startPage: 1,
      sortBy: null,
      columns: [
        { name: "id", text: "ID", type: 'checkbox' },
        { name: "id", text: "ID", total: true },
        { name: "name", text: "Name", filter: "input", rowRender(h,val, row) { return <router-link to={{ name: 'product', params: {id: row.id}} }>{val}</router-link> } },
        { name: "username", text: "Username" },
        { name: "email", text: "Email" },
        { name: "website", text: "URL", rowRender(h,val, row) { return <a target="_blank" href={ `http://${val}` }>{row.website}</a> } }
      ],
      rows: [],
      selectedIds: [],
      selectAll: [],
      beforeFetch: function(reqParams) {

      },
      afterFetch: function(data) {
        return data;
      }
    }
  },
  created() {
    this.defaults = {
      column: {
        name: null,
        text: null,
        class: null,
        type: 'string',
        sort: true,
        filter: false,
        filterValue: null,
        total: false,
        colRender: null,
        rowRender: null,
        colRendered: null,
        rowRendered: null
      }
    }
    this.parseColumns();
    this.getData();
  },
  computed: {
    dtColumns() {
      return this.columns;
    },
    dtRows() {
      return this.rows.slice((this.startPage - 1) * this.perPage, this.perPage*this.startPage);
    },
    checkoutStatus() {
      return this.$store.state.cart.lastCheckout
    },
    total() {
      return this.products.reduce((total, p) => {
        return total + p.price * p.quantity
      }, 0)
    }
  },
  watch: {
    selectedIds(val) {
      console.log(val);
    }
  },
  components: {
    'dt-th': {
      props: ['col', 'rows'],
      render: function (h) {
        const { col, rows } = this;
        let child = col.text;

        if (col.type === 'checkbox') {
          child = <input type="checkbox" v-model={this.selectAll}/>

        } else {

          if (typeof col.colRender === 'function') child = col.colRender.call(this, h, col, rows)
          if (col.filter === 'input') {
            child = (<div><div>{child}</div><input type="text" v-model={col.filterValue} /></div>);
          }
        }

        const th = <th class="checkbox-wrapper">
		         { child }
		       </th>
        if (typeof col.colRendered === 'function') col.colRendered.call(this, h, th, col, rows);
        return th;
        //return typeof col.render === 'function' ? col.render.call(this, createElement, row[col.name], row): createElement('td', [row[col.name]]);
      }
    },
    'dt-td': {
      props: ['col', 'row'],
      render: function (h) {
        const { col, row } = this;

        let child = row[col.name];
        if (col.type === 'checkbox') {
          child = <input type="checkbox" id={row.id} value={row.id} v-model={this.selectedIds}/>

        } else {
          if (typeof col.rowRender === 'function') child = col.rowRender.call(this, h, row[col.name], row)
        }

        const td = <td class="checkbox-wrapper">
		         { child }
		       </td>

        if (typeof col.rowRendered === 'function') col.rowRendered.call(this, h, td, row[col.name], row);
        return td;
      }
    }
  },
  methods: {
    parseColumns() {
      debugger;
      this.columns = this.columns.map(col => Object.assign({}, this.defaults.column, col));
    },
    getData() {
      fetch(this.url).then((resp) => resp.json()).then(data => typeof this.afterFetch === 'function' ? this.afterFetch(data) : data).then(data => { this.rows = data; console.log(this.rows) });
    },
    getNext() {
      if(this.startPage * this.perPage < this.rows.length)
      this.startPage += 1;
      debugger;
    },
    getPrev() {
      if (this.startPage > 1)
      this.startPage -= 1;
    },
    sort(name) {
      if(name) {
      this.rows.sort((a,b) => (a[name] > b[name]) ? 1 : ((b[name] > a[name]) ? -1 : 0));
      this.sortBy = name;
      }
    },
    insertNew() {
      alert('adding new');
      this.rows.push({
        "id": 9999,
        "name": "JAG CENA",
        "username": "Bret",
        "email": "Sincere@april.biz",
        "address": {
          "street": "Kulas Light",
          "suite": "Apt. 556",
          "city": "Gwenborough",
          "zipcode": "92998-3874",
          "geo": {
            "lat": "-37.3159",
            "lng": "81.1496"
          }
        },
        "phone": "8888888888",
        "website": "hildegard.org",
        "company": {
          "name": "Romaguera-Crona",
          "catchPhrase": "Multi-layered client-server neural-net",
          "bs": "harness real-time e-markets"
        }
      })
    },
    change() {
      this.rows.find(o => o.id === 9999).name = "REDDY REDDY REDDY";
    }
  }
}

</script>

<style>
table {
  border: 1px solid #aaa;
}
thead {
      background-color: #ddd;
    border-bottom: 1px solid #aaa;
}
thead th {
  padding: 4px 10px;
  border-right: 1px solid #ddd;
}
td {
  border-right: 1px solid #ddd;
  padding: 2px 10px;
}
tr:nth-child(odd) {
  background-color: #f5f5f5;
}
</style>
