import sys, json
import numpy as np
from PIL import Image, ImageDraw
from svgpathtools import parse_path

P1 = 'M114.5 780.005H54.0002C14.0002 720.805 3.33358 633.671 3.00024 597.505L11.0002 159.005C26.2002 46.2047 79.5002 10.4526 95.0002 14.0047C138 27.0046 165.667 118.338 168.5 159.005V597.505C164.5 674.305 130.834 751.171 114.5 780.005Z'
P2 = 'M295 781.005H237C207.4 729.805 193 649.671 189.5 616.005V161.005C200.3 37.4045 242.334 5.50454 262 5.00457C308.4 4.60457 327.334 108.838 331 161.005L337 616.005C331.4 684.005 306.667 754.338 295 781.005Z'
P3 = 'M473 776.005H411C377.4 728.005 360.334 648.005 356 614.005L350 159.005C364.4 33.4045 407.334 2.67121 427 3.00457C468.6 2.20457 494.334 106.671 502 159.005L516 614.005C511.2 682.005 485.334 750.338 473 776.005Z'
PATHS = [P1, P2, P3]
COLORS = [(255, 60, 60), (60, 255, 120), (90, 160, 255)]

def pbbox(d):
    p = parse_path(d)
    xs, ys = [], []
    for i in range(801):
        z = p.point(i / 800)
        xs.append(z.real); ys.append(z.imag)
    return p, min(xs), min(ys), max(xs), max(ys)

# report trace bboxes
for i, d in enumerate(PATHS):
    _, x0, y0, x1, y1 = pbbox(d)
    print(f'path{i} trace bbox x {x0:.1f}-{x1:.1f} (w {x1-x0:.1f}) y {y0:.1f}-{y1:.1f} (h {y1-y0:.1f})')

if len(sys.argv) > 1:
    targets = json.loads(sys.argv[1])  # [[x0,y0,x1,y1] x3]
    im = Image.open('src/assets/sts_raft_3.png').convert('RGB')
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
    im.save('.sts_mask/overlay3.png')
    print('saved .sts_mask/overlay3.png')
