<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form class="form-inline" :model="searchForm" :inline="true">
        <el-form-item label="产品ID">
          <el-input
            v-model="searchForm.store_product_id"
            placeholder="产品ID"
            clearable
            size="small"
          />
        </el-form-item>
        <el-form-item label="产品SKU">
          <el-input v-model="searchForm.sku" placeholder="产品SKU" clearable size="small" />
        </el-form-item>
        <el-form-item label="截止时间">
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
        icon="el-icon-circle-plus-outline"
        size="small"
        @click="handleClickAddBtn"
      >添加</el-button>
      <el-button
        v-if="store_id == 2"
        type="primary"
        icon="el-icon-refresh"
        size="small"
        @click="handlePull"
      >拉取</el-button>
      <el-button
        type="primary"
        icon="el-icon-download"
        size="small"
        @click="handleExport"
        :disabled="isDisabledBtn"
      >导出</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column fixed prop="store_product_id" label="产品ID"></el-table-column>
      <el-table-column prop="name" label="产品名称"></el-table-column>
      <el-table-column prop="sku" label="产品sku"></el-table-column>
      <el-table-column prop="credit" label="产品积分"></el-table-column>
      <el-table-column prop="qty" label="产品可兑换数"></el-table-column>
      <el-table-column prop="status" label="产品状态"></el-table-column>
      <el-table-column prop="last_sys_at" label="拉取时间"></el-table-column>
      <el-table-column prop="expire_time" label="截止时间"></el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          <el-button @click="handleClickEdit(scope.$index, scope.row)" type="text" size="mini">编辑</el-button>
          <el-button
            @click="handleClickDeleteBtn(scope.$index, scope.row)"
            type="text"
            size="mini"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="添加" :visible.sync="dialogFormVisiblePoints">
      <el-form :model="addProductForm">
        <el-form-item label="产品ID" :label-width="formLabelWidth">
          <el-input v-model="addProductForm.store_product_id" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item label="产品积分" :label-width="formLabelWidth">
          <el-input v-model="addProductForm.credit" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item label="产品可兑换数" :label-width="formLabelWidth">
          <el-input v-model="addProductForm.qty" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item v-if="store_id == 1" label="截止时间" :label-width="formLabelWidth">
          <el-date-picker
            v-model="addProductForm.expire_time"
            type="datetime"
            placeholder="选择日期时间"
            value-format="yyyy-MM-dd"
            size="small"
          ></el-date-picker>
        </el-form-item>
        <el-form-item v-if="store_id == 1" label="产品状态" :label-width="formLabelWidth">
          <el-select v-model="addProductForm.status" placeholder="请选择明细方式" size="small">
            <el-option label="上架" value="1"></el-option>
            <el-option label="下架" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisiblePoints = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitProductAdd(addProductForm)">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑" :visible.sync="dialogFormEditVisible">
      <el-form :model="editProductForm">
        <el-form-item label="产品兑换积分" :label-width="formLabelWidth">
          <el-input v-model="editProductForm.credit" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item label="产品可兑换数" :label-width="formLabelWidth">
          <el-input v-model="editProductForm.qty" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item label="截止时间" :label-width="formLabelWidth">
          <el-date-picker
            v-model="editProductForm.expire_time"
            type="datetime"
            placeholder="选择日期时间"
            size="small"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="产品状态" :label-width="formLabelWidth">
          <el-select v-model="editProductForm.status" placeholder="请选择明细方式" size="small">
            <el-option label="上架" value="1"></el-option>
            <el-option label="下架" value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitProductEdit(editProductForm)">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="提示"
      :visible.sync="dialogVisibleDelete"
      width="30%"
      :before-close="handleClose"
    >
      <el-form :model="rowProductForm">
        <span>确定删除此条数据？</span>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleDelete = false">取 消</el-button>
        <el-button type="primary" @click="handleDeleteItem(rowProductForm)">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="同步时间" :visible.sync="dialogVisibleSync">
      <el-form :model="syncProductForm">
        <el-form-item label="同步时间" :label-width="formLabelWidth">
          <el-date-picker
            v-model="syncProductForm.syncDate"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleSync = false">取 消</el-button>
        <el-button type="primary" @click="handleSyncProduct(syncProductForm)">确 定</el-button>
      </div>
    </el-dialog>

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
import {
  getProductList,
  setAddProductItem,
  setEditProductItem,
  syncProductList,
  deleteProductItem,
  getExportList
} from '@/api/product'
import { mapGetters } from 'vuex'
import pagination from '@/components/Pagination'
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
        store_product_id: '',
        sku: '',
        lastDate: []
      },
      tableData: [],
      addProductForm: {
        store_product_id: '',
        credit: '',
        qty: '',
        expire_time: '',
        status: ''
      },
      editProductForm: {
        credit: '',
        qty: '',
        expire_time: '',
        status: ''
      },
      syncProductForm: {
        syncDate: ''
      },
      rowProductForm: {},
      exportData: {},
      // 排序
      orderbyData: {},
      dialogFormVisible: false,
      dialogFormVisiblePoints: false,
      dialogFormEditVisible: false,
      dialogVisibleDelete: false,
      dialogVisibleSync: false,
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
      getProductList(data).then(response => {
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
          // location.href = this.apiUrl + response.data.url;
        })
        .catch(res => {
          this.isDisabledBtn = false
        })
    },
    // 查询
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
      getProductList(data).then(response => {
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 同步事件
    handlePull() {
      this.dialogVisibleSync = true
    },
    handleSyncProduct(syncProductForm) {
      const lastDate = {
        start_time: this.syncProductForm.syncDate[0],
        end_time: this.syncProductForm.syncDate[1],
        store_id: Number(this.store_id),
        operator: this.operator,
        token: this.token
      }
      const data = Object.assign(lastDate, this.syncProductForm)
      for (let key in data) {
        delete data.syncDate
      }
      syncProductList(data)
        .then(response => {
          console.log(response.data)
          this.$message({
            type: 'success',
            message: response.msg
          })
          this.dialogVisibleSync = false
          this.setNewsApi()
        })
        .catch(res => {
          this.$message({
            type: 'success',
            message: response.msg
          })
        })
    },
    // 点击添加按钮事件
    handleClickAddBtn() {
      this.dialogFormVisiblePoints = true
      this.addProductForm.store_product_id = ''
      this.addProductForm.credit = ''
      this.addProductForm.qty = ''
      this.addProductForm.expire_time = ''
      this.addProductForm.status = ''
    },
    // 确定添加
    handleSubmitProductAdd(addProductForm) {
      const setData = this.addProductForm
      console.log(setData)
      const data = Object.assign(setData, {
        store_id: Number(this.store_id),
        operator: this.operator,
        token: this.token
      })
      console.log(data)
      setAddProductItem(setData).then(response => {
        this.dialogFormVisiblePoints = false
        this.setNewsApi()
      })
    },

    handleClickEdit(index, row) {
      this.dialogFormEditVisible = true
      this.editProductForm = Object.assign({}, row)
    },
    // 提交编辑
    handleSubmitProductEdit(editProductForm) {
      const editData = this.editProductForm
      const data = Object.assign(editData, {
        store_id: Number(this.store_id),
        operator: this.operator,
        token: this.token
      })
      setEditProductItem(data)
        .then(response => {
          this.dialogFormEditVisible = false
          this.$message({
            type: 'success',
            message: 'ok'
          })
          this.setNewsApi()
        })
        .catch(res => {})
    },
    //  删除
    handleClickDeleteBtn(index, row) {
      this.dialogVisibleDelete = true
      this.rowProductForm = Object.assign(
        { store_id: Number(this.store_id) },
        row
      )
      console.log(this.rowProductForm)
    },

    handleDeleteItem(rowProductForm) {
      const data = {
        store_id: this.rowProductForm.store_id,
        id: this.rowProductForm.id,
        operator: this.operator,
        token: this.token
      }
      deleteProductItem(data)
        .then(response => {
          this.$message({
            type: 'success',
            message: 'ok'
          })
          this.dialogVisibleDelete = false
          this.setNewsApi()
        })
        .catch(res => {
          this.$message({
            type: 'error',
            message: res.msg
          })
        })
    }
    // 格式化数据
    // formatState(row, column) {
    //   return row.status == "1" ? "上架" : row.status == "0" ? "非上架" : "";
    // }
  }
}
</script>

<style scoped>
.fromBtn {
  text-align: right;
  margin: 10px auto;
}
</style>

