import Vue from 'vue';
import Router from 'vue-router';

import {
  HomeTreeBuilder,
  AboutTreeBuilder,
} from './routes';

Vue.use(Router);

export default new Router({
  base: '/Vue-Player/',
  mode: 'history',
  routes: [
    HomeTreeBuilder('/', 'home'),
    AboutTreeBuilder('/about', 'about'),
  ],
});
