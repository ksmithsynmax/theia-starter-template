from PIL import Image, ImageDraw
import numpy as np
from svgpathtools import parse_path

im = Image.open('src/assets/sts_raft_2.png').convert('RGB')
W, H = im.size
arr = np.array(im, dtype=float)
R, G, B = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
bright = arr.mean(axis=2)
blueness = B - (R + G) / 2
# stricter ship mask (exclude bright foam/wake): decks are mid-tone, not white
ship = (bright > 70) & (bright < 210) & (blueness < 22)
colcov = ship.mean(axis=0)
rowcov = ship.mean(axis=1)
xs = np.where(colcov > 0.10)[0]
ys = np.where(rowcov > 0.10)[0]
ix0, ix1, iy0, iy1 = xs[0], xs[-1], ys[0], ys[-1]
icx, icy = (ix0 + ix1) / 2, (iy0 + iy1) / 2
print('ship bbox', ix0, ix1, iy0, iy1, 'w', ix1 - ix0, 'h', iy1 - iy0,
      'cx', round(icx), 'cy', round(icy))

d1 = "M55.5007 779.003H115.501C146.301 722.203 162.667 640.003 167.001 606.003L173.001 156.003C158.601 50.4032 115.001 16.0032 95.0007 12.0032C46.2007 13.6032 20.0007 104.67 13.0007 150.003L3.00073 599.003C4.60073 668.603 38.6674 748.003 55.5007 779.003Z"
d2 = "M239.001 779.003H296.001C330.401 686.203 339.001 622.336 339.001 602.003L334.001 170.003C326.001 42.8032 283.334 5.66984 263.001 3.00317C211.801 3.80317 193.667 114.67 191.001 170.003V592.003C192.601 689.603 223.667 757.336 239.001 779.003Z"
p1, p2 = parse_path(d1), parse_path(d2)

# trace bbox (union)
b = [pp.bbox() for pp in (p1, p2)]
tx0 = min(x[0] for x in b); tx1 = max(x[1] for x in b)
ty0 = min(x[2] for x in b); ty1 = max(x[3] for x in b)
tcx, tcy = (tx0 + tx1) / 2, (ty0 + ty1) / 2
print('trace bbox', round(tx0,1), round(tx1,1), round(ty0,1), round(ty1,1),
      'w', round(tx1-tx0,1), 'h', round(ty1-ty0,1))

# UNIFORM scale — use width (least affected by wake), center-align both axes
s = (ix1 - ix0) / (tx1 - tx0)
ox = icx - tcx * s
oy = icy - tcy * s
print('uniform s', round(s, 4), 'ox', round(ox, 1), 'oy', round(oy, 1))


def draw(p, col):
    tp = p.scaled(s).translated(complex(ox, oy))
    pts = [tp.point(t / 500.0) for t in range(501)]
    ImageDraw.Draw(im).line([(z.real, z.imag) for z in pts], fill=col, width=3)


draw(p1, (0, 255, 90))
draw(p2, (255, 210, 0))
im.save('.sts_mask/calib2_check.png')
print('S=%.4f OX=%.1f OY=%.1f' % (s, ox, oy))
