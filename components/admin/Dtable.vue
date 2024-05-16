<template>
  <div class="d-table">
    <data-table :rows="tableData"
                :pagination="pagination"
                :query="query"
                :loading="isLoading"
                top-pagination
                striped
                sn
                filter
                @loadData="loadData"
    >
      <template #thead>
        <slot name="thead"></slot>
      </template>

      <template #tbody="{row}">
        <slot :row="row" name="rows"></slot>
      </template>
    </data-table>
  </div>
</template>

<script lang="ts" setup>

interface IProps {
  data: {}[];
  toSearch?: string[];
  filtering?: string[];
  toFilter: boolean
}

interface IQuery {
  page: number;
  per_page: number;
  search: string;
  fTerm: string;
  dir: string;
}

const props = defineProps<IProps>()

const emit = defineEmits(['endFilter']);
const tableData = ref<{}[]>([]);
const page = ref<number>(1);
const per_page = ref<number>(10);
const search = ref<string>("");
const pagination = ref<object>({});
const isLoading = ref<boolean>(false);

const query = ref<object>({
  search: "",
});

watch(() => props.toFilter, (oldVal, newVal) => {

  if (!newVal) {
    emit('endFilter')
    return
  }

  if (newVal) {
    loadData({
      page: page.value,
      'per_page': per_page.value,
      'search': search.value,
      fTerm: props.filtering?.length ? props.filtering[0] : '',
      dir: props.filtering?.length ? props.filtering[1] : ''
    })
  }
  emit('endFilter');
});


type objRecord = Record<string, any>


function loadData(query: IQuery): void {
  isLoading.value = true;
  try {


    page.value = query.page;
    per_page.value = query.per_page;
    search.value = query.search;

    if (query.fTerm) {
      if (query.dir) {
        if (query.dir === 'desc') {
          (typeof (props.data[0] as objRecord)[query.fTerm] !== 'string') ?
              props.data.sort((a, b) => (b as objRecord)[query.fTerm] - (a as objRecord)[query.fTerm]) :
              props.data.sort((a, b) => (b as objRecord)[query.fTerm].localeCompare((a as objRecord)[query.fTerm]))
        } else {
          (typeof (props.data[0] as objRecord)[query.fTerm] !== 'string') ?
              props.data.sort((a, b) => (a as objRecord)[query.fTerm] - (b as objRecord)[query.fTerm]) :
              props.data.sort((a, b) => (a as objRecord)[query.fTerm].localeCompare((b as objRecord)[query.fTerm]))
        }
      }
    }

    if (query.search) {

      let filtered: [] = [];

      props.toSearch?.map(item => {

        const filter = props.data.filter(
            (x) => {
              if(typeof (x as objRecord)[item] === 'string'){
                return (x as objRecord)[item].toLowerCase().includes(query.search.trim().toLowerCase())
              }
              if(Array.isArray((x as objRecord)[item])){

               const filteredArr = (x as objRecord)[item].filter((v: objRecord) => Object.values(v).some(value => typeof value === 'string' &&
                    (value as string).toLowerCase().includes(query.search.trim().toLowerCase())
                ))[0]

               return typeof filteredArr === 'object' && Object.keys(filteredArr).length;
              }
              return  ((x as objRecord)[item] + '').indexOf(query.search) > -1;
              //(x[item].toString()).includes(query.search.toString());
            }
        ) as []

        if (filter.length) {
          filtered.push(...filter);
          filtered = Array.from(new Set(filtered.map(item=>JSON.stringify(item)))).map(item=>JSON.parse(item)) as [];
        }
      })

      tableData.value = filtered.slice((query.page - 1) * query.per_page, query.page * query.per_page);
      pagination.value = {...pagination.value, page: query.page, total: filtered.length}
    } else {
      tableData.value = props.data.slice((query.page - 1) * query.per_page, query.page * query.per_page);
      pagination.value = {...pagination.value, page: query.page, total: props.data.length}
    }
    isLoading.value = false;
  }catch (e){
    console.log(e);
  }


}
</script>


<style lang="scss" scoped>


::v-deep(.dt__table__thead__th) {
  text-align: center !important;
}

::v-deep(.dt__filter__search) {
  color: #000 !important;
}

::v-deep(.dt__pagination_size) {
  color: #000 !important;
}

::v-deep(.dt-hidden) {
  display: flex;
  flex-direction: row;
}

::v-deep(.dt__pagination) {
  justify-content: flex-start !important;
  @media (max-width: 715px) {
    .dt-hidden {
      flex-direction: column;
    }
  }
  @media (max-width: 570px) {
    display: none !important;
  }
}

</style>

