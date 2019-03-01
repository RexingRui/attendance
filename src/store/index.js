import Vue from 'vue';
import Vuex from 'vuex';
import mutations from '@/store/mutations.js';
import actions from '@/store/actions.js';
import vuexAlong from 'vue-along';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userNum: 0,
    staffNum: 0,
    staffDatas: [],
    deleteId: 0,
    pageIndex: 'staffAttendance',
    currentStaffAttend: {
      state: '',
      date: [],
      reason: ''
    }
  },
  getters: {

  },
  mutations,
  actions,
  plugins: [vuexAlong]

})