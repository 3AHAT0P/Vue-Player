<template>
  <div
    id="app"
    :class="blockName | bemMods({theme: 'dark'})"

    @dragenter.prevent="pass"
    @dragleave.prevent="pass"
    @dragover.prevent="pass"
    @dragend.prevent="pass"
    @drop.prevent="pass"
  >
    <Layout>
      <template slot="header">
        <Header></Header>
      </template>
      <router-view/>
      <template slot="footer">
        <Footer></Footer>
      </template>
    </Layout>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Header, Footer } from '@/components';
import { Layout } from '@/components/core';

@Component({
  components: { Layout, Header, Footer },
})
export default class App extends Vue {
  private blockName: string = 'app';
  
  private pass() {}
}
</script>

<style lang="stylus">
@import './lib/styles'

.app
  width 100%
  height 100%

  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color var(--appTextColorMain)
  background url("/assets/bg.png")
  background-color var(--appBackgroundColorMain)
  background-position center
  background-size auto
  background-repeat no-repeat

  &--theme-dark
    darkTheme()

  &__nav
    padding 30px
    a
      font-weight bold
      color #2c3e50
      &.router-link-exact-active
        color #42b983
</style>
