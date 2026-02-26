import React from 'react'
import { Box, Text, Title, Checkbox, Radio, Group } from '@mantine/core'
import KeyValuePair from '../KeyValuePair'
import ShipPathPanelButton from './ShipPathPanelButton'
import ViewExtendedPathIcon from '../../custom-icons/ViewExtendedPathIcon'
import ViewPathPlaybackIcon from '../../custom-icons/ViewPathPlaybackIcon'
import FuturePathPredictionIcon from '../../custom-icons/FuturePathPredictionIcon'
import ViewEstimatedLocationIcon from '../../custom-icons/ViewEstimatedLocationIcon'
import SatelliteIcon from '../../custom-icons/SatelliteIcon'
import SimilarSearchIcon from '../../custom-icons/SimilarSearchIcon'
import AlertIcon from '../../custom-icons/AlertIcon'
import DownloadPathXLS from '../../custom-icons/DownloadPathXLS'

const ShipDetailsPanel = () => {
  return (
    <>
      <Box
        style={{
          padding: '16px',
          border: '1px solid #393C56',
          background: '#24263C',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
        }}
      >
        <KeyValuePair
          keyName="Selected Event"
          value="Oct 25, 2025 09:53 (Latest)"
        />
      </Box>
      <Box
        style={{
          padding: '16px',
          border: '1px solid #393C56',
          borderTop: 'none',
          background: '#24263C',
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px',
        }}
      >
        <Box style={{ display: 'flex', gap: 16 }}>
          <Checkbox
            defaultChecked
            label="Show AIS path"
            size="xs"
            style={{ color: '#fff' }}
          />
          <Radio.Group name="favoriteFramework">
            <Group>
              <Radio
                size="xs"
                variant="outline"
                value="Line"
                label="Line"
                style={{ color: '#fff' }}
              />
              <Radio
                size="xs"
                variant="outline"
                value="AisSignal"
                label="AIS Signal"
                style={{ color: '#fff' }}
              />
            </Group>
          </Radio.Group>
        </Box>
        <Box
          style={{ display: 'flex', gap: 6, marginBottom: 6, marginTop: 16 }}
        >
          <ShipPathPanelButton
            label="View Extended Path"
            icon={<ViewExtendedPathIcon />}
          />
          <ShipPathPanelButton
            label="View Path Playback"
            icon={<ViewPathPlaybackIcon />}
          />
          <ShipPathPanelButton
            label="Future Path Prediction"
            icon={<FuturePathPredictionIcon />}
          />
          <ShipPathPanelButton
            label="View Estimated Location"
            icon={<ViewEstimatedLocationIcon />}
          />
        </Box>
        <Box style={{ display: 'flex', gap: 6 }}>
          <ShipPathPanelButton
            label="View Satellite Imagery"
            icon={<SatelliteIcon />}
          />
          <ShipPathPanelButton
            label="Search Similar Ships"
            icon={<SimilarSearchIcon />}
          />
          <ShipPathPanelButton label="Create Ship Alert" icon={<AlertIcon />} />
          <ShipPathPanelButton
            label="Download Path XLS"
            icon={<DownloadPathXLS />}
          />
        </Box>
      </Box>
    </>
  )
}

export default ShipDetailsPanel
