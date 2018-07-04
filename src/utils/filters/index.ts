import Vue from 'vue';

import bem from './bem';
import bemElement from './bem-element';
import bemMods from './bem-mods';

Vue.filter('bem', bem);
Vue.filter('bemElement', bemElement);
Vue.filter('bemMods', bemMods);
