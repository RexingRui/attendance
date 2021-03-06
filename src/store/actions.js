import WebStorage from "web-storage-cache";
import FileSaver from "file-saver";
// 存储账号信息以及员工信息
let myStorage = new WebStorage();
// 存储登陆状态
let mySessionSt = new WebStorage({
  storage: "sessionStorage",
  exp: 84600 // 84600 一天
})

export default {
  // 登陆账号信息更新
  updateLoginUser({
    commit
  }, payload) {
    new Promise((resolve, reject) => {
      let loginUser = mySessionSt.get('loginUser');
      if (payload.flag == 'login') {
        // 首次登陆
        mySessionSt.add('loginUser', payload.loginUser);
      } else if (payload.flag == 'password') {
        // 修改密码
        loginUser.password = payload.userPassword;
        mySessionSt.replace('loginUser', loginUser);
        myStorage.replace('user' + loginUser.id, loginUser);
        payload.loginUser = mySessionSt.get('loginUser');
      } else if (payload.flag == 'logout') {
        mySessionSt.delete('loginUser');
        payload.loginUser = {};
      }
      resolve(payload);
    }).then(value => {
      commit('updateLoginUser', value);
    })
  },
  // 初始化账号信息
  initialUser({
    commit
  }, payload) {
    new Promise((resolve, reject) => {
      if (payload.userData && payload.userData) {
        // 本地存储没有数据从文件中读取数据
        console.log(payload);
        myStorage.add("userNum", payload.userNum);
        payload.userData.forEach(el => {
          myStorage.set("user" + el.id, el);
        });
      } else {
        // 本地文件中有数据
        myStorage.replace("userNum", payload.userNum);
        // 将本地的数据存至vuex
        payload.userData = [];
        for (let i = 0; i < payload.userNum; i++) {
          payload.userData.push(myStorage.get('user' + i));
        }
      }
      resolve(payload);
    }).then(value => {
      commit("initialUser", value);
    });
  },
  // 增加账号
  changeUser({
    commit
  }, payload) {
    new Promise((resolve, reject) => {
      // 存入localStorage
      let userNum = payload.userNum + 1;
      let userNumStorage = myStorage.get(String(userNum));
      if (userNumStorage) {
        myStorage.replace("userNum", userNum);
      } else {
        myStorage.set("userNum", userNum)
      }
      myStorage.set("user" + payload.userNum, payload.userData);
      // 存入本地json文件
      let userAllData = [];
      for (let i = 0; i < userNum; i++) {
        userAllData.push(myStorage.get("user" + i));
      }
      let jsonData = JSON.stringify(userAllData);
      var file = new File([jsonData], {
        type: "text/plain;charset=utf-8"
      });
      setTimeout(() => {
        FileSaver.saveAs(file);
      }, 2000);

      resolve(payload);
    }).then(value => {
      commit("changeUser", value);
    });
  },
  // 初始化员工数量
  initialStaffNum({
    commit
  }, payload) {
    new Promise((resolve, reject) => {
      myStorage.set("staffNum", payload.staffNum);
      resolve(payload.staffNum);
    }).then(value => {
      commit("initialStaffNum", value);
    });
  },
  // 更改员工数量
  changeStaffNum({
    commit
  }, payload) {
    new Promise((resolve, reject) => {
      myStorage.replace("staffNum", payload.staffNum);
      resolve(payload.staffNum);
    }).then(value => {
      commit("changeStaffNum", value);
    });
  },
  // 更改删除员工数量
  changeDeleteNum({
    commit
  }, payload) {
    new Promise((resolve, reject) => {
      myStorage.set("deleteNum", payload.deleteNum);
      resolve(payload.deleteNum);
    }).then(value => {
      commit('changeDeleteNum', value);
    })
  },
  // 初始化员工信息
  initialStaffData({
    commit
  }, payload) {
    new Promise((resolve, reject) => {
      if(payload.flag === 'load' || payload.flag === 'reload') {
        myStorage.set('loadData', payload.currentMonthAttend);
      }
      resolve(payload);
    }).then(value => {
      commit("initialStaffData", value);
    });
  },
  // 更改员工信息
  changeStaffData({
    commit
  }, payload) {
    new Promise((resolve, reject) => {
      // 判断是添加员工信息还是更改
      if (payload.flag == 'add') {
        myStorage.set("staff" + payload.staffData.id, payload.staffData);
      } else if (payload.flag == 'change') {
        myStorage.replace("staff" + payload.staffData.id, payload.staffData);
      } else if (payload.flag == 'remove') {
        if (payload.deleteIndex) {
          // localstorage中删除staff数据
          payload.deleteIndex.forEach(value => {
            myStorage.delete("staff" + value);
          });
        }
      }
      resolve(payload);
    }).then(value => {
      commit("changeStaffData", value);
    });
  },
  // 更改当前显示的页面
  changeCurrentPage({
    commit
  }, payload) {
    commit("changeCurrentPage", payload.pageIndex);
  },

  // 更改登陆状态
  changeLoginState({
    commit
  }, payload) {
    new Promise(resolve => {
      if (payload.flag == 'login') {
        mySessionSt.set('loginState', payload.loginState);
      } else if (payload.flag == 'logout') {
        mySessionSt.delete('loginState', payload.loginState)
      }
      resolve(payload.loginState);
    }).then(value => {
      commit('changeLoginState', value);
    })
  },

  // 获取今年的节日数据 
  getDateDataOfYear({
    commit
  }, payload) {
    new Promise(reslove => {
      myStorage.set('dateDataOfYear', payload.dateDataOfYear);
      reslove(payload.dateDataOfYear)
    }).then(value => {
      commit('getDateDataOfYear', value)
    })
  },

  // 更改考勤标准数据
  changeStandardData({
    commit
  }, payload) {
    new Promise(reslove => {
      if (payload.flag === 'initial') {
        myStorage.set('standardData', payload.standardData);
      } else {
        myStorage.replace('standardData', payload.standardData);
      }
      reslove(payload.standardData);
    }).then(value => {
      commit('changeStandardData', value);
    })
  },

  // 更新考勤统计数据
  updateAnalysisData({commit}, payload) {
    new Promise(reslove => {
      if (myStorage.get('attendanceAnalysisData')) {
        myStorage.replace('attendanceAnalysisData', payload.attendanceAnalysisData);
      } else {
        myStorage.set('attendanceAnalysisData', payload.attendanceAnalysisData);
      }
      reslove(payload.attendanceAnalysisData);
    }).then(value => {
      commit('updateAnalysisData', value);
    })
  }
};