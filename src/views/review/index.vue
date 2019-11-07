<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form class="form-inline" :model="searchForm" :inline="true">
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.account" placeholder="邮箱" clearable size="small" />
        </el-form-item>
        <el-form-item label="产品SKU">
          <el-input v-model="searchForm.sku" placeholder="产品SKU" clearable size="small" />
        </el-form-item>
        <el-form-item label="站点">
          <el-select v-model="searchForm.country" placeholder="站点" size="small">
            <el-option label="US" value="US"></el-option>
            <el-option label="UK" value="UK"></el-option>
            <el-option label="DE" value="DE"></el-option>
            <el-option label="JP" value="JP"></el-option>
            <el-option label="FR" value="FR"></el-option>
            <el-option label="CA" value="CA"></el-option>
            <!-- <el-option label="FR" value="4"></el-option> -->
            <!-- <el-option v-if="store_id == 2" label="VIP5" value="5"></!-->
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.audit_status" placeholder="审核状态" size="small">
            <!-- <el-option label="全部" value=''></el-option> -->
            <el-option
              v-for="item in audit_statusList"
              :label="item.dict_value"
              :value="item.dict_key"
              :key="item.dict_key"
            ></el-option>
            <!-- <el-option label="CA" value="5"></el-option> -->
            <!-- <el-option label="FR" value="4"></el-option> -->
            <!-- <el-option v-if="store_id == 2" label="VIP5" value="5"></!-->
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
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
        <!-- <div>
          <el-form-item label="是否有亚马逊profile">
            <el-radio v-model="searchForm.is_has_profile" label="1">是</el-radio>
            <el-radio v-model="searchForm.is_has_profile" label="0">否</el-radio>
          </el-form-item>
        </div>-->
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
    <!-- 详情弹窗 -->
    <el-dialog title="详情" :visible.sync="detailFlag" :close-on-click-modal="false">
      <el-table :data="detailTableData" border style="width: 100%">
        <el-table-column prop="created_at" label="Amazon profile  url">
          <template slot-scope="scope">
            <a
              style="color:#66b1ff"
              target="_blank"
              :href="scope.row.profile_url"
            >{{scope.row.profile_url}}</a>
          </template>
        </el-table-column>
        <el-table-column prop="social_media" label="分享社媒链接">
          <template slot-scope="scope">
            <a
              style="color:#66b1ff"
              target="_blank"
              :href="scope.row.social_media"
            >{{scope.row.social_media}}</a>
          </template>
        </el-table-column>
        <el-table-column prop="products" label="兴趣产品"></el-table-column>
        <el-table-column prop="show_order_status" label="订单匹配">
          <template slot-scope="scope">
            <router-link
              v-if="scope.row.show_order_status=='Shipped'"
              tag="a"
              target="_blank"
              :to="{path:'/order/index',query: {orderno: scope.row.orderno}}"
            >
              <a style="color:#66b1ff">{{scope.row.show_order_status}}</a>
            </router-link>
            <!-- <span v-if="scope.row.show_order_status=='Pending'" style="color:#66b1ff;cursor: pointer" @click="revewDetail(scope.row.act_id,scope.row.customer_id)" >{{scope.row.show_order_status}}</span> -->
            <span v-else>{{scope.row.show_order_status}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="资格条件(用户填写)"></el-table-column>
      </el-table>
    </el-dialog>
    <!-- 审核弹窗 -->
    <el-dialog title="产品申请审核" :visible.sync="dialogFormVisiblePoints" :close-on-click-modal="false">
      <el-form :model="editPointsForm" :rules="rules" ref="ruleForm">
        <el-form-item label="状态" :label-width="formLabelWidth" prop="audit_status">
          <el-radio-group v-model="editPointsForm.audit_status" @change="actionStatusChange">
            <el-radio :label="1">己通过(发送成功通知邮件)</el-radio>
            <el-radio :label="2">未通过(发送失败通知邮件)</el-radio>
            <el-radio :label="3">其他(无通知邮件)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="审核人" prop="reviewer" :label-width="formLabelWidth">
          <el-input v-model="editPointsForm.reviewer" autocomplete="off" size="small" width="50%"></el-input>
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
      <el-table-column type="selection" :selectable="selectFlag" width="55"></el-table-column>
      <!-- <el-table-column fixed prop="name" label="会员名"></el-table-column> -->
      <el-table-column prop="act_name" label="活动期数"></el-table-column>
      <el-table-column prop="customer_name" label="会员名"></el-table-column>
      <el-table-column label="账号邮箱">
        <template slot-scope="scope">
          <router-link :to="{path:'/member/detail',query: {account: scope.row.account}}">
            <a style="color:#66b1ff">{{scope.row.account}}</a>
          </router-link>
        </template>
      </el-table-column>
      <!-- :formatter="formatStatus" -->
      <el-table-column prop="is_activate" label="账号激活"></el-table-column>
      <!-- <el-table-column prop="content" label="邮件内容"></el-table-column> -->
      <el-table-column prop="country" label="站点"></el-table-column>
      <el-table-column prop="sku" label="申请产品sku"></el-table-column>
      <el-table-column prop="product_name" label="产品标题"></el-table-column>
      <el-table-column prop="created_at" label="申请详情">
        <template slot-scope="scope">
          <span
            style="color:#66b1ff;cursor: pointer"
            @click="revewDetail(scope.row.act_id,scope.row.customer_id)"
          >点击查看</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="申请时间"></el-table-column>
      <el-table-column prop="ip" label="申请ip"></el-table-column>
      <el-table-column prop="audit_status" label="审核状态"></el-table-column>
      <el-table-column prop="reviewer" label="审核人"></el-table-column>
      <el-table-column prop="review_at" label="审核时间"></el-table-column>
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
import {
  getShareList,
  exportShareList,
  editShareList,
  activityList,
  exportActivityList,
  activityInfo,
  activityAudit
} from '@/api/mail'
import { getSelectData } from '@/api/user'
import pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
export default {
  components: {
    pagination
  },
  data() {
    var actionvalidate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择审核状态'))
      } else {
        callback()
      }
    }
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
        audit_status: [{ required: true, message: '请选择审核状态', trigger: 'blur' },
                       { validator: actionvalidate, trigger: 'blur' },
                       ],
        reviewer: [
          { required: true, message: '请输入审核人', trigger: 'blur' },
          // { validator: actionvalidate, trigger: 'blur' }
        ],
        remarks: [{ max: 100, message: '长度不得大于100字符', trigger: 'blur' }]
      },
      isDisabledBtn: false,
      //选中的数据
      multipleSelection: [],
      detailTableData: [],
      form: {
        name: '',
        region: '',
        date1: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      confirmFlag: false,
      searchForm: {
        audit_status: '',
        account: '',
        country: '',
        sku: '',
        lastDate: ''
        // is_has_profile:""
      },
      audit_statusList: [],
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
      audit_status: '',
      editPointsForm: {
        audit_status: '',
        reviewer: '',
        ids: '',
        store_id: '',
        remarks: ''
      },
      detailFlag: false,
      exportData: {},
      dialogFormVisible: false,
      dialogFormVisiblePoints: false,
      formLabelWidth: '120px',
      halfFormLabelWidth: '60px',
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
    this.sourceData()
  },
  computed: {
    ...mapGetters(['store_id', 'apiUrl', 'operator', 'token'])
  },
  methods: {
    sourceData: function() {
      const data = {
        type: 'audit_status'
      }
      getSelectData(data).then(response => {
        console.log(response)
        this.audit_statusList = response.data
      })
    },
    setNewsApi: function() {
      this.listLoading = true
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: Number(this.listQuery.page),
        orderby: this.orderbyData.orderby,
        start_at: '',
        end_at: '',
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      for (let key in data) {
        delete data.lastDate
      }
      this.exportData = data
      activityList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 导出数据
    handleExport() {
      this.isDisabledBtn = true
      if (this.searchForm.lastDate) {
        this.searchForm.start_at = this.searchForm.lastDate[0]
        this.searchForm.end_at = this.searchForm.lastDate[1]
      } else {
        for (let key in this.searchForm) {
          delete this.searchForm.start_at
          delete this.searchForm.end_at
        }
      }
      if (this.searchForm.account) {
        this.searchForm.account = this.trimStr(this.searchForm.account)
      }
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: Number(this.listQuery.page),
        orderby: this.orderbyData.orderby,
        start_at: '',
        end_at: '',
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      for (let key in data) {
        delete data.lastDate
      }
      this.exportData = data
      exportActivityList(this.exportData)
        .then(response => {
          this.isDisabledBtn = false
          window.open(this.apiUrl + response.data.url, 'newwindow')
        })
        .catch(res => {
          this.isDisabledBtn = false
        })
    },
    trimStr(str) {
      return str.replace(/(^\s*)|(\s*$)/g, '')
    },
    handleFilter(searchForm) {
      if (this.searchForm.lastDate) {
        this.searchForm.start_at = this.searchForm.lastDate[0]
        this.searchForm.end_at = this.searchForm.lastDate[1]
      } else {
        for (let key in this.searchForm) {
          delete this.searchForm.start_at
          delete this.searchForm.end_at
        }
      }
      if (this.searchForm.account) {
        this.searchForm.account = this.trimStr(this.searchForm.account)
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
      activityList(data).then(response => {
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
      this.confirmFlag = false
      if (this.multipleSelection.length > 0) {
        var flagarr = []
        this.allsame(this.multipleSelection, flagarr)
        if (flagarr.indexOf('false') >= 0) {
          this.$message({
            message: '勾选的用户的审核人和审核状态必须相同',
            type: 'warning'
          })
        } else {
          this.dialogFormVisiblePoints = true
          this.$nextTick(function() {
            this.$refs['ruleForm'].resetFields()
            this.dialogFormVisiblePoints = true
            this.editPointsForm.reviewer = this.multipleSelection[0].reviewer
            if (this.multipleSelection.length == 1) {
              this.editPointsForm.remarks = this.multipleSelection[0].remarks
            } else {
              this.editPointsForm.remarks = ''
            }
            if (this.multipleSelection[0].audit_status == '已通过') {
              this.editPointsForm.audit_status = 1
              this.audit_status = 1
            } else if (this.multipleSelection[0].audit_status == '未通过') {
              this.editPointsForm.audit_status = 2
              this.audit_status = 2
            } else if (this.multipleSelection[0].audit_status == '未审核') {
              this.editPointsForm.audit_status = 0
              this.audit_status = 0
            } else {
              this.editPointsForm.audit_status = 3
              this.audit_status = 3
            }
            this.dialogFormVisiblePoints = true
            var constomerId = []
            this.multipleSelection.forEach(element => {
              constomerId.push(element.id + '')
            })
            this.editPointsForm.ids = constomerId
            this.editPointsForm.store_id = this.store_id
            this.editPointsForm.token = this.token
            this.editPointsForm.operator = this.operator
          })
        }
      } else {
        this.$message({
          message: '请至少勾选一个用户才能审核',
          type: 'warning'
        })
      }
      // this.$nextTick(function() {
      //   this.$refs['ruleForm'].resetFields()
      // })
    },
    //提交审核
    reviewActionSubmit() {
      console.log(this.editPointsForm)
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          if (this.confirmFlag) {
            this.$confirm('确认重新审核，并给用户发送通知邮件', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                activityAudit(this.editPointsForm).then(response => {
                  this.dialogFormVisiblePoints = false
                  this.searchForm.audit_status = ''
                  this.searchForm.reviewer = ''
                  this.searchForm.remarks = ''
                  this.setNewsApi()
                  this.$message({
                    message: '审核成功',
                    type: 'success'
                  })
                })
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消审核'
                })
              })
          } else {
            activityAudit(this.editPointsForm)
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
        }
      })
    },
    //改变审核状态
    actionStatusChange(value) {
      var auditor = this.editPointsForm.reviewer
      if (this.audit_status != 0) {
        if (this.audit_status != value) {
          if (value != 1) {
            this.$refs['ruleForm'].resetFields()
            this.editPointsForm.audit_status = value
            this.editPointsForm.reviewer = auditor
          }
          this.confirmFlag = true
        } else {
          this.confirmFlag = false
        }
      } else {
        this.confirmFlag = false
      }
    },
    //详情
    revewDetail(actId, customerId) {
      this.detailFlag = true
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        operator: this.operator,
        token: this.token,
        act_id: actId,
        customer_id: customerId
      })
      activityInfo(lastDate).then(data => {
        console.log(data)
        this.detailTableData = []
        if (
          data.data.social_media ||
          data.data.blogs_tech_websites ||
          data.data.youtube_channel ||
          data.data.deal_forums ||
          data.data.others
        ) {
          if (data.data.social_media) {
            this.detailTableData.push({
              profile_url: data.data.profile_url,
              social_media: data.data.social_media,
              products: data.data.products.join(','),
              show_order_status: data.data.show_order_status,
              remarks: data.data.remarks,
              orderno: data.data.orderno
            })
          }
          if (data.data.blogs_tech_websites) {
            this.detailTableData.push({
              social_media: data.data.blogs_tech_websites,
              profile_url: data.data.profile_url,
              products: data.data.products.join(','),
              show_order_status: data.data.show_order_status,
              remarks: data.data.remarks,
              orderno: data.data.orderno
            })
          }
          if (data.data.youtube_channel) {
            this.detailTableData.push({
              social_media: data.data.youtube_channel,
              profile_url: data.data.profile_url,
              products: data.data.products.join(','),
              show_order_status: data.data.show_order_status,
              remarks: data.data.remarks,
              orderno: data.data.orderno
            })
          }
          if (data.data.deal_forums) {
            this.detailTableData.push({
              social_media: data.data.deal_forums,
              profile_url: data.data.profile_url,
              products: data.data.products.join(','),
              show_order_status: data.data.show_order_status,
              remarks: data.data.remarks,
              orderno: data.data.orderno
            })
          }
          if (data.data.others) {
            this.detailTableData.push({
              social_media: data.data.others,
              profile_url: data.data.profile_url,
              products: data.data.products.join(','),
              show_order_status: data.data.show_order_status,
              remarks: data.data.remarks,
              orderno: data.data.orderno
            })
          }
        } else {
          this.detailTableData.push({
            profile_url: data.data.profile_url,
            // social_media:data.data.social_media,
            products: data.data.products.join(','),
            show_order_status: data.data.show_order_status,
            remarks: data.data.remarks,
            orderno: data.data.orderno
          })
        }
      })
    },
    //判断是否可勾选
    selectFlag(row, index) {
      return true
    },
    //判断所有勾选的审核人和状态是否一致
    allsame(arr, flagarr) {
      if (arr.length > 1) {
        arr.reduce(function(pre, cur) {
          if (
            pre.audit_status != cur.audit_status ||
            (pre.reviewer && cur.reviewer && pre.reviewer != cur.reviewer)
          ) {
            flagarr.push('false')
          } else {
            flagarr.push('true')
          }
          return cur
        })
      } else {
        flagarr = ['true']
      }
    }
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

