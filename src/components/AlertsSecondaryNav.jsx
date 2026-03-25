import { useState } from 'react'
import { Box, Text, Radio, Button, Checkbox } from '@mantine/core'
import CollapseButton from '../custom-icons/CollapseButton'
import ExpandButton from '../custom-icons/ExpandButton'

const ALERTS_SECONDARY_NAV_DEFAULT_WIDTH = 386

function AlertsSecondaryNav({ isOpen, onOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('New Alert')
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [expandHovered, setExpandHovered] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [shipSelection, setShipSelection] = useState('any')
  const [areaSelection, setAreaSelection] = useState('global')
  const [selectedTriggers, setSelectedTriggers] = useState([])

  const isNewAlert = activeTab === 'New Alert'

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleCancel = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      // Handle actual cancel logic here if needed
    }
  }

  const isNextDisabled = () => {
    if (currentStep === 1 && shipSelection !== 'any') return true
    if (currentStep === 2 && areaSelection !== 'global') return true
    return false
  }

  const toggleTrigger = (trigger) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    )
  }

  const triggerOptions = [
    { id: 'optical', label: 'Optical detection' },
    { id: 'spoofing', label: 'Spoofing event' },
    { id: 'ais_on', label: 'AIS on' },
    { id: 'ais_off', label: 'AIS off' },
    { id: 'sts_ais', label: 'STS (AIS)' },
    { id: 'sts_optical', label: 'STS (optical)' },
    { id: 'flag_change', label: 'Flag change' },
    { id: 'ownership_change', label: 'Ownership change' },
    { id: 'gps_manipulation', label: 'GPS manipulation' },
  ]

  return (
    <Box
      style={{
        width: isOpen ? ALERTS_SECONDARY_NAV_DEFAULT_WIDTH : 32,
        overflow: 'hidden',
        backgroundColor: '#181926',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #393c56',
        flexShrink: 0,
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {!isOpen && (
        <Box
          onClick={onOpen}
          onMouseEnter={() => setExpandHovered(true)}
          onMouseLeave={() => setExpandHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 71,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <ExpandButton
            backgroundColor={expandHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      {isOpen && (
        <Box
          onClick={onClose}
          onMouseEnter={() => setCollapseHovered(true)}
          onMouseLeave={() => setCollapseHovered(false)}
          style={{
            position: 'absolute',
            right: 0,
            top: 71,
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <CollapseButton
            backgroundColor={collapseHovered ? '#4C5070' : '#393C56'}
          />
        </Box>
      )}

      <Box
        style={{
          width: ALERTS_SECONDARY_NAV_DEFAULT_WIDTH,
          minWidth: ALERTS_SECONDARY_NAV_DEFAULT_WIDTH,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Box
          style={{
            display: 'flex',
            borderBottom: '1px solid #393C56',
            height: 50,
          }}
        >
          <Box
            onClick={() => setActiveTab('New Alert')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderBottom: isNewAlert ? '2px solid #fff' : 'none',
              color: isNewAlert ? '#fff' : '#888F9E',
              fontWeight: isNewAlert ? 600 : 400,
              fontSize: 14,
            }}
          >
            New Alert
          </Box>
          <Box
            onClick={() => setActiveTab('My Alerts')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderBottom: !isNewAlert ? '2px solid #fff' : 'none',
              color: !isNewAlert ? '#fff' : '#888F9E',
              fontWeight: !isNewAlert ? 600 : 400,
              fontSize: 14,
            }}
          >
            My Alerts
          </Box>
        </Box>

        <Box
          style={{
            padding: '24px',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isNewAlert ? (
            <>
              {/* Progress Bar */}
              <Box
                style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}
              >
                {[1, 2, 3, 4, 5].map((step) => (
                  <Box
                    key={step}
                    style={{
                      height: '8px',
                      flex: 1,
                      backgroundColor: currentStep >= step ? '#0094FF' : '#24263C',
                      borderRadius: '4px',
                    }}
                  />
                ))}
              </Box>

              {currentStep === 1 && (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  >
                    Select ship(s):
                  </Text>

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Select the ship(s) you'd like to be alerted with. If you don't
                    have a specific ship in mind, select "Any ship" and you'll be
                    notified when any ship triggers the alert.
                  </Text>

                  <Radio.Group value={shipSelection} onChange={setShipSelection}>
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        marginTop: '8px',
                      }}
                    >
                      <Radio
                        value="any"
                        label="Any ship"
                        size="md"
                        styles={{
                          radio: {
                            backgroundColor: 'transparent',
                            borderColor: '#fff',
                            borderWidth: 2,
                            cursor: 'pointer',
                            '&:checked, &[data-checked]': {
                              backgroundColor: 'transparent',
                              borderColor: '#fff',
                            },
                          },
                          icon: {
                            color: '#0094FF',
                          },
                          label: {
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                          },
                        }}
                      />
                      <Radio
                        value="specific"
                        label="Specific ship(s)"
                        size="md"
                        styles={{
                          radio: {
                            backgroundColor: 'transparent',
                            borderColor: '#fff',
                            borderWidth: 2,
                            cursor: 'pointer',
                            '&:checked, &[data-checked]': {
                              backgroundColor: 'transparent',
                              borderColor: '#fff',
                            },
                          },
                          icon: {
                            color: '#0094FF',
                          },
                          label: {
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                          },
                        }}
                      />
                    </Box>
                  </Radio.Group>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  >
                    Select area(s):
                  </Text>

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Select the area(s) you'd like to be alerted with. If you
                    don't have a specific area in mind, select "Global" and
                    you'll be notified when the alert is triggered anywhere in the world.
                  </Text>

                  <Radio.Group
                    value={areaSelection}
                    onChange={setAreaSelection}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        marginTop: '8px',
                      }}
                    >
                      <Radio
                        value="global"
                        label="Global"
                        size="md"
                        styles={{
                          radio: {
                            backgroundColor: 'transparent',
                            borderColor: '#fff',
                            borderWidth: 2,
                            cursor: 'pointer',
                            '&:checked, &[data-checked]': {
                              backgroundColor: 'transparent',
                              borderColor: '#fff',
                            },
                          },
                          icon: {
                            color: '#0094FF',
                          },
                          label: {
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                          },
                        }}
                      />
                      <Radio
                        value="specific"
                        label="Specific area(s)"
                        size="md"
                        styles={{
                          radio: {
                            backgroundColor: 'transparent',
                            borderColor: '#fff',
                            borderWidth: 2,
                            cursor: 'pointer',
                            '&:checked, &[data-checked]': {
                              backgroundColor: 'transparent',
                              borderColor: '#fff',
                            },
                          },
                          icon: {
                            color: '#0094FF',
                          },
                          label: {
                            color: '#fff',
                            fontSize: '16px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                          },
                        }}
                      />
                    </Box>
                  </Radio.Group>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  >
                    Select trigger(s):
                  </Text>

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Select the trigger(s) you'd like to be alerted with. If
                    multiple triggers are selected, you can apply sequential
                    logic and be alerted only when the triggers happen in the
                    desired order.
                  </Text>

                  <Box
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginTop: '8px',
                    }}
                  >
                    {triggerOptions.map((option) => (
                      <Checkbox
                        key={option.id}
                        label={option.label}
                        checked={selectedTriggers.includes(option.id)}
                        onChange={() => toggleTrigger(option.id)}
                        size="sm"
                        className="ship-filter-checkbox"
                        styles={{
                          label: {
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer',
                            paddingLeft: '12px',
                            lineHeight: '1.2',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </>
          ) : (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Text style={{ color: '#888F9E', fontSize: '14px' }}>
                No alerts yet.
              </Text>
            </Box>
          )}
        </Box>

        {/* Footer Buttons */}
        {isNewAlert && (
          <Box
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #393C56',
              display: 'flex',
              gap: '12px',
              backgroundColor: '#181926',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <Button
              variant="outline"
              onClick={handleCancel}
              style={{
                flex: currentStep === 1 ? 1 : 0,
                width: currentStep === 1 ? 'auto' : '100px',
                borderColor: '#393C56',
                color: '#fff',
                backgroundColor: 'transparent',
              }}
            >
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleCancel}
                style={{
                  flex: 0,
                  width: '100px',
                  borderColor: '#393C56',
                  color: '#fff',
                  backgroundColor: 'transparent',
                }}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isNextDisabled()}
              style={{
                flex: 1,
                backgroundColor: isNextDisabled() ? '#393C56' : '#0094FF',
                color: isNextDisabled() ? '#888F9E' : '#fff',
                cursor: isNextDisabled() ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AlertsSecondaryNav
