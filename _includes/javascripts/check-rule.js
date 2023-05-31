// bad
<el-input
    type="textarea"
    v-model="inputForm.contents"
/>

// good
<el-input
    type="textarea"
    v-model="inputForm.contents"
    :rules="[{required: true, message: '请输入工单内容', trigger: 'blur'}]"
    :rows="12"
    :maxlength="4000"
/>

