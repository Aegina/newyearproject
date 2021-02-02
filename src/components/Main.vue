<template>
  <div>
    <!-- <van-cell-group>
      <van-cell title="单元格" value="内容" />
      <van-cell title="单元格" value="内容" label="描述信息" />
    </van-cell-group> -->
    <van-form @submit="onSubmit">
      <van-field name="radio" label="类型">
        <template #input>
          <van-radio-group
            direction="horizontal"
            v-model="form.selected"
            @change="handleChangeOpt"
          >
            <van-radio name="1">情报板</van-radio>
            <van-radio name="2">车指状态</van-radio>
            <van-radio name="3">车指任务1</van-radio>
            <van-radio name="4">车指任务2</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        readonly
        clickable
        name="picker"
        :value="form.board"
        label="选值"
        placeholder="点击选择情报板code"
        @click="showPicker = true"
      />
      <van-popup v-model="showPicker" position="bottom">
        <van-picker
          show-toolbar
          :columns="columns"
          @confirm="onConfirm"
          @cancel="showPicker = false"
        />
      </van-popup>

      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit"
          >查询</van-button
        >
      </div>
    </van-form>
    <!-- 结果展示区 -->
    <div id="jsoneditor">
      <json-viewer
        :value="result"
        :expand-depth="5"
        copyable
        boxed
        sort
      ></json-viewer>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import JsonViewer from 'vue-json-viewer';

Vue.use(JsonViewer);

// 接口baseUrl
const baseUrl = 'http://202.107.216.230:49685';
export default {
  name: 'Main',
  components: { JsonViewer },
  data() {
    return {
      result: [],
      form: {
        selected: '1',
        board: '',
        boardCode: '',
      },
      showPicker: false,
      columns: [],
      boardColumns: [], // 车指数据
      indicatorColumns: [], // 车指数据
    };
  },
  computed: {},
  watch: {},
  mounted() {
    this.fetchBoard();
    this.fetchIndicator();
  },
  methods: {
    //   获取情报板code
    async fetchBoard() {
      const { data } = await this.$axios.get('./data/info.json');
      //   console.log(data);
      const direction = { 1: '福向', 2: '台向' };
      this.boardColumns = data.map((column) => {
        return {
          value: column.code,
          text: `${direction[column.direction]}-${column.pileNo}`,
        };
      });
      this.columns = this.boardColumns;
    },
    //   获取车指code
    async fetchIndicator() {
      const { data } = await this.$axios.get('./data/indicator.json');
      //   console.log(data);
      const direction = { 1: '福向', 2: '台向' };
      this.indicatorColumns = data.map((column) => {
        return {
          value: column.code,
          text: `${direction[column.direction]}-${column.pileNo}`,
        };
      });
    },
    // handleChangeOpt
    handleChangeOpt(v) {
      if (v !== '1') {
        this.columns = this.indicatorColumns;
      } else {
        this.columns = this.boardColumns;
      }
      //   初始化值
      this.initValue();
    },
    initValue() {
      this.form.board = '';
      this.form.boardCode = '';
      this.form.picker = '';
      this.result = [];
    },
    async onSubmit(v) {
      const query = {
        1: {
          type: 'get',
          url: '/iot-manager/board/get-playlist',
          params: { identityCode: this.form.boardCode },
        },
        2: {
          type: 'post',
          url: '/iot-manager/device/exec-command',
          params: { device: this.form.boardCode, command: 'lsStatusGroup' },
        },
        3: {
          type: 'post',
          url: '/iot-manager/device/exec-command',
          params: { device: this.form.boardCode, command: 'getSwitchPlanNo1' },
        },
        4: {
          type: 'post',
          url: '/iot-manager/device/exec-command',
          params: { device: this.form.boardCode, command: 'getSwitchPlanNo2' },
        },
      };
      const checked = query[v.radio];
      if (!v.picker || !this.form.boardCode) {
        this.$toast.fail('请选择值');
        return;
      }
      let res = null;
      if (checked.type === 'get') {
        res = await this.$axios[checked.type](baseUrl + checked.url, {
          params: checked.params,
        });
      } else {
        res = await this.$axios[checked.type](baseUrl + checked.url, {
          ...checked.params,
        });
      }
      this.result = {
        ...res.data,
        status: res.status,
        statusText: res.statusText,
      };
    },

    // 选中了情报板code
    onConfirm(v) {
      this.form.board = v.text;
      this.form.boardCode = v.value;
      this.showPicker = false;
    },
  },
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.jv-node {
  text-align: left;
}
</style>
