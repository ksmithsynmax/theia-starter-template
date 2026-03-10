import React from 'react'
import { Box, Text, Title } from '@mantine/core'
import {
  File02,
  Star01,
  Copy02,
  ChevronDown,
  ArrowRight,
} from '@untitledui/icons'
import KeyValuePair from '../components/KeyValuePair'
import flagImg from '../assets/flag.png'
import AlertIcon from '../custom-icons/AlertIcon'
import {
  sanctionVersionA,
  sanctionVersionB,
  sanctionVersionC,
} from '../mock/sanctionVersionMocks'

const Myships = () => {
  const [activeTab, setActiveTab] = React.useState('Sanction Details')
  const [selectedVersionKey, setSelectedVersionKey] = React.useState('A')
  const [expandedEventId, setExpandedEventId] = React.useState(null)
  const tabs = ['Event Timeline', 'Ownership', 'Sanction Details']
  const versionDataByKey = {
    A: sanctionVersionA,
    B: sanctionVersionB,
    C: sanctionVersionC,
  }
  const versionData = versionDataByKey[selectedVersionKey] || sanctionVersionA
  const events = versionData.events
  const badgeStyles = {
    sanctions: { background: '#F84B4B', color: '#fff' },
    provider: { background: '#393C56', color: '#fff' },
    name: { background: '#393C56', color: '#fff' },
    mmsi: { background: '#393C56', color: '#fff' },
    flag: { background: '#393C56', color: '#fff' },
    scrapped: { background: '#F84B4B', color: '#fff' },
    warning: { background: '#393C56', color: '#fff' },
  }
  const countryFlags = {
    Tanzania: '🇹🇿',
    'Sierra Leone': '🇸🇱',
    Cameroon: '🇨🇲',
    UK: '🇬🇧',
    EU: '🇪🇺',
  }

  React.useEffect(() => {
    const onVersionChange = (evt) => {
      const key = evt?.detail?.key
      if (key === 'A' || key === 'B' || key === 'C') {
        setSelectedVersionKey(key)
        setExpandedEventId(null)
      }
    }
    window.addEventListener('version-testing-change', onVersionChange)
    return () =>
      window.removeEventListener('version-testing-change', onVersionChange)
  }, [])

  return (
    <Box
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box style={{ padding: '20px', flexShrink: 0 }}>
        <Box style={{ display: 'flex', marginBottom: '16px' }}>
          <Box
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Title order={4} style={{ color: 'white' }}>
              Invictus
            </Title>

            <img src={flagImg} alt="flag" />
          </Box>
          <Box style={{ flex: 1 }}></Box>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginRight: 24,
            }}
          >
            <File02 style={{ color: '#fff', width: 20, height: 20 }} />
            <AlertIcon style={{ color: '#fff', width: 20, height: 20 }} />
            <Star01 style={{ color: '#fff', width: 20, height: 20 }} />
          </Box>
        </Box>
        <Box style={{ display: 'flex', gap: '64px', marginBottom: '8px' }}>
          <KeyValuePair keyName="Latest Event" value="Sanctioned" />
          <KeyValuePair keyName="IMO" value="9819870" />
          <KeyValuePair keyName="MMSI" value="331000686" />
          <KeyValuePair keyName="Object ID" value="No Info" />
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'end',
            gap: 8,
            marginBottom: '16px',
          }}
        >
          <KeyValuePair
            keyName="SynMax Ship ID"
            value="f8f6a2c9-9c04-777e-ecc4-6bcf114315ac"
          />

          <Copy02
            style={{
              color: '#fff',
              width: 16,
              height: 16,
              cursor: 'pointer',
            }}
            // onClick={() => navigator.clipboard.writeText(activeShip.shipId)}
          />
        </Box>
        <Box>
          <Text
            style={{ color: '#888F9E', fontSize: '10px', marginBottom: '6px' }}
          >
            Ship Tools
          </Text>

          <Box style={{ display: 'flex', marginBottom: '12px' }}>
            <Box
              style={{
                padding: '12px',
                background: '#393C56',
                borderRight: '1px solid #6B6D80',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                flex: 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: '14px' }}>
                View extended path
              </Text>
            </Box>
            <Box
              style={{
                background: '#393C56',
                width: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderTopRightRadius: '4px',
                borderBottomRightRadius: '4px',
              }}
            >
              <ChevronDown style={{ color: '#fff', width: 20, height: 20 }} />
            </Box>
          </Box>
          <Text
            style={{ color: '#888F9E', fontSize: '10px', marginBottom: '6px' }}
          >
            Satellite Imagery Tools
          </Text>
          <Box style={{ display: 'flex' }}>
            <Box
              style={{
                padding: '12px',
                background: '#393C56',
                borderRight: '1px solid #6B6D80',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                flex: 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: '14px' }}>
                View satellite imagery
              </Text>
            </Box>
            <Box
              style={{
                background: '#393C56',
                width: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderTopRightRadius: '4px',
                borderBottomRightRadius: '4px',
              }}
            >
              <ChevronDown style={{ color: '#fff', width: 20, height: 20 }} />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box style={{ padding: '20px 20px 0 20px', flexShrink: 0 }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '0 -20px 16px -20px',
            borderBottom: '1px solid #393C56',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab
            return (
              <Box
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px 8px',
                  borderBottom: isActive
                    ? '2px solid #FFFFFF'
                    : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <Text
                  style={{
                    color: isActive ? '#FFFFFF' : '#888F9E',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {tab}
                </Text>
              </Box>
            )
          })}
        </Box>
      </Box>

      <Box
        className="subtle-scrollbar"
        style={{
          padding: '0 20px 20px 20px',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {activeTab === 'Sanction Details' ? (
          <>
            {selectedVersionKey === 'A' && (
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <Box style={{ padding: 8 }}>
                    <Text style={{ color: '#8D95AA', fontSize: 10, marginBottom: 2 }}>
                      Vessel Owner
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 1.25 }}>
                      {versionData.overview.vesselOwner}
                    </Text>
                  </Box>
                  {versionData.overview.remarks?.map((remark, idx) => {
                    const provider = remark.startsWith('UK ')
                      ? 'UK'
                      : remark.startsWith('EU ')
                        ? 'EU'
                        : ''
                    const programRaw = versionData.overview.programs[idx] || ''
                    const programText = provider
                      ? programRaw.replace(new RegExp(`^${provider}:?\\s*`), '')
                      : programRaw
                    const normalizedRemarkText = remark
                      .replace(/^(UK|EU)\s+/, '')
                      .replace(/\s*\|\s*/g, ' ')
                      .replace(/Sanction date:\s*/i, '')
                    const codeMatch = normalizedRemarkText.match(/\[[^\]]+\]/)
                    const codeText = codeMatch
                      ? codeMatch[0].replace(/^\[|\]$/g, '')
                      : ''
                    const dateText = codeMatch
                      ? normalizedRemarkText
                          .slice((codeMatch.index || 0) + codeMatch[0].length)
                          .trim()
                      : normalizedRemarkText
                    return (
                      <Box
                        key={remark}
                        style={{
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                        }}
                      >
                        <Box style={{ minWidth: 0 }}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              lineHeight: 1.25,
                              marginBottom: 3,
                            }}
                          >
                            {provider ? `${provider}: ${programText}` : programText}
                          </Text>
                          <Box
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Text style={{ color: '#8D95AA', fontSize: 10 }}>
                              {dateText}
                            </Text>
                            <Text style={{ color: '#8D95AA', fontSize: 10 }}>
                              {'\u2022'}
                            </Text>
                            <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
                              {codeText}
                            </Text>
                          </Box>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            )}
            {selectedVersionKey === 'B' && (
              <Box
                style={{
                  marginBottom: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <Box>
                  <Text style={{ color: '#8D95AA', fontSize: 11, marginBottom: 2 }}>
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
                      style={{ background: '#393C56', borderRadius: 4, padding: '4px 8px' }}
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
                    <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
                      Russia Sanctions 2019
                    </Text>
                    <Text style={{ color: '#888F9E', fontSize: 14 }}>{'\u2022'}</Text>
                    <Box
                      style={{ background: '#393C56', borderRadius: 4, padding: '4px 8px' }}
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
                    <Text style={{ color: '#FFFFFF', fontSize: 14 }}>Sanctions</Text>
                  </Box>
                </Box>
                <Box>
                  <Text style={{ color: '#8D95AA', fontSize: 11, marginBottom: 2 }}>
                    Vessel Owner
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
                    {versionData.overview.vesselOwner}
                  </Text>
                </Box>
              </Box>
            )}
            {selectedVersionKey === 'C' && (
              <Box
                style={{
                  marginBottom: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <Box
                  style={{
                    border: '1px solid #393C56',
                    borderRadius: 4,
                    background: '#24263C',
                    overflow: 'hidden',
                  }}
                >
                  <Box style={{ padding: 8, borderBottom: '1px solid #393C56' }}>
                    <Text style={{ color: '#8D95AA', fontSize: 10, marginBottom: 2 }}>
                      Vessel Owner
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 1.25 }}>
                      {versionData.overview.vesselOwner}
                    </Text>
                  </Box>
                  {versionData.overview.remarks?.map((remark, idx) => {
                    const provider = remark.startsWith('UK ')
                      ? 'UK'
                      : remark.startsWith('EU ')
                        ? 'EU'
                        : ''
                    const programRaw = versionData.overview.programs[idx] || ''
                    const programText = provider
                      ? programRaw.replace(new RegExp(`^${provider}:?\\s*`), '')
                      : programRaw
                    const normalizedRemarkText = remark
                      .replace(/^(UK|EU)\s+/, '')
                      .replace(/\s*\|\s*/g, ' ')
                      .replace(/Sanction date:\s*/i, '')
                    const codeMatch = normalizedRemarkText.match(/\[[^\]]+\]/)
                    const codeText = codeMatch
                      ? codeMatch[0].replace(/^\[|\]$/g, '')
                      : ''
                    const dateText = codeMatch
                      ? normalizedRemarkText
                          .slice((codeMatch.index || 0) + codeMatch[0].length)
                          .trim()
                      : normalizedRemarkText
                    return (
                      <Box
                        key={remark}
                        style={{
                          padding: '8px',
                          background: '#24263C',
                          borderBottom:
                            idx < versionData.overview.remarks.length - 1
                              ? '1px solid #393C56'
                              : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                        }}
                      >
                        <Box style={{ minWidth: 0 }}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 12,
                              lineHeight: 1.25,
                              marginBottom: 3,
                            }}
                          >
                            {provider ? `${provider}: ${programText}` : programText}
                          </Text>
                          <Text style={{ color: '#8D95AA', fontSize: 10 }}>
                            {dateText}
                          </Text>
                        </Box>
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 10,
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {codeText}
                        </Text>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            )}

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
                  display: selectedVersionKey === 'C' ? 'none' : 'block',
                }}
              />
              {events.map((event, index) => {
                const isVersionC = selectedVersionKey === 'C'
                const isExpanded = expandedEventId === event.id
                const hasDetails = (event.detailFields || []).length > 0
                const canExpandInVersionC = [
                  'sanction_added',
                  'scrapped',
                ].includes(event.eventType)
                const canExpand = isVersionC
                  ? canExpandInVersionC && (hasDetails || Boolean(event.code))
                  : hasDetails && event.eventType === 'scrapped'
                const isFlagChangeEvent = event.eventType === 'flag_change'
                const hasBeforeAndAfter = Boolean(
                  event.beforeValue && event.afterValue
                )
                const hasSingleValue =
                  !hasBeforeAndAfter &&
                  Boolean(event.afterValue || event.beforeValue)
                const showBadges =
                  selectedVersionKey === 'B' || selectedVersionKey === 'C'
                const hideDuplicateChangeHeadline =
                  (selectedVersionKey === 'B' || selectedVersionKey === 'C') &&
                  ['mmsi_change', 'name_change', 'flag_change'].includes(
                    event.eventType
                  )
                return (
                  <Box
                    key={event.id}
                    style={{
                      display: 'flex',
                      gap: isVersionC ? 0 : 14,
                      paddingBottom: index < events.length - 1 ? 10 : 0,
                    }}
                  >
                    {!isVersionC && (
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
                            outline: '2px solid #181926',
                            position: 'absolute',
                            left: 5,
                            top: 5,
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                    )}
                    <Box
                      style={{
                        flex: 1,
                        paddingBottom: isVersionC ? 0 : 10,
                        background: isVersionC ? '#24263C' : 'transparent',
                        border: isVersionC ? '1px solid #393C56' : 'none',
                        borderRadius: isVersionC ? 4 : 0,
                      }}
                    >
                      <Box
                        style={
                          isVersionC
                            ? {
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                              }
                            : {}
                        }
                      >
                        <Box style={isVersionC ? { flex: 1, minWidth: 0 } : {}}>
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
                            {event.effectiveDate}
                          </Text>
                          {showBadges &&
                            event.chips?.map((chip) => {
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
                                      badgeStyles[chip.tone]?.background ||
                                      '#2B3350',
                                    borderRadius: 4,
                                    padding: '4px 8px',
                                  }}
                                >
                                  <Text
                                    style={{
                                      color:
                                        badgeStyles[chip.tone]?.color || '#fff',
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
                        {event.code && (!isVersionC || isExpanded) && (
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
                                {countryFlags[event.beforeValue] && (
                                  <Text style={{ fontSize: 16, lineHeight: 1 }}>
                                    {countryFlags[event.beforeValue]}
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
                                {countryFlags[event.afterValue] && (
                                  <Text style={{ fontSize: 16, lineHeight: 1 }}>
                                    {countryFlags[event.afterValue]}
                                  </Text>
                                )}
                                <Text
                                  style={{ color: '#FFFFFF', fontSize: 16 }}
                                >
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
                        {canExpand &&
                          (!isVersionC ? (
                            <Text
                              onClick={() =>
                                setExpandedEventId(isExpanded ? null : event.id)
                              }
                              style={{
                                color: '#0085E6',
                                fontSize: 14,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                marginBottom: isExpanded ? 8 : 0,
                              }}
                            >
                              {isExpanded ? 'Hide details' : 'View details'}
                            </Text>
                          ) : null)}
                        </Box>
                        {isVersionC && canExpand && (
                          <Box
                            component="button"
                            type="button"
                            onClick={() =>
                              setExpandedEventId(isExpanded ? null : event.id)
                            }
                            style={{
                              width: 30,
                              height: 30,
                              background: 'transparent',
                              border: '1px solid #D9DEEB',
                              borderRadius: 4,
                              color: '#D9DEEB',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <ChevronDown
                              style={{
                                width: 18,
                                height: 18,
                                transform: isExpanded
                                  ? 'rotate(180deg)'
                                  : 'rotate(0deg)',
                                transition: 'transform 160ms ease',
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      {canExpand && isExpanded && hasDetails && (
                        <Box
                          style={{
                            marginTop: isVersionC ? 8 : 0,
                            width: '100%',
                            boxSizing: 'border-box',
                            border: isVersionC ? 'none' : '1px solid #393C56',
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
          </>
        ) : (
          <Text style={{ color: '#8D95AA', fontSize: 14 }}>
            {activeTab} content placeholder
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default Myships
