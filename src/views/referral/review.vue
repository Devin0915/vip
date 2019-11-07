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
        <!-- <el-form-item label="发送时间">
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
        </el-form-item>-->
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.audit_status">
            <el-option
              v-for="item in actionValue"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
      <el-button
        type="primary"
        size="small"
        icon="el-icon-edit-outline"
        @click="reviewAction"
        style="float:left"
        :disabled="isDisabledBtn"
      >审核</el-button>
    </div>
    <!-- 审核弹窗 -->
    <el-dialog title="活动审核" :visible.sync="dialogFormVisiblePoints">
      <el-form :model="editPointsForm" :rules="rules" ref="ruleForm">
        <el-form-item label="状态" :label-width="formLabelWidth" prop="audit_status">
          <el-radio-group v-model="editPointsForm.audit_status" @change="actionStatusChange">
            <el-radio :label="1">己通过</el-radio>
            <el-radio :label="2">未通过</el-radio>
            <el-radio :label="3">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="经验明细"
          prop="value"
          :label-width="formLabelWidth"
          v-if="editPointsForm.audit_status==1||editPointsForm.audit_status==3"
        >
          <div class="radioDiv">
            <el-radio v-model="editPointsForm.add_type" label="1">增加</el-radio>
            <el-input
              v-if="editPointsForm.add_type == 1"
              v-model="editPointsForm.value"
              placeholder="请输出经验明细值，请填写数字，如果填'0'则不会改变经验值"
              autocomplete="off"
              size="small"
            ></el-input>
          </div>
          <div class="radioDiv">
            <el-radio v-model="editPointsForm.add_type" label="2">减少</el-radio>
            <el-input
              v-if="editPointsForm.add_type == 2"
              v-model="editPointsForm.value"
              placeholder="请输出经验明细值，请填写数字，如果填'0'则不会改变经验值"
              autocomplete="off"
              size="small"
            ></el-input>
          </div>
        </el-form-item>
        <el-form-item
          label="经验明细方式"
          prop="action"
          :label-width="formLabelWidth"
          v-if="editPointsForm.audit_status==1||editPointsForm.audit_status==3"
        >
          <el-select v-model="editPointsForm.action" placeholder="请选择明细方式" size="small">
            <el-option
              v-for="item in actionType"
              :label="item.value"
              :value="item.key"
              :key="item.key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks" :label-width="formLabelWidth">
          <el-input
            v-model="editPointsForm.remarks"
            autocomplete="off"
            size="small"
            type="textarea"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisiblePoints = false">取 消</el-button>
        <el-button type="primary" @click="reviewActionSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <!-- <el-table-column fixed prop="name" label="会员名"></el-table-column> -->
      <el-table-column prop="account" label="邮箱"></el-table-column>
      <el-table-column prop="country" label="国家"></el-table-column>
      <el-table-column label="分享链接">
        <template slot-scope="scope">
          <a style="color:#66b1ff" target="_blank" :href="scope.row.content">{{scope.row.content}}</a>
        </template>
      </el-table-column>
      <!-- :formatter="formatStatus" -->
      <el-table-column prop="audit_status" label="审核状态"></el-table-column>
      <!-- <el-table-column prop="content" label="邮件内容"></el-table-column> -->
      <el-table-column prop="created_at" label="分享时间"></el-table-column>
      <!-- <el-table-column prop="ctime" label="被邀时间"></el-table-column> -->
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
import { getActionList } from '@/api/member'
import { getShareList, exportShareList, editShareList } from '@/api/mail'
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
      rules: {
        value: [{ required: true, message: '请输入经验明细', trigger: 'blur' }],
        action: [
          { required: true, message: '请输入经验明细方式', trigger: 'blur' }
        ],
        remarks: [
          { required: true, message: '请输出备注', trigger: 'blur' },
          { max: 100, message: '长度不得大于100字符', trigger: 'blur' }
        ]
      },
      isDisabledBtn: false,
      //选中的数据
      multipleSelection: [],
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
        audit_status: '',
        account: '',
        country: ''
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
      editPointsForm: {
        audit_status: 1,
        add_type: '1',
        value: '',
        action: '',
        remarks: '',
        id: '',
        store_id: ''
      },
      exportData: {},
      dialogFormVisible: false,
      dialogFormVisiblePoints: false,
      formLabelWidth: '120px',
      actionType: [
        {
          key: '',
          value: ''
        }
      ],
      actionValue: [
        {
          value: '',
          label: '全部'
        },
        {
          value: 0,
          label: '未审核'
        },
        {
          value: 1,
          label: '审核通过'
        },
        {
          value: 2,
          label: '审核未通过'
        },
        {
          value: 3,
          label: '其他'
        }
      ]
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
        start_time: '',
        end_time: '',
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      for (let key in data) {
        delete data.lastDate
      }
      this.exportData = data
      getShareList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 导出数据
    handleExport() {
      this.isDisabledBtn = true
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: Number(this.listQuery.page),
        orderby: this.orderbyData.orderby,
        start_time: '',
        end_time: '',
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      for (let key in data) {
        delete data.lastDate
      }
      this.exportData = data
      exportShareList(this.exportData)
        .then(response => {
          this.isDisabledBtn = false
          window.open(this.apiUrl + response.data.url, 'newwindow')
        })
        .catch(res => {
          this.isDisabledBtn = false
        })
    },
    handleFilter(searchForm) {
      // if (this.searchForm.lastDate) {
      //   this.searchForm.start_time = this.searchForm.lastDate[0];
      //   this.searchForm.end_time = this.searchForm.lastDate[1];
      // } else {
      //   for (let key in this.searchForm) {
      //     delete this.searchForm.start_time;
      //     delete this.searchForm.end_time;
      //   }
      // }
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
      getShareList(data).then(response => {
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
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    //审核
    reviewAction() {
      if (this.multipleSelection.length > 0) {
        this.dialogFormVisiblePoints = true
        this.editPointsForm.audit_status = 1
        this.editPointsForm.add_type = '1'
        this.editPointsForm.value = ''
        this.editPointsForm.action = ''
        this.editPointsForm.remarks = ''
        // this.editPointsForm.pointsWay = "";
        this.dialogFormVisiblePoints = true
        var constomerId = []
        this.multipleSelection.forEach(element => {
          constomerId.push(element.id + '')
        })
        this.editPointsForm.id = constomerId
        this.editPointsForm.store_id = this.multipleSelection[0].store_id
          ? this.multipleSelection[0].store_id
          : 2
        this.editPointsForm.token = this.token
        this.editPointsForm.operator = this.operator
        const actionData = {
          store_id: this.editPointsForm.store_id,
          type: 'credit',
          operator: this.operator,
          token: this.token
        }
        getActionList(actionData).then(response => {
          this.actionType = response.data
        })
      } else {
        this.$message({
          message: '请至少勾选一个用户才能审核',
          type: 'warning'
        })
      }
      this.$nextTick(function() {
        this.$refs['ruleForm'].resetFields()
        this.editPointsForm.value = ''
        this.editPointsForm.action = ''
        this.editPointsForm.remarks = ''
      })
    },
    //提交审核
    reviewActionSubmit() {
      console.log(this.editPointsForm)
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          editShareList(this.editPointsForm)
            .then(response => {
              this.dialogFormVisiblePoints = false
              this.searchForm.audit_status = ''
              this.searchForm.account = ''
              this.searchForm.country = ''
              this.setNewsApi()
              this.$message({
                message: '审核成功',
                type: 'success'
              })
            })
            .catch(error => {
              console.log(error)
            })
        }
      })
    },
    //改变审核状态
    actionStatusChange(value) {
      if (value == 0) {
        this.editPointsForm.add_type = ''
        this.editPointsForm.value = ''
        this.editPointsForm.action = ''
      } else {
        this.editPointsForm.add_type = '1'
      }
    }
    // formatshare(row,column){
    //   return "<a href = "+row.share+'>'+row.type+"</a>"
    // }
  }
}
</script>

<style scoped>
.fromBtn {
  text-align: right;
  margin: 10px auto;
}
.radioDiv {
  display: flex;
}
.radioDiv label.el-radio {
  line-height: 40px;
}
.radioDiv .el-input {
  flex: 1;
}
</style>

