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
        <el-form-item label="会员等级">
          <el-select v-model="searchForm.vip" placeholder="请选择会员等级" size="small">
            <el-option label="全部" value></el-option>
            <el-option label="VIP1" value="1"></el-option>
            <el-option label="VIP2" value="2"></el-option>
            <el-option label="VIP3" value="3"></el-option>
            <el-option label="VIP4" value="4"></el-option>
            <el-option v-if="store_id == 2" label="VIP5" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
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
         <el-form-item label="数据来源">
            <el-select v-model="searchForm.source" placeholder="来源" size="small">
            <el-option label="全部" value></el-option>
            <el-option v-for="item in selectList" :label="item.dict_value" :value="item.dict_key" :key="item.dict_key"></el-option>
            <!-- <el-option v-if="store_id == 2" label="VIP5" value="5"></el-option> -->
          </el-select>
          </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleFilter">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表单 -->
    <div class="fromBtn">
      <el-button type="primary" icon="el-icon-refresh" size="small" @click="handlePull">拉取</el-button>
      <el-button
        type="primary"
        icon="el-icon-download"
        size="small"
        :disabled="isDisabledBtn"
        @click="handleExport"
      >导出</el-button>
      <div slot="tip" class="el-upload__tip">*请选择导出过滤条件</div>
    </div>
    <el-table :data="tableData" border style="width: 100%" @sort-change="sortChange">
      <el-table-column fixed prop="fullName" label="会员名" :formatter="formatName"></el-table-column>
      <!-- <el-table-column v-if="store_id == 1" prop="gender" label="性别"></el-table-column> -->
      <!-- <el-table-column v-if="store_id == 1" prop="brithday" label="出生日期"></el-table-column> -->
      <el-table-column label="邮箱">
        <template slot-scope="scope">
          <span class="account" @click="accoutRoute(scope.row)">{{ scope.row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="country" label="国家"></el-table-column>
      <el-table-column prop="credit" label="会员当前积分" sortable="custom"></el-table-column>
      <el-table-column prop="total_credit" label="会员总积分" sortable="custom"></el-table-column>
      <el-table-column prop="exp" label="会员经验值" sortable="custom"></el-table-column>
      <el-table-column prop="vip" label="会员等级"></el-table-column>
      <!-- <el-table-column v-if="store_id == 2" prop="isactivate" label="会员状态"></el-table-column> -->
      <el-table-column prop="ctime" label="注册时间"></el-table-column>
      <el-table-column prop="lastlogin" label="最后活动时间"></el-table-column>
      <el-table-column prop="ip" label="注册ip"></el-table-column>
      <el-table-column prop="source_value" label="来源"></el-table-column>
      <el-table-column fixed="right" label="操作" width="130">
        <template slot-scope="scope">
          <!-- <el-button type="text" size="mini" @click="handleClickEdit(scope.$index, scope.row)">会员</el-button> -->
          <el-button
            type="text"
            size="mini"
            @click="handleClickIntegralEdit(scope.$index, scope.row)"
          >积分</el-button>
          <el-button
            v-if="store_id !=3 && store_id != 5"
            type="text"
            size="mini"
            @click="handleClickExpEdit(scope.$index, scope.row)"
          >经验</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="block">
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        :current-page.sync="listQuery.page"
        :pager-count="4"
        @pagination="setNewsApi"
      />
    </div>

    <!-- 弹窗 -->
    <el-dialog title="同步时间" :visible.sync="dialogVisibleSync">
      <el-form :model="syncProductForm">
        <el-form-item label="同步时间" :label-width="formLabelWidth">
          <el-date-picker
            v-model="syncProductForm.syncDate"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            align="right"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleSync = false">取 消</el-button>
        <el-button type="primary" @click="handleSyncProduct(syncProductForm)">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="会员" :visible.sync="dialogFormVisible">
      <el-form :model="editForm">
        <el-form-item label="First Name" :label-width="formLabelWidth">
          <el-input v-model="editForm.first_name" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item label="Last Name" :label-width="formLabelWidth">
          <el-input v-model="editForm.last_name" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item label="国家" :label-width="formLabelWidth">
          <el-select v-model="editForm.country_code" placeholder="请选择" size="small">
            <el-option
              v-for="item in countryOptions"
              :key="item.value"
              :label="item.value"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="editForm.account" :disabled="true" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item v-if="store_id==1" label="性别" :label-width="formLabelWidth">
          <el-select v-model="editForm.gender" placeholder="请选择性别" size="small">
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="store_id==1" label="出生日期" :label-width="formLabelWidth">
          <el-date-picker
            v-model="editForm.brithday"
            type="date"
            placeholder="选择日期"
            size="small"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item v-if="store_id==1" label="州" :label-width="formLabelWidth">
          <el-input v-model="editForm.region" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item v-if="store_id==1" label="城市" :label-width="formLabelWidth">
          <el-input v-model="editForm.city" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item v-if="store_id==1" label="地址" :label-width="formLabelWidth">
          <el-input v-model="editForm.street" autocomplete="off" size="small"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleClickEditSubmit(editForm)">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="积分" :visible.sync="dialogFormVisiblePoints">
      <el-form :model="editPointsForm">
        <el-form-item label="积分明细" :label-width="formLabelWidth">
          <div class="radioDiv">
            <el-radio v-model="editPointsForm.add_type" label="1">增加</el-radio>
            <el-input
              v-if="editPointsForm.add_type == 1"
              v-model="editPointsForm.value"
              autocomplete="off"
              size="small"
            ></el-input>
          </div>
          <div class="radioDiv">
            <el-radio v-model="editPointsForm.add_type" label="2">减少</el-radio>
            <el-input
              v-if="editPointsForm.add_type == 2"
              v-model="editPointsForm.value"
              autocomplete="off"
              size="small"
            ></el-input>
          </div>
        </el-form-item>
        <el-form-item label="积分明细方式" :label-width="formLabelWidth">
          <el-select v-model="editPointsForm.action" placeholder="请选择明细方式" size="small">
            <el-option
              v-for="(item,index) in actionType"
              :key="index"
              :label="item.value"
              :value="item.key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth">
          <el-input v-model="editPointsForm.remark" autocomplete="off" size="small" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisiblePoints = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitPointEdit(editPointsForm)">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="经验" :visible.sync="dialogFormVisibleExp">
      <el-form :model="editExpForm">
        <el-form-item label="经验明细" :label-width="formLabelWidth">
          <div class="radioDiv">
            <el-radio v-model="editExpForm.add_type" label="1">增加</el-radio>
            <el-input
              v-if="editExpForm.add_type == 1"
              v-model="editExpForm.value"
              autocomplete="off"
              size="small"
            ></el-input>
          </div>
          <div class="radioDiv">
            <el-radio v-model="editExpForm.add_type" label="2">减少</el-radio>
            <el-input
              v-if="editExpForm.add_type == 2"
              v-model="editExpForm.value"
              autocomplete="off"
              size="small"
            ></el-input>
          </div>
        </el-form-item>
        <el-form-item label="经验明细方式" :label-width="formLabelWidth">
          <el-select v-model="editExpForm.action" placeholder="请选择明细方式" size="small">
            <el-option
              v-for="(item, index) in actionType"
              :key="index"
              :label="item.value"
              :value="item.key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth">
          <el-input v-model="editExpForm.remark" autocomplete="off" size="small" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleExp = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitExpEdit(editExpForm)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getList,
  setItem,
  getCustomerList,
  setPoints,
  setExp,
  getActionList,
  syncMemberList,
  getExportList
} from '@/api/member'
import { mapGetters } from 'vuex'
import {getSelectData}from "@/api/user"
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
      searchForm: {
        source:'',
        account: '',
        country: '',
        vip: '',
        lastDate: []
      },
      tableData: [],
      isDisabledBtn: false,
      total: 0,
      currentPage: 1,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      editForm: {
        first_name: '',
        last_name: '',
        account: '',
        country: '',
        country_code: '',
        region: '',
        city: '',
        gender: '',
        street: '',
        brithday: ''
      },
      selectList:[],
      countryOptions: [
        {
          value: 'US',
          label: 'United States'
        },
        {
          value: 'CA',
          label: 'Canada'
        },
        {
          value: 'MX',
          label: 'Mexico'
        },
        {
          value: 'UK',
          label: 'United Kingdom'
        },
        {
          value: 'FR',
          label: 'France'
        },
        {
          value: 'DE',
          label: 'Germany'
        },
        {
          value: 'IT',
          label: 'Italy'
        },
        {
          value: 'ES',
          label: 'Spain'
        },
        {
          value: 'JP',
          label: 'Japan'
        },
        {
          value: 'AU',
          label: 'Australia'
        },
        {
          value: 'Other',
          label: 'Other'
        }
      ],
      editPointsForm: {
        add_type: '1',
        value: Number,
        remark: '',
        customer_id: '',
        store_id: ''
      },
      editExpForm: {
        add_type: '1',
        value: Number,
        remark: '',
        customer_id: '',
        store_id: ''
      },
      actionType: [
        {
          key: '',
          value: ''
        }
      ],
      syncProductForm: {
        syncDate: ''
      },
      // 排序
      orderbyData: {},
      exportData: {},
      dialogFormVisible: false,
      dialogFormVisiblePoints: false,
      dialogVisibleSync: false,
      dialogFormVisibleExp: false,
      formLabelWidth: '120px'
    }
  },
  computed: {
    ...mapGetters(['store_id', 'apiUrl', 'operator', 'token'])
  },
  created() {
    this.setNewsApi()
    this.selectData()
    console.log(this.apiUrl)
  },
  methods: {
    selectData:function(){
      const data = {
        type:"source_show",
        // store_id: Number(this.store_id),
        // operator: this.operator,
      }
      getSelectData(data).then(response =>{
        console.log(response)
        this.selectList = response.data
      })
    },
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
      delete data.lastDate
      this.exportData = data
      getList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 查询
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
      getList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 排序
    sortChange: function(column, prop, order) {
      const lineOrder = column.order === 'ascending' ? 'asc' : 'desc'
      const orderby = [column.prop, lineOrder]
      console.log(column.prop)
      console.log(lineOrder)
      const lastDate = {
        start_time: this.searchForm.lastDate[0],
        end_time: this.searchForm.lastDate[1],
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: 1,
        orderby: orderby,
        operator: this.operator,
        token: this.token
      }
      this.listQuery.page = 1
      const data = Object.assign(lastDate, this.searchForm)
      delete data.lastDate
      this.exportData = data
      this.orderbyData = data
      getList(data).then(response => {
        this.total = Number(response.data.pagination.total)
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
      console.log(lastDate.start_time)
      console.log(lastDate.end_time)
      const data = Object.assign(lastDate)
      delete data.syncDate
      syncMemberList(data)
        .then(response => {
          this.$message({
            type: 'success',
            message: response.msg,
            duration: 8000
          })
          this.dialogVisibleSync = false
          this.setNewsApi()
        })
        .catch(err => {
          this.$message({
            type: 'success',
            message: err.msg
          })
        })
    },

    // 导出
    handleExport() {
      this.isDisabledBtn = true

      getExportList(this.exportData)
        .then(response => {
          window.open(this.apiUrl + response.data.url, 'newwindow')
          // window.open('https://brand.patozon.net/api' + response.data.url, "newwindow");
          this.isDisabledBtn = false
        })
        .catch(res => {
          this.isDisabledBtn = false
        })
    },
    // 编辑
    handleClickEdit(index, row) {
      this.dialogFormVisible = true
      const customer_id = row.customer_id
      const store_id = row.store_id
      const operator = this.operator
      const token = this.token
      this.editForm.store_id = row.store_id
      this.editForm.operator = this.operator
      this.editForm.token = this.token

      getCustomerList({ store_id, customer_id, operator, token })
        .then(response => {
          this.editForm.first_name = response.data.first_name
          this.editForm.last_name = response.data.last_name
          this.editForm.last_name = response.data.last_name
          this.editForm.country_code = response.data.country_code
          this.editForm.account = response.data.account
          this.editForm.brithday = response.data.brithday
          this.editForm.region = response.data.region
          this.editForm.city = response.data.city
          this.editForm.street = response.data.street
          this.editForm.customer_id = response.data.customer_id
          if (response.data.gender === '1' || response.data.gender === '2') {
            this.editForm.gender = response.data.gender
            console.log(this.editForm.gender)
          } else {
            this.editForm.gender = ''
          }
        })
        .catch(res => {
          // this.$message({
          //   type: "error",
          //   message: "error"
          // });
        })
    },

    // 提交编辑
    handleClickEditSubmit(editForm) {
      setItem(editForm)
        .then(response => {
          console.log(response.data)
          this.$message({
            type: 'success',
            message: '成功'
          })
          this.setNewsApi()
          this.dialogFormVisible = false
        })
        .catch(res => {
          this.$message({
            type: 'error',
            message: 'error'
          })
        })
    },

    // 编辑积分
    handleClickIntegralEdit(index, row) {
      this.editPointsForm.add_type = '1'
      this.editPointsForm.value = ''
      this.editPointsForm.remark = ''
      // this.editPointsForm.pointsWay = "";
      this.dialogFormVisiblePoints = true
      this.editPointsForm.customer_id = row.customer_id
      this.editPointsForm.store_id = row.store_id
      this.editPointsForm.operator = row.operator
      this.editPointsForm.token = this.token
      this.editPointsForm.operator = this.operator
      const actionData = {
        store_id: row.store_id,
        type: 'credit',
        operator: this.operator,
        token: this.token
      }
      getActionList(actionData).then(response => {
        this.actionType = response.data
      })
    },
    // 提交积分编辑
    handleSubmitPointEdit(editPointsForm) {
      console.log(editPointsForm)
      setPoints(editPointsForm)
        .then(response => {
          this.$message({
            type: 'success',
            message: response.msg
          })
          this.dialogFormVisiblePoints = false
          this.setNewsApi()
        })
        .catch(res => {})
    },
    // 编辑经验
    handleClickExpEdit(index, row) {
      this.dialogFormVisibleExp = true
      console.log(row)
      this.editExpForm.add_type = '1'
      this.editExpForm.value = ''
      this.editExpForm.remark = ''
      this.editExpForm.customer_id = row.customer_id
      this.editExpForm.store_id = row.store_id
      this.editExpForm.token = this.token
      this.editExpForm.operator = this.operator
      const actionData = {
        store_id: row.store_id,
        type: 'credit',
        operator: this.operator,
        token: this.token
      }
      getActionList(actionData).then(response => {
        this.actionType = response.data
      })
    },
    // 提交经验编辑
    handleSubmitExpEdit(editExpForm) {
      console.log(editExpForm)
      setExp(editExpForm)
        .then(response => {
          this.$message({
            type: 'success',
            message: response.msg
          })
          this.dialogFormVisibleExp = false
          this.setNewsApi()
        })
        .catch(res => {
          // this.$message({
          //   type: "error",
          //   message: res.msg
          // });
        })
    },
    // 格式化表格数据
    // formatGender(row, column) {
    //   return row.gender === '1' ? '男' : row.gender === '2' ? '女' : '未知'
    // },
    formatName(row, column) {
      return (this.tableData.fullName = row.first_name + ' ' + row.last_name)
    },
    accoutRoute(row) {
      console.log(row)
      this.$router.push({
        path: '/member/detail',
        query: { account: row.account }
      })
    }
  }
}
</script>

<style scoped>
.radioDiv {
  display: flex;
}
.radioDiv label.el-radio {
  line-height: 40px;
}
.radioDiv .el-input {
  flex: 1;
}
.fromBtn {
  text-align: right;
  margin: 10px auto;
}
.account {
  color: #409eff;
  cursor: pointer;
}
.account:hover {
  text-decoration: underline;
}
</style>
