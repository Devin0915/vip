<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form class="form-inline" :model="searchForm" :inline="true">
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.account" placeholder="邮箱" clearable size="small" />
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="searchForm.country" placeholder="国家" clearable size="small" />
        </el-form-item>
        <el-form-item label="发送时间">
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
        @click="handleExport"
        :disabled="isDisabledBtn"
      >导出</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <!-- <el-table-column fixed prop="name" label="会员名"></el-table-column> -->
      <el-table-column prop="to_email" label="邮箱"></el-table-column>
      <el-table-column prop="country" label="国家"></el-table-column>
      <el-table-column prop="type" label="邮件类型"></el-table-column>
      <!-- :formatter="formatStatus" -->
      <el-table-column prop="status" label="邮件状态"></el-table-column>
      <el-table-column prop="extinfo" label="邮件内容"></el-table-column>
      <el-table-column prop="remark" label="邮箱标识"></el-table-column>
      <!-- <el-table-column prop="content" label="邮件内容"></el-table-column> -->
      <el-table-column prop="ctime" label="邮件发送时间"></el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="block">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="setNewsApi"
        :pager-count="4"
      />
    </div>
  </div>
</template>
<script>
import { getEmailList, getExportList } from '@/api/mail'
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
      isDisabledBtn: false,
      form: {
        name: '',
        region: '',
        date1: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      searchForm: {
        account: '',
        lastDate: [],
        start_time: '',
        end_time: ''
      },
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      // 排序
      orderbyData: {},
      tableData: [],
      editForm: {},
      editPointsForm: {},
      exportData: {},
      dialogFormVisible: false,
      dialogFormVisiblePoints: false,
      formLabelWidth: '120px'
    }
  },
  created() {
    this.setNewsApi()
  },
  computed: {
    ...mapGetters(['store_id', 'apiUrl', 'operator', 'token'])
  },
  methods: {
    setNewsApi: function() {
      this.listLoading = true
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: Number(this.listQuery.page),
        orderby: this.orderbyData.orderby,
        start_time: this.searchForm.lastDate[0],
        end_time: this.searchForm.lastDate[1],
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      for (let key in data) {
        delete data.lastDate
      }
      this.exportData = data
      getEmailList(data).then(response => {
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
        for (let key in this.searchForm) {
          delete this.searchForm.start_time
          delete this.searchForm.end_time
        }
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
      for (let key in data) {
        delete data.lastDate
      }
      this.exportData = data
      getEmailList(data).then(response => {
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
    formatStatus(row, column) {
      return row.status == '1'
        ? '发送'
        : row.status === '0'
        ? '尝试'
        : row.status === '2'
        ? '失败'
        : '未知'
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

