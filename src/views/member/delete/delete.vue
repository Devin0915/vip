<template>
  <div class="app-container">
    <div class="form-views">
      <el-form :model="form" label-width="100px" :rules="rules" ref="deleteForm">
        <el-form-item label="删除账号:" prop="account">
            <el-input type = "textarea" v-model="form.account" placeholder="请以英文‘,’隔开账号，例如：account1,caccout2,accout3" :rows="5" style="width:50%;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">删除</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import {
  deleteAccount
} from "@/api/member";
import { mapGetters } from "vuex";
export default{
    data(){
      return{
        form:{
          account:""
        },
        rules:{
          account:[
            {required: true, message: '请输入用户账号', trigger: 'blur'}
          ]
        }
      }
    },
    methods:{
      onSubmit(){
        this.$refs["deleteForm"].validate((valid) =>{
          if(valid){
            this.$confirm('用户将被永久删除, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              const lastDate = Object.assign({
              store_id: Number(this.store_id),
              operator: this.operator,
              token: this.token
              });
              const data = Object.assign(lastDate, this.form);
              this.exportData = data;
              deleteAccount(data).then(response => {
                  this.$message({
                    message: '删除成功',
                    type: 'success'
                  })
                  this.form.account = ''
              });
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '已取消删除'
              });          
            });
          }
        })
      },
       resetForm() {
        this.$refs["deleteForm"].resetFields();
      }
    },
    computed: {
      ...mapGetters(["store_id","operator", "token"])
    },
  }
</script>