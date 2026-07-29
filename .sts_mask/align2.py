from PIL import Image, ImageDraw
import numpy as np
from svgpathtools import parse_path

IMG = 'src/assets/sts_raft_2.png'
im = Image.open(IMG).convert('RGB')
W, H = im.size
arr = np.array(im, dtype=float)
R, G, B = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
bright = arr.mean(axis=2)
blueness = B - (R + G) / 2
ship = (bright > 70) & (blueness < 25)

# tight bbox of ships, ignoring thin specks via coverage thresholds
colcov = ship.mean(axis=0)
rowcov = ship.mean(axis=1)
xs = np.where(colcov > 0.06)[0]
ys = np.where(rowcov > 0.06)[0]
ix0, ix1 = xs[0], xs[-1]
iy0, iy1 = ys[0], ys[-1]
print('image ship bbox x', ix0, ix1, 'y', iy0, iy1, 'wh', ix1 - ix0, iy1 - iy0)

d1 = "M55.5007 779.003H115.501C146.301 722.203 162.667 640.003 167.001 606.003L173.001 156.003C158.601 50.4032 115.001 16.0032 95.0007 12.0032C46.2007 13.6032 20.0007 104.67 13.0007 150.003L3.00073 599.003C4.60073 668.603 38.6674 748.003 55.5007 779.003Z"
d2 = "M239.001 779.003H296.001C330.401 686.203 339.001 622.336 339.001 602.003L334.001 170.003C326.001 42.8032 283.334 5.66984 263.001 3.00317C211.801 3.80317 193.667 114.67 191.001 170.003V592.003C192.601 689.603 223.667 757.336 239.001 779.003Z"
p1 = parse_path(d1)
p2 = parse_path(d2)


def bbox_union(paths):
    xs0 = []
    xs1 = []
    ys0 = []
    ys1 = []
    for p in paths:
        a, b, c, d = p.bbox()
        xs0.append(a)
        xs1.append(b)
        ys0.append(c)
        ys1.append(d)
    return min(xs0), max(xs1), min(ys0), max(ys1)


tx0, tx1, ty0, ty1 = bbox_union([p1, p2])
print('trace bbox x', round(tx0, 1), round(tx1, 1), 'y', round(ty0, 1), round(ty1, 1))

sx = (ix1 - ix0) / (tx1 - tx0)
sy = (iy1 - iy0) / (ty1 - ty0)
print('scale', round(sx, 4), round(sy, 4))


def xform(p):
    # scale about origin then translate so trace bbox maps to image bbox
    p = p.scaled(sx, sy)
    # after scaling, trace min moves to tx0*sx ; shift to ix0
    dz = complex(ix0 - tx0 * sx, iy0 - ty0 * sy)
    return p.translated(dz)


tp1 = xform(p1)
tp2 = xform(p2)


def rd(p):
    import re
    s = p.d()
    return re.sub(r'-?\d+\.\d+', lambda m: str(round(float(m.group()), 1)), s)


for name, tp in [('SHIP0', tp1), ('SHIP1', tp2)]:
    a, b, c, d = tp.bbox()
    cx, cy, w, h = (a + b) / 2, (c + d) / 2, b - a, d - c
    print(name, 'cx', round(cx), 'cy', round(cy), 'w', round(w), 'h', round(h))
    print(name, 'd=', rd(tp))

# rasterize to verify
draw = ImageDraw.Draw(im)
for tp, col in [(tp1, (0, 255, 90)), (tp2, (255, 210, 0))]:
    pts = [tp.point(t / 400.0) for t in range(401)]
    xy = [(pt.real, pt.imag) for pt in pts]
    draw.line(xy, fill=col, width=4)
im.save('.sts_mask/align2_check.png')
print('saved check')
