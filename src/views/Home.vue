<template>
  <div class="home">
    <div class="home-header">
      <div class="home-header-left">
        <i class="el-icon-edit-outline"></i>
        <div class="home-title">Scheduler</div>
      </div>
      <div class="home-header-right">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            User
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="修改密码">修改密码</el-dropdown-item>
            <el-dropdown-item divided command="登出">登出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="home-main" v-if="showAnalysis">
      <div class="home-side">
        <home-side></home-side>
      </div>
      <div class="home-content">
        <component :is="pageIndex" @analysis="handleAnalysisData"></component>
      </div>
    </div>
    <div class="home-staff" v-else>
      <router-view></router-view>
    </div>
    <div class="password">
      <change-password v-model="showPasswordDialog"></change-password>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HomeSide from "@/components/HomeSide.vue";
import StaffInformation from "@/components/staffInformation.vue";
import WebStorage from "web-storage-cache";
import staffAttendance from "@/components/staffAttendance.vue";
import changePassword from "@/components/changePassword.vue";
import holidaysInput from "@/components/holidaysInput";
import staffManager from "@/components/staffManager.vue";
import attendanceAnalysis from "@/components/attendanceAnalysis.vue";
import standardInput from "@/components/standardInput.vue";
import FileSaver from "file-saver";
import { mapState, mapGetters } from "vuex";

let myStorage = new WebStorage();
let mySessionSt = new WebStorage({ storage: "sessionStorage" });

export default {
  name: "home",
  components: {
    HomeSide,
    StaffInformation,
    staffAttendance,
    changePassword,
    holidaysInput,
    staffManager,
    attendanceAnalysis,
    standardInput
  },
  data() {
    return { showPasswordDialog: false, showAnalysis: true };
  },
  computed: {
    ...mapState(["pageIndex", "loginUser", "loginState", "staffDatas"]),
    ...mapGetters(["dateDataOfYear"])
  },
  watch: {
    loginState(val) {
      if (!val) {
        this.$router.push({ path: "/" });
      }
    }
  },
  methods: {
    /**
     * 获取员工数据，并将数据存入至vuex
     */
    getStaffData() {
      // 获取员工数量，初始化

      let staffNum = myStorage.get("staffNum") ? myStorage.get("staffNum") : 0;
      this.$store.dispatch("initialStaffNum", { staffNum: staffNum });
      // 获取员工信息,初始化
      let staffDatas = [];
      // 已经删除的员工数量
      let deletNum = myStorage.get("deleteNum")
        ? myStorage.get("deleteNum")
        : 0;
      let num = staffNum + deletNum;
      for (let i = 0; i < num; i++) {
        let staff = myStorage.get("staff" + i);
        if (staff) {
          staffDatas.push(staff);
        }
      }
      this.$store.dispatch("initialStaffData", {
        staffDatas: staffDatas,
        flag: "initial"
      });
    },
    /**
     * 打开修改密码对话框
     */
    handleCommand(command) {
      if (command == "修改密码") {
        this.showPasswordDialog = true;
      } else if (command == "登出") {
        this.$confirm("确定退出当前登陆状态", "提示", {
          confirmButtonText: "确定",
          cancleButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$store.dispatch("changeLoginState", {
              loginState: false,
              flag: "logout"
            });
            this.$store.dispatch("updateLoginUser", {
              loginUser: this.loginUser,
              flag: "logout"
            });
            myStorage.set("attendanceId", 0);
            this.$router.push({ path: "/" });
            this.$message({
              type: "success",
              message: "退出登陆",
              duration: 1500
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "取消登出",
              duration: 1600
            });
          });
      }
    },
    handleToolTip() {
      console.log(this.staffDatas);
      if (this.staffDatas && this.staffDatas.length < 1) {
        this.$confirm("注册员工信息，或者读入历史数据", "提示", {
          confirmButtonText: "注册员工信息",
          cancelButtonText: "导入历史数据",
          type: "warning"
        })
          .then(() => {
            this.$store.dispatch("changeCurrentPage", {
              pageIndex: "staffInformation"
            });
          })
          .catch(() => {
            this.$store.dispatch("changeCurrentPage", {
              pageIndex: "staffManager"
            });
          });
      }
    },
    handleAnalysisData(attendanceId) {
      // this.showAnalysis = attendanceId != '0' ? false : true;
      let routerData = this.$router.resolve({
        name: "staff",
        params: { id: parseInt(attendanceId) }
      });
      // this.$router.push({ name: "staff", params: { id: parseInt(attendanceId) } })
      myStorage.set("attendanceId", attendanceId);
      window.open(routerData.href, "_blank");
      // this.showAnalysis = true;
      console.log("执行了");
    }
  },
  mounted() {
    this.getStaffData();
    let that = this;
    setTimeout(() => {
      this.handleToolTip();
    }, 100);
    // 关闭页面或在浏览器提示保存数据

    window.onbeforeunload = function(e) {
      if (that.$route.path.indexOf("home") > -1) {
        var confirmationMessage = "o/";
        myStorage.set("attendanceId", 0);
        that
          .$confirm("是否保存数据", "提示", {
            confirmButtonText: "保存",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            // 保存数据
            let dateDataOfYear = that.dateDataOfYear;
            let deleteNum = that.deleteNum;
            let staffNum = that.staffNum;
            let standardData = that.standardData;
            let staffDatas = that.staffDatas;
            let jsonData = JSON.stringify({
              dateDataOfYear,
              deleteNum,
              staffNum,
              standardData,
              staffDatas
            });

            let file = new File([jsonData], {
              type: "text/plain;charset=utf-8"
            });
            setTimeout(() => {
              FileSaver.saveAs(file);
            }, 1000);
          })
          .catch(() => {
            console.log("取消");
          });
        (e || window.event).returnValue = confirmationMessage; // Gecko and Trident
        return confirmationMessage; // webkit
      } else {
        window.onbeforeunload = null;
      }
    };
    console.log("mounted执行了");
  },
  // 组件路由钩子，防止直接输入url进入考勤页面
  // 不能使用this，所以直接从sessionStorage中获取值
  beforeRouteEnter(to, from, next) {
    if (mySessionSt.get("loginState")) {
      next(vm => {
        console.log("钩子执行了");
        vm.showAnalysis = myStorage.get("attendanceId") != 0 ? false : true;
        // vm.handleToolTip()
      });
    } else {
      next({ path: "/" });
    }
  }
};
</script>
<style lang="less" scoped>
.home-header {
  position: fixed;
  z-index: 10;
  height: 1.2rem;
  width: 100%;
  background-color: #4a648b;
  color: #e1e1e1;
  .home-header-left {
    margin: 0.42rem 0 0 0.48rem;
    .el-icon-edit-outline {
      transform: scale(2);
    }
    .home-title {
      margin: -0.34rem 0 0 0.5rem;
      font-size: 0.4rem;
    }
  }
  .home-header-right {
    position: absolute;
    top: 0.4rem;
    right: 1rem;
    .el-dropdown {
      color: #e1e1e1;
    }
  }
}
.home-main {
  z-index: 1;
  width: 100%;
  padding-top: 1.2rem;
  min-height: 100vh;
  background-color: #e9e9f0;
  .home-side {
    position: fixed;
    overflow-y: auto;
    width: 5rem;
    height: 100%;
  }
  .home-content {
    padding: 0.5rem;
    box-sizing: border-box;
    margin-left: 5rem;
    background-color: #fbfbfb;
    min-height: calc(100vh - 1.2rem);
  }
}
</style>

