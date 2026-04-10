import React from 'react'
import { Box, Text } from '@mantine/core'
import { ArrowRight, ChevronDown } from '@untitledui/icons'

const DEFAULT_OVERVIEW = {
  vesselOwner: 'HCC Shipmanagement Inc',
}

const DEFAULT_BADGE_STYLES = {
  sanctions: { background: '#F84B4B', color: '#fff' },
  provider: { background: '#393C56', color: '#fff' },
  name: { background: '#393C56', color: '#fff' },
  mmsi: { background: '#393C56', color: '#fff' },
  flag: { background: '#393C56', color: '#fff' },
  scrapped: { background: '#F84B4B', color: '#fff' },
  warning: { background: '#393C56', color: '#fff' },
}

const DEFAULT_COUNTRY_FLAGS = {
  Tanzania: '🇹🇿',
  'Sierra Leone': '🇸🇱',
  Cameroon: '🇨🇲',
  UK: '🇬🇧',
  EU: '🇪🇺',
}

const DEFAULT_EVENTS = [
  {
    id: 'sanction-b-1',
    effectiveDate: '2025-05-19',
    eventType: 'sanctions',
    headline: 'Added to EU Sanctions',
    code: 'EU_9247883',
    chips: [
      { tone: 'sanctions', label: 'Sanctions' },
      { tone: 'provider', label: 'EU' },
    ],
  },
  {
    id: 'sanction-b-2',
    effectiveDate: '2025-05-09',
    eventType: 'sanctions',
    headline: 'Added to UK Russian Sanctions 2019',
    code: 'RUS2550',
    chips: [
      { tone: 'sanctions', label: 'Sanctions' },
      { tone: 'provider', label: 'UK' },
    ],
  },
  {
    id: 'sanction-b-3',
    effectiveDate: '2025-04-27',
    eventType: 'alias_added',
    headline: 'Alias Added',
    afterValue: 'HATTI',
    chips: [{ tone: 'name', label: 'Name Change' }],
  },
  {
    id: 'sanction-b-4',
    effectiveDate: '2025-04-15',
    eventType: 'associated_mmsi_added',
    headline: 'Associated MMSI Added',
    afterValue: '314996000',
    chips: [{ tone: 'mmsi', label: 'MMSI Change' }],
  },
  {
    id: 'sanction-b-5',
    effectiveDate: '2025-02-28',
    eventType: 'scrapped',
    headline: 'Reported scrapped',
    afterValue: 'Alang, India',
    chips: [
      { tone: 'scrapped', label: 'Scrapped' },
      { tone: 'warning', label: 'Breach: EU SRR' },
    ],
    detailFields: [
      { label: 'Yard', value: 'Shree Ram Vessel Scrap Pvt Ltd' },
      { label: 'Location', value: 'Alang, India' },
      { label: 'Flag Prior', value: 'Cameroon' },
      { label: 'Beneficial Owner', value: 'JOINT STOCK COMPANY SOVCOMFLOT' },
      { label: 'Commercial Operator', value: 'SCF Management Services' },
    ],
  },
  {
    id: 'sanction-b-6',
    effectiveDate: '2024-11-03',
    eventType: 'name_change',
    beforeValue: 'CAPE HORN',
    afterValue: 'SAPNA',
    chips: [{ tone: 'name', label: 'Name Change' }],
  },
  {
    id: 'sanction-b-7',
    effectiveDate: '2024-06-01',
    eventType: 'mmsi_change',
    beforeValue: '667001111',
    afterValue: '667002270',
    chips: [{ tone: 'mmsi', label: 'MMSI Change' }],
  },
  {
    id: 'sanction-b-8',
    effectiveDate: '2023-09-10',
    eventType: 'flag_change',
    beforeValue: 'Tanzania',
    afterValue: 'Sierra Leone',
    chips: [{ tone: 'flag', label: 'Flag Change' }],
  },
]

const formatTimelineDate = (dateValue) => {
  if (!dateValue) return 'No info'

  const normalizedValue =
    typeof dateValue === 'string' ? dateValue.trim() : dateValue
  const isIsoDateString =
    typeof normalizedValue === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)
  const parsedDate =
    normalizedValue instanceof Date
      ? normalizedValue
      : isIsoDateString
        ? new Date(`${normalizedValue}T00:00:00`)
        : new Date(normalizedValue)

  if (Number.isNaN(parsedDate.getTime())) return String(dateValue)

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const SanctionDetailsVersionB = ({
  versionData,
  events,
  expandedEventId,
  setExpandedEventId,
  badgeStyles,
  countryFlags,
}) => {
  const [localExpandedEventId, setLocalExpandedEventId] = React.useState(null)
  const [dateSortOrder, setDateSortOrder] = React.useState('desc')
  const safeVersionData = versionData || {}
  const safeOverview = {
    ...DEFAULT_OVERVIEW,
    ...(safeVersionData.overview || {}),
  }
  const safeEvents =
    Array.isArray(events) && events.length > 0 ? events : DEFAULT_EVENTS
  const safeBadgeStyles = { ...DEFAULT_BADGE_STYLES, ...(badgeStyles || {}) }
  const safeCountryFlags = { ...DEFAULT_COUNTRY_FLAGS, ...(countryFlags || {}) }
  const sanctionDates = safeEvents
    .filter((event) => event.eventType === 'sanctions' && event.effectiveDate)
    .map((event) => event.effectiveDate)
  const sanctionDateLabel = formatTimelineDate(
    safeOverview.sanctionDate || sanctionDates[0]
  )
  const sortedEvents = React.useMemo(() => {
    const direction = dateSortOrder === 'asc' ? 1 : -1

    return safeEvents
      .map((event, index) => {
        const parsedDate = event.effectiveDate
          ? new Date(event.effectiveDate)
          : null

        return {
          event,
          index,
          sortTs:
            parsedDate && !Number.isNaN(parsedDate.getTime())
              ? parsedDate.getTime()
              : null,
        }
      })
      .sort((a, b) => {
        const aHasDate = a.sortTs !== null
        const bHasDate = b.sortTs !== null

        if (aHasDate && bHasDate) {
          return (a.sortTs - b.sortTs) * direction
        }
        if (aHasDate) return -1
        if (bHasDate) return 1
        return a.index - b.index
      })
      .map((item) => item.event)
  }, [safeEvents, dateSortOrder])
  const hasExternalExpandedState = typeof setExpandedEventId === 'function'
  const resolvedExpandedEventId = hasExternalExpandedState
    ? expandedEventId
    : localExpandedEventId
  const onToggleExpanded = (nextEventId) => {
    if (hasExternalExpandedState) {
      setExpandedEventId(nextEventId)
      return
    }
    setLocalExpandedEventId(nextEventId)
  }

  return (
    <Box
      style={{
        border: '1px solid #3D456B',
        borderRadius: 4,
        background: '#24263C',
        padding: 12,
      }}
    >
      <Box
        style={{
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Box>
            <Text style={{ color: '#8D95AA', fontSize: 10, marginBottom: 2 }}>
              Date of sanction
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
              {sanctionDateLabel}
            </Text>
          </Box>
          <Box
            onClick={() =>
              setDateSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
            }
            style={{
              border: '1px solid #FFFFFF',
              borderRadius: 4,
              padding: '4px 8px',
              cursor: 'pointer',
              userSelect: 'none',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 600 }}>
              Sort: {dateSortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Text>
          </Box>
        </Box>
        <Box>
          <Text style={{ color: '#8D95AA', fontSize: 10, marginBottom: 2 }}>
            Program(s)
          </Text>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <Box
              style={{
                background: '#393C56',
                borderRadius: 4,
                padding: '4px 8px',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                UK
              </Text>
            </Box>
            <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
              Russia Sanctions 2019
            </Text>
            <Box
              style={{
                width: 1,
                height: 12,
                background: '#4B5070',
                margin: '0 2px',
              }}
            />
            <Box
              style={{
                background: '#393C56',
                borderRadius: 4,
                padding: '4px 8px',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                EU
              </Text>
            </Box>
            <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Sanctions</Text>
          </Box>
        </Box>
        <Box>
          <Text style={{ color: '#8D95AA', fontSize: 10, marginBottom: 2 }}>
            Vessel Owner
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
            {safeOverview.vesselOwner || 'No info'}
          </Text>
        </Box>
      </Box>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            left: 10,
            top: 8,
            bottom: 14,
            width: 1,
            backgroundImage:
              'repeating-linear-gradient(to bottom, #A7ADBF 0 3px, transparent 3px 7px)',
            display: 'block',
          }}
        />
        {sortedEvents.map((event, index) => {
          const isExpanded = resolvedExpandedEventId === event.id
          const hasDetails = (event.detailFields || []).length > 0
          const canExpand = hasDetails && event.eventType === 'scrapped'
          const isFlagChangeEvent = event.eventType === 'flag_change'
          const hasBeforeAndAfter = Boolean(
            event.beforeValue && event.afterValue
          )
          const hasSingleValue =
            !hasBeforeAndAfter && Boolean(event.afterValue || event.beforeValue)
          const hideDuplicateChangeHeadline = [
            'mmsi_change',
            'name_change',
            'flag_change',
          ].includes(event.eventType)

          return (
            <Box
              key={event.id}
              style={{
                display: 'flex',
                gap: 14,
                paddingBottom: index < sortedEvents.length - 1 ? 10 : 0,
              }}
            >
              <Box
                style={{
                  width: 22,
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <Box
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: '#FFFFFF',
                    outline: '2px solid #24263c',
                    position: 'absolute',
                    left: 5,
                    top: 5,
                    flexShrink: 0,
                  }}
                />
              </Box>
              <Box
                style={{
                  flex: 1,
                  paddingBottom: 10,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 0,
                }}
              >
                <Box>
                  <Box style={{ minWidth: 0 }}>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Text
                        style={{
                          color: '#8D95AA',
                          fontSize: 14,
                          lineHeight: '22px',
                        }}
                      >
                        {formatTimelineDate(event.effectiveDate)}
                      </Text>
                      {event.chips?.map((chip) => {
                        const labelOverride =
                          chip.tone === 'name'
                            ? 'Name Change'
                            : chip.tone === 'mmsi'
                              ? 'MMSI Change'
                              : chip.tone === 'flag'
                                ? 'Flag Change'
                                : chip.label

                        return (
                          <Box
                            key={`${event.id}-${chip.label}`}
                            style={{
                              background:
                                safeBadgeStyles[chip.tone]?.background ||
                                '#2B3350',
                              borderRadius: 4,
                              padding: '4px 8px',
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  safeBadgeStyles[chip.tone]?.color || '#fff',
                                fontSize: 11,
                                fontWeight: 700,
                                lineHeight: 1.2,
                              }}
                            >
                              {labelOverride}
                            </Text>
                          </Box>
                        )
                      })}
                    </Box>
                    {!hideDuplicateChangeHeadline && (
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 16,
                          fontWeight: 500,
                          marginBottom: 2,
                        }}
                      >
                        {event.headline}
                      </Text>
                    )}
                    {event.code && (
                      <Text
                        style={{
                          color: '#8D95AA',
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                      >
                        {event.code}
                      </Text>
                    )}
                    {hasBeforeAndAfter && (
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        {isFlagChangeEvent ? (
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            {safeCountryFlags[event.beforeValue] && (
                              <Text style={{ fontSize: 16, lineHeight: 1 }}>
                                {safeCountryFlags[event.beforeValue]}
                              </Text>
                            )}
                            <Text style={{ color: '#fff', fontSize: 16 }}>
                              {event.beforeValue}
                            </Text>
                          </Box>
                        ) : (
                          <Text style={{ color: '#fff', fontSize: 16 }}>
                            {event.beforeValue}
                          </Text>
                        )}
                        <ArrowRight
                          style={{
                            width: 18,
                            height: 16,
                            color: '#888F9E',
                          }}
                        />
                        {isFlagChangeEvent ? (
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            {safeCountryFlags[event.afterValue] && (
                              <Text style={{ fontSize: 16, lineHeight: 1 }}>
                                {safeCountryFlags[event.afterValue]}
                              </Text>
                            )}
                            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                              {event.afterValue}
                            </Text>
                          </Box>
                        ) : (
                          <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                            {event.afterValue}
                          </Text>
                        )}
                      </Box>
                    )}
                    {hasSingleValue && (
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 16,
                          marginBottom: 6,
                        }}
                      >
                        {event.afterValue || event.beforeValue}
                      </Text>
                    )}
                    {canExpand && (
                      <Box
                        onClick={() =>
                          onToggleExpanded(isExpanded ? null : event.id)
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer',
                          marginBottom: isExpanded ? 8 : 0,
                          userSelect: 'none',
                        }}
                      >
                        <Text
                          style={{
                            color: '#0094FF',
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isExpanded ? 'Hide details' : 'View details'}
                        </Text>
                        <ChevronDown
                          style={{
                            width: 14,
                            height: 14,
                            color: '#0094FF',
                            transform: isExpanded
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                            transition: 'transform 140ms ease',
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
                {canExpand && isExpanded && hasDetails && (
                  <Box
                    style={{
                      marginTop: 0,
                      width: '100%',
                      boxSizing: 'border-box',
                      border: '1px solid #393C56',
                      borderRadius: 4,
                      background: '#24263C',
                      padding: 14,
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: 12,
                    }}
                  >
                    {event.detailFields.map((field) => (
                      <Box key={`${event.id}-${field.label}`}>
                        <Text
                          style={{
                            color: '#7E8BA6',
                            fontSize: 11,
                            marginBottom: 2,
                          }}
                        >
                          {field.label}
                        </Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
                          {field.value}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default SanctionDetailsVersionB
