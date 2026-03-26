import { useState } from 'react'
import { Box, Text, Radio, Button, Checkbox, Select, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { Calendar, Edit02, CheckCircle } from '@untitledui/icons'
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
  const [sequentialLogic, setSequentialLogic] = useState('no')
  
  // Step 4 state
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [doesNotExpire, setDoesNotExpire] = useState(false)
  const [notificationFrequency, setNotificationFrequency] = useState('Daily Report')
  const [receiveViaEmail, setReceiveViaEmail] = useState(true)
  const [receiveViaApp, setReceiveViaApp] = useState(false)
  const [emailForNotifications, setEmailForNotifications] = useState('')
  const [alertName, setAlertName] = useState('')
  const [hasNewAlert, setHasNewAlert] = useState(false)

  const isNewAlert = activeTab === 'New Alert'

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 5) {
      setCurrentStep(6)
      setHasNewAlert(true)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setShipSelection('any')
    setAreaSelection('global')
    setSelectedTriggers([])
    setSequentialLogic('no')
    setStartDate(null)
    setEndDate(null)
    setDoesNotExpire(false)
    setNotificationFrequency('Daily Report')
    setReceiveViaEmail(true)
    setReceiveViaApp(false)
    setEmailForNotifications('')
    setAlertName('')
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isNextDisabled = () => {
    if (currentStep === 1 && shipSelection !== 'any') return true
    if (currentStep === 2 && areaSelection !== 'global') return true
    if (currentStep === 3 && selectedTriggers.length > 1 && sequentialLogic === 'yes') return true
    if (currentStep === 4) {
      if (!startDate) return true
      if (!doesNotExpire && !endDate) return true
      if (receiveViaEmail && !emailForNotifications.trim()) return true
      if (!receiveViaEmail && !receiveViaApp) return true
    }
    if (currentStep === 5 && !alertName.trim()) return true
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

  const triggerLabels = selectedTriggers.map(id => triggerOptions.find(t => t.id === id)?.label).join(', ')
  const triggersValue = selectedTriggers.length > 0
    ? `${selectedTriggers.length > 1 ? (sequentialLogic === 'yes' ? 'Sequential: ' : 'Non-sequential: ') : ''}${triggerLabels}`
    : 'None'

  const receiveViaText = [receiveViaEmail ? 'Email' : null, receiveViaApp ? 'In-App Notification' : null].filter(Boolean).join(', ')

  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const renderSummaryRow = (label, value, stepToEdit) => (
    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Text style={{ color: '#888F9E', fontSize: '12px', marginBottom: '4px' }}>{label}</Text>
        <Text style={{ color: '#fff', fontSize: '14px', lineHeight: 1.4 }}>{value}</Text>
      </Box>
      <Edit02
        size={16}
        color="#888F9E"
        style={{ cursor: 'pointer', marginTop: '4px' }}
        onClick={() => setCurrentStep(stepToEdit)}
      />
    </Box>
  )

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
              gap: '6px',
            }}
          >
            {hasNewAlert && (
              <Box
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#F75349',
                }}
              />
            )}
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
              {currentStep < 6 && (
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
              )}

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

                  {selectedTriggers.length > 1 && (
                    <>
                      <Box
                        style={{
                          height: '1px',
                          backgroundColor: '#393C56',
                          margin: '24px 0',
                        }}
                      />
                      <Text
                        style={{
                          color: '#E0E0E0',
                          fontSize: '14px',
                          marginBottom: '16px',
                        }}
                      >
                        Multiple triggers selected. Apply sequential logic?
                      </Text>
                      <Radio.Group
                        value={sequentialLogic}
                        onChange={setSequentialLogic}
                      >
                        <Box
                          style={{
                            display: 'flex',
                            gap: '24px',
                          }}
                        >
                          <Radio
                            value="no"
                            label="No"
                            size="md"
                            styles={{
                              radio: {
                                backgroundColor: 'transparent',
                                borderColor: '#fff',
                                borderWidth: 2,
                                cursor: 'pointer',
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
                            value="yes"
                            label="Yes"
                            size="md"
                            styles={{
                              radio: {
                                backgroundColor: 'transparent',
                                borderColor: '#fff',
                                borderWidth: 2,
                                cursor: 'pointer',
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
                </>
              )}

              {currentStep === 4 && (
                <>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '16px',
                    }}
                  >
                    Configure settings:
                  </Text>

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Select the start and end dates and choose how often you'd
                    like to receive this alert.
                  </Text>

                  <Box style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <Box style={{ flex: 1 }}>
                      <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '8px' }}>
                        Start Date
                      </Text>
                      <DateInput
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="MM/DD/YYYY"
                        valueFormat="MM/DD/YYYY"
                        rightSection={<Calendar size={20} color="#888F9E" />}
                        styles={{
                          input: {
                            backgroundColor: 'transparent',
                            borderColor: '#393C56',
                            color: '#fff',
                            height: '40px',
                          },
                        }}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '8px' }}>
                        End Date
                      </Text>
                      <DateInput
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="MM/DD/YYYY"
                        valueFormat="MM/DD/YYYY"
                        disabled={doesNotExpire}
                        rightSection={<Calendar size={20} color="#888F9E" />}
                        styles={{
                          input: {
                            backgroundColor: 'transparent',
                            borderColor: '#393C56',
                            color: '#fff',
                            height: '40px',
                            opacity: doesNotExpire ? 0.5 : 1,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Box style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <Checkbox
                      label="Does not expire"
                      checked={doesNotExpire}
                      onChange={(e) => {
                        setDoesNotExpire(e.currentTarget.checked)
                        if (e.currentTarget.checked) setEndDate(null)
                      }}
                      size="sm"
                      className="ship-filter-checkbox"
                      styles={{
                        label: {
                          color: '#E0E0E0',
                          fontSize: '14px',
                          cursor: 'pointer',
                          paddingLeft: '8px',
                        },
                      }}
                    />
                  </Box>

                  <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '8px' }}>
                    Notification Frequency
                  </Text>
                  <Select
                    value={notificationFrequency}
                    onChange={setNotificationFrequency}
                    data={['Daily Report', 'Immediate', 'Weekly Report']}
                    styles={{
                      input: {
                        backgroundColor: 'transparent',
                        borderColor: '#393C56',
                        color: '#fff',
                        height: '40px',
                      },
                      dropdown: {
                        backgroundColor: '#181926',
                        borderColor: '#393C56',
                      },
                      item: {
                        color: '#fff',
                      },
                    }}
                  />

                  <Text
                    style={{
                      color: '#E0E0E0',
                      fontSize: '14px',
                      marginTop: '16px',
                      marginBottom: '24px',
                      lineHeight: 1.5,
                    }}
                  >
                    Receives a single summary at the end of each day listing all
                    ships that triggered alerts during that day. No report is
                    sent if no alerts occur.
                  </Text>

                  <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '12px' }}>
                    Receive Via
                  </Text>
                  <Box style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                    <Checkbox
                      label="Email"
                      checked={receiveViaEmail}
                      onChange={(e) => setReceiveViaEmail(e.currentTarget.checked)}
                      size="sm"
                      className="ship-filter-checkbox"
                      styles={{
                        label: {
                          color: '#E0E0E0',
                          fontSize: '14px',
                          cursor: 'pointer',
                          paddingLeft: '8px',
                        },
                      }}
                    />
                    <Checkbox
                      label="In-App Notification"
                      checked={receiveViaApp}
                      onChange={(e) => setReceiveViaApp(e.currentTarget.checked)}
                      size="sm"
                      className="ship-filter-checkbox"
                      styles={{
                        label: {
                          color: '#E0E0E0',
                          fontSize: '14px',
                          cursor: 'pointer',
                          paddingLeft: '8px',
                        },
                      }}
                    />
                  </Box>

                  {receiveViaEmail && (
                    <>
                      <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '8px' }}>
                        Email for Notifications
                      </Text>
                      <TextInput
                        value={emailForNotifications}
                        onChange={(e) => setEmailForNotifications(e.currentTarget.value)}
                        placeholder="Enter email"
                        styles={{
                          input: {
                            backgroundColor: 'transparent',
                            borderColor: '#393C56',
                            color: '#fff',
                            height: '40px',
                          },
                        }}
                      />
                    </>
                  )}
                </>
              )}

              {currentStep === 5 && (
                <>
                  <Text style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
                    Confirm alert details:
                  </Text>
                  <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                    Review and confirm the selected ship, area, and alert triggers, along with any other related details.
                  </Text>

                  <Box style={{ backgroundColor: '#24263C', borderRadius: '4px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Box>
                      <Text style={{ color: '#888F9E', fontSize: '12px', marginBottom: '8px' }}>Alert Name</Text>
                      <TextInput
                        value={alertName}
                        onChange={(e) => setAlertName(e.currentTarget.value)}
                        placeholder="Enter name"
                        styles={{
                          input: {
                            backgroundColor: '#181926',
                            borderColor: '#393C56',
                            color: '#fff',
                            height: '40px',
                          },
                        }}
                      />
                    </Box>

                    {renderSummaryRow(`Ship(s)`, shipSelection === 'any' ? 'Any ship' : 'Specific ship(s)', 1)}
                    {renderSummaryRow(`Area(s)`, areaSelection === 'global' ? 'Global' : 'Specific area(s)', 2)}
                    {renderSummaryRow(`Trigger(s) - ${selectedTriggers.length} trigger${selectedTriggers.length === 1 ? '' : 's'}`, triggersValue, 3)}

                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box style={{ display: 'flex', gap: '48px' }}>
                        <Box>
                          <Text style={{ color: '#888F9E', fontSize: '12px', marginBottom: '4px' }}>Start Date</Text>
                          <Text style={{ color: '#fff', fontSize: '14px' }}>{formatDate(startDate)}</Text>
                        </Box>
                        <Box>
                          <Text style={{ color: '#888F9E', fontSize: '12px', marginBottom: '4px' }}>End Date</Text>
                          <Text style={{ color: '#fff', fontSize: '14px' }}>{doesNotExpire ? 'Does not expire' : formatDate(endDate)}</Text>
                        </Box>
                      </Box>
                      <Edit02 size={16} color="#888F9E" style={{ cursor: 'pointer', marginTop: '4px' }} onClick={() => setCurrentStep(4)} />
                    </Box>

                    {renderSummaryRow('Notification Frequency', notificationFrequency, 4)}
                    {renderSummaryRow('Receive Via', receiveViaText, 4)}
                    {receiveViaEmail && renderSummaryRow('Email for Notification', emailForNotifications || 'None provided', 4)}
                  </Box>
                </>
              )}
              {currentStep === 6 && (
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
                  <CheckCircle size={48} color="#00EB6C" style={{ marginBottom: '24px' }} />
                  <Text style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                    Alert created successfully.
                  </Text>
                  <Text style={{ color: '#E0E0E0', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
                    Please check 'My Alerts' tab for the latest status.
                  </Text>
                  <Box style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('My Alerts')}
                      style={{
                        flex: 1,
                        borderColor: '#393C56',
                        color: '#fff',
                        backgroundColor: 'transparent',
                      }}
                    >
                      Go To My Alerts
                    </Button>
                    <Button
                      onClick={handleReset}
                      style={{
                        flex: 1,
                        backgroundColor: '#0094FF',
                        color: '#fff',
                      }}
                    >
                      Create New Alert
                    </Button>
                  </Box>
                </Box>
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
        {isNewAlert && currentStep < 6 && (
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
              onClick={() => {
                // Handle actual cancel logic here
              }}
              style={{
                flex: currentStep === 1 ? 1 : 0,
                width: currentStep === 1 ? 'auto' : '100px',
                minWidth: currentStep === 1 ? 'auto' : '100px',
                borderColor: '#393C56',
                color: '#fff',
                backgroundColor: 'transparent',
                padding: 0,
              }}
            >
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                style={{
                  flex: 0,
                  width: '100px',
                  minWidth: '100px',
                  borderColor: '#393C56',
                  color: '#fff',
                  backgroundColor: 'transparent',
                  padding: 0,
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
              {currentStep === 5 ? 'Confirm & Create' : 'Next'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AlertsSecondaryNav
