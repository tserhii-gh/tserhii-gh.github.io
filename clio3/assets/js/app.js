Vue.component("app-progress", {
  template: `
    <div class="progress">
        <div class="progress-bar" style="width: 50%">79</div>
      </div>
    `,
});

Vue.component("item-selector", {
  props: {
    procdata: [],
  },
  // data: function () {
  //   return {
  //     curItemData: [
  //       { sub_id: "SUB_ID", schs: [{ nm_id: "NM_ID", nm_desc: "NM_DESC" }] },
  //     ],
  //   };
  // },

  template: `
  <div class="dropdown-menu">
    <div v-for="i in procdata" :key="i.id">
      <h class="dropdown-header">{{ i.opt_title }}</h>
      <a class="dropdown-item" role="button" v-for="x in i.opts" :key="x.opt_id"> {{ x.opt_desc }}</a>
    </div>
  </div>
  `,
  // methods: {
  //   curItemData: function () {
  //     return [
  //       { sub_id: "SUB_ID", schs: [{ nm_id: "NM_ID", nm_desc: "NM_DESC" }] },
  //     ];
  //   },
  // },
});

Vue.component("code-list", {
  props: {
    obj: Object,
  },
  template: `
    <div>
        <ul v-for="(value, key) in obj">
          {{ key }} - {{ value }}
        </ul>
      </div>
    `,
});

Vue.component("alert-message", {
  props: {
    show_message: Boolean,
    message: String,
  },

  template: `
  <div class="row justify-content-center" v-if=show_message>
        <div class="col-md-auto">
          <!-- <div class="w-100"> -->
          <div class="align-self-center text-center">
            <div class="alert alert-warning font-weight-bold" role="alert">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
  `,
});

Vue.component("base-checkbox", {
  model: {
    prop: "checked",
    event: "change",
  },
  props: {
    checked: Boolean,
  },
  template: `
    <input
      type="text"
      v-bind:value="checked"
      v-on:change="$emit('change', $event.target.value)"
    >
  `,
});

const fusejsOptions = {
  keys: ["id", "desc"],
  includeScore: true,
  threshold: 0.2,
};

// const category_labels = ["Обладнання", "Ел. ланцюги", "Запобіжники"];
const category_list = [
  { title: "Обладнання", data: PARTS },
  { title: "Ел. ланцюги", data: CIRCUITS },
];

const abbreviation = ["abbreviation-1.jpg", "abbreviation-2.jpg"];
const documents = {
  fuses: {
    count: 43,
  },
};

let app = new Vue({
  el: "#app",
  data: function () {
    return {
      search: "",
      message: "",
      show_alert: false,
      show_results_table: false,
      show_slider: false,
      show_info: true,
      // isActive: true,
      sq: [],
      current_category: category_list[0],
      current_document_imgs: [],
      current_item: "R334",
      // no_result: false,
    };
  },

  watch: {
    search: function () {
      this.fuzzSearch();
    },
  },

  computed: {
    curItemData: function () {
      console.log(this.current_item);
      // console.log(this.current_category);
      // console.log(
      //   this.current_category.data.filter((cat) => {
      //     return cat.id === this.current_item;
      //   })[0].sub
      // );
      return NM.filter((cat) => {
        return cat.id === this.current_item;
      })[0]["sub"];

      // return [
      //   { sub_id: "SUB_ID", schs: [{ nm_id: "NM_ID", nm_desc: "NM_DESC" }] },
      // ];
    },
  },

  methods: {
    fuzzSearch: function () {
      const fuseJs = new Fuse(this.current_category.data, fusejsOptions);
      const s_result = fuseJs.search(this.search);
      if (s_result.length === 0) {
        this.message = "Результатів не знайдено! Спробуйте інші варіанти.";
        this.show_alert = true;
        this.sq = [];
        this.show_results_table = false;
      } else {
        this.show_slider = false;
        this.current_document_imgs = [];
        this.show_results_table = true;
        this.show_alert = false;
        this.sq = s_result;
      }

      if (this.search === "") {
        this.show_alert = false;
      }
    },

    selectCategory: function (c) {
      this.clearView();
      this.current_category = category_list[c];
      this.$refs.search_input.focus();
    },

    selectItem: function (id) {
      console.log(id);
      this.clearView();
      this.current_item = id;
    },

    clearView: function () {
      this.message = "";
      this.show_alert = false;
      this.show_results_table = false;
      this.show_slider = false;
      this.sq = [];
      this.current_document_imgs = [];
    },

    galery_gen: function (number, category) {
      // let l = [];
      return Array.from(
        { length: number },
        (_, i) =>
          "lib/ru/documents/" +
          category +
          "/" +
          category +
          "-" +
          (i + 1) +
          ".jpg"
      );
    },

    showDocumentSlider: function (doc) {
      this.clearView();
      // console.log(documents[doc]);
      this.show_slider = true;
      this.current_document_imgs = this.galery_gen(
        documents[doc]["count"],
        doc
      );
    },
  },
});
