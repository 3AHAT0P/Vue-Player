import About from './about.vue';

export default (path: string, name: string = 'about') => ({
  path, name,
  component: About,
});
