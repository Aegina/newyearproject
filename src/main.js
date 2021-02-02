import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';

import Vant from 'vant';
import 'vant/lib/index.css';

import { Toast } from 'vant';
// 引入jsoneditor css
// import('jsoneditor/src/scss/jsoneditor.scss');

Vue.use(Vant);
Vue.use(Toast);
Vue.prototype.$toast = Toast;
Vue.prototype.$axios = axios;
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
