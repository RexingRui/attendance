<template>
  <div class="attendance-dialog">
    <el-dialog title="填写考勤" :visible.sync="dialogFormVisible" width="45%" @open="handleDialogOpen" ref="dialog">
      <div class="radios">
        <el-radio v-model="radioValue" label="工作" border v-if="showRadio">工作</el-radio>
        <el-radio v-model="radioValue" label="请假" border v-if="showRadio">请假</el-radio>
        <el-radio v-model="radioValue" label="加班" border>加班</el-radio>
        <el-radio v-model="radioValue" label="异常出勤" border v-if="showRadio">异常出勤</el-radio>
      </div>
      <div class="select-date">
        <span class="select-date-title">日期/时间:</span>
        <el-date-picker
          v-model="workTime"
          type="datetimerange"
          :default-time="['09:00:00', '17:30:00']"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </div>
      <div class="select-category" v-if="showSelectCategory">
        <span class="select-category-title">{{leaveCategory}}:</span>
        <el-select v-model="valueCategory" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelClick">取 消</el-button>
        <el-button type="primary" @click="handleSureClick">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'attendanceDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    isWeekend: {
      type: Boolean,
      default: false
    },
    isHoliday: {
      type: Boolean,
      default: false
    },
    isWeekDie: {
      type: Boolean,
      default: false
    },
    currentAttendDate: {
      type: String
    }
  },
  data () {
    return {
      radioValue: '工作',
      workTime: '',
      valueCategory: '',
      options: [],
      dialogFormVisible: false,
      showSelectCategory: false,
      leaveCategory: '',
      attendance: {
        state: '',
        punchInTime: [],
        reason: ''
      }
    }
  },
  computed: {
    showRadio () {
      return !this.isHoliday && !this.isWeekend;
    }
  },
  watch: {
    value (val) {
      this.dialogFormVisible = val;
    },
    dialogFormVisible (val) {
      this.$emit('input', val);
    },
    /**
     * 根据选择的工作、请假、休假显示不同的页面 
     */
    radioValue (val) {
      switch (val) {
        case '请假':
          this.showSelectCategory = true;
          this.leaveCategory = '请假类型';
          this.options = [
            {
              value: '婚假',
              label: '婚假'
            },
            {
              value: '病假',
              label: '病假'
            },
            {
              value: '年假',
              label: '年假'
            },
            {
              value: '产假',
              label: '产假'
            },
            {
              value: '调休',
              label: '调休'
            }
          ];
          break;
        default:
          this.showSelectCategory = false;
          break;
      }
    }
  },
  methods: {
    handleCancelClick () {
      this.dialogFormVisible = false;
    },
    handleSureClick () {
      // 判断考勤中选中的日期是不是当前日期
      if (this.workTime[0].toLocaleDateString() === this.currentAttendDate) {
        this.attendance.state = this.radioValue;
        this.attendance.punchInTime = [this.workTime[0].getTime(), this.workTime[1].getTime()];
        this.attendance.reason = this.valueCategory;
        this.dialogFormVisible = false;
        this.$emit('record', this.attendance); 
      } else {
        this.$message({
          showClose: true,
          message: '考勤日期选择错误',
          type: 'warning'
        });
      }

    },
    /**
     * 对话框打开回调处理函数，每次打开后清空对话框的值
     */
    handleDialogOpen () {
      this.radioValue = '';
      this.workTime = [];
      this.valueCategory = '';

    }
  }
}
</script>
<style lang="less" scoped>
.attendance-dialog {
  .select-date {
    .select-date-title {
      font-size: 18px;
    }
  }
  .select-category {
    margin-top: 20px;
    .select-category-title {
      font-size: 18px;
    }
  }
}
</style>
