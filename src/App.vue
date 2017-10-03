<template>
  <div id="app">
    <b-container class="bv-example-row">
        <b-row>
            <my-header />
        </b-row>

        <b-row>
            <b-col>
                <router-view></router-view>
            </b-col>
        </b-row>
        <b-row>
            <my-footer />
        </b-row>

    </b-container>


  </div>
</template>

<script>
import MyHeader from './components/Header'
import MyFooter from './components/Footer'

export default {
  name: 'app',
  components: {
    MyHeader,
    MyFooter
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
