import Vue from 'vue';
import Vuex from 'vuex';

import getters from './getters';
import mutations from './mutations';
import state from './states';

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions: {

  },
});
