import './SortableHeader.scss'

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface SortableHeaderProps {
  label: string
  sortKey: string
  sortConfig: SortConfig
  onSort: (key: string) => void
}

const SortableHeader = ({ label, sortKey, sortConfig, onSort }: SortableHeaderProps) => {
  const isActive = sortConfig.key === sortKey
  const arrow = isActive ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'

  return (
    <th
      className={`sortable-header ${isActive ? 'active' : ''}`}
      onClick={() => onSort(sortKey)}
    >
      {label} <span className="sort-arrow">{arrow}</span>
    </th>
  )
}

export default SortableHeader
