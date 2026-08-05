import React from 'react'
import { useLocation } from 'react-router-dom'
import { Box } from '@mantine/core'
import {
  Signal01,
  Bookmark,
  VideoRecorder,
  Clock,
  Star01,
} from '@untitledui/icons'
import SatelliteIcon from '../custom-icons/SatelliteIcon'
import AnchorIcon from '../custom-icons/AnchorIcon.svg'
import OsintIcon from '../custom-icons/OsintIcon'
import AlertIcon from '../custom-icons/AlertIcon'
import SimilarSearchIcon from '../custom-icons/SimilarSearchIcon'
import PolygonIcon from '../custom-icons/PolygonIcon'
import LeftNavButton from './LeftNavButton'

const timelineNavItem = {
  icon: <Clock color="white" size={20} />,
  to: '/timeline',
  label: 'Timeline',
}

const LeftNav = ({
  onNavClick,
  watchlistVersion = 'grouped',
  forYouPrototype = 'proto1',
  forYouActive = false,
  portsActive = false,
}) => {
  const location = useLocation()
  const isVersion2 = watchlistVersion === 'version2'
  const isVersion4Or5 =
    watchlistVersion === 'version4' ||
    watchlistVersion === 'version5' ||
    watchlistVersion === 'version6' ||
    watchlistVersion === 'version7'
  // Prototype 1 reframes "Bookmarks" as "Favorites" with a star icon.
  const isFavoritesProto = forYouPrototype === 'proto1'
  const bookmarksIcon =
    isVersion4Or5 && isFavoritesProto ? (
      <Star01 color="white" size={20} />
    ) : isVersion4Or5 ? (
      <Bookmark color="white" size={20} />
    ) : (
      <Signal01 color="white" size={20} />
    )
  const bookmarksLabel = isVersion4Or5
    ? isFavoritesProto
      ? 'Favorites'
      : 'Bookmarks'
    : 'Watchlist'
  // Opening a ship/port from the watchlist or favorites navigates to /myships,
  // which would otherwise drop the active highlight off this nav item. Treat
  // /myships as part of the watchlist section unless we're in the For You flow.
  const onWatchlistRoute =
    location.pathname === '/watchlist' || location.pathname === '/myships'
  // A port opened from the Ports nav lives on /myships too; keep the highlight on
  // Ports (not Favorites/Watchlist) in that case.
  const bookmarksActive = !forYouActive && !portsActive && onWatchlistRoute
  const primaryNavItems = [
    {
      icon: <Signal01 color="white" size={20} />,
      to: '/for-you',
      label: 'For You',
      active: forYouActive,
    },
    {
      icon: bookmarksIcon,
      to: '/watchlist',
      label: bookmarksLabel,
      active: bookmarksActive,
    },
    {
      icon: (
        <Box
          component="img"
          src={AnchorIcon}
          alt=""
          style={{ width: 20, height: 20, display: 'block' }}
        />
      ),
      to: '/ports',
      label: 'Ports',
      active: portsActive || location.pathname === '/ports',
    },
    {
      icon: <PolygonIcon style={{ width: 20, height: 20 }} />,
      to: '/my-shapes',
      label: 'My Shapes',
      active: location.pathname === '/my-shapes',
    },
    { icon: <SatelliteIcon />, to: '/tip-cue', label: 'Tip & Cue' },
    {
      icon: <VideoRecorder color="white" size={20} />,
      to: '/webcams',
      label: 'Webcams',
    },
    { icon: <OsintIcon />, to: '/osint', label: 'OSINT' },
    ...(!isVersion2
      ? [{ icon: <AlertIcon />, to: '/alerts', label: 'Alerts' }]
      : []),
    {
      icon: <SimilarSearchIcon />,
      to: '/similarsearch',
      label: 'Similar Search',
    },
  ]

  return (
    <Box
      style={{
        backgroundColor: '#24263C',
        width: '50px',
        minWidth: '50px',
        minHeight: '100%',
        position: 'relative',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <Box>
        {primaryNavItems.map((item, index) => (
          <LeftNavButton
            key={index}
            icon={item.icon}
            to={item.to}
            label={item.label}
            active={item.active}
            onNavClick={onNavClick}
          />
        ))}
      </Box>
      <Box style={{ marginTop: 'auto' }}>
        <LeftNavButton
          icon={timelineNavItem.icon}
          to={timelineNavItem.to}
          label={timelineNavItem.label}
          onNavClick={onNavClick}
        />
      </Box>
    </Box>
  )
}

export default LeftNav
