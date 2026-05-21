import React from 'react'
import { Box, Text } from '@mantine/core'

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
    code: 'EU_9247883',
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

const formatDateLabel = (dateValue) => {
  if (!dateValue) return 'No info'
  const parsedDate = new Date(dateValue)
  if (Number.isNaN(parsedDate.getTime())) return dateValue
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const SECTION_TITLE_VARIANTS = {
  info: {
    summary: 'Sanction Info',
    events: 'Sanction Events',
  },
  profile: {
    summary: 'Sanctions Profile',
    events: 'Sanctions Timeline',
  },
  records: {
    summary: 'Sanctions Overview',
    events: 'Sanction Records',
  },
}

const SanctionDetailsVersionB = ({
  versionData,
  events,
  badgeStyles,
  titleVariant = 'info',
}) => {
  const safeVersionData = versionData || {}
  const safeOverview = {
    ...DEFAULT_OVERVIEW,
    ...(safeVersionData.overview || {}),
  }
  const safeEvents =
    Array.isArray(events) && events.length > 0 ? events : DEFAULT_EVENTS
  const sanctionEvents = safeEvents.filter(
    (event) => event.eventType === 'sanctions'
  )
  const safeBadgeStyles = { ...DEFAULT_BADGE_STYLES, ...(badgeStyles || {}) }
  const providerProgramMap = {
    UK: 'Russia Sanctions 2019',
    EU: 'Sanctions',
  }
  const providerAuthorityMap = {
    UK: 'UK OFSI',
    EU: 'EU Council',
  }
  const providerNoticeMap = {
    UK: 'https://www.gov.uk/government/publications/the-russia-sanctions-regime',
    EU: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1485',
  }
  const summaryPrograms = sanctionEvents
    .map((event) => event.chips || [])
    .flat()
    .filter((chip) => chip.tone === 'provider' && chip.label)
    .reduce((acc, chip) => {
      if (acc.some((item) => item.provider === chip.label)) return acc
      return [
        ...acc,
        {
          provider: chip.label,
          program: providerProgramMap[chip.label] || 'Sanctions',
        },
      ]
    }, [])
  const resolvedTitleVariant =
    SECTION_TITLE_VARIANTS[titleVariant] || SECTION_TITLE_VARIANTS.info
  const isProfileVariant = titleVariant === 'profile'
  const isRecordsVariant = titleVariant === 'records'

  const renderEventBody = (event) => {
    const providerChips = (event.chips || []).filter(
      (chip) => chip.tone === 'provider'
    )

    return (
      <Box style={{ minWidth: 0 }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 6,
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              minWidth: 0,
            }}
          >
            <Text
              style={{
                color: '#8D95AA',
                fontSize: 12,
                lineHeight: '18px',
                fontWeight: 500,
              }}
            >
              {formatDateLabel(event.effectiveDate)}
            </Text>
            {providerChips.map((chip) => {
              return (
                <Box
                  key={`${event.id}-${chip.label}`}
                  style={{
                    background: safeBadgeStyles[chip.tone]?.background || '#2B3350',
                    borderRadius: 4,
                    padding: '4px 8px',
                  }}
                >
                  <Text
                    style={{
                      color: safeBadgeStyles[chip.tone]?.color || '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      lineHeight: '14px',
                    }}
                  >
                    {chip.label}
                  </Text>
                </Box>
              )
            })}
          </Box>
          {event.code && (
            <Text
              style={{
                color: '#8D95AA',
                fontSize: 13,
                lineHeight: '18px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {event.code}
            </Text>
          )}
        </Box>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 600,
            lineHeight: '21px',
            marginBottom: 0,
            minWidth: 0,
          }}
        >
          {event.headline}
        </Text>
      </Box>
    )
  }

  const renderProfileEventCard = (event) => {
    const providerChips = (event.chips || []).filter(
      (chip) => chip.tone === 'provider'
    )
    const primaryProvider = providerChips[0]?.label
    const authorityLabel =
      event.authority ||
      (primaryProvider ? providerAuthorityMap[primaryProvider] : null) ||
      'Unknown authority'
    const verifiedLabel = formatDateLabel(event.lastVerified || event.effectiveDate)
    const noticeUrl =
      event.officialNoticeUrl ||
      (primaryProvider ? providerNoticeMap[primaryProvider] : null)

    return (
      <Box
        key={event.id}
        style={{
          background: '#21243A',
          border: '1px solid #3A4163',
          borderRadius: 4,
          padding: 16,
        }}
      >
        {renderEventBody(event)}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
            flexWrap: 'wrap',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 500 }}>
            {authorityLabel}
          </Text>
          <Text style={{ color: '#8D95AA', fontSize: 11 }}>•</Text>
          <Text style={{ color: '#8D95AA', fontSize: 12 }}>
            Verified {verifiedLabel}
          </Text>
          {noticeUrl && (
            <>
              <Text style={{ color: '#8D95AA', fontSize: 11 }}>•</Text>
              <Text
                component="a"
                href={noticeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#0094FF',
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Official notice
              </Text>
            </>
          )}
        </Box>
      </Box>
    )
  }

  if (isProfileVariant) {
    return (
      <Box
        style={{
          border: '1px solid #3D456B',
          borderRadius: 4,
          background: '#24263C',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Box>
          <Text style={{ color: '#8D95AA', fontSize: 11, marginBottom: 6 }}>
            Program(s)
          </Text>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              columnGap: 8,
              rowGap: 6,
              flexWrap: 'wrap',
            }}
          >
            {summaryPrograms.length > 0 ? (
              summaryPrograms.map((program, index) => (
                <Box
                  key={`${program.provider}-${program.program}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginRight: index < summaryPrograms.length - 1 ? 10 : 0,
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
                        lineHeight: '14px',
                      }}
                    >
                      {program.provider}
                    </Text>
                  </Box>
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                    {program.program}
                  </Text>
                </Box>
              ))
            ) : (
              <Text style={{ color: '#8D95AA', fontSize: 12 }}>
                No sanction programs available.
              </Text>
            )}
          </Box>
        </Box>
        <Box>
          <Text style={{ color: '#8D95AA', fontSize: 11, marginBottom: 6 }}>
            Vessel Owner
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: '20px' }}>
            {safeOverview.vesselOwner || 'No info'}
          </Text>
        </Box>
        {sanctionEvents.length > 0 && (
          <Box
            style={{
              borderTop: '1px solid #3D456B',
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {sanctionEvents.map((event) => renderProfileEventCard(event))}
          </Box>
        )}
        {sanctionEvents.length === 0 && (
          <Text style={{ color: '#8D95AA', fontSize: 12 }}>
            No sanction events available.
          </Text>
        )}
      </Box>
    )
  }

  if (isRecordsVariant) {
    return (
      <Box
        style={{
          border: '1px solid #3D456B',
          borderRadius: 4,
          background: '#24263C',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Box>
          <Text style={{ color: '#8D95AA', fontSize: 11, marginBottom: 6 }}>
            Program(s)
          </Text>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              columnGap: 8,
              rowGap: 6,
              flexWrap: 'wrap',
            }}
          >
            {summaryPrograms.length > 0 ? (
              summaryPrograms.map((program, index) => (
                <Box
                  key={`${program.provider}-${program.program}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginRight: index < summaryPrograms.length - 1 ? 10 : 0,
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
                        lineHeight: '14px',
                      }}
                    >
                      {program.provider}
                    </Text>
                  </Box>
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                    {program.program}
                  </Text>
                </Box>
              ))
            ) : (
              <Text style={{ color: '#8D95AA', fontSize: 12 }}>
                No sanction programs available.
              </Text>
            )}
          </Box>
        </Box>
        <Box>
          <Text style={{ color: '#8D95AA', fontSize: 11, marginBottom: 6 }}>
            Vessel Owner
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: '20px' }}>
            {safeOverview.vesselOwner || 'No info'}
          </Text>
        </Box>
        {sanctionEvents.length > 0 && (
          <Box
            style={{
              borderTop: '1px solid #3D456B',
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {sanctionEvents.map((event, index) => (
              <Box
                key={event.id}
                style={{
                  paddingTop: index === 0 ? 0 : 12,
                  borderTop: index === 0 ? 'none' : '1px solid #343B59',
                }}
              >
                {renderEventBody(event)}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
        }}
      >
        {resolvedTitleVariant.summary}
      </Text>
      <Box
        style={{
          border: '1px solid #3D456B',
          borderRadius: 4,
          background: '#24263C',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Box>
          <Text style={{ color: '#8D95AA', fontSize: 11, marginBottom: 6 }}>
            Program(s)
          </Text>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              columnGap: 8,
              rowGap: 6,
              flexWrap: 'wrap',
            }}
          >
            {summaryPrograms.length > 0 ? (
              summaryPrograms.map((program, index) => (
                <Box
                  key={`${program.provider}-${program.program}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginRight: index < summaryPrograms.length - 1 ? 10 : 0,
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
                        lineHeight: '14px',
                      }}
                    >
                      {program.provider}
                    </Text>
                  </Box>
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                    {program.program}
                  </Text>
                </Box>
              ))
            ) : (
              <Text style={{ color: '#8D95AA', fontSize: 12 }}>
                No sanction programs available.
              </Text>
            )}
          </Box>
        </Box>
        <Box>
          <Text style={{ color: '#8D95AA', fontSize: 11, marginBottom: 6 }}>
            Vessel Owner
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: '20px' }}>
            {safeOverview.vesselOwner || 'No info'}
          </Text>
        </Box>
      </Box>

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
          }}
        >
          {resolvedTitleVariant.events}
        </Text>
        {sanctionEvents.map((event) => (
          <Box
            key={event.id}
            style={{
              background: '#21243A',
              border: '1px solid #3A4163',
              borderRadius: 4,
              padding: 16,
            }}
          >
            {renderEventBody(event)}
          </Box>
        ))}
        {sanctionEvents.length === 0 && (
          <Text style={{ color: '#8D95AA', fontSize: 12 }}>
            No sanction events available.
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default SanctionDetailsVersionB
