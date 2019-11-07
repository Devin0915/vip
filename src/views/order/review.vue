<template>
  <div class="app-container">
    <!-- 搜索 -->
    <div class="filter-container">
      <el-form class="form-inline" :model="searchForm" :inline="true">
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.account" placeholder="邮箱" clearable size="small" />
        </el-form-item>
        <el-form-item label="国家">
          <el-select v-model="searchForm.order_country" placeholder="国家" size="small">
            <el-option label="US" value="US"></el-option>
            <el-option label="UK" value="UK"></el-option>
            <el-option label="DE" value="DE"></el-option>
            <el-option label="JP" value="JP"></el-option>
            <el-option label="FR" value="FR"></el-option>
            <el-option label="CA" value="CA"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderno" placeholder="订单号" size="small"></el-input>
        </el-form-item>
         <el-form-item label="订单状态">
          <el-select v-model="searchForm.order_status" placeholder="订单状态" size="small">
            <el-option label="Matching" value="-1"></el-option>
            <el-option label="Pending" value="0"></el-option>
            <el-option label="Shipped" value="1"></el-option>
            <el-option label="Canceled" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.review_status" placeholder="审核状态" size="small">
            <el-option label="已通过" value="1"></el-option>
            <el-option label="未审核" value="0"></el-option>
            <el-option label="未通过" value="2"></el-option>
            <el-option label="其他" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="评论提交时间">
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
    <el-dialog title="详情" :visible.sync="detailFlag">
      <el-table
      :data="detailTableData"
      border
      style="width: 100%">
          <el-table-column prop="created_at" label="Amazon profile  url">
              <template slot-scope="scope">
                <a style="color:#66b1ff" target="_blank" :href="scope.row.profile_url">{{scope.row.profile_url}}</a>
              </template>
          </el-table-column>
          <el-table-column prop="social_media" label="分享社媒链接">
              <template slot-scope="scope">
                <a style="color:#66b1ff" target="_blank" :href="scope.row.social_media">{{scope.row.social_media}}</a>
              </template>
          </el-table-column>
          <el-table-column prop="products" label="兴趣产品"></el-table-column>
          <el-table-column prop="show_order_status" label="订单匹配">
                <template slot-scope="scope">
                  <router-link v-if="scope.row.show_order_status=='Shipped'" tag="a" target="_blank" :to="{path:'/order/index',query: {orderno: scope.row.orderno}}"><a style="color:#66b1ff" >{{scope.row.show_order_status}}</a></router-link> 
                  <!-- <span v-if="scope.row.show_order_status=='Pending'" style="color:#66b1ff;cursor: pointer" @click="revewDetail(scope.row.act_id,scope.row.customer_id)" >{{scope.row.show_order_status}}</span> -->
                  <span v-else >{{scope.row.show_order_status}}</span>
                </template>
          </el-table-column>
          <el-table-column prop="created_at" label="资格条件(用户填写)"></el-table-column>
      </el-table>
    </el-dialog>
    <!-- 审核弹窗 -->
    <el-dialog title="评论审核" :visible.sync="dialogFormVisiblePoints" :close-on-click-modal="false">
      <el-form :model="editPointsForm" :rules="rules" ref="ruleForm">
        <el-form-item label="状态" :label-width="formLabelWidth" prop="review_status">
          <el-radio-group v-model="editPointsForm.review_status" @change="actionStatusChange">
            <el-radio :label="1">己通过(发送成功通知邮件)</el-radio>
            <el-radio :label="2">未通过(发送失败通知邮件)</el-radio>
            <el-radio :label="3">其他(无通知邮件)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="积分值"
          prop="review_credit"
          :label-width="formLabelWidth"
        >
         <div class="reivewDom">
           <span>+</span>
          <el-input
            v-model="editPointsForm.review_credit"
            autocomplete="off"
            size="small"
            width= "50%"
            :disabled="disabledFlag"
          ></el-input>
         </div>
           
        </el-form-item>
        <el-form-item label="备注" prop="review_remark" :label-width="formLabelWidth">
          
          <el-input
            v-model="editPointsForm.review_remark"
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
      <el-table-column type="selection" :selectable='selectFlag' width="55"></el-table-column>
      <el-table-column prop="account" label="邮箱账号"></el-table-column>
      <el-table-column prop="country" label="国家"></el-table-column>
      <el-table-column prop="orderno" label="订单号"></el-table-column>
      <el-table-column prop="amount" label="订单金额"></el-table-column>
      <el-table-column prop="sku" label="产品sku"></el-table-column>
      <el-table-column prop="warranty" label="订单延保日期">
          <template slot-scope="scope">
            <span v-if="scope.row.order_status!='Matching'&&scope.row.order_status!='Canceled'&&scope.row.order_status!='Pending'">{{scope.row.warranty}}</span>
            <span v-else></span>
          </template>
      </el-table-column>
      <el-table-column prop="order_status" label="订单状态"></el-table-column>
      <el-table-column prop="review_link" label="订单评论链接">
          <template slot-scope="scope">
            <a style="color:#66b1ff" target="_blank" :href="scope.row.review_link">{{scope.row.review_link}}</a>
          </template>
      </el-table-column>
      <el-table-column prop="review_time" label="评论提交时间"></el-table-column>
      <el-table-column prop="review_status" label="评论审核状态"></el-table-column>
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
import { getShareList, exportShareList, editShareList,activityList,exportActivityList,activityInfo,activityAudit,reviewList,reviewExport,reviewCheck} from '@/api/mail'
import {getSelectData}from "@/api/user"
import pagination from '@/components/Pagination'
import { mapGetters } from 'vuex'
export default {
  components: {
    pagination
  },
  data() {
    var actionvalidate = (rule,value,callback) =>{
      if(this.editPointsForm.review_status == "1"){
          if(!value){
            callback(new Error('请输入积分'))
          }else if(typeof (value-0) != 'number'||(value-0)%1 != 0){
            callback(new Error('请输入整数字'))
          }else{
            callback()
          }
      }else if(typeof (value-0) != 'number'||(value-0)%1 != 0){
        callback(new Error('请输入整数字'))
      }else{
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
        review_credit: [
          { validator: actionvalidate, trigger: 'blur' }
        ],
        review_remark: [
          { required: true, message: '请输出备注', trigger: 'blur' },
          { max: 100, message: '长度不得大于100字符', trigger: 'blur' }
        ]
      },
      isDisabledBtn: false,
      //选中的数据
      multipleSelection: [],
      detailTableData:[],
      form: {
        name: '',
        region: '',
        date1: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      disabledFlag:false,
      confirmFlag:false,
      searchForm: {
        account: '',
        lastDate:'',

      },
      audit_statusList:[],
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
      audit_status:'',
      editPointsForm: {
        review_status: "",
        review_credit: '25',
        id: '',
        store_id: '',
        review_remark:''
      },
      detailFlag:false,
      exportData: {},
      dialogFormVisible: false,
      dialogFormVisiblePoints: false,
      formLabelWidth: '120px',
      halfFormLabelWidth:"60px",
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
    sourceData:function(){
      const data = {
        type:"audit_status"
      }
      getSelectData(data).then(response =>{
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
        review_start_time: '',
        review_end_time: '',
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      for (let key in data) {
        delete data.lastDate
      }
      this.exportData = data
      reviewList(data).then(response => {
        this.total = Number(response.data.pagination.total)
        this.tableData = response.data.data
        this.listLoading = false
      })
    },
    // 导出数据
    handleExport() {
      this.isDisabledBtn = true
       if (this.searchForm.lastDate) {
        this.searchForm.review_start_time = this.searchForm.lastDate[0];
        this.searchForm.review_end_time = this.searchForm.lastDate[1];
      } else {
        for (let key in this.searchForm) {
          delete this.searchForm.review_start_time;
          delete this.searchForm.review_end_time;
        }
      }
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        page_size: Number(this.listQuery.limit),
        page: Number(this.listQuery.page),
        orderby: this.orderbyData.orderby,
        review_start_time: '',
        review_end_time: '',
        operator: this.operator,
        token: this.token
      })
      const data = Object.assign(lastDate, this.searchForm)
      for (let key in data) {
        delete data.lastDate
      }
      this.exportData = data
      reviewExport(this.exportData)
        .then(response => {
          this.isDisabledBtn = false
          window.open(this.apiUrl + response.data.url, 'newwindow')
        })
        .catch(res => {
          this.isDisabledBtn = false
        })
    },
    //查询
    handleFilter(searchForm) {
      if (this.searchForm.lastDate) {
        this.searchForm.review_start_time = this.searchForm.lastDate[0];
        this.searchForm.review_end_time = this.searchForm.lastDate[1];
      } else {
        for (let key in this.searchForm) {
          delete this.searchForm.review_start_time;
          delete this.searchForm.review_end_time;
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
      reviewList(data).then(response => {
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
        var flagarr = []
        this.allsame(this.multipleSelection,flagarr)
        if(flagarr.indexOf("false")>=0){
          this.$message({
            message: '勾选的审核状态必须相同',
            type: 'warning'
          })
        }else{
          this.dialogFormVisiblePoints = true
          this.$nextTick(function() {
            this.$refs['ruleForm'].resetFields()
            if(this.multipleSelection[0].review_status=="已通过"){
            this.editPointsForm.review_status = 1
            this.audit_status =1
            this.editPointsForm.review_credit = 25
            this.disabledFlag=false
          }else if(this.multipleSelection[0].review_status=="未通过"){
            this.editPointsForm.review_status = 2
            this.audit_status =2;
            this.editPointsForm.review_credit = "";
            this.disabledFlag=true
          }else if(this.multipleSelection[0].review_status=="未审核"){
            this.editPointsForm.review_status = 4
            this.audit_status =4
            this.editPointsForm.review_credit = "";
            this.disabledFlag=false
          }else{
            this.editPointsForm.review_status = 3
            this.audit_status =3
            this.editPointsForm.review_credit = ""
            this.disabledFlag=false
          }
          if(this.multipleSelection.length==1){
            this.editPointsForm.review_remark = this.multipleSelection[0].review_remark
          }else{
            this.editPointsForm.review_remark = ''
          }
          
          this.dialogFormVisiblePoints = true
          var constomerId = []
          this.multipleSelection.forEach(element => {
            constomerId.push(element.id + '')
          })
          this.editPointsForm.id = constomerId
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
      
    },
    //提交审核
    reviewActionSubmit() {
      console.log(this.editPointsForm)
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          if(this.confirmFlag){
              this.$confirm('确认重新审核，并给用户发送通知邮件', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              reviewCheck(this.editPointsForm).then(response => {
                this.dialogFormVisiblePoints = false
                // this.searchForm.audit_status = ''
                // this.searchForm.reviewer = ''
                // this.searchForm.remarks = ''
                this.setNewsApi()
                this.$message({
                  message: '审核成功',
                  type: 'success'
                })
              });
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消审核'
                });          
              });
          }else{
            reviewCheck(this.editPointsForm).then(response => {
              this.dialogFormVisiblePoints = false
              // this.searchForm.audit_status = ''
              // this.searchForm.account = ''
              // this.searchForm.country = ''
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
      this.$refs['ruleForm'].resetFields()
      if(this.audit_status !=4){
        if(this.audit_status!=value){
          // this.$refs['ruleForm'].resetFields()
          if(value==1){
            this.editPointsForm.review_status = value
            this.editPointsForm.review_credit = "25";
            this.disabledFlag = false
          }else if(value == 2){
            this.editPointsForm.review_status = value
            this.editPointsForm.review_credit = "";
            this.disabledFlag = true
          }else if(value == 3){
            this.editPointsForm.review_status = value
            this.editPointsForm.review_credit = "";
            this.disabledFlag = false
          }
          this.confirmFlag = true
        }else{
          this.confirmFlag = false
        }
      }else{
        this.confirmFlag = false
      }
      if(value==1){
        this.editPointsForm.review_status = value
        this.editPointsForm.review_credit = "25";
        this.disabledFlag = false
      }else if(value == 2){
        this.editPointsForm.review_status = value
        this.editPointsForm.review_credit = "";
        this.disabledFlag = true
      }else if(value == 3){
        this.editPointsForm.review_status = value
        this.editPointsForm.review_credit = "";
        this.disabledFlag = false
      }
    },
    //详情
    revewDetail(actId,customerId){
      this.detailFlag = true
      const lastDate = Object.assign({
        store_id: Number(this.store_id),
        operator: this.operator,
        token: this.token,
        act_id:actId,
        customer_id:customerId
      })
      activityInfo(lastDate).then(data =>{
        console.log(data)
        this.detailTableData = []
        if(data.data.social_media){
        this.detailTableData.push(
          {
          profile_url:data.data.profile_url,
          social_media:data.data.social_media,
          products:data.data.products.join(","),
          show_order_status:data.data.show_order_status,
          remarks:data.data.remarks,
          orderno:data.data.orderno
          }
        )
        }
        if(data.data.blogs_tech_websites){
           this.detailTableData.push({
            social_media:data.data.blogs_tech_websites,
            profile_url:data.data.profile_url,
            products:data.data.products.join(","),
            show_order_status:data.data.show_order_status,
            remarks:data.data.remarks,
            orderno:data.data.orderno
          })
        }
        if(data.data.youtube_channel){
           this.detailTableData.push({
            social_media:data.data.youtube_channel,
            profile_url:data.data.profile_url,
            products:data.data.products.join(","),
            show_order_status:data.data.show_order_status,
            remarks:data.data.remarks,
            orderno:data.data.orderno
          })
        }
        if(data.data.deal_forums){
           this.detailTableData.push({
            social_media:data.data.deal_forums,
            profile_url:data.data.profile_url,
            products:data.data.products.join(","),
            show_order_status:data.data.show_order_status,
            remarks:data.data.remarks,
            orderno:data.data.orderno
          })
        }
        if(data.data.others){
           this.detailTableData.push({
            social_media:data.data.others,
            profile_url:data.data.profile_url,
            products:data.data.products.join(","),
            show_order_status:data.data.show_order_status,
            remarks:data.data.remarks,
            orderno:data.data.orderno
          })
        }
      })
    },
    //判断是否可勾选
    selectFlag(row,index){
      return true
    },
    //判断所有勾选的审核人和状态是否一致
    allsame(arr,flagarr){
      if(arr.length>1){
        arr.reduce(function(pre,cur){
          if(pre.review_status != cur.review_status){
            flagarr.push("false")
          }else{
            flagarr.push("true")
          }
          return cur
        })
      }else{
        flagarr=["true"]
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
.reivewDom .el-input{
  width: 97%
}
.reivewDom span{
  display: inline-block;
  width: 3%
}
</style>

