<style lang="scss">
.data-table {
  table {
    border: 1px solid #aaa;
  }
  thead {
    background-color: #ddd;
    border-bottom: 1px solid #aaa;
    th {
      padding: 4px 10px;
      border-right: 1px solid #ddd;
    }
  }
  td {
    border-right: 1px solid #ddd;
    padding: 2px 10px;
  }
  tr:nth-child(odd) {
    background-color: #f5f5f5;
  }
}
</style>

<template>
<div class="data-table">
  <div v-if="sortBy">Sorted By: "{{sortBy}}"</div>
  <button @click="insertNew">Add</button>
  <button @click="change">Change</button>
  <button @click="getData">Refresh</button>
  <button @click="getPrev">prev</button>
  <button @click="getNext">next</button>
  <div>{{dtColumns[2].filterValue}}</div>
  <table class="checkout-table">
    <thead>
      <tr>
        <dt-th v-for="(col, index) in dtColumns" :key="index" :col="col" :rows="dtRows" :selectAll="selectAll" @setSelectAll="val => selectAll = val" @click="sort(col)" ></dt-th>
      </tr>
    </thead>
    <tbody>
    <tr v-for="(row, index) in pageRows" :key="index">
      <dt-td v-for="(col, index) in columns" :key="index" :col="col" :row="row" :uniqueId="uniqueId" :selectedIds="selectedIds"></dt-td>
    </tr>
    <tr class='total'>
      <td v-for="(col, index) in dtColumns" :key="index" v-if="col.total"></td>
    </tr>
    </tbody>
  </table>
</div>
</template>

<script>
import DEFAULTS from './defaults';

export default {
  props: {
    configs: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      ...DEFAULTS.configs, ...this.configs
    };
  },
  created() {
    this.parseColumns();
    this.getData();
  },
  computed: {
    dtColumns() {
      return this.columns;
    },
    dtRows() {
      return this.rows;
    },
    filteredRows() {
      let rows = this.rows;

      // filter by column
      this.columns.forEach(col => {
        if (col.filterValue)
          rows = rows.filter(
            r =>
              (r[col.name] == null ? "" : r[col.name] + "").search(
                new RegExp(col.filterValue, "ig")
              ) > -1
          );
      });

      // filter globally

      // sort by column
      // if(col.sort === 'asc') {
      //   this.filteredRows.sort((a,b) => (a[name] > b[name]) ? 1 : ((b[name] > a[name]) ? -1 : 0));
      //   col.sort = 'desc';
      // } else if(col.sort === 'desc') {
      //   this.filteredRows.sort((a,b) => (a[name] > b[name]) ? -1 : ((b[name] > a[name]) ? 1 : 0));
      //   col.sort = 'asc';
      // }

      this.startPage = 1;

      return rows;
    },
    pageRows() {
      return this.filteredRows.slice(
        (this.startPage - 1) * this.perPage,
        this.perPage * this.startPage
      );
    },
    selectAll: {
      get() {
        return this.selectedIds.length === (this.selectAllFiltered ? this.filteredRows.length : this.dtRows.length);
      },
      set(val) {
        if(val) {
          this.selectedIds = (this.selectAllFiltered ? this.filteredRows : this.dtRows).map(r => r[this.uniqueId]);
        } else {
          this.selectedIds = [];
        }
      }
    }
  },
  watch: {
    selectedIds(val) {
      console.log(val);
    }
  },
  components: {
    'dt-th': {
      props: ['col', 'rows', 'selectAll'],
      render: function(h) {
        const { col, rows } = this;
        let child = col.text;

        if (col.type === 'checkbox') {
          child = (
            <input
              type="checkbox"
              checked={this.selectAll}
              onChange={e => this.$emit('setSelectAll', e.target.checked)}
            />
          );
        } else {
          if (typeof col.colRender === 'function')
            child = col.colRender.call(this, h, col, rows);
          if (col.filter === 'input') {
            child = (
              <div>
                <div>{child}</div>
                <input
                  type="text"
                  value={col.filterValue}
                  onInput={e => (this.col.filterValue = e.target.value)}
                />
              </div>
            );
          } else if (col.filter === 'select') {
            const options = [];
            rows.map(r => r[col.name]).reduce((o, v) => {
              if (!o.includes(v)) o.push(v);
              return o;
            }, options);

            child = (
              <div>
                <div>{child}</div>
                <select
                  value={col.filterValue}
                  onChange={e => this.col.filterValue = e.target.value}
                >
                  <option value="" selected>
                    All
                  </option>
                  {options.map(o => <option value={o}>{o}</option>)}
                </select>
              </div>
            );
          }
        }

        const th = <th>{child}</th>;
        if (typeof col.colRendered === "function")
          col.colRendered.call(this, h, th, col, rows);
        return th;
      }
    },
    'dt-td': {
      props: ['col', 'row', 'uniqueId', 'selectedIds'],
      render: function(h) {
        const { col, row, uniqueId, selectedIds } = this;
        const uid = row[uniqueId];
        let child = row[col.name];
        if (col.type === 'checkbox') {
          if (!uniqueId || !uid) {
            throw new Error('"uniqueId" needs to be defined to use check boxes on DataTable')
          }
          child = (
            <input
              type="checkbox"
              id={uid}
              value={uid}
              checked={selectedIds.includes(uid)}
              onChange={e =>
                e.target.checked
                  ? selectedIds.push(uid)
                  : selectedIds.splice(selectedIds.indexOf(uid), 1)
              }
            />
          );
        } else {
          if (typeof col.rowRender === 'function')
            child = col.rowRender.call(this, h, row[col.name], row);
        }

        const td = <td class={col.class}>{child}</td>;

        if (typeof col.rowRendered === 'function')
          col.rowRendered.call(this, h, td, row[col.name], row);
        return td;
      }
    }
  },
  methods: {
    parseColumns() {
      this.columns = this.columns.map(col =>
        Object.assign({}, DEFAULTS.column, col)
      );
    },
    getData() {
      fetch(this.url)
        .then(resp => resp.json())
        .then(
          data =>
            typeof this.afterFetch === 'function' ? this.afterFetch(data) : data
        )
        .then(data => (this.rows = data));
    },
    getNext() {
      if (this.startPage * this.perPage < this.filteredRows.length)
        this.startPage += 1;
    },
    getPrev() {
      if (this.startPage > 1) this.startPage -= 1;
    },
    sort(col) {
      colsole.log(col);
      if (col.sort === 'desc') {
        this.filteredRows.sort(
          (a, b) => (a[name] > b[name] ? 1 : b[name] > a[name] ? -1 : 0)
        );
        col.sort = 'asc';
      } else {
        this.filteredRows.sort(
          (a, b) => (a[name] > b[name] ? -1 : b[name] > a[name] ? 1 : 0)
        );
        col.sort = 'desc';
      }
    },
    insertNew() {
      alert("adding new");
      this.rows.push({
        id: 9999,
        name: "JAG CENA",
        username: "Bret",
        email: "Sincere@april.biz",
        address: {
          street: "Kulas Light",
          suite: "Apt. 556",
          city: "Gwenborough",
          zipcode: "92998-3874",
          geo: {
            lat: "-37.3159",
            lng: "81.1496"
          }
        },
        phone: "8888888888",
        website: "hildegard.org",
        company: {
          name: "Romaguera-Crona",
          catchPhrase: "Multi-layered client-server neural-net",
          bs: "harness real-time e-markets"
        }
      });
    },
    change() {
      this.rows.find(o => o.id === 9999).name = "REDDY REDDY REDDY";
    }
  }
};
</script>

