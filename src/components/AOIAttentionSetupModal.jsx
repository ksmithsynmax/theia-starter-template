import { Box, Button, Checkbox, Modal, NumberInput, Radio, Text } from '@mantine/core'
import { useShipContext } from '../context/ShipContext'

const AOI_OPTIONS = ['Persian Gulf AOI', 'Red Sea AOI', 'South China Sea AOI']

function AOIAttentionSetupModal() {
  const {
    attentionSetupOpen,
    closeAttentionSetup,
    saveAttentionSetup,
    attentionAois,
    setAttentionAois,
    attentionSignals,
    setAttentionSignals,
    attentionSensitivity,
    setAttentionSensitivity,
    attentionLookbackDays,
    setAttentionLookbackDays,
    attentionPinOnMap,
    setAttentionPinOnMap,
    attentionShowOnLogin,
    setAttentionShowOnLogin,
    attentionLinkAlerts,
    setAttentionLinkAlerts,
  } = useShipContext()

  const toggleAoi = (aoi) => {
    setAttentionAois((prev) =>
      prev.includes(aoi) ? prev.filter((item) => item !== aoi) : [...prev, aoi]
    )
  }

  const toggleSignal = (signalKey) => {
    setAttentionSignals((prev) => ({ ...prev, [signalKey]: !prev[signalKey] }))
  }

  return (
    <Modal
      opened={attentionSetupOpen}
      onClose={closeAttentionSetup}
      title={
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
          AOI Attention Feed Setup
        </Text>
      }
      centered
      size="lg"
      styles={{
        content: { background: '#181926', border: '1px solid #393C56' },
        header: { background: '#181926', borderBottom: '1px solid #393C56' },
        body: { background: '#181926' },
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Box>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
            1) Choose AOI scope
          </Text>
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {AOI_OPTIONS.map((aoi) => (
              <Checkbox
                key={aoi}
                checked={attentionAois.includes(aoi)}
                onChange={() => toggleAoi(aoi)}
                label={aoi}
                size="sm"
                className="ship-filter-checkbox"
                styles={{ label: { color: '#fff', fontSize: 13 } }}
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
            2) Define what needs attention
          </Text>
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Checkbox
              checked={attentionSignals.dark}
              onChange={() => toggleSignal('dark')}
              label="Recent dark activity"
              size="sm"
              className="ship-filter-checkbox"
              styles={{ label: { color: '#fff', fontSize: 13 } }}
            />
            <Checkbox
              checked={attentionSignals.spoofing}
              onChange={() => toggleSignal('spoofing')}
              label="Spoofing behavior"
              size="sm"
              className="ship-filter-checkbox"
              styles={{ label: { color: '#fff', fontSize: 13 } }}
            />
            <Checkbox
              checked={attentionSignals.sts}
              onChange={() => toggleSignal('sts')}
              label="Ship-to-ship interaction"
              size="sm"
              className="ship-filter-checkbox"
              styles={{ label: { color: '#fff', fontSize: 13 } }}
            />
            <Checkbox
              checked={attentionSignals.light}
              onChange={() => toggleSignal('light')}
              label="Suspicious light activity"
              size="sm"
              className="ship-filter-checkbox"
              styles={{ label: { color: '#fff', fontSize: 13 } }}
            />
          </Box>
          <Radio.Group value={attentionSensitivity} onChange={setAttentionSensitivity}>
            <Box style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
              <Radio value="high" label="High only" size="sm" styles={{ label: { color: '#fff' } }} />
              <Radio value="medium_high" label="Medium + High" size="sm" styles={{ label: { color: '#fff' } }} />
              <Radio value="all" label="All" size="sm" styles={{ label: { color: '#fff' } }} />
            </Box>
          </Radio.Group>
          <Text style={{ color: '#A4ABBE', fontSize: 12, marginBottom: 6 }}>Lookback (days)</Text>
          <NumberInput
            value={attentionLookbackDays}
            onChange={(value) => {
              const parsed = Number(value)
              if (!Number.isFinite(parsed)) return
              setAttentionLookbackDays(Math.max(1, Math.min(90, Math.round(parsed))))
            }}
            min={1}
            max={90}
            hideControls
            styles={{
              input: {
                background: 'transparent',
                color: '#fff',
                borderColor: '#393C56',
                height: 36,
              },
            }}
          />
        </Box>

        <Box>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
            3) Defaults
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Checkbox
              checked={attentionPinOnMap}
              onChange={(event) => setAttentionPinOnMap(event.currentTarget.checked)}
              label="Pin attention vessels on map"
              size="sm"
              className="ship-filter-checkbox"
              styles={{ label: { color: '#fff', fontSize: 13 } }}
            />
            <Checkbox
              checked={attentionShowOnLogin}
              onChange={(event) => setAttentionShowOnLogin(event.currentTarget.checked)}
              label="Show attention list on login"
              size="sm"
              className="ship-filter-checkbox"
              styles={{ label: { color: '#fff', fontSize: 13 } }}
            />
            <Checkbox
              checked={attentionLinkAlerts}
              onChange={(event) => setAttentionLinkAlerts(event.currentTarget.checked)}
              label="Also create alert notifications"
              size="sm"
              className="ship-filter-checkbox"
              styles={{ label: { color: '#fff', fontSize: 13 } }}
            />
          </Box>
        </Box>

        <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6 }}>
          <Button
            variant="outline"
            onClick={closeAttentionSetup}
            style={{ borderColor: '#393C56', color: '#fff', background: 'transparent' }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveAttentionSetup}
            style={{ background: '#0094FF', color: '#fff' }}
          >
            Save & Start Watching
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default AOIAttentionSetupModal
