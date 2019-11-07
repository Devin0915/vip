<template>
  <div
    class="app-container"
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="请稍等"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form class="form-inline" :model="searchForm" :inline="true">
        <el-form-item label="兑换码">
          <el-input v-model="searchForm.code" placeholder="兑换码" clearable size="small" />
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="searchForm.country" placeholder="国家" clearable size="small" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" size="small">
            <el-option label="全部"></el-option>
            <el-option label="无效" value="3"></el-option>
            <el-option label="未使用" value="1"></el-option>
            <el-option label="已使用" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
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
    <!-- action="api/coupon/import" -->
    <div class="fromBtn">
      <el-upload
        class="upload-demo"
        action="/api/admin/coupon/import"
        :on-change="handleChange"
        :file-list="fileList"
        :show-file-list="false"
        :data="{store_id,operator,token}"
        :on-success="handleFileSuccess"
        :on-error="handleFileError"
        :before-upload="beforeFileUpload"
        accept=".xls, .xlsx"
      >
        <el-button size="small" type="primary" icon="el-icon-upload2">导入</el-button>
      </el-upload>
      <el-button size="small" type="button" icon="el-icon-download" @click="handleTemplateDown">模板下载</el-button>
      <div slot="tip" class="el-upload__tip">数量不超过2万条, 只能上传.xls.xlsx文件，且大小不超过1MB</div>
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column fixed prop="code" label="兑换码"></el-table-column>
      <el-table-column prop="type" label="类型"></el-table-column>
      <el-table-column prop="country" label="国家"></el-table-column>
      <el-table-column prop="status" label="状态"></el-table-column>
      <el-table-column prop="ctime" label="创建时间"></el-table-column>
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
import { getCouponList } from '@/api/coupon'
import pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
export default {
  components: {
    pagination
  },
  data() {
    return {
      fullscreenLoading: false,
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
      searchForm: {
        account: '',
        lastDate: [],
        status: ''
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
      tableData: [
        {
          loading: true
        }
      ],
      editForm: {},
      // 排序
      orderbyData: {},
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
      getCouponList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 导入数据
    handleFileSuccess(res, file) {
      this.$message.warning(res.msg)
      this.fullscreenLoading = false
      this.setNewsApi()
    },
    handleFileError(err, file, fileList) {
      this.fullscreenLoading = false
      this.$message.error('导入失败，请稍后重试！')
    },
    beforeFileUpload(file) {
      let fileName = file.name
      let pos = fileName.lastIndexOf('.')
      let lastName = fileName.substring(pos, fileName.length)
      if (
        lastName.toLowerCase() !== '.xls' &&
        lastName.toLowerCase() !== '.xlsx'
      ) {
        this.$message.error('上传文件必须为.xls.xlsx类型')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 1
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 1MB!')
      } else {
        this.fullscreenLoading = true
      }
      return isLt2M
    },
    //查询
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
      getCouponList(data).then(response => {
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
    // 模板下载
    handleTemplateDown() {
      window.open(
        this.apiUrl + '/public/template/coupon_template.xlsx',
        'newwindow'
      )
    },
    // 格式化表格数据
    formatStatus(row, column) {
      return row.status === '1'
        ? '未使用'
        : row.status === '2'
        ? '已使用'
        : row.status === '3'
        ? '无效'
        : ''
    }
  }
}
</script>

<style scoped>
.fromBtn {
  text-align: right;
  margin: 10px auto;
}
.upload-demo {
  float: right;
  margin-left: 10px;
}
</style>

