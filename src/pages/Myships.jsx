import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Text, Title, Checkbox, Button, Modal } from '@mantine/core'

function Myships() {
  const {
    mockAois,
    selectedAoiIds,
    setSelectedAoiIds,
    showAoiLayer,
    setShowAoiLayer,
    riskWindowDays,
    setRiskWindowDays,
    showOnlyFlagged,
    setShowOnlyFlagged,
    mapShips,
    selectedShipId,
    setSelectedShipId,
    selectedShip,
  } = useOutletContext()

  const [ctaModal, setCtaModal] = useState(null)
  const flaggedCount = useMemo(
    () => mapShips.filter((ship) => ship.risk?.isFlagged).length,
    [mapShips]
  )

  const toggleAoi = (aoiId) => {
    setSelectedAoiIds((prev) =>
      prev.includes(aoiId) ? prev.filter((id) => id !== aoiId) : [...prev, aoiId]
    )
  }

  return (
    <Box style={{ padding: '18px 16px', color: '#fff' }}>
      <Title order={4} style={{ color: '#fff', marginBottom: 4 }}>
        AOI Risk Prototype
      </Title>
      <Text style={{ color: '#9CA3B4', fontSize: 12, marginBottom: 14 }}>
        Frontend-only prototype for AOI visibility and dark-since-port risk
        prioritization.
      </Text>

      <Box
        style={{
          border: '1px solid #393C56',
          borderRadius: 6,
          padding: 12,
          marginBottom: 14,
          background: '#1F2134',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
          Layer Controls
        </Text>
        <Checkbox
          checked={showAoiLayer}
          onChange={(event) => setShowAoiLayer(event.currentTarget.checked)}
          label="Show customer AOI layer"
          size="xs"
          styles={{ label: { color: '#DDE2EE', fontSize: 12 } }}
        />
        <Checkbox
          checked={showOnlyFlagged}
          onChange={(event) => setShowOnlyFlagged(event.currentTarget.checked)}
          label="Show only flagged ships"
          size="xs"
          mt={8}
          styles={{ label: { color: '#DDE2EE', fontSize: 12 } }}
        />
      </Box>

      <Box
        style={{
          border: '1px solid #393C56',
          borderRadius: 6,
          padding: 12,
          marginBottom: 14,
          background: '#1F2134',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          Risk Window
        </Text>
        <Box style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {[7, 14, 30].map((days) => (
            <Button
              key={days}
              size="xs"
              variant={riskWindowDays === days ? 'filled' : 'outline'}
              onClick={() => setRiskWindowDays(days)}
              style={{
                background: riskWindowDays === days ? '#0094FF' : 'transparent',
                borderColor: '#4B5166',
                color: '#fff',
              }}
            >
              {days} days
            </Button>
          ))}
        </Box>
        <Text style={{ color: '#9CA3B4', fontSize: 11 }}>
          Flagged ships: {flaggedCount} / {mapShips.length}
        </Text>
      </Box>

      <Box
        style={{
          border: '1px solid #393C56',
          borderRadius: 6,
          padding: 12,
          marginBottom: 14,
          background: '#1F2134',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          Customer AOIs
        </Text>
        {mockAois.map((aoi) => (
          <Checkbox
            key={aoi.id}
            checked={selectedAoiIds.includes(aoi.id)}
            onChange={() => toggleAoi(aoi.id)}
            label={`${aoi.name} (${aoi.customerName})`}
            size="xs"
            mt={6}
            styles={{ label: { color: '#DDE2EE', fontSize: 12 } }}
          />
        ))}
      </Box>

      <Box
        style={{
          border: '1px solid #393C56',
          borderRadius: 6,
          padding: 12,
          background: '#1F2134',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          Ships in View
        </Text>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {mapShips.map((ship) => (
            <Box
              key={ship.id}
              onClick={() => setSelectedShipId(ship.id)}
              style={{
                padding: '8px 10px',
                borderRadius: 4,
                border:
                  selectedShipId === ship.id
                    ? '1px solid #2A9DFF'
                    : '1px solid #353A4F',
                background:
                  selectedShipId === ship.id ? '#273557' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: 700 }}>
                {ship.name}
                {ship.risk?.isFlagged ? ' - Flagged' : ''}
              </Text>
              <Text style={{ fontSize: 11, color: '#9CA3B4' }}>
                {ship.risk?.reasonSummary}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        style={{
          border: '1px solid #393C56',
          borderRadius: 6,
          padding: 12,
          marginTop: 14,
          background: '#1F2134',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          Why Flagged
        </Text>
        {selectedShip ? (
          <>
            <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              {selectedShip.name}
            </Text>
            <Text style={{ fontSize: 12, color: '#DDE2EE', marginBottom: 8 }}>
              {selectedShip.risk?.reasonSummary}
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selectedShip.risk?.evidence?.map((line) => (
                <Text key={line} style={{ fontSize: 11, color: '#9CA3B4' }}>
                  - {line}
                </Text>
              ))}
            </Box>
            <Text style={{ fontSize: 11, color: '#8AA0C8', marginTop: 8 }}>
              {selectedShip.risk?.originHint || 'No AOI expansion suggestion yet.'}
            </Text>
            <Box style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button
                size="xs"
                onClick={() => setCtaModal('intel')}
                style={{ background: '#0094FF', color: '#fff' }}
              >
                Request Intel Support
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setCtaModal('aoi')}
                style={{ borderColor: '#4B5166', color: '#fff' }}
              >
                Expand AOI
              </Button>
            </Box>
          </>
        ) : (
          <Text style={{ fontSize: 12, color: '#9CA3B4' }}>
            Select a ship marker or list row to view risk context.
          </Text>
        )}
      </Box>

      <Modal
        opened={Boolean(ctaModal)}
        onClose={() => setCtaModal(null)}
        centered
        title={ctaModal === 'intel' ? 'Request Intel Support' : 'Expand AOI'}
        styles={{
          content: { background: '#24263C', border: '1px solid #393C56' },
          header: { background: '#24263C' },
          title: { color: '#fff' },
          close: { color: '#fff' },
        }}
      >
        <Text style={{ color: '#D6DBE8', fontSize: 13, lineHeight: 1.45 }}>
          {ctaModal === 'intel'
            ? 'Prototype CTA: this would open the intel-as-a-service request workflow with selected ship context prefilled.'
            : 'Prototype CTA: this would start AOI expansion recommendations using origin patterns from flagged vessels.'}
        </Text>
      </Modal>
    </Box>
  )
}

export default Myships
