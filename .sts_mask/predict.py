import numpy as np
from PIL import Image, ImageDraw
from svgpathtools import parse_path

LEFT = 'M55.5007 779.003H115.501C146.301 722.203 162.667 640.003 167.001 606.003L173.001 156.003C158.601 50.4032 115.001 16.0032 95.0007 12.0032C46.2007 13.6032 20.0007 104.67 13.0007 150.003L3.00073 599.003C4.60073 668.603 38.6674 748.003 55.5007 779.003Z'
RIGHT = 'M239.001 779.003H296.001C330.401 686.203 339.001 622.336 339.001 602.003L334.001 170.003C326.001 42.8032 283.334 5.66984 263.001 3.00317C211.801 3.80317 193.667 114.67 191.001 170.003V592.003C192.601 689.603 223.667 757.336 239.001 779.003Z'

# per-hull asset-space transforms currently in code: (ox, oy, sx, sy)
HULLS = [
    (LEFT,  (567.7, 139.8, 1.0944, 1.0143), (255, 60, 60)),
    (RIGHT, (585.4, 146.9, 1.0135, 1.0181), (60, 255, 120)),
]
# validated asset->screenshot cover mapping
AS, ASy, OX, OY = 0.6324, 0.6204, -1.1, -30.0

im = Image.open('.sts_mask/app_shot.png').convert('RGB')
d = ImageDraw.Draw(im)
for path_d, (ox, oy, sx, sy), color in HULLS:
    p = parse_path(path_d)
    pts = []
    for i in range(801):
        z = p.point(i / 800)
        ax = ox + sx * z.real
        ay = oy + sy * z.imag
        X = ax * AS + OX
        Y = ay * ASy + OY
        pts.append((X, Y))
    d.line(pts, fill=color, width=3)
im.save('.sts_mask/predict_over_shot.png')
print('saved .sts_mask/predict_over_shot.png')
