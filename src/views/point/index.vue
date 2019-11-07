<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form class="form-inline" :model="searchForm" :inline="true">
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.account" placeholder="邮箱" clearable size="small" />
        </el-form-item>
        <el-form-item label="积分变动时间">
          <el-date-picker
            v-model="searchForm.lastDate"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            size="small"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleFilter">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表单 -->

    <div class="fromBtn">
      <el-button
        type="primary"
        icon="el-icon-download"
        size="small"
        :disabled="isDisabledBtn"
        @click="handleExport"
      >导出</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="account" label="邮箱"></el-table-column>
      <!-- :formatter="formatPointDetail" -->
      <!--  :formatter="formatPointWay" -->
      <el-table-column prop="value" label="积分明细"></el-table-column>
      <el-table-column prop="action" label="积分明细方式"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column prop="ctime" label="积分变动时间"></el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="block">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        :pager-count="4"
        @size-change="handleSizeChange"
        @pagination="setNewsApi"
      />
    </div>
  </div>
</template>
<script>
import { getPointsList, getExportList } from '@/api/point'
import pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
export default {
  components: {
    pagination
  },
  data() {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      form: {
        name: '',
        region: '',
        date1: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      isDisabledBtn: false,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      searchForm: {
        account: '',
        lastDate: []
      },
      // 排序
      orderbyData: {},
      tableData: [],
      editForm: {},
      exportData: {},
      editPointsForm: {},
      dialogFormVisible: false,
      dialogFormVisiblePoints: false,
      formLabelWidth: '120px'
    }
  },
  computed: {
    ...mapGetters(['store_id', 'apiUrl', 'operator', 'token'])
  },
  created() {
    this.setNewsApi()
  },
  methods: {
    setNewsApi: function() {
      this.listLoading = true
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: Number(this.listQuery.page),
        start_time: this.searchForm.lastDate[0],
        end_time: this.searchForm.lastDate[1],
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      delete data.lastDate
      console.log(data)
      this.exportData = data
      getPointsList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 导出数据
    handleExport() {
      this.isDisabledBtn = true
      getExportList(this.exportData)
        .then(response => {
          this.isDisabledBtn = false
          window.open(this.apiUrl + response.data.url, 'newwindow')
        })
        .catch(res => {
          this.isDisabledBtn = false
        })
    },
    handleFilter(searchForm) {
      if (this.searchForm.lastDate) {
        this.searchForm.start_time = this.searchForm.lastDate[0]
        this.searchForm.end_time = this.searchForm.lastDate[1]
      } else {
        delete this.searchForm.start_time
        delete this.searchForm.end_time
      }
      const lastDate = {
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: 1,
        operator: this.operator,
        token: this.token
      }
      this.listQuery.page = 1
      const data = Object.assign(lastDate, this.searchForm)
      delete data.lastDate
      this.exportData = data
      getPointsList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    handleClickIntegralEdit(row) {
      this.dialogFormVisible = true
      this.editForm = row
    },
    handleClickEdit(row) {
      this.dialogFormVisiblePoints = true
      this.editPointsForm = row
    },
    // 格式化表格数据
    /* eslint-disable */
    formatPointDetail(row, column) {
      return row.add_type === ('1' || '2') && row.value === '0'
        ? row.value
        : row.add_type === '1'
        ? '+' + row.value
        : row.add_type === '2'
        ? '-' + row.value
        : ''
    },
    /* eslint-disable */
    formatPointWay(row, column) {
      return row.action === 'order'
        ? '订单'
        : row.action === 'share'
        ? '分享'
        : row.action === 'signup'
        ? '注册'
        : row.action === 'creditExchange'
        ? '兑换'
        : row.action === 'order_bind'
        ? '订单绑定'
        : '其他'
    },
    // 监听改变分页大小
    handleSizeChange(val) {
      console.log(val)
    }
  }
}
</script>

<style scoped>
.fromBtn {
  text-align: right;
  margin: 10px auto;
}
</style>

