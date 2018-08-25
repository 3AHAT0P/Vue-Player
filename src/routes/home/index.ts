import Home from './home.vue';

export default (path: string, name: string = 'home') => ({
  path, name,
  component: Home,
});
