import sys
import numpy as np
from PIL import Image, ImageDraw
from svgpathtools import parse_path

LEFT = 'M55.5007 779.003H115.501C146.301 722.203 162.667 640.003 167.001 606.003L173.001 156.003C158.601 50.4032 115.001 16.0032 95.0007 12.0032C46.2007 13.6032 20.0007 104.67 13.0007 150.003L3.00073 599.003C4.60073 668.603 38.6674 748.003 55.5007 779.003Z'
RIGHT = 'M239.001 779.003H296.001C330.401 686.203 339.001 622.336 339.001 602.003L334.001 170.003C326.001 42.8032 283.334 5.66984 263.001 3.00317C211.801 3.80317 193.667 114.67 191.001 170.003V592.003C192.601 689.603 223.667 757.336 239.001 779.003Z'

# Candidate transform: translate(tx ty) scale(sx sy)
tx, ty, sx, sy = [float(x) for x in sys.argv[1:5]]

im = Image.open('src/assets/sts_raft_2.png').convert('RGB')
d = ImageDraw.Draw(im)

for path_d, color in [(LEFT, (255, 60, 60)), (RIGHT, (60, 255, 120))]:
    p = parse_path(path_d)
    pts = []
    N = 600
    for i in range(N + 1):
        z = p.point(i / N)
        x = z.real * sx + tx
        y = z.imag * sy + ty
        pts.append((x, y))
    d.line(pts, fill=color, width=4)

out = '.sts_mask/overlay_preview.png'
im.save(out)
print('saved', out)
