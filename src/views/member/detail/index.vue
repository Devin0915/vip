<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form class="form-inline" :model="searchForm" :inline="true">
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.account" placeholder="邮箱" clearable />
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="searchForm.country" placeholder="国家" clearable />
        </el-form-item>
        <el-form-item v-if="store_id != 1" label="兴趣">
          <el-select v-model="searchForm.interests" multiple placeholder="请选择兴趣">
            <el-option label="sport" value="sport"></el-option>
            <el-option label="read" value="read"></el-option>
            <el-option label="music" value="music"></el-option>
            <el-option label="shopping" value="shopping"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="store_id == 1" label="性别">
          <el-select v-model="searchForm.gender" placeholder="性别">
             <el-option v-for="item in genderList" :label="item.dict_value" :value="item.dict_key" :key="item.dict_key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="填写时间">
          <el-date-picker
            v-model="searchForm.lastDate"
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
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleFilter">查询</el-button>
        </el-form-item>
        <div>
          <el-form-item v-if="store_id == 1" label="是否有亚马逊profile">
            <el-radio v-model="searchForm.is_has_profile" label="1">是</el-radio>
            <el-radio v-model="searchForm.is_has_profile" label="0">否</el-radio>
          </el-form-item>
        </div>
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
    <el-table style="width: 100%" border :data="tableData" @sort-change="sortChange">
      <!--  -->
      <el-table-column fixed prop="fullName" label="会员名" :formatter="formatName"></el-table-column>
      <el-table-column prop="gender" label="性别"></el-table-column>
      <el-table-column prop="brithday" label="出生日期"></el-table-column>
      <el-table-column prop="account" label="邮箱"></el-table-column>
      <el-table-column prop="country" label="国家"></el-table-column>
      <el-table-column prop="region" label="州/省"></el-table-column>
      <el-table-column v-if="store_id !=1" prop="interest" label="兴趣"></el-table-column>
      <el-table-column v-if="store_id ==1" prop="profile_url" label="profile">
          <template slot-scope="scope">
            <a :href="scope.row.profile_url" target="_blank" style="color:#66b1ff" >{{scope.row.profile_url}}</a>
            <!-- <router-link :to="{path:'/member/detail',query: {account: scope.row.content}}"><a :href="''" style="color:#66b1ff" >{{scope.row.profile_url}}</a></router-link>  -->
          </template>
      </el-table-column>
      <!-- <el-table-column v-if="store_id == 2" prop="isactivate" label="会员状态"></el-table-column> -->
      <el-table-column prop="mtime" label="填写时间"></el-table-column>
      <el-table-column v-if="store_id == 1" prop="ip" label="注册ip"></el-table-column>
      <el-table-column fixed="right" label="操作" width="80">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleClickEdit(scope.row)">编辑</el-button>
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
    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-form :model="editForm" :label-width="formLabelWidth">
        <el-form-item label="邮箱">
          <el-input v-model="editForm.account" autocomplete="off" size="small" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="First Name">
          <el-input v-model="editForm.first_name" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item label="Last Name">
          <el-input v-model="editForm.last_name" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="editForm.gender" placeholder="请选择性别" size="small">
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
            <el-option label="Private" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="国家">
          <el-autocomplete
            v-model="editForm.country"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            value-key="country_name"
            @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="州/省">
          <el-input v-model="editForm.region" autocomplete="off" size="small"></el-input>
        </el-form-item>
        <el-form-item v-if="store_id != 3 && store_id != 5" label="兴趣">
          <el-select v-model="editForm.interests" multiple placeholder="请选择兴趣">
            <el-option label="sport" value="sport"></el-option>
            <el-option label="read" value="read"></el-option>
            <el-option label="music" value="music"></el-option>
            <el-option label="shopping" value="shopping"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker
            v-model="editForm.brithday"
            type="date"
            placeholder="选择日期"
            size="small"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="填写时间">
          <el-date-picker
            v-model="editForm.mtime"
            type="datetime"
            placeholder="填写时间"
            size="small"
            :disabled="true"
            value-format="yyyy-MM-dd HH:mm:ss"
          ></el-date-picker>
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
  getDetailsList,
  setItem,
  // getCustomerList,
  getCountryApi,
  setPoints,
  setExp,
  getActionList,
  syncMemberList,
  DetailsListExport
} from '@/api/member'
import {getSelectData}from "@/api/user"
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
      searchForm: {
        account: '',
        country: '',
        lastDate: [],
        start_at: '',
        end_at: ''
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
      editForm: {},
      femail: [
        {
          value: 0,
          label: '女'
        },
        {
          value: 1,
          label: '男'
        }
      ],
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
      genderList:[],
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
    if (this.$route.query.account) {
      this.searchForm.account = this.$route.query.account
    }
  },
  mounted() {
    this.setNewsApi()
    this.sourceData()
  },
  methods: {
    sourceData:function(){
      const data = {
        type:"gender"
      }
      getSelectData(data).then(response =>{
        console.log(response)
        this.genderList = response.data
      })
    },
    setNewsApi: function() {
      this.listLoading = true
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: Number(this.listQuery.page),
        orderby: this.orderbyData.orderby,
        start_at: this.searchForm.lastDate[0],
        end_at: this.searchForm.lastDate[1],
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      delete data.lastDate
      this.exportData = data
      getDetailsList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 查询
    handleFilter(searchForm) {
      if (this.searchForm.lastDate) {
        this.searchForm.start_at = this.searchForm.lastDate[0]
        this.searchForm.end_at = this.searchForm.lastDate[1]
      } else {
        delete this.searchForm.start_at
        delete this.searchForm.end_at
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
      getDetailsList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 排序
    sortChange: function(column, prop, order) {
      const lineOrder = column.order === 'ascending' ? 'asc' : 'desc'
      const orderby = [column.prop, lineOrder]
      const lastDate = {
        start_at: this.searchForm.lastDate[0],
        end_at: this.searchForm.lastDate[1],
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
      getDetailsList(data).then(response => {
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
        start_at: this.syncProductForm.syncDate[0],
        end_at: this.syncProductForm.syncDate[1],
        store_id: Number(this.store_id),
        operator: this.operator,
        token: this.token
      }
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
      if (this.searchForm.lastDate) {
        this.searchForm.start_at = this.searchForm.lastDate[0]
        this.searchForm.end_at = this.searchForm.lastDate[1]
      } else {
        delete this.searchForm.start_at
        delete this.searchForm.end_at
      }
      const lastDate = {
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: 1,
        operator: this.operator,
        token: this.token
      }
      const data = Object.assign(lastDate, this.searchForm)
      delete data.lastDate
      this.exportData = data
      DetailsListExport(this.exportData)
        .then(response => {
          window.open(this.apiUrl + response.data.url, 'newwindow')
          this.isDisabledBtn = false
        })
        .catch(res => {
          this.isDisabledBtn = false
        })
    },
    // 编辑
    handleClickEdit(row) {
      console.log(row)
      let interests = []
      if (row.interest.length > 0) {
        interests = row.interest.split(',')
      } else {
        interests = []
      }
      if (row.brithday !== '' && row.brithday.indexOf('/')) {
        const a = row.brithday.split('/')
        const b = a[2] + '-' + a[0] + '-' + a[1]
        row.brithday = b
      }
      this.editForm = Object.assign({}, row, { interests: interests })
      this.getCountry()
      this.$nextTick(() => {
        this.dialogFormVisible = true
      })
    },
    // 获取国家
    getCountry() {
      getCountryApi()
        .then(res => {
          this.countryOptions = res.data
        })
        .catch(() => {})
    },
    // 提交编辑
    handleClickEditSubmit(editForm) {
      if (!editForm.gender) {
        editForm.gender = '0'
      }
      Object.assign(editForm)
      setItem(editForm)
        .then(response => {
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
            message: res.msg
          })
        })
    },

    // 编辑积分
    handleClickIntegralEdit(index, row) {
      this.editPointsForm.add_type = '1'
      this.editPointsForm.value = ''
      this.editPointsForm.remark = ''
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
    formatGender(row, column) {
      return row.gender === '1' ? '男' : row.gender === '2' ? '女' : '未知'
    },
    formatName(row, column) {
      return (this.tableData.fullName = row.first_name + ' ' + row.last_name)
    },
    formatVip(row, column) {
      var interest = []
      var currentInter = ''
      if (row.interest) {
        interest = row.interest.split(',')
        interest.forEach(element => {
          if (element === 1) {
            currentInter += 'sport,'
          } else if (element === 2) {
            currentInter += 'read,'
          } else if (element === 3) {
            currentInter += 'music,'
          } else if (element === 4) {
            currentInter += 'shopping,'
          }
        })
      }
      return currentInter
    },
    // auto 搜索
    querySearch(queryString, cb) {
      var countryOptions = this.countryOptions
      var results = queryString
        ? countryOptions.filter(this.createFilter(queryString))
        : countryOptions
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return countryOption => {
        return (
          countryOption.country_name
            .toLowerCase()
            .indexOf(queryString.toLowerCase()) === 0
        )
      }
    },
    handleSelect(item) {
      this.editForm.country = item.country_code
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
</style>
