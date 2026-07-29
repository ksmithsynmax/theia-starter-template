import sys, json
from PIL import Image, ImageDraw
from svgpathtools import parse_path

P1 = 'M41.5008 712.03H88.0008C109.201 688.83 129.834 609.697 137.501 573.03L149.501 128.53C145.101 36.93 104.667 11.3634 85.0008 10.03C41.8008 10.43 21.3341 89.1967 16.5008 128.53L3.00078 573.03C4.20078 643.03 29.1674 694.863 41.5008 712.03Z'
P2 = 'M162.001 138.53L151.001 569.53C155.001 642.33 180.334 693.863 192.501 710.53H233.001C258.201 682.53 277.167 604.863 283.501 569.53L293.001 138.53C291.801 38.93 251.501 10.3634 231.501 8.53003C183.501 9.33003 165.167 95.53 162.001 138.53Z'
P3 = 'M296.501 569.53C294.101 631.93 321.501 687.197 335.501 707.03H377.501C396.701 690.63 419.834 608.53 429.001 569.53L434.501 129.53C430.901 25.9299 390.667 2.02994 371.001 3.02994C320.201 7.02993 305.501 89.0299 304.501 129.53L296.501 569.53Z'
P4 = 'M446.501 142.03V564.53C452.101 632.13 478.834 684.697 491.501 702.53H533.501C563.901 659.33 576.501 592.53 579.001 564.53V145.03C575.401 40.63 533.167 8.1967 512.501 5.03003C463.701 6.63003 448.167 97.03 446.501 142.03Z'
PATHS = [P1, P2, P3, P4]
COLORS = [(255, 60, 60), (60, 255, 120), (90, 160, 255), (255, 200, 40)]

def pbbox(d):
    p = parse_path(d)
    xs, ys = [], []
    for i in range(801):
        z = p.point(i / 800)
        xs.append(z.real); ys.append(z.imag)
    return p, min(xs), min(ys), max(xs), max(ys)

for i, d in enumerate(PATHS):
    _, x0, y0, x1, y1 = pbbox(d)
    print(f'path{i} trace bbox x {x0:.1f}-{x1:.1f} (w {x1-x0:.1f}) y {y0:.1f}-{y1:.1f} (h {y1-y0:.1f})')

if len(sys.argv) > 1:
    targets = json.loads(sys.argv[1])
    im = Image.open('src/assets/sts_raft_4.png').convert('RGB')
    d = ImageDraw.Draw(im)
    for path_d, color, tb in zip(PATHS, COLORS, targets):
        p, x0, y0, x1, y1 = pbbox(path_d)
        tx0, ty0, tx1, ty1 = tb
        sx = (tx1 - tx0) / (x1 - x0); sy = (ty1 - ty0) / (y1 - y0)
        ox = tx0 - x0 * sx; oy = ty0 - y0 * sy
        pts = []
        for i in range(801):
            z = p.point(i / 800)
            pts.append((z.real * sx + ox, z.imag * sy + oy))
        d.line(pts, fill=color, width=4)
        print(color, 'tx', round(ox, 1), 'ty', round(oy, 1), 'sx', round(sx, 4), 'sy', round(sy, 4),
              'tb', [round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)])
    im.save('.sts_mask/overlay4.png')
    print('saved .sts_mask/overlay4.png')
