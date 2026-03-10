<template>
  <div class="table-wrapper">
    <div class="table-toolbar">
      <div class="toolbar-left">
        <button class="btn btn-sm" @click="selectAll">Seleccionar todos</button>
        <button class="btn btn-sm" @click="deselectAll">Deseleccionar</button>
        <span v-if="selectedItems.length > 0" class="selection-count">
          {{ selectedItems.length }} seleccionado(s)
        </span>
      </div>
      <div class="toolbar-actions">
        <slot name="toolbar" :selected="selectedItems" :count="selectedItems.length" />
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="check-col">
            <input type="checkbox" :checked="allChecked" @change="toggleAll" />
          </th>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item._id" :class="{ 'row-selected': selectedIds.includes(item._id) }">
          <td class="check-col">
            <input type="checkbox" :checked="selectedIds.includes(item._id)" @change="toggleItem(item)" />
          </td>
          <td v-for="col in columns" :key="col.key">
            <template v-if="col.render">{{ col.render(item) }}</template>
            <template v-else>{{ getNestedValue(item, col.key) }}</template>
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td :colspan="columns.length + 1" class="empty">
            No se encontraron registros
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination-bar" v-if="paginated && totalPages > 0">
      <div class="pagination-info">
        Pagina {{ currentPage }} de {{ totalPages }} ({{ total }} registros)
      </div>
      <div class="pagination-controls">
        <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(1)" title="Primera pagina">
          <ChevronsLeft :size="16" />
        </button>
        <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)" title="Anterior">
          <ChevronLeft :size="16" />
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          class="page-btn page-num"
          :class="{ active: p === currentPage }"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>

        <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)" title="Siguiente">
          <ChevronRight :size="16" />
        </button>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(totalPages)" title="Ultima pagina">
          <ChevronsRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const props = defineProps({
  columns: Array,
  items: Array,
  paginated: { type: Boolean, default: true },
  skip: { type: Number, default: 0 },
  limit: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
})

const emit = defineEmits(['page-change'])

// Selection
const selectedIds = ref([])

const selectedItems = computed(() => props.items.filter(i => selectedIds.value.includes(i._id)))
const allChecked = computed(() => props.items.length > 0 && props.items.every(i => selectedIds.value.includes(i._id)))

function toggleItem(item) {
  const idx = selectedIds.value.indexOf(item._id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(item._id)
}

function selectAll() { selectedIds.value = props.items.map(i => i._id) }
function deselectAll() { selectedIds.value = [] }
function toggleAll() { allChecked.value ? deselectAll() : selectAll() }

watch(() => props.items, () => { selectedIds.value = [] })

// Pagination
const currentPage = computed(() => Math.floor(props.skip / props.limit) + 1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))

const visiblePages = computed(() => {
  const pages = []
  const tp = totalPages.value
  const cp = currentPage.value
  let start = Math.max(1, cp - 2)
  let end = Math.min(tp, cp + 2)

  if (cp <= 3) end = Math.min(tp, 5)
  if (cp >= tp - 2) start = Math.max(1, tp - 4)

  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  emit('page-change', (page - 1) * props.limit)
}

function getNestedValue(obj, path) {
  const val = path.split('.').reduce((o, k) => o?.[k], obj)
  if (val === null || val === undefined) return '-'
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'boolean') return val ? 'Si' : 'No'
  return val
}
</script>

<style scoped>
.table-wrapper { overflow-x: auto; }

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.selection-count {
  font-size: 0.83rem;
  color: #e94560;
  font-weight: 600;
}

table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid #ddd; white-space: nowrap; }
td { padding: 8px 12px; border-bottom: 1px solid #eee; }
tr:hover { background: #fafafa; }
.empty { text-align: center; color: #999; padding: 24px; }
.check-col { width: 40px; text-align: center; }
.row-selected { background: #fff0f3; }
.row-selected:hover { background: #ffe0e6; }

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-top: 4px;
}
.pagination-info {
  font-size: 0.83rem;
  color: #888;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: #555;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled):not(.active) {
  background: #f0f0f0;
  border-color: #ccc;
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.page-btn.active {
  background: #e94560;
  color: #fff;
  border-color: #e94560;
  font-weight: 700;
}
.page-num {
  min-width: 34px;
  font-weight: 500;
}
</style>
