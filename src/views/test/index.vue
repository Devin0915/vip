<template>
  <el-upload
    class="upload-demo"
    action="http://172.16.6.93:8002/"
    :on-change="handleChange"
    :file-list="fileList"
    :show-file-list="false"
    :on-success="handleFileSuccess"
    :on-error="handleFileError"
    :before-upload="beforeFileUpload"
    accept=".xls, .xlsx"
  >
    <el-button size="small" type="primary">点击上传</el-button>
    <div slot="tip" class="el-upload__tip">只能上传.xls.xlsx文件，且大小不超过1MB</div>
  </el-upload>
</template>


<script>
export default {
  data() {
    return {
      imageUrl: ""
    };
  },
  methods: {
    handleFileSuccess(res, file) {
      console.log(res);
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    handleFileError(err, file, fileList){
      this.$message.error("导入失败，请稍后重试！");
      console.log(err)
    },
    beforeFileUpload(file) {
      let fileName = file.name;
      let pos = fileName.lastIndexOf(".");
      let lastName = fileName.substring(pos, fileName.length);
      if (
        lastName.toLowerCase() !== ".xls" &&
        lastName.toLowerCase() !== ".xlsx"
      ) {
        this.$message.error("上传文件必须为.xls.xlsx类型");
        // this.resetCompressData()
        return;
      }
      // const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 1;
      if (!isLt2M) {
        this.$message.error("上传文件大小不能超过 1MB!");
      }
      return isLt2M;
    }
  }
};
</script>
