import React, { useMemo, useState } from 'react'
import { Box, Text } from '@mantine/core'
import { SwitchVertical01, Trash01, Star01, Eye, EyeOff } from '@untitledui/icons'
import ShipIcon from '../custom-icons/ShipIcon'
import PolygonIcon from '../custom-icons/PolygonIcon'
import AnchorIcon from '../custom-icons/AnchorIcon.svg'

// Shared table/card views used by both the Favorites/Watchlist nav and the
// Maritime Briefing feed so the two stay visually and behaviorally in sync.

export const tableShellStyles = {
  width: '100%',
  borderRadius: '4px 4px 0 0',
  overflow: 'hidden',
  background: 'transparent',
}

export const getColumnsByTab = (tabId) => {
  if (tabId === 'ships') {
    return [
      { key: 'name', label: 'Name', width: 'minmax(0, 1.3fr)' },
      { key: 'flag', label: 'Flag', width: '72px', align: 'left' },
      { key: 'type', label: 'Type', width: 'minmax(0, 1.1fr)' },
      { key: 'port', label: 'Port', width: 'minmax(0, 1fr)' },
    ]
  }

  if (tabId === 'ports') {
    return [
      { key: 'name', label: 'Port', width: 'minmax(0, 1.4fr)' },
      { key: 'country', label: 'Country', width: 'minmax(0, 0.9fr)' },
      { key: 'activity', label: 'Activity', width: 'minmax(0, 1fr)' },
      { key: 'risk', label: 'Risk', width: 'minmax(0, 0.8fr)' },
      { key: 'updatedAt', label: 'Updated', width: 'minmax(0, 0.9fr)' },
    ]
  }

  if (tabId === 'polygons') {
    return [
      { key: 'name', label: 'Shape Name', width: 'minmax(0, 1.6fr)' },
      { key: 'area', label: 'Area', width: 'minmax(0, 1fr)' },
      { key: 'lastEdited', label: 'Last Edited', width: 'minmax(0, 1fr)' },
    ]
  }

  if (tabId === 'events') {
    return [
      { key: 'name', label: 'Event', width: 'minmax(0, 1.2fr)' },
      { key: 'severity', label: 'Severity', width: 'minmax(0, 0.8fr)' },
      { key: 'relatedTo', label: 'Related To', width: 'minmax(0, 1fr)' },
      { key: 'lastSeen', label: 'Last Seen', width: 'minmax(0, 1fr)' },
      { key: 'source', label: 'Source', width: 'minmax(0, 0.8fr)' },
    ]
  }

  if (tabId === 'recently-viewed') {
    return [
      { key: 'entityType', label: 'Type', width: 'minmax(0, 0.8fr)' },
      { key: 'name', label: 'Name', width: 'minmax(0, 1.3fr)' },
      { key: 'details', label: 'Details', width: 'minmax(0, 1.2fr)' },
      { key: 'lastViewed', label: 'Last Viewed', width: 'minmax(0, 1fr)' },
    ]
  }

  return [
    { key: 'entityType', label: 'Type', width: 'minmax(0, 0.8fr)' },
    { key: 'name', label: 'Name', width: 'minmax(0, 1.2fr)' },
    { key: 'description', label: 'Description', width: 'minmax(0, 1.2fr)' },
    { key: 'status', label: 'Status', width: 'minmax(0, 0.8fr)' },
    { key: 'updatedAt', label: 'Updated', width: 'minmax(0, 0.9fr)' },
  ]
}

export const DataTable = ({
  rows,
  columns,
  emptyMessage,
  onRowClick,
  activeRowId,
  onRemoveRow,
  isFavorite,
  onToggleFavorite,
  isMarkerOn,
  onToggleMarker,
}) => {
  const hasRemove = typeof onRemoveRow === 'function'
  const hasFavorite = typeof onToggleFavorite === 'function'
  const hasMarker = typeof onToggleMarker === 'function'
  const gridTemplateColumns = [
    ...columns.map((column) => column.width),
    ...(hasMarker ? ['32px'] : []),
    ...(hasFavorite ? ['32px'] : []),
    ...(hasRemove ? ['32px'] : []),
  ].join(' ')
  const isInteractive = typeof onRowClick === 'function'
  const [hoveredRowId, setHoveredRowId] = useState(null)
  const [localActiveRowId, setLocalActiveRowId] = useState(null)
  const [sortConfig, setSortConfig] = useState(null)
  const resolvedActiveRowId =
    activeRowId !== undefined
      ? activeRowId === null
        ? null
        : String(activeRowId)
      : localActiveRowId
  const sortedRows = useMemo(() => {
    if (!sortConfig?.key) return rows
    const sorted = [...rows]
    const normalizeValue = (value) => {
      if (value === null || value === undefined) return ''
      const raw = String(value).trim()
      if (!raw) return ''
      const numeric = Number(raw)
      if (!Number.isNaN(numeric) && /^-?\d+(\.\d+)?$/.test(raw)) return numeric
      const parsedDate = Date.parse(raw)
      if (!Number.isNaN(parsedDate)) return parsedDate
      return raw.toLowerCase()
    }
    sorted.sort((a, b) => {
      const aVal = normalizeValue(a?.[sortConfig.key])
      const bVal = normalizeValue(b?.[sortConfig.key])
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal)
      const bStr = String(bVal)
      const cmp = aStr.localeCompare(bStr, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
      return sortConfig.direction === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [rows, sortConfig])
  const SortHeaderIcon = () => <SwitchVertical01 size={12} color="#FFFFFF" />

  return (
    <Box style={tableShellStyles}>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns,
          columnGap: 10,
          alignItems: 'center',
          padding: '6px 10px',
          background: '#24263C',
          borderRadius: '4px 4px 0 0',
        }}
      >
        {columns.map((column) => (
          <Text
            key={column.key}
            component="span"
            style={{
              color: '#fff',
              fontSize: 12,
              lineHeight: '16px',
              minWidth: 0,
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {column.sortable === false ? (
              <Box
                component="span"
                style={{
                  display: 'block',
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '16px',
                }}
              >
                {column.label}
              </Box>
            ) : (
              <Box
                component="button"
                type="button"
                onClick={() =>
                  setSortConfig((prev) => {
                    if (!prev || prev.key !== column.key) {
                      return { key: column.key, direction: 'asc' }
                    }
                    return {
                      key: column.key,
                      direction: prev.direction === 'asc' ? 'desc' : 'asc',
                    }
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  gap: 4,
                  width: '100%',
                  minWidth: 0,
                  overflow: 'hidden',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  margin: 0,
                  color: 'inherit',
                  cursor: 'pointer',
                  lineHeight: '16px',
                }}
              >
                <Box
                  component="span"
                  style={{
                    display: 'block',
                    flex: '0 1 auto',
                    minWidth: 0,
                    maxWidth: 'calc(100% - 16px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '16px',
                  }}
                >
                  {column.label}
                </Box>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 12,
                    height: 12,
                    lineHeight: 0,
                    flexShrink: 0,
                    opacity: sortConfig?.key === column.key ? 1 : 0.65,
                    transform:
                      sortConfig?.key === column.key &&
                      sortConfig?.direction === 'desc'
                        ? 'rotate(180deg)'
                        : 'none',
                    transition: 'transform 120ms ease, opacity 120ms ease',
                  }}
                >
                  <SortHeaderIcon />
                </Box>
              </Box>
            )}
          </Text>
        ))}
        {hasMarker && <Box style={{ width: 32 }} />}
        {hasFavorite && <Box style={{ width: 32 }} />}
        {hasRemove && <Box style={{ width: 32 }} />}
      </Box>

      {rows.length === 0 ? (
        <Box
          style={{
            padding: '14px 12px',
            background: '#181926',
          }}
        >
          <Text style={{ color: '#8D95AA', fontSize: 12, lineHeight: 1.4 }}>
            {emptyMessage}
          </Text>
        </Box>
      ) : (
        sortedRows.map((row, idx) => (
          <Box
            key={row.id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onMouseEnter={
              isInteractive ? () => setHoveredRowId(String(row.id)) : undefined
            }
            onMouseLeave={
              isInteractive ? () => setHoveredRowId(null) : undefined
            }
            onMouseDown={
              isInteractive
                ? () => setLocalActiveRowId(String(row.id))
                : undefined
            }
            style={{
              display: 'grid',
              gridTemplateColumns,
              columnGap: 10,
              alignItems: 'center',
              padding: '8px',
              borderTop:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? '1px solid #006CD7'
                  : idx === 0 ||
                      (isInteractive &&
                        idx > 0 &&
                        resolvedActiveRowId === String(sortedRows[idx - 1]?.id))
                    ? 'none'
                    : '1px solid #393C56',
              borderRight:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? '1px solid #006CD7'
                  : 'none',
              borderBottom:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? '1px solid #006CD7'
                  : 'none',
              borderLeft:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? '1px solid #006CD7'
                  : 'none',
              borderRadius: 0,
              background:
                isInteractive && resolvedActiveRowId === String(row.id)
                  ? 'linear-gradient(0deg, rgba(0,108,215,0.24), rgba(0,108,215,0.24)), #181926'
                  : isInteractive && hoveredRowId === String(row.id)
                    ? '#0056AC'
                    : '#181926',
              cursor: isInteractive ? 'pointer' : 'default',
              transition: isInteractive
                ? 'background-color 120ms ease'
                : undefined,
            }}
          >
            {columns.map((column) => (
              <Text
                key={`${row.id}-${column.key}`}
                style={{
                  color: '#fff',
                  fontSize: column.key === 'flag' ? 16 : 12,
                  lineHeight: '16px',
                  minWidth: 0,
                  textAlign: column.align || 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={row[column.key]}
              >
                {row[column.key] || 'No info'}
              </Text>
            ))}
            {hasMarker && (
              <Box
                component="button"
                type="button"
                aria-label="Toggle map marker"
                aria-pressed={isMarkerOn?.(row) ? true : false}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleMarker(row)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  justifySelf: 'center',
                }}
              >
                {isMarkerOn?.(row) ? (
                  <Eye size={15} color="#FFFFFF" />
                ) : (
                  <EyeOff size={15} color="#6C7392" />
                )}
              </Box>
            )}
            {hasFavorite && (
              <Box
                component="button"
                type="button"
                aria-label="Favorite"
                aria-pressed={isFavorite?.(row) ? true : false}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleFavorite(row)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  justifySelf: 'center',
                }}
              >
                <Star01
                  size={14}
                  color={isFavorite?.(row) ? '#FDB022' : '#A4ABBE'}
                  fill={isFavorite?.(row) ? '#FDB022' : 'none'}
                />
              </Box>
            )}
            {hasRemove && (
              <Box
                component="button"
                type="button"
                aria-label="Remove"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemoveRow(row)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#A4ABBE',
                  justifySelf: 'center',
                }}
              >
                <Trash01 size={14} color="#A4ABBE" />
              </Box>
            )}
          </Box>
        ))
      )}
    </Box>
  )
}

export const BookmarkCardList = ({
  rows,
  kind,
  emptyMessage,
  onRowClick,
  activeRowId,
  onRemoveRow,
  secondaryText,
  isFavorite,
  onToggleFavorite,
  isMarkerOn,
  onToggleMarker,
}) => {
  const [hoveredRowId, setHoveredRowId] = useState(null)
  const isInteractive = typeof onRowClick === 'function'
  const hasRemove = typeof onRemoveRow === 'function'
  const hasFavorite = typeof onToggleFavorite === 'function'
  const hasMarker = typeof onToggleMarker === 'function'
  const resolvedActiveRowId =
    activeRowId === null || activeRowId === undefined
      ? null
      : String(activeRowId)

  if (!rows || rows.length === 0) {
    return (
      <Box
        style={{
          border: '1px solid #393C56',
          borderRadius: 4,
          background: '#181926',
          padding: '16px',
          color: '#888F9E',
          fontSize: 12,
        }}
      >
        {emptyMessage}
      </Box>
    )
  }

  const renderIcon = () => {
    if (kind === 'port') {
      return (
        <Box
          component="img"
          src={AnchorIcon}
          alt=""
          style={{ width: 18, height: 18, display: 'block' }}
        />
      )
    }
    if (kind === 'shape') {
      return <PolygonIcon style={{ width: 18, height: 18 }} />
    }
    return <ShipIcon style={{ width: 18, height: 18 }} />
  }

  const getSecondary = (row) => {
    const clean = (value) => {
      const str = String(value ?? '').trim()
      if (!str || str.toLowerCase() === 'no info') return ''
      return str
    }
    let parts = []
    if (kind === 'ship') parts = [clean(row.type), clean(row.port)]
    else if (kind === 'port') parts = [clean(row.country), clean(row.risk)]
    else parts = [clean(row.polygonType), clean(row.region)]
    return parts.filter(Boolean).join('  \u00B7  ')
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {rows.map((row) => {
        const isActive = resolvedActiveRowId === String(row.id)
        const isHovered = hoveredRowId === row.id
        const secondary =
          typeof secondaryText === 'function'
            ? secondaryText(row)
            : getSecondary(row)
        return (
          <Box
            key={row.id}
            onClick={isInteractive ? () => onRowClick(row) : undefined}
            onMouseEnter={() => setHoveredRowId(row.id)}
            onMouseLeave={() => setHoveredRowId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 8,
              borderRadius: 4,
              border: `1px solid ${isActive ? '#006CD7' : '#393C56'}`,
              background: isActive
                ? 'linear-gradient(0deg, rgba(0,108,215,0.16), rgba(0,108,215,0.16)), #24263C'
                : '#24263C',
              cursor: isInteractive ? 'pointer' : 'default',
            }}
          >
            <Box
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 4,
                background: '#181926',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {renderIcon()}
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.name}
                {row.flag && String(row.flag).trim() && row.flag !== '-'
                  ? ` ${row.flag}`
                  : ''}
              </Text>
              {secondary && (
                <Text
                  style={{
                    color: '#888F9E',
                    fontSize: 12,
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {secondary}
                </Text>
              )}
            </Box>
            {hasMarker && (
              <Box
                component="button"
                type="button"
                aria-label="Toggle map marker"
                aria-pressed={isMarkerOn?.(row) ? true : false}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleMarker(row)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                {isMarkerOn?.(row) ? (
                  <Eye size={15} color="#FFFFFF" />
                ) : (
                  <EyeOff size={15} color="#6C7392" />
                )}
              </Box>
            )}
            {hasFavorite && (
              <Box
                component="button"
                type="button"
                aria-label="Favorite"
                aria-pressed={isFavorite?.(row) ? true : false}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleFavorite(row)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                <Star01
                  size={15}
                  color={isFavorite?.(row) ? '#FDB022' : '#A4ABBE'}
                  fill={isFavorite?.(row) ? '#FDB022' : 'none'}
                />
              </Box>
            )}
            {hasRemove && (
              <Box
                component="button"
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemoveRow(row)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  opacity: isHovered ? 1 : 0.65,
                }}
              >
                <Trash01 size={14} color="#A4ABBE" />
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
