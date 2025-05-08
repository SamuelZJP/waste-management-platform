<template>
  <baidu-map
    class="bm-view"
    :center="localCenter"
    :zoom="zoom"
    :scroll-wheel-zoom="true"
    @ready="handleMapReady"
  >
    <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"></bm-navigation>
    <bm-map-type :map-types="['BMAP_NORMAL_MAP', 'BMAP_HYBRID_MAP']"></bm-map-type>
    
    <bm-marker 
      v-for="marker in markers" 
      :key="marker.id"
      :position="{lng: marker.longitude, lat: marker.latitude}"
      @click="() => handleMarkerClick(marker)"
    >
      <bm-label 
        :content="marker.name"
        :labelStyle="{ color: '#fff', backgroundColor: getMarkerColor(marker.status), border: 'none', padding: '2px 8px', borderRadius: '4px' }"
        :offset="{ width: 20, height: -30 }"
      />
    </bm-marker>
  </baidu-map>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';

const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lng: 119.7032393, lat: 29.0855113 })
  },
  markers: {
    type: Array,
    default: () => []
  },
  initialZoom: {
    type: Number,
    default: 17
  }
});

const emit = defineEmits(['marker-click', 'map-ready']);

const localCenter = ref(props.center);
const zoom = ref(props.initialZoom);

// 处理地图准备完成事件
const handleMapReady = ({BMap, map}) => {
  // 通知父组件地图已准备好
  emit('map-ready', {BMap, map});
};

// 处理标记点点击事件
const handleMarkerClick = (marker) => {
  emit('marker-click', marker);
};

// 获取标记点颜色
const getMarkerColor = (status) => {
  switch (status) {
    case 0: return '#909399'; // 离线
    case 1: return '#67c23a'; // 在线
    case 2: return '#f56c6c'; // 故障
    case 'normal': return '#67c23a'; // 兼容管理端状态值
    case 'warning': return '#e6a23c'; // 兼容管理端状态值
    case 'error': return '#f56c6c'; // 兼容管理端状态值
    default: return '#909399';
  }
};
</script>

<style scoped>
.bm-view {
  width: 100%;
  height: 100%;
}
</style>