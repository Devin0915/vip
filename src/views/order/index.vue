<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form class="form-inline" :model="searchForm" :inline="true">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderno" placeholder="订单号" clearable size="small" />
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="searchForm.country" placeholder="国家Code" clearable size="small" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.account" placeholder="邮箱" clearable size="small" />
        </el-form-item>
        <el-form-item v-if="store_id == 2" label="订单时间">
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
        <el-form-item v-if="store_id == 1" label="订单填写时间">
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
      <div slot="tip" class="el-upload__tip">*请选择导出过滤条件</div>
    </div>

    <el-table :data="orderTableData" border style="width: 100%">
      <el-table-column prop="orderno" label="订单号"></el-table-column>
      <el-table-column prop="amount" label="金额"></el-table-column>
      <!-- <el-table-column v-if="store_id == 1" prop="amount" label="订单价格"></el-table-column> -->
      <el-table-column prop="country" label="国家"></el-table-column>
      <el-table-column prop="account" label="邮箱"></el-table-column>
      <el-table-column prop="order_status" label="状态"></el-table-column>
      <el-table-column prop="product_title" label="产品名称(参考)"></el-table-column>
      <el-table-column prop="sku" label="产品SKU(参考)"></el-table-column>
      <el-table-column v-if="store_id == 1" prop="ctime" label="订单填写时间"></el-table-column>
      <el-table-column prop="order_time" label="订单时间"></el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="block">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        :pager-count="4"
        @pagination="setNewsApi"
      />
    </div>
  </div>
</template>
<script>
import { getOrderList, getExportList } from '@/api/order'
import pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
import { all } from 'q';
import { debuglog } from 'util';
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
      searchForm: {
        orderno: '',
        country: '',
        lastDate: ''
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
      orderTableData: [],
      editForm: {},
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
    
    if (this.$route.query.orderno) {
      this.searchForm.orderno = this.$route.query.orderno
    }
    this.setNewsApi()
  },
  methods: {
    setNewsApi: function() {
      this.listLoading = true
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        orderby: this.orderbyData.orderby,
        page: Number(this.listQuery.page),
        start_time: this.searchForm.lastDate[0],
        end_time: this.searchForm.lastDate[1],
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      delete data.lastDate
      this.exportData = data
      getOrderList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.orderTableData = response.data.data
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
      getOrderList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.orderTableData = response.data.data
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
