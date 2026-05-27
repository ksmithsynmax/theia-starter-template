export const getPortIconSvg = (borderColor = '#393C56', size = 28) => `
  <svg width="${size}" height="${size}" viewBox="-1 -1 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" fill="#181926" stroke="${borderColor}" stroke-width="1.5" style="transition: stroke 0.2s ease;" />
    <path d="M20.3333 17C21.714 17 22.8333 15.8807 22.8333 14.5C22.8333 13.1193 21.714 12 20.3333 12C18.9526 12 17.8333 13.1193 17.8333 14.5C17.8333 15.8807 18.9526 17 20.3333 17Z" fill="#181926"/>
    <path d="M14.5 20.3333H12C12 22.5435 12.878 24.6631 14.4408 26.2259C16.0036 27.7887 18.1232 28.6667 20.3333 28.6667C22.5435 28.6667 24.6631 27.7887 26.2259 26.2259C27.7887 24.6631 28.6667 22.5435 28.6667 20.3333H26.1667" fill="#181926"/>
    <path d="M20.3333 17C21.714 17 22.8333 15.8807 22.8333 14.5C22.8333 13.1193 21.714 12 20.3333 12C18.9526 12 17.8333 13.1193 17.8333 14.5C17.8333 15.8807 18.9526 17 20.3333 17ZM20.3333 17V28.6667M20.3333 28.6667C18.1232 28.6667 16.0036 27.7887 14.4408 26.2259C12.878 24.6631 12 22.5435 12 20.3333H14.5M20.3333 28.6667C22.5435 28.6667 24.6631 27.7887 26.2259 26.2259C27.7887 24.6631 28.6667 22.5435 28.6667 20.3333H26.1667" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

export const PORT_ICON_SVG = getPortIconSvg('#393C56', 40)

const PortIcon = () => (
  <span
    aria-hidden
    dangerouslySetInnerHTML={{ __html: PORT_ICON_SVG }}
    style={{ display: 'inline-flex', width: 40, height: 40 }}
  />
)

export default PortIcon
