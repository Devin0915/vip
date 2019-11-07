<template>
  <div style="padding: 0 15px;" class="select_contain">
      <div class="select_item clearfix left">
        <div class="select_tit left">{{placeholder}}:</div>
        <div class="select_module_con left">
          <div class="select_result">
            <input @focus="toggle" v-model="selectValue" :placeholder="label"/>
            <div class="triangle"></div>
          </div>
          <ul v-if="flag" @click="toggle">
            <li v-for="item in selectListData" :key="item.code" :label="item.label" @click="selectAction($event)">{{item.label}}</li>
          </ul>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'selectData',
  // props: [
  //    selectListData,lable,placeholder,selectOptionValue,selectOptionKey
  // ],
  data(){
    return{
      // selectOptionValue:this.selectOptionValue,
      // placeholder:this.placeholder,
      // label:this.label,
      // selectListData:this.selectListData,
      // selectOptionKey:this.selectOptionKey,
      selectOptionValue:"",
      placeholder:"活动记录123",
      label:"活动记录",
      selectListData:[
        {code:"湖北",label:"湖北"},
        {code:"湖南",label:"湖南"},
        {code:"四川",label:"四川"},
        {code:"河南",label:"河南"},
      ],
      selectValue :"",
      flag:false
    }
  },
  methods: {
    selectAction:function(e){
      this.selectValue = e.target.getAttribute("label")
      this.selectListData = this.selectValue
      this.selectOptionKey = e.target.getAttribute("key")
      console.log(e.target.getAttribute("label"))
    },
    toggle:function(){
      this.flag = !this.flag
    }
  },
  computed(){
    if(!this.selectOptionValue){
        this.value = selectOptionValue
    }
    if(!this.selectListData.length>0){
      this.selectListData = []
    }
  }
}
</script>

<style scoped>
.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

.hamburger.is-active {
  transform: rotate(180deg);
}
</style>
